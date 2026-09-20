<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionAndSuspensionTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_toggle_user_active_status(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['is_active' => true]);

        // Toggle to paused (false)
        $response = $this->actingAs($admin)->patch(route('admin.users.status', $client));
        $response->assertSessionHas('success');

        $this->assertFalse($client->fresh()->isActive());

        // Toggle back to active (true)
        $this->actingAs($admin)->patch(route('admin.users.status', $client));
        $this->assertTrue($client->fresh()->isActive());
    }

    public function test_super_admin_cannot_pause_own_account(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->patch(route('admin.users.status', $admin));
        $response->assertSessionHas('error');

        $this->assertTrue($admin->fresh()->isActive());
    }

    public function test_regular_client_cannot_toggle_user_status(): void
    {
        $client1 = User::factory()->create();
        $client2 = User::factory()->create();

        $this->actingAs($client1)
            ->patch(route('admin.users.status', $client2))
            ->assertForbidden();
    }

    public function test_paused_user_cannot_authenticate_via_login(): void
    {
        $client = User::factory()->paused()->create([
            'email' => 'paused@cliente.com',
            'password' => 'password123',
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'paused@cliente.com',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_active_user_can_authenticate_normally(): void
    {
        $client = User::factory()->create([
            'email' => 'active@cliente.com',
            'password' => 'password123',
            'is_active' => true,
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'active@cliente.com',
            'password' => 'password123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.dashboard', absolute: false));
    }

    public function test_active_session_is_terminated_if_user_gets_paused(): void
    {
        $client = User::factory()->paused()->create();

        $response = $this->actingAs($client)->get(route('admin.dashboard'));

        $this->assertGuest();
        $response->assertRedirect(route('admin.login'));
    }

    public function test_public_site_returns_401_when_portfolio_owner_is_paused(): void
    {
        // 1. Desactivar todos los clientes existentes en BD para la prueba
        User::where('role_id', 2)->orWhere('email', 'mjgaliciab@gmail.com')->update(['is_active' => false]);

        // 2. Visitar el sitio público (home)
        $response = $this->get('/');

        $response->assertStatus(401);
        $response->assertSee('Sitio Web Suspendido Temporalmente');
    }

    public function test_public_cpt_route_returns_401_when_cpt_owner_is_paused(): void
    {
        $client = User::factory()->paused()->create();

        $cpt = ContentType::create([
            'user_id' => $client->id,
            'name' => 'Casos',
            'singular_name' => 'Caso',
            'slug' => 'casos',
            'public_slug' => 'casos',
            'icon' => 'Scale',
            'is_public' => true,
            'order' => 0,
        ]);

        $content = Content::create([
            'user_id' => $client->id,
            'content_type_id' => $cpt->id,
            'title' => 'Sentencia Favorable',
            'slug' => 'sentencia-favorable',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // CPT index devuelve 401
        $this->get('/casos')->assertStatus(401);

        // CPT single devuelve 401
        $this->get('/casos/sentencia-favorable')->assertStatus(401);
    }

    public function test_public_site_returns_200_when_portfolio_owner_is_active(): void
    {
        // Asegurar que el cliente principal esté activo
        User::where('role_id', 2)->orWhere('email', 'mjgaliciab@gmail.com')->update(['is_active' => true]);

        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
