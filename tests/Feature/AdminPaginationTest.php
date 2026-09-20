<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_content_index_returns_paginated_results_and_json(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'is_public' => true,
        ]);

        // Crear 25 contenidos
        for ($i = 1; $i <= 25; $i++) {
            Content::create([
                'user_id' => $user->id,
                'content_type_id' => $cpt->id,
                'title' => "Publicación {$i}",
                'slug' => "publicacion-{$i}",
                'status' => 'published',
            ]);
        }

        // Página 1 Inertia
        $response = $this->actingAs($user)->get(route('admin.content.index', $cpt->slug));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Content/Index')
            ->has('contents.data', 20)
            ->where('contents.total', 25)
            ->where('contents.current_page', 1)
            ->where('contents.last_page', 2)
        );

        // Página 2 solicitada como JSON para Scroll Infinito
        $jsonResponse = $this->actingAs($user)->getJson(route('admin.content.index', [$cpt->slug, 'page' => 2]));
        $jsonResponse->assertOk();
        $jsonResponse->assertJsonStructure([
            'data',
            'current_page',
            'next_page_url',
            'total',
        ]);
        $this->assertCount(5, $jsonResponse->json('data'));
        $this->assertEquals(2, $jsonResponse->json('current_page'));
    }

    public function test_media_index_returns_paginated_json_for_infinite_scroll(): void
    {
        $user = User::factory()->create();

        // Crear 30 archivos de medios
        for ($i = 1; $i <= 30; $i++) {
            Media::create([
                'user_id' => $user->id,
                'disk' => 'public',
                'file_path' => "media/test-{$i}.jpg",
                'file_name' => "test-{$i}.jpg",
                'mime_type' => 'image/jpeg',
                'file_size' => 1024 * $i,
                'collection' => 'gallery',
            ]);
        }

        // Página 1 Inertia
        $response = $this->actingAs($user)->get(route('admin.media.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Media/Index')
            ->has('media.data', 24)
            ->where('media.total', 30)
        );

        // Página 2 JSON
        $jsonResponse = $this->actingAs($user)->getJson(route('admin.media.index', ['page' => 2]));
        $jsonResponse->assertOk();
        $this->assertCount(6, $jsonResponse->json('data'));
    }

    public function test_user_index_returns_paginated_json_for_infinite_scroll(): void
    {
        $admin = User::factory()->admin()->create();

        User::factory()->count(20)->create();

        $response = $this->actingAs($admin)->get(route('admin.users.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 15)
            ->has('stats.totalUsers')
        );

        $jsonResponse = $this->actingAs($admin)->getJson(route('admin.users.index', ['page' => 2]));
        $jsonResponse->assertOk();
        $this->assertNotEmpty($jsonResponse->json('data'));
    }

    public function test_taxonomies_return_paginated_json_for_infinite_scroll(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Blog',
            'singular_name' => 'Post',
            'slug' => 'blog',
            'has_categories' => true,
            'has_tags' => true,
            'is_public' => true,
        ]);

        for ($i = 1; $i <= 25; $i++) {
            Category::create([
                'user_id' => $user->id,
                'content_type_id' => $cpt->id,
                'name' => "Categoria {$i}",
                'slug' => "categoria-{$i}",
            ]);
        }

        $response = $this->actingAs($user)->get(route('admin.content.categories.index', $cpt->slug));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('items.data', 20)
            ->where('items.total', 25)
        );

        $jsonResponse = $this->actingAs($user)->getJson(route('admin.content.categories.index', [$cpt->slug, 'page' => 2]));
        $jsonResponse->assertOk();
        $this->assertCount(5, $jsonResponse->json('data'));
    }
}
