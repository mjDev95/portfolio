<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_site_never_consumes_admin_css_or_admin_scripts(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);

        // Assets públicos esperados
        $response->assertSee('fluid-system');
        $response->assertSee('public');

        // Los assets del admin (Tailwind/React) NUNCA deben estar en el frontend público
        $response->assertDontSee('resources/css/app.css');
        $response->assertDontSee('resources/js/app.jsx');
        $this->assertStringNotContainsString('assets/app-', (string) $response->getContent());
    }

    public function test_public_internal_pages_do_not_consume_admin_css(): void
    {
        foreach (['/sobre-mi', '/contacto'] as $url) {
            $response = $this->get($url);
            $response->assertStatus(200);

            $response->assertSee('fluid-system');
            $response->assertSee('public');
            $response->assertDontSee('resources/css/app.css');
            $response->assertDontSee('resources/js/app.jsx');
        }
    }

    public function test_admin_panel_uses_isolated_admin_assets(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertStatus(200);
        $content = (string) $response->getContent();
        $this->assertTrue(
            str_contains($content, 'resources/js/app.jsx') || str_contains($content, 'assets/app-'),
            'Admin panel must load isolated admin asset (resources/js/app.jsx or compiled assets/app-).'
        );
    }
}
