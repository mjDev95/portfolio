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
        $response->assertSee('Casos de Estudio');
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
        $response->assertSee('data-flip-card', false);
        $response->assertSee('data-flip-id="project-plataforma-ecommerce-headless"', false);
        $response->assertSee('Plataforma E-Commerce Headless');
        $response->assertDontSee('Auto Key Access');
        $response->assertDontSee('Clearbox Communications');
        $response->assertSee('project-showcase-card');
    }

    public function test_project_single_renders_matching_flip_attributes(): void
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

        $content = Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $admin->id,
            'title' => 'Plataforma E-Commerce Headless',
            'slug' => 'plataforma-ecommerce-headless',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get('/proyectos/plataforma-ecommerce-headless');

        $response->assertStatus(200);
        $response->assertSee('content-show');
        $response->assertSee('data-flip-text', false);
        $response->assertSee('Plataforma E-Commerce Headless');
    }

    public function test_home_selected_cases_renders_stodio_sequence_with_flip_and_cursor_attributes(): void
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

        $project = Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $admin->id,
            'title' => 'Stodio Project Test',
            'slug' => 'stodio-project-test',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertSee('data-selected-cases', false);
        $response->assertSee('showcase-pinned-hero');
        $response->assertSee('data-project-card', false);
        $response->assertSee('data-flip-card', false);
        $response->assertSee('data-flip-id="project-stodio-project-test"', false);
        $response->assertSee('data-flip-element="image"', false);
    }
}
