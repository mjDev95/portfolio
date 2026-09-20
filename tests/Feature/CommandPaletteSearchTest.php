<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommandPaletteSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_search_api(): void
    {
        $response = $this->getJson(route('admin.api.search'));
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_search_globally(): void
    {
        $user = User::factory()->admin()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'icon' => 'FileText',
        ]);

        Content::create([
            'user_id' => $user->id,
            'content_type_id' => $cpt->id,
            'title' => 'Guía avanzada de Laravel',
            'slug' => 'guia-avanzada-de-laravel',
            'status' => 'published',
        ]);

        $response = $this->actingAs($user)->getJson(route('admin.api.search', ['q' => 'Laravel']));

        $response->assertOk()
            ->assertJsonStructure(['items', 'commands'])
            ->assertJsonFragment(['title' => 'Guía avanzada de Laravel']);
    }

    public function test_contextual_search_filters_by_cpt_type(): void
    {
        $user = User::factory()->admin()->create();

        $cpt1 = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'icon' => 'FileText',
        ]);

        $cpt2 = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'icon' => 'Briefcase',
        ]);

        Content::create([
            'user_id' => $user->id,
            'content_type_id' => $cpt1->id,
            'title' => 'Artículo sobre Fintech',
            'slug' => 'articulo-fintech',
            'status' => 'published',
        ]);

        Content::create([
            'user_id' => $user->id,
            'content_type_id' => $cpt2->id,
            'title' => 'Proyecto Fintech App',
            'slug' => 'proyecto-fintech-app',
            'status' => 'published',
        ]);

        // Búsqueda contextual solo en Proyectos
        $response = $this->actingAs($user)->getJson(route('admin.api.search', [
            'q' => 'Fintech',
            'type' => 'proyectos',
        ]));

        $response->assertOk()
            ->assertJsonFragment(['title' => 'Proyecto Fintech App'])
            ->assertJsonMissing(['title' => 'Artículo sobre Fintech']);
    }

    public function test_command_prefix_returns_quick_actions(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this->actingAs($user)->getJson(route('admin.api.search', ['q' => '> dashboard']));

        $response->assertOk()
            ->assertJsonFragment(['title' => 'Ir al Dashboard']);
    }
}
