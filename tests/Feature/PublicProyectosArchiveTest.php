<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicProyectosArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_displays_two_most_recent_cases_and_button_to_proyectos(): void
    {
        $admin = User::factory()->admin()->create();

        $cpt = ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'public_slug' => 'proyectos',
            'is_public' => true,
        ]);

        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertSee('/// Selected Cases ///');
        $response->assertSee('Proyectos en Producción');
        $response->assertSee('Ver todos los proyectos');
        $response->assertSee(route('public.content.index', 'proyectos'));
    }

    public function test_proyectos_archive_renders_two_column_container_with_hover_cards(): void
    {
        $admin = User::factory()->admin()->create();

        $cpt = ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'public_slug' => 'proyectos',
            'is_public' => true,
        ]);

        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $admin->id,
            'title' => 'Plataforma E-Commerce Headless',
            'slug' => 'plataforma-ecommerce-headless',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get('/proyectos');

        $response->assertStatus(200);
        $response->assertSee('data-layout="airy"', false);
        $response->assertSee('data-project-card', false);
        $response->assertSee('Auto Key Access');
        $response->assertSee('Clearbox Communications');
        $response->assertSee('View Project');
    }
}
