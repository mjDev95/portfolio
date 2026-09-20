<?php

namespace Tests\Feature;

use App\Models\ContentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_user_management_index(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['name' => 'Cliente Test']);

        ContentType::create([
            'user_id' => $client->id,
            'name' => 'Casos',
            'singular_name' => 'Caso',
            'slug' => 'casos',
            'icon' => 'Scale',
            'order' => 0,
        ]);

        $totalUsers = User::count();

        $response = $this->actingAs($admin)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users/Index')
                ->has('users.data', $totalUsers)
                ->has('roles')
            );
    }

    public function test_regular_client_cannot_access_user_management(): void
    {
        $client = User::factory()->create();

        $this->actingAs($client)
            ->get(route('admin.users.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_create_new_client_user(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Nuevo Cliente',
            'email' => 'nuevo@cliente.com',
            'password' => 'SecurePass123!#',
            'password_confirmation' => 'SecurePass123!#',
            'role_id' => 2,
            'has_telemetry' => true,
        ]);

        $response->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'Nuevo Cliente',
            'email' => 'nuevo@cliente.com',
            'role_id' => 2,
            'has_telemetry' => true,
        ]);
    }

    public function test_super_admin_can_update_user_details(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'old@cliente.com',
            'role_id' => 2,
            'has_telemetry' => false,
        ]);

        $response = $this->actingAs($admin)->put(route('admin.users.update', $client), [
            'name' => 'Updated Name',
            'email' => 'updated@cliente.com',
            'role_id' => 2,
            'has_telemetry' => true,
        ]);

        $response->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'id' => $client->id,
            'name' => 'Updated Name',
            'email' => 'updated@cliente.com',
            'role_id' => 2,
            'has_telemetry' => true,
        ]);
    }

    public function test_super_admin_can_toggle_telemetry_for_a_user(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create([
            'has_telemetry' => false,
        ]);

        $response = $this->actingAs($admin)->patch(route('admin.users.telemetry', $client));
        $response->assertSessionHas('success');

        $this->assertTrue($client->fresh()->has_telemetry);

        // Toggle back to false
        $this->actingAs($admin)->patch(route('admin.users.telemetry', $client));
        $this->assertFalse($client->fresh()->has_telemetry);
    }

    public function test_regular_client_cannot_toggle_telemetry(): void
    {
        $client1 = User::factory()->create(['has_telemetry' => false]);
        $client2 = User::factory()->create(['has_telemetry' => false]);

        $this->actingAs($client1)
            ->patch(route('admin.users.telemetry', $client2))
            ->assertForbidden();

        $this->assertFalse($client2->fresh()->has_telemetry);
    }

    public function test_super_admin_cannot_delete_own_account(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $admin));
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_super_admin_can_delete_client_user(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create();

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $client));
        $response->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseMissing('users', ['id' => $client->id]);
    }

    public function test_dashboard_returns_global_metrics_and_users_list_for_super_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('isAdmin', true)
                ->has('usersList')
                ->has('stats.users.total')
                ->has('stats.contents.total')
            );
    }

    public function test_dashboard_returns_client_scoped_data_for_regular_client(): void
    {
        $client = User::factory()->create();

        $this->actingAs($client)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('isAdmin', false)
                ->where('usersList', [])
                ->has('stats.contents.total')
            );
    }
}
