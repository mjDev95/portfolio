<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContentIsolationAndFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_by_default_only_sees_own_posts_in_cpt_index(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
        ]);
        $cpt->users()->attach([$admin->id, $client->id]);

        // Post del admin
        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $admin->id,
            'title' => 'Admin Post',
            'slug' => 'admin-post',
            'status' => 'published',
        ]);

        // Post del cliente
        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $client->id,
            'title' => 'Client Post',
            'slug' => 'client-post',
            'status' => 'published',
        ]);

        // Super Admin accede sin client_id: SOLO debe ver su propio post
        $response = $this->actingAs($admin)->get(route('admin.content.index', $cpt->slug));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Content/Index')
                ->has('contents.data', 1)
                ->where('contents.data.0.title', 'Admin Post')
                ->where('statusCounts.all', 1)
                ->where('statusCounts.published', 1)
                ->where('statusCounts.draft', 0)
                ->where('statusCounts.archived', 0)
            );
    }

    public function test_super_admin_can_filter_by_client_id_to_view_client_posts(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
        ]);
        $cpt->users()->attach([$admin->id, $client->id]);

        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $admin->id,
            'title' => 'Admin Post',
            'slug' => 'admin-post',
            'status' => 'published',
        ]);

        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $client->id,
            'title' => 'Client Post',
            'slug' => 'client-post',
            'status' => 'published',
        ]);

        // Super Admin filtra explícitamente por el cliente
        $response = $this->actingAs($admin)->get(route('admin.content.index', [
            'typeSlug' => $cpt->slug,
            'client_id' => $client->id,
        ]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Content/Index')
                ->has('contents.data', 1)
                ->where('contents.data.0.title', 'Client Post')
                ->where('statusCounts.all', 1)
            );
    }

    public function test_status_filters_and_counts_work_like_wordpress(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
        ]);
        $cpt->users()->attach([$user->id]);

        // 2 Publicados, 1 Borrador, 1 Archivado
        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $user->id,
            'title' => 'Post Publicado 1',
            'slug' => 'post-pub-1',
            'status' => 'published',
        ]);
        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $user->id,
            'title' => 'Post Publicado 2',
            'slug' => 'post-pub-2',
            'status' => 'published',
        ]);
        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $user->id,
            'title' => 'Post Borrador',
            'slug' => 'post-draft',
            'status' => 'draft',
        ]);
        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $user->id,
            'title' => 'Post Archivado',
            'slug' => 'post-archived',
            'status' => 'archived',
        ]);

        // 1. Sin filtro (Todos): 4 publicaciones, conteos calculados
        $this->actingAs($user)
            ->get(route('admin.content.index', $cpt->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('contents.data', 4)
                ->where('statusCounts.all', 4)
                ->where('statusCounts.published', 2)
                ->where('statusCounts.draft', 1)
                ->where('statusCounts.archived', 1)
            );

        // 2. Filtro status = published
        $this->actingAs($user)
            ->get(route('admin.content.index', ['typeSlug' => $cpt->slug, 'status' => 'published']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('contents.data', 2)
                ->where('statusCounts.all', 4)
                ->where('statusCounts.published', 2)
            );

        // 3. Filtro status = draft
        $this->actingAs($user)
            ->get(route('admin.content.index', ['typeSlug' => $cpt->slug, 'status' => 'draft']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('contents.data', 1)
                ->where('contents.data.0.title', 'Post Borrador')
            );

        // 4. Filtro status = all (debe ignorarse y devolver todos, no 0)
        $this->actingAs($user)
            ->get(route('admin.content.index', ['typeSlug' => $cpt->slug, 'status' => 'all']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('contents.data', 4)
            );
    }

    public function test_sidebar_only_shows_cpts_assigned_to_user(): void
    {
        $userA = User::factory()->create(['name' => 'User A']);
        $userB = User::factory()->create(['name' => 'User B']);

        $cptShared = ContentType::create([
            'user_id' => $userA->id,
            'name' => 'Compartido',
            'singular_name' => 'Compartido',
            'slug' => 'compartido',
        ]);
        $cptShared->users()->attach([$userA->id, $userB->id]);

        $cptExclusiveB = ContentType::create([
            'user_id' => $userB->id,
            'name' => 'Solo B',
            'singular_name' => 'Solo B',
            'slug' => 'solo-b',
        ]);
        $cptExclusiveB->users()->attach([$userB->id]);

        // User A solo debe recibir 1 CPT en su menú
        $this->actingAs($userA)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('content_types', 1)
                ->where('content_types.0.slug', 'compartido')
            );

        // User B debe recibir 2 CPTs en su menú
        $this->actingAs($userB)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('content_types', 2)
            );
    }
}
