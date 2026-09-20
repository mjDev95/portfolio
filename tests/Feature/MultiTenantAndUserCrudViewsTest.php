<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\CustomField;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MultiTenantAndUserCrudViewsTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_view_user_create_page(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.users.create'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users/Form')
                ->where('user', null)
                ->has('roles')
            );
    }

    public function test_super_admin_can_view_user_edit_page(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['name' => 'Cliente Demo']);

        $response = $this->actingAs($admin)->get(route('admin.users.edit', $client));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users/Form')
                ->where('user.id', $client->id)
                ->where('user.name', 'Cliente Demo')
                ->has('roles')
            );
    }

    public function test_super_admin_can_view_user_show_page_with_kpis_and_cpts(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['name' => 'Cliente Corporativo']);

        $cpt = ContentType::create([
            'user_id' => $client->id,
            'name' => 'Proyectos Especiales',
            'singular_name' => 'Proyecto Especial',
            'slug' => 'proyectos-especiales',
            'icon' => 'Briefcase',
            'order' => 0,
        ]);

        $cpt->users()->attach($client->id);

        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $client->id,
            'title' => 'Primer Proyecto de Cliente',
            'slug' => 'primer-proyecto-de-cliente',
            'content' => 'Contenido de prueba',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.users.show', $client));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users/Show')
                ->where('client.id', $client->id)
                ->where('client.name', 'Cliente Corporativo')
                ->where('client.stats.totalContents', 1)
                ->where('client.stats.published', 1)
                ->has('client.content_types', 1)
                ->has('client.recent_contents', 1)
            );
    }

    public function test_super_admin_api_search_endpoint(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['name' => 'Roberto Sánchez', 'email' => 'roberto@empresa.com']);
        User::factory()->create(['name' => 'Carlos López', 'email' => 'carlos@empresa.com']);

        $response = $this->actingAs($admin)->getJson(route('admin.api.users.search', ['search' => 'Roberto']));

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['name' => 'Roberto Sánchez']);
    }

    public function test_multi_client_cpt_assignment_and_strict_content_isolation(): void
    {
        $admin = User::factory()->admin()->create();
        $clientA = User::factory()->create(['name' => 'Cliente A']);
        $clientB = User::factory()->create(['name' => 'Cliente B']);

        // Crear CPT asignado a ambos clientes vía tabla pivot
        $cpt = ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Portafolios Compartidos',
            'singular_name' => 'Portafolio',
            'slug' => 'portafolios-compartidos',
            'icon' => 'FolderGit2',
            'order' => 0,
        ]);

        $cpt->users()->attach([$clientA->id, $clientB->id]);

        // Cliente A crea su publicación privada
        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $clientA->id,
            'title' => 'Publicación Privada de Cliente A',
            'slug' => 'publicacion-cliente-a',
            'content' => 'Datos confidenciales de A',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Cliente B crea su publicación privada
        Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $clientB->id,
            'title' => 'Publicación Privada de Cliente B',
            'slug' => 'publicacion-cliente-b',
            'content' => 'Datos confidenciales de B',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Cliente A consulta el índice del CPT: SOLO ve su contenido
        $responseA = $this->actingAs($clientA)->get(route('admin.content.index', $cpt->slug));
        $responseA->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Content/Index')
                ->has('contents.data', 1)
                ->where('contents.data.0.title', 'Publicación Privada de Cliente A')
            );

        // Cliente B consulta el índice del CPT: SOLO ve su contenido
        $responseB = $this->actingAs($clientB)->get(route('admin.content.index', $cpt->slug));
        $responseB->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Content/Index')
                ->has('contents.data', 1)
                ->where('contents.data.0.title', 'Publicación Privada de Cliente B')
            );
    }

    public function test_custom_fields_scoping_loads_global_and_specific_fields(): void
    {
        $admin = User::factory()->admin()->create();
        $clientA = User::factory()->create(['name' => 'Cliente A']);
        $clientB = User::factory()->create(['name' => 'Cliente B']);

        $cpt = ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Casos de Estudio',
            'singular_name' => 'Caso de Estudio',
            'slug' => 'casos-de-estudio',
            'icon' => 'BookOpen',
            'order' => 0,
        ]);

        $cpt->users()->attach([$clientA->id, $clientB->id]);

        // Campo Global (para todos)
        CustomField::create([
            'content_type_id' => $cpt->id,
            'user_id' => null,
            'name' => 'duracion_meses',
            'label' => 'Duración (Meses)',
            'type' => 'number',
            'sort_order' => 1,
        ]);

        // Campo Específico para Cliente A únicamente
        CustomField::create([
            'content_type_id' => $cpt->id,
            'user_id' => $clientA->id,
            'name' => 'numero_expediente_interno',
            'label' => 'N° Expediente Interno',
            'type' => 'text',
            'sort_order' => 2,
        ]);

        // Cliente A al crear contenido debe ver 2 campos (Global + el suyo)
        $responseA = $this->actingAs($clientA)->get(route('admin.content.create', $cpt->slug));
        $responseA->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Content/Form')
                ->has('contentType.custom_fields', 2)
            );

        // Cliente B al crear contenido debe ver únicamente 1 campo (el Global)
        $responseB = $this->actingAs($clientB)->get(route('admin.content.create', $cpt->slug));
        $responseB->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Content/Form')
                ->has('contentType.custom_fields', 1)
                ->where('contentType.custom_fields.0.name', 'duracion_meses')
            );
    }
}
