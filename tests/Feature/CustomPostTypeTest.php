<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomPostTypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_new_custom_post_type_with_dynamic_fields(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this->actingAs($user)->post(route('admin.content-types.store'), [
            'name' => 'Casos de Éxito',
            'singular_name' => 'Caso de Éxito',
            'slug' => 'casos-de-exito',
            'icon' => 'Scale',
            'description' => 'Casos jurídicos ganados',
            'has_categories' => true,
            'has_tags' => true,
            'order' => 1,
            'fields' => [
                [
                    'label' => 'Tribunal',
                    'name' => 'court',
                    'type' => 'text',
                    'is_required' => true,
                    'sort_order' => 0,
                ],
                [
                    'label' => 'Indemnización',
                    'name' => 'settlement_amount',
                    'type' => 'number',
                    'is_required' => false,
                    'sort_order' => 1,
                ],
                [
                    'label' => 'Tipo de Juicio',
                    'name' => 'trial_type',
                    'type' => 'select',
                    'options' => [
                        ['label' => 'Civil', 'value' => 'civil'],
                        ['label' => 'Penal', 'value' => 'penal'],
                    ],
                    'is_required' => false,
                    'sort_order' => 2,
                ],
            ],
        ]);

        $response->assertRedirect(route('admin.content-types.index'));

        $this->assertDatabaseHas('content_types', [
            'user_id' => $user->id,
            'name' => 'Casos de Éxito',
            'slug' => 'casos-de-exito',
            'icon' => 'Scale',
        ]);

        $cpt = ContentType::where('slug', 'casos-de-exito')->first();
        $this->assertCount(3, $cpt->customFields);
        $this->assertDatabaseHas('custom_fields', [
            'content_type_id' => $cpt->id,
            'name' => 'court',
            'type' => 'text',
            'is_required' => 1,
        ]);
    }

    public function test_user_can_create_and_publish_content_under_cpt_with_custom_values(): void
    {
        $user = User::factory()->create();

        $cpt = $user->contentTypes()->create([
            'name' => 'Tratamientos',
            'singular_name' => 'Tratamiento',
            'slug' => 'tratamientos',
            'icon' => 'Stethoscope',
        ]);

        $cpt->customFields()->create([
            'label' => 'Duración (días)',
            'name' => 'recovery_days',
            'type' => 'number',
            'is_required' => true,
        ]);

        $cpt->customFields()->create([
            'label' => 'Requiere Anestesia',
            'name' => 'requires_anesthesia',
            'type' => 'boolean',
            'is_required' => false,
        ]);

        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Cirugía Menor',
            'slug' => 'cirugia-menor',
        ]);

        $tag = Tag::create([
            'user_id' => $user->id,
            'name' => 'Ambulatorio',
            'slug' => 'ambulatorio',
        ]);

        $response = $this->actingAs($user)->post(route('admin.content.store', $cpt->slug), [
            'title' => 'Rinoplastia Estética',
            'slug' => 'rinoplastia-estetica',
            'excerpt' => 'Procedimiento reconstructivo y estético',
            'body' => '## Detalles del procedimiento quirúrgico...',
            'status' => 'published',
            'featured' => true,
            'sort_order' => 1,
            'categories' => [$category->id],
            'tags' => [$tag->id],
            'custom_values' => [
                'recovery_days' => 14,
                'requires_anesthesia' => true,
            ],
            'meta_title' => 'Rinoplastia Avanzada',
            'meta_description' => 'Tratamiento seguro de rinoplastia',
        ]);

        $response->assertRedirect();

        $content = Content::where('slug', 'rinoplastia-estetica')->first();
        $this->assertNotNull($content);
        $this->assertEquals('Rinoplastia Estética', $content->title);
        $this->assertEquals(14, $content->getCustomValue('recovery_days'));
        $this->assertTrue($content->getCustomValue('requires_anesthesia'));
        $this->assertEquals('published', $content->status);
        $this->assertTrue($content->featured);

        // Relaciones
        $this->assertTrue($content->categories->contains($category));
        $this->assertTrue($content->tags->contains($tag));
    }

    public function test_dynamic_validation_enforces_required_custom_fields(): void
    {
        $user = User::factory()->create();

        $cpt = $user->contentTypes()->create([
            'name' => 'Consultorías',
            'singular_name' => 'Consultoría',
            'slug' => 'consultorias',
        ]);

        $cpt->customFields()->create([
            'label' => 'Tarifa Horaria',
            'name' => 'hourly_rate',
            'type' => 'number',
            'is_required' => true,
        ]);

        // Request missing the required hourly_rate
        $response = $this->actingAs($user)->post(route('admin.content.store', $cpt->slug), [
            'title' => 'Asesoría Fiscal',
            'status' => 'published',
            'custom_values' => [],
        ]);

        $response->assertSessionHasErrors(['custom_values.hourly_rate']);
    }

    public function test_user_can_reorder_contents(): void
    {
        $user = User::factory()->create();

        $cpt = $user->contentTypes()->create([
            'name' => 'Portafolio',
            'singular_name' => 'Proyecto',
            'slug' => 'portafolio',
        ]);

        $c1 = $cpt->contents()->create([
            'user_id' => $user->id,
            'title' => 'Item 1',
            'slug' => 'item-1',
            'status' => 'published',
            'sort_order' => 0,
        ]);

        $c2 = $cpt->contents()->create([
            'user_id' => $user->id,
            'title' => 'Item 2',
            'slug' => 'item-2',
            'status' => 'published',
            'sort_order' => 1,
        ]);

        // Reorder so Item 2 is first
        $response = $this->actingAs($user)->post(route('admin.content.reorder', $cpt->slug), [
            'order' => [$c2->id, $c1->id],
        ]);

        $response->assertStatus(302);

        $this->assertEquals(0, $c2->fresh()->sort_order);
        $this->assertEquals(1, $c1->fresh()->sort_order);
    }

    public function test_authenticated_user_receives_content_types_in_inertia_props(): void
    {
        $user = User::factory()->create();

        $user->contentTypes()->create([
            'name' => 'Testimonios',
            'singular_name' => 'Testimonio',
            'slug' => 'testimonios',
            'icon' => 'MessageSquare',
            'order' => 1,
        ]);

        $this->actingAs($user)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('content_types', 1)
                ->where('content_types.0.slug', 'testimonios')
                ->where('content_types.0.name', 'Testimonios')
            );
    }

    public function test_public_view_respects_custom_public_slug_and_loads_authorized_cpt(): void
    {
        $user = User::factory()->create();

        $cpt = $user->contentTypes()->create([
            'name' => 'Casos de Éxito',
            'singular_name' => 'Caso de Éxito',
            'slug' => 'casos-de-exito',
            'is_public' => true,
            'public_slug' => 'casos',
        ]);

        $content = $cpt->contents()->create([
            'user_id' => $user->id,
            'title' => 'Sentencia Histórica Tribunal Supremo',
            'slug' => 'sentencia-historica',
            'body' => 'Detalles del caso legal ganado.',
            'status' => 'published',
            'published_at' => now(),
            'featured' => true,
        ]);

        // 1. Archivo del CPT accesible mediante la URL personalizada
        $this->get('/casos')
            ->assertOk()
            ->assertSee('Casos de Éxito')
            ->assertSee('Sentencia Histórica Tribunal Supremo');

        // 2. Detalle del contenido accesible mediante /{public_slug}/{slug}
        $this->get('/casos/sentencia-historica')
            ->assertOk()
            ->assertSee('Sentencia Histórica Tribunal Supremo')
            ->assertSee('Detalles del caso legal ganado.');

        // 3. Aparece en el Navbar público
        $this->get('/')
            ->assertOk()
            ->assertSee('Casos de Éxito')
            ->assertSee(route('public.content.index', 'casos'));
    }

    public function test_cpt_unauthorized_from_admin_returns_404_and_is_hidden_from_public(): void
    {
        $user = User::factory()->create();

        $cpt = $user->contentTypes()->create([
            'name' => 'Registros Médicos Internos',
            'singular_name' => 'Registro',
            'slug' => 'registros-internos',
            'is_public' => false, // Desautorizado para vista pública
            'public_slug' => 'internos',
        ]);

        $content = $cpt->contents()->create([
            'user_id' => $user->id,
            'title' => 'Ficha Confidencial Paciente #402',
            'slug' => 'ficha-402',
            'body' => 'Datos confidenciales',
            'status' => 'published',
            'published_at' => now(),
            'featured' => true,
        ]);

        // 1. Visitar la URL pública devuelve 404
        $this->get('/internos')->assertNotFound();
        $this->get('/registros-internos')->assertNotFound();
        $this->get('/internos/ficha-402')->assertNotFound();

        // 2. No aparece en la navegación pública ni en portada
        $this->get('/')
            ->assertOk()
            ->assertDontSee('Registros Médicos Internos')
            ->assertDontSee('Ficha Confidencial Paciente #402');
    }

    public function test_client_user_can_view_content_types_index_with_assigned_cpts(): void
    {
        $client = User::factory()->create(['role' => 'user']);
        $admin = User::factory()->admin()->create();

        $clientCpt = ContentType::create([
            'user_id' => $client->id,
            'name' => 'Servicios Legales',
            'singular_name' => 'Servicio Legal',
            'slug' => 'servicios-legales',
            'is_public' => true,
        ]);

        $adminCpt = ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Módulos Internos',
            'singular_name' => 'Módulo',
            'slug' => 'modulos-internos',
            'is_public' => false,
        ]);

        $response = $this->actingAs($client)
            ->get(route('admin.content-types.index'))
            ->assertOk();

        // En Inertia, el cliente solo recibe sus propios CPTs
        $cpts = $response->viewData('page')['props']['contentTypes'];
        $this->assertCount(1, $cpts);
        $this->assertEquals('servicios-legales', $cpts[0]['slug']);
    }

    public function test_client_user_can_toggle_visibility_of_own_cpt(): void
    {
        $client = User::factory()->create(['role' => 'user']);

        $cpt = ContentType::create([
            'user_id' => $client->id,
            'name' => 'Mis Asesorías',
            'singular_name' => 'Asesoría',
            'slug' => 'mis-asesorias',
            'is_public' => true,
        ]);

        $this->actingAs($client)
            ->patch(route('admin.content-types.visibility', $cpt->id))
            ->assertRedirect();

        $this->assertFalse($cpt->fresh()->is_public);

        // Toggle again to re-enable
        $this->actingAs($client)
            ->patch(route('admin.content-types.visibility', $cpt->id))
            ->assertRedirect();

        $this->assertTrue($cpt->fresh()->is_public);
    }

    public function test_client_user_cannot_create_update_or_delete_cpts(): void
    {
        $client = User::factory()->create(['role' => 'user']);

        $cpt = ContentType::create([
            'user_id' => $client->id,
            'name' => 'Protegido',
            'singular_name' => 'Protegido',
            'slug' => 'protegido',
        ]);

        // Intentar crear CPT
        $this->actingAs($client)
            ->get(route('admin.content-types.create'))
            ->assertForbidden();

        $this->actingAs($client)
            ->post(route('admin.content-types.store'), [
                'name' => 'Nuevo Hack',
            ])
            ->assertForbidden();

        // Intentar editar CPT
        $this->actingAs($client)
            ->get(route('admin.content-types.edit', $cpt->id))
            ->assertForbidden();

        $this->actingAs($client)
            ->put(route('admin.content-types.update', $cpt->id), [
                'name' => 'Hackeado',
            ])
            ->assertForbidden();

        // Intentar eliminar CPT
        $this->actingAs($client)
            ->delete(route('admin.content-types.destroy', $cpt->id))
            ->assertForbidden();
    }

    public function test_super_admin_can_assign_cpt_to_client_user_and_reassign(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['name' => 'Cliente Uno', 'role' => 'user']);
        $clientTwo = User::factory()->create(['name' => 'Cliente Dos', 'role' => 'user']);

        // 1. Super Admin crea CPT asignándolo a $client
        $response = $this->actingAs($admin)->post(route('admin.content-types.store'), [
            'user_id' => $client->id,
            'name' => 'Tratamientos Estéticos',
            'singular_name' => 'Tratamiento',
            'slug' => 'tratamientos-esteticos',
            'icon' => 'Stethoscope',
            'is_public' => true,
            'public_slug' => 'tratamientos',
            'has_categories' => true,
            'has_tags' => true,
        ]);

        $response->assertRedirect(route('admin.content-types.index'));

        $cpt = ContentType::where('slug', 'tratamientos-esteticos')->first();
        $this->assertNotNull($cpt);
        $this->assertEquals($client->id, $cpt->user_id);

        // 2. Super Admin reasigna el CPT a $clientTwo
        $updateResponse = $this->actingAs($admin)->put(route('admin.content-types.update', $cpt->id), [
            'user_id' => $clientTwo->id,
            'name' => 'Tratamientos Estéticos Clínicos',
            'singular_name' => 'Tratamiento',
            'slug' => 'tratamientos-esteticos',
            'icon' => 'Stethoscope',
            'is_public' => true,
            'public_slug' => 'tratamientos',
            'has_categories' => true,
            'has_tags' => true,
        ]);

        $updateResponse->assertRedirect(route('admin.content-types.index'));
        $this->assertEquals($clientTwo->id, $cpt->fresh()->user_id);
    }

    public function test_cpt_assigned_to_client_does_not_appear_in_super_admin_menu(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['name' => 'Cliente', 'role' => 'user']);

        // CPT del admin
        $admin->contentTypes()->create([
            'name' => 'Admin Blog',
            'singular_name' => 'Admin Post',
            'slug' => 'admin-blog',
        ]);

        // CPT asignado al cliente
        $client->contentTypes()->create([
            'name' => 'Casos Cliente',
            'singular_name' => 'Caso Cliente',
            'slug' => 'casos-cliente',
        ]);

        // 1. El super admin solo ve sus propios CPTs en su menú Inertia (content_types prop)
        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('content_types', 1)
                ->where('content_types.0.slug', 'admin-blog')
            );

        // 2. El cliente solo ve sus propios CPTs en su menú Inertia (content_types prop)
        $this->actingAs($client)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('content_types', 1)
                ->where('content_types.0.slug', 'casos-cliente')
            );
    }

    public function test_content_policy_prevents_client_from_updating_or_deleting_other_user_content(): void
    {
        $owner = User::factory()->create(['role' => 'user']);
        $attacker = User::factory()->create(['role' => 'user']);

        $cpt = $owner->contentTypes()->create([
            'name' => 'Proyectos Privados',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos-privados',
        ]);

        $content = $owner->contents()->create([
            'content_type_id' => $cpt->id,
            'title' => 'Proyecto Secreto',
            'slug' => 'proyecto-secreto',
            'status' => 'published',
        ]);

        // Intento de edición por parte del atacante
        $this->actingAs($attacker)
            ->get(route('admin.content.edit', [$cpt->slug, $content->id]))
            ->assertForbidden();

        // Intento de actualización por parte del atacante
        $this->actingAs($attacker)
            ->put(route('admin.content.update', [$cpt->slug, $content->id]), [
                'title' => 'Hacked Title',
                'status' => 'draft',
            ])
            ->assertForbidden();

        // Intento de borrado por parte del atacante
        $this->actingAs($attacker)
            ->delete(route('admin.content.destroy', [$cpt->slug, $content->id]))
            ->assertForbidden();

        // Verificar que el contenido sigue intacto
        $this->assertDatabaseHas('contents', [
            'id' => $content->id,
            'title' => 'Proyecto Secreto',
        ]);
    }

    public function test_super_admin_can_update_and_delete_any_content(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['role' => 'user']);

        $cpt = $client->contentTypes()->create([
            'name' => 'Casos Cliente',
            'singular_name' => 'Caso',
            'slug' => 'casos-cliente',
        ]);

        $content = $client->contents()->create([
            'content_type_id' => $cpt->id,
            'title' => 'Caso Inicial',
            'slug' => 'caso-inicial',
            'status' => 'draft',
        ]);

        // Super Admin puede editar
        $this->actingAs($admin)
            ->get(route('admin.content.edit', [$cpt->slug, $content->id]))
            ->assertOk();

        // Super Admin puede actualizar
        $this->actingAs($admin)
            ->put(route('admin.content.update', [$cpt->slug, $content->id]), [
                'title' => 'Caso Auditado',
                'status' => 'published',
            ])
            ->assertRedirect(route('admin.content.edit', [$cpt->slug, $content->id]));

        $this->assertEquals('Caso Auditado', $content->fresh()->title);

        // Super Admin puede eliminar
        $this->actingAs($admin)
            ->delete(route('admin.content.destroy', [$cpt->slug, $content->id]))
            ->assertRedirect(route('admin.content.index', $cpt->slug));

        $this->assertSoftDeleted('contents', ['id' => $content->id]);
    }

    public function test_dashboard_returns_dynamic_metrics_and_recent_contents(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $cpt = $user->contentTypes()->create([
            'name' => 'Portfolio Items',
            'singular_name' => 'Item',
            'slug' => 'portfolio-items',
            'icon' => 'Briefcase',
        ]);

        $user->contents()->create([
            'content_type_id' => $cpt->id,
            'title' => 'Item Publicado',
            'slug' => 'item-publicado',
            'status' => 'published',
        ]);

        $user->contents()->create([
            'content_type_id' => $cpt->id,
            'title' => 'Item Borrador',
            'slug' => 'item-borrador',
            'status' => 'draft',
        ]);

        $this->actingAs($user)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('stats.contents')
                ->where('stats.contents.total', 2)
                ->where('stats.contents.published', 1)
                ->where('stats.contents.drafts', 1)
                ->has('recentContents', 2)
                ->where('recentContents.0.content_type.name', 'Portfolio Items')
            );
    }

    public function test_public_universal_views_render_for_cpt_index_and_show(): void
    {
        $user = User::factory()->create();

        $cpt = $user->contentTypes()->create([
            'name' => 'Experiencias',
            'singular_name' => 'Experiencia',
            'slug' => 'experiencias',
            'public_slug' => 'exp',
            'is_public' => true,
            'description' => 'Listado de experiencias profesionales',
        ]);

        $cpt->customFields()->create([
            'label' => 'Empresa',
            'name' => 'company',
            'type' => 'text',
            'is_required' => true,
        ]);

        $content = $user->contents()->create([
            'content_type_id' => $cpt->id,
            'title' => 'Desarrollo en Google',
            'slug' => 'desarrollo-en-google',
            'excerpt' => 'Liderazgo técnico en equipo de UI',
            'body' => '## Detalles del proyecto...',
            'custom_values' => ['company' => 'Google Inc'],
            'status' => 'published',
            'published_at' => now(),
            'meta_title' => 'Google Experience SEO',
            'meta_description' => 'Descripción optimizada para Google',
        ]);

        // 1. Acceso a vista pública de listado universal (/exp)
        $indexResponse = $this->get('/exp');
        $indexResponse->assertOk()
            ->assertViewIs('public.content.universal-index')
            ->assertSee('Experiencias')
            ->assertSee('Desarrollo en Google');

        // 2. Acceso a vista pública de detalle universal (/exp/desarrollo-en-google)
        $showResponse = $this->get('/exp/desarrollo-en-google');
        $showResponse->assertOk()
            ->assertViewIs('public.content.universal-show')
            ->assertSee('Desarrollo en Google')
            ->assertSee('Google Inc')
            ->assertSee('Google Experience SEO')
            ->assertSee('Descripción optimizada para Google');
    }

    public function test_clean_urls_without_c_prefix_and_editable_permalinks(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $cpt = $user->contentTypes()->create([
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'public_slug' => 'proyectos',
            'is_public' => true,
        ]);

        $content = $user->contents()->create([
            'content_type_id' => $cpt->id,
            'title' => 'App Fintech',
            'slug' => 'app-fintech-v1',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // 1. Admin: Acceso directo sin /c/ (/admin/proyectos)
        $this->actingAs($user)
            ->get('/admin/proyectos')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Content/Index')
                ->where('contentType.slug', 'proyectos')
            );

        // 2. Admin: Compatibilidad con /admin/c/proyectos redirige limpiamente a /admin/proyectos
        $this->actingAs($user)
            ->get('/admin/c/proyectos')
            ->assertRedirect(route('admin.content.index', 'proyectos'));

        // 3. Admin: Edición del permalink / slug del single (como en WP)
        $this->actingAs($user)
            ->put(route('admin.content.update', [$cpt->slug, $content->id]), [
                'title' => 'App Fintech 2.0',
                'slug' => 'app-fintech-personalizado',
                'status' => 'published',
            ])
            ->assertRedirect(route('admin.content.edit', [$cpt->slug, $content->id]));

        $this->assertEquals('app-fintech-personalizado', $content->fresh()->slug);

        // 4. Público: Acceso con nuevo permalink directo (/proyectos/app-fintech-personalizado)
        $this->get('/proyectos/app-fintech-personalizado')
            ->assertOk()
            ->assertViewIs('public.content.universal-show')
            ->assertSee('App Fintech 2.0');

        // 5. Público: Compatibilidad con /c/ redirige 301 a la URL limpia
        $this->get('/c/proyectos')
            ->assertRedirect('/proyectos');

        $this->get('/c/proyectos/app-fintech-personalizado')
            ->assertRedirect('/proyectos/app-fintech-personalizado');
    }

    public function test_async_modal_saving_supports_json_and_from_modal_redirect(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $cpt = $user->contentTypes()->create([
            'name' => 'Servicios',
            'singular_name' => 'Servicio',
            'slug' => 'servicios',
            'is_public' => true,
        ]);

        // 1. Guardado asíncrono con _from_modal redirige back() manteniendo la pantalla
        $responseModal = $this->actingAs($user)
            ->from(route('admin.content.index', $cpt->slug))
            ->post(route('admin.content.store', $cpt->slug), [
                'title' => 'Auditoría Cloud',
                'status' => 'published',
                '_from_modal' => 1,
            ]);

        $responseModal->assertRedirect(route('admin.content.index', $cpt->slug));
        $this->assertDatabaseHas('contents', [
            'title' => 'Auditoría Cloud',
            'user_id' => $user->id,
        ]);

        $content = Content::where('title', 'Auditoría Cloud')->first();

        // 2. Actualización asíncrona vía JSON/AJAX
        $responseJson = $this->actingAs($user)
            ->putJson(route('admin.content.update', [$cpt->slug, $content->id]), [
                'title' => 'Auditoría Cloud Enterprise',
                'status' => 'published',
            ]);

        $responseJson->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertEquals('Auditoría Cloud Enterprise', $content->fresh()->title);

        // 3. Petición proveniente de Inertia con X-Requested-With (NO debe devolver JSON plano)
        $responseInertia = $this->actingAs($user)
            ->withHeaders([
                'X-Inertia' => 'true',
                'X-Requested-With' => 'XMLHttpRequest',
            ])
            ->put(route('admin.content.update', [$cpt->slug, $content->id]), [
                'title' => 'Auditoría Cloud Inertia',
                'status' => 'published',
            ]);

        $responseInertia->assertRedirect();
        $this->assertFalse($responseInertia->isOk() && $responseInertia->headers->get('Content-Type') === 'application/json');
    }
}
