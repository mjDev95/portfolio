<?php

namespace Tests\Feature;

use App\Models\ContentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_public_navigation_renders_active_content_types(): void
    {
        $admin = User::factory()->admin()->create();

        ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'public_slug' => 'proyectos',
            'is_public' => true,
            'order' => 1,
        ]);

        ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'public_slug' => 'articulos',
            'is_public' => true,
            'order' => 2,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('Proyectos');
        $response->assertSee('Artículos');
        $response->assertSee(route('public.content.index', 'proyectos'));
        $response->assertSee(route('public.content.index', 'articulos'));
    }

    public function test_navbar_and_footer_handle_string_or_array_cpt_shapes_without_error(): void
    {
        $view = view('partials.navbar', [
            'navContentTypes' => ['proyectos', 'articulos'],
        ])->render();

        $this->assertStringContainsString('proyectos', $view);
        $this->assertStringContainsString('articulos', $view);

        $footerView = view('partials.footer', [
            'navContentTypes' => ['proyectos', 'articulos'],
        ])->render();

        $this->assertStringContainsString('proyectos', $footerView);
        $this->assertStringContainsString('articulos', $footerView);
    }
}
