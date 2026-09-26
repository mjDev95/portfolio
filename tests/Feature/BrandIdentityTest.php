<?php

namespace Tests\Feature;

use App\Models\ColorPalette;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BrandIdentityTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $client;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Super Admin']);
        $clientRole = Role::firstOrCreate(['slug' => 'user'], ['name' => 'Cliente']);

        $this->admin = User::factory()->create([
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        $this->client = User::factory()->create([
            'role_id' => $clientRole->id,
            'is_active' => true,
        ]);
    }

    public function test_guests_are_redirected_from_brand_identity_to_login(): void
    {
        $response = $this->get(route('admin.brand.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_non_admin_client_cannot_access_brand_identity(): void
    {
        $response = $this->actingAs($this->client)->get(route('admin.brand.index'));

        $response->assertForbidden();
    }

    public function test_super_admin_can_access_brand_identity_view(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.brand.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Brand/Index')
        );
    }

    public function test_super_admin_can_update_and_persist_custom_color_palette(): void
    {
        $response = $this->actingAs($this->admin)->put(route('admin.preferences.update'), [
            'color_palette' => [
                'colors' => [
                    'primary' => '#CC282F', // Carmine Tech
                    'secondary' => '#1D4ED8', // Sapphire Code
                ],
            ],
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $this->admin->id,
        ]);

        $pref = $this->admin->fresh()->preference;
        $this->assertNotNull($pref);
        $this->assertEquals('#CC282F', $pref->getSetting('color_palette.colors.primary'));
        $this->assertEquals('#1D4ED8', $pref->getSetting('color_palette.colors.secondary'));
    }

    public function test_blade_initializes_super_admin_palette_for_admin_and_isolates_client(): void
    {
        // 1. Super Admin response contains is-super-admin initialization
        $adminResponse = $this->actingAs($this->admin)->get(route('admin.dashboard'));
        $adminResponse->assertOk();
        $adminContent = $adminResponse->getContent();
        $this->assertStringContainsString('classList.add(\'is-super-admin\')', $adminContent);
        $this->assertStringContainsString('--brand-primary', $adminContent);

        // 2. Client response does not add is-super-admin
        $clientResponse = $this->actingAs($this->client)->get(route('admin.dashboard'));
        $clientResponse->assertOk();
        $clientContent = $clientResponse->getContent();
        $this->assertStringContainsString('classList.remove(\'is-super-admin\')', $clientContent);
    }

    public function test_public_site_takes_color_palette_from_database_and_ignores_stale_client_custom_colors(): void
    {
        // Create master palette in database
        $master = ColorPalette::create([
            'name' => 'Cardinal & Aurum Carbon',
            'slug' => 'cardinal-aurum',
            'primary_color' => '#CB2128',
            'secondary_color' => '#DFB136',
            'accent_color' => '#F59E0B',
            'is_master' => true,
        ]);

        // Client has a stale pink color in preferences
        $this->client->preference()->create([
            'color_palette' => [
                'id' => 'custom',
                'colors' => [
                    'primary' => '#f529a0',
                    'secondary' => '#6c757d',
                ],
            ],
        ]);

        // Guest visits public site
        $response = $this->get(route('home'));
        $response->assertOk();

        // Must take the database palette (#CB2128) and NOT the client pink (#f529a0)
        $response->assertSee('--accent: #CB2128;', false);
        $response->assertDontSee('#f529a0');
    }
}
