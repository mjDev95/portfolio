<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\Role;
use App\Models\User;
use App\Models\Visit;
use App\Services\PortfolioCacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class DashboardAndCustomFieldScalabilityTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected ContentType $cpt;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Super Admin',
                'description' => 'Administrador',
            ]
        );

        $this->admin = User::factory()->create([
            'role_id' => $adminRole->id,
        ]);

        $this->cpt = ContentType::create([
            'user_id' => $this->admin->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'public_slug' => 'proyectos',
            'is_public' => true,
            'order' => 1,
        ]);
    }

    public function test_dashboard_computes_and_caches_metrics(): void
    {
        PortfolioCacheService::clearAll();

        // Creamos contenidos y visitas
        Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Proyecto Escalable',
            'slug' => 'proyecto-escalable',
            'status' => 'published',
            'custom_values' => ['client' => 'Acme Corp', 'year' => '2026'],
        ]);

        Visit::create([
            'user_id' => $this->admin->id,
            'visitor_hash' => 'hash_123',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'path' => '/',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));
        $response->assertOk();

        // Verificamos que la clave de caché del dashboard se haya registrado
        $cacheKey = PortfolioCacheService::PREFIX_DASHBOARD."{$this->admin->id}:admin";
        $this->assertTrue(Cache::has($cacheKey));

        $cachedData = Cache::get($cacheKey);
        $this->assertIsArray($cachedData);
        $this->assertArrayHasKey('stats', $cachedData);
        $this->assertArrayHasKey('activityData', $cachedData);
        $this->assertEquals(1, $cachedData['stats']['contents']['published']);

        // Segunda llamada aprovecha la caché sin fallos
        $secondResponse = $this->actingAs($this->admin)->get(route('admin.dashboard'));
        $secondResponse->assertOk();
    }

    public function test_content_mutation_invalidates_dashboard_cache(): void
    {
        PortfolioCacheService::clearAll();

        $content = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Inicial',
            'slug' => 'inicial',
            'status' => 'published',
            'custom_values' => ['client' => 'Original Client', 'year' => '2025'],
        ]);

        // Poblamos la caché del dashboard
        $this->actingAs($this->admin)->get(route('admin.dashboard'))->assertOk();
        $cacheKey = PortfolioCacheService::PREFIX_DASHBOARD."{$this->admin->id}:admin";
        $this->assertTrue(Cache::has($cacheKey));

        // Al mutar el contenido, el ContentObserver debe purgar la caché
        $content->update(['title' => 'Inicial Modificado']);
        $this->assertFalse(Cache::has($cacheKey));
    }

    public function test_custom_values_query_and_virtual_columns(): void
    {
        $contentA = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'App Mobile',
            'slug' => 'app-mobile',
            'status' => 'published',
            'custom_values' => ['client' => 'Google', 'year' => '2026'],
        ]);

        $contentB = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Web Dashboard',
            'slug' => 'web-dashboard',
            'status' => 'published',
            'custom_values' => ['client' => 'Microsoft', 'year' => '2025'],
        ]);

        // Verificamos que la columna virtual extraiga el valor directamente
        $reloadedA = Content::find($contentA->id);
        $this->assertEquals('Google', $reloadedA->custom_client);
        $this->assertEquals('2026', $reloadedA->custom_year);

        // Verificamos scopeWhereCustomField usando la columna virtual
        $resultsGoogle = Content::whereCustomField('client', 'Google')->get();
        $this->assertCount(1, $resultsGoogle);
        $this->assertEquals($contentA->id, $resultsGoogle->first()->id);

        // Verificamos scopeFilterByCustomFields
        $resultsYear = Content::filterByCustomFields(['year' => '2025'])->get();
        $this->assertCount(1, $resultsYear);
        $this->assertEquals($contentB->id, $resultsYear->first()->id);

        // Verificamos fallback en campos sin columna virtual dedicada
        $contentC = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Brand Identity',
            'slug' => 'brand-identity',
            'status' => 'published',
            'custom_values' => ['agency' => 'Pentagram'],
        ]);

        $resultsAgency = Content::whereCustomField('agency', 'Pentagram')->get();
        $this->assertCount(1, $resultsAgency);
        $this->assertEquals($contentC->id, $resultsAgency->first()->id);
    }
}
