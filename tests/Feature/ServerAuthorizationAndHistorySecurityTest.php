<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ContentType;
use App\Models\Message;
use App\Models\Role;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServerAuthorizationAndHistorySecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $client;

    protected User $otherClient;

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

        $this->otherClient = User::factory()->create([
            'role_id' => $clientRole->id,
            'is_active' => true,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Inertia History Encryption & Clear History Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_history_encryption_is_enabled_in_inertia_response_for_authenticated_users(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));

        $response->assertOk();

        // In Inertia v2, encryptHistory boolean is present in page payload
        $page = $response->viewData('page');
        $this->assertTrue($page['encryptHistory'] ?? false, 'Expected Inertia encryptHistory to be true');
    }

    public function test_logout_clears_browser_history_on_subsequent_inertia_visit(): void
    {
        $this->actingAs($this->client);

        $logoutResponse = $this->post('/logout');
        $logoutResponse->assertRedirect('/login');

        // Subsequent visit to login receives clearHistory = true
        $loginResponse = $this->get('/login');
        $loginResponse->assertOk();

        $page = $loginResponse->viewData('page');
        $this->assertTrue($page['clearHistory'] ?? false, 'Expected Inertia clearHistory to be true on next visit');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Server-side Authorization: Zero Trust Frontend
    // ─────────────────────────────────────────────────────────────────────────

    public function test_non_admin_client_cannot_access_or_manage_users_crud(): void
    {
        // Even if frontend buttons were manipulated in DOM, backend must reject with 403
        $this->actingAs($this->client)
            ->get(route('admin.users.index'))
            ->assertForbidden();

        $this->actingAs($this->client)
            ->get(route('admin.users.create'))
            ->assertForbidden();

        $this->actingAs($this->client)
            ->post(route('admin.users.store'), [
                'name' => 'Hacked Admin',
                'email' => 'hacked@example.com',
                'password' => 'Password123!',
                'role_id' => $this->admin->role_id,
            ])
            ->assertForbidden();

        $this->actingAs($this->client)
            ->delete(route('admin.users.destroy', $this->otherClient))
            ->assertForbidden();

        $this->actingAs($this->client)
            ->patch(route('admin.users.status', $this->otherClient))
            ->assertForbidden();

        $this->actingAs($this->client)
            ->patch(route('admin.users.telemetry', $this->otherClient))
            ->assertForbidden();
    }

    public function test_non_admin_client_cannot_create_or_delete_content_types(): void
    {
        $cpt = ContentType::create([
            'user_id' => $this->admin->id,
            'name' => 'Proyectos Especiales',
            'singular_name' => 'Proyecto Especial',
            'slug' => 'proyectos-especiales',
            'is_public' => true,
            'has_categories' => true,
            'has_tags' => true,
            'order' => 1,
        ]);

        $this->actingAs($this->client)
            ->post(route('admin.content-types.store'), [
                'name' => 'Injected CPT',
            ])
            ->assertForbidden();

        $this->actingAs($this->client)
            ->delete(route('admin.content-types.destroy', $cpt))
            ->assertForbidden();
    }

    public function test_non_admin_client_cannot_view_or_delete_other_users_messages(): void
    {
        $adminMessage = Message::create([
            'user_id' => $this->admin->id,
            'name' => 'Inquiry for Admin',
            'email' => 'lead@example.com',
            'message' => 'Confidential business lead',
        ]);

        $this->actingAs($this->client)
            ->get(route('admin.messages.show', $adminMessage))
            ->assertForbidden();

        $this->actingAs($this->client)
            ->delete(route('admin.messages.destroy', $adminMessage))
            ->assertForbidden();

        // Ensure the message was not deleted
        $this->assertDatabaseHas('messages', ['id' => $adminMessage->id]);
    }

    public function test_messages_index_strictly_isolates_client_messages(): void
    {
        Message::create([
            'user_id' => $this->admin->id,
            'name' => 'Admin Lead',
            'email' => 'admin-lead@example.com',
            'message' => 'Admin lead text',
        ]);

        $clientMessage = Message::create([
            'user_id' => $this->client->id,
            'name' => 'Client Lead',
            'email' => 'client-lead@example.com',
            'message' => 'Client lead text',
        ]);

        $response = $this->actingAs($this->client)->get(route('admin.messages.index'));
        $response->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Messages/Index')
            ->has('messages.data', 1)
            ->where('messages.data.0.id', $clientMessage->id)
            ->where('messages.data.0.name', 'Client Lead')
        );
    }

    public function test_non_admin_cannot_purge_admin_or_all_cache(): void
    {
        $this->actingAs($this->client)
            ->postJson(route('admin.preferences.cache.clear'), ['scope' => 'admin'])
            ->assertForbidden();

        $this->actingAs($this->client)
            ->postJson(route('admin.preferences.cache.clear'), ['scope' => 'all'])
            ->assertForbidden();

        // Public cache purge is permitted
        $this->actingAs($this->client)
            ->postJson(route('admin.preferences.cache.clear'), ['scope' => 'public'])
            ->assertOk();
    }

    public function test_non_admin_cannot_associate_category_with_unauthorized_content_type(): void
    {
        $adminCpt = ContentType::create([
            'user_id' => $this->admin->id,
            'name' => 'Privado Admin',
            'singular_name' => 'Privado',
            'slug' => 'privado-admin',
            'is_public' => false,
            'has_categories' => true,
            'has_tags' => true,
        ]);

        $this->actingAs($this->client)
            ->postJson(route('admin.categories.store'), [
                'name' => 'Hack Category',
                'content_type_id' => $adminCpt->id,
            ])
            ->assertForbidden();
    }

    public function test_non_admin_cannot_delete_other_users_taxonomy(): void
    {
        $cpt = ContentType::create([
            'user_id' => $this->admin->id,
            'name' => 'Portafolio CPT',
            'singular_name' => 'Item',
            'slug' => 'portafolio-cpt',
            'is_public' => true,
            'has_categories' => true,
            'has_tags' => true,
        ]);

        $cpt->users()->sync([$this->client->id, $this->otherClient->id]);

        $otherClientCategory = Category::create([
            'user_id' => $this->otherClient->id,
            'content_type_id' => $cpt->id,
            'name' => 'Other Client Category',
            'slug' => 'other-client-category',
        ]);

        $otherClientTag = Tag::create([
            'user_id' => $this->otherClient->id,
            'name' => 'Other Client Tag',
            'slug' => 'other-client-tag',
        ]);

        $this->actingAs($this->client)
            ->delete(route('admin.content.categories.destroy', [$cpt->slug, $otherClientCategory]))
            ->assertForbidden();

        $this->actingAs($this->client)
            ->delete(route('admin.content.tags.destroy', [$cpt->slug, $otherClientTag]))
            ->assertForbidden();

        $this->assertDatabaseHas('categories', ['id' => $otherClientCategory->id]);
        $this->assertDatabaseHas('tags', ['id' => $otherClientTag->id]);
    }
}
