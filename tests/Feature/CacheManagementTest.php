<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use App\Services\PortfolioCacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CacheManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin@example.com',
            'role_id' => 1,
            'is_active' => true,
        ]);
    }

    public function test_portfolio_cache_service_remembers_and_clears_public_home(): void
    {
        Cache::flush();

        $cpt = ContentType::create([
            'user_id' => $this->admin->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'is_public' => true,
            'order' => 0,
        ]);

        $callCount = 0;
        $getter = function () use (&$callCount) {
            $callCount++;

            return [$callCount, 2, 3];
        };

        $res1 = PortfolioCacheService::rememberPublicHomeIds($getter);
        $this->assertSame([1, 2, 3], $res1);
        $this->assertSame(1, $callCount);

        // Second call should hit cache without invoking callback
        $res2 = PortfolioCacheService::rememberPublicHomeIds($getter);
        $this->assertSame([1, 2, 3], $res2);
        $this->assertSame(1, $callCount);

        // Purge public cache
        PortfolioCacheService::clearPublicCache();

        // Third call should invoke callback again
        $res3 = PortfolioCacheService::rememberPublicHomeIds($getter);
        $this->assertSame([2, 2, 3], $res3);
        $this->assertSame(2, $callCount);
    }

    public function test_content_observer_automatically_purges_public_cache_on_save(): void
    {
        Cache::flush();

        $cpt = ContentType::create([
            'user_id' => $this->admin->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'is_public' => true,
            'order' => 0,
        ]);

        $executed = false;
        PortfolioCacheService::rememberPublicHomeIds(function () use (&$executed) {
            $executed = true;

            return [10];
        });
        $this->assertTrue($executed);

        $executedAgain = false;
        // Verify it is cached
        PortfolioCacheService::rememberPublicHomeIds(function () use (&$executedAgain) {
            $executedAgain = true;

            return [20];
        });
        $this->assertFalse($executedAgain);

        // Create a new content -> ContentObserver should invalidate public cache
        Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $cpt->id,
            'title' => 'Nuevo Post',
            'slug' => 'nuevo-post',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // After save, cache should be empty
        $executedAfterSave = false;
        PortfolioCacheService::rememberPublicHomeIds(function () use (&$executedAfterSave) {
            $executedAfterSave = true;

            return [30];
        });
        $this->assertTrue($executedAfterSave);
    }

    public function test_authenticated_admin_can_clear_cache_via_endpoint(): void
    {
        $response = $this->actingAs($this->admin)->postJson(route('admin.preferences.cache.clear'), [
            'scope' => 'public',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'scope' => 'public',
        ]);

        $allResponse = $this->actingAs($this->admin)->postJson(route('admin.preferences.cache.clear'), [
            'scope' => 'all',
        ]);

        $allResponse->assertOk();
        $allResponse->assertJson([
            'success' => true,
            'scope' => 'all',
        ]);
    }

    public function test_unauthenticated_user_cannot_clear_cache(): void
    {
        $response = $this->postJson(route('admin.preferences.cache.clear'), [
            'scope' => 'all',
        ]);

        $response->assertUnauthorized();
    }
}
