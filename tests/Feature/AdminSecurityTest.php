<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_inertia_shared_user_prop_is_strictly_sanitized(): void
    {
        $user = User::factory()->create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
        ]);

        UserPreference::create([
            'user_id' => $user->id,
            'theme' => 'dark',
            'table_density' => 'compact',
        ]);

        $this->actingAs($user)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->has('auth.user', fn (Assert $prop) => $prop
                    ->where('id', $user->id)
                    ->where('name', 'Admin Test')
                    ->where('email', 'admin@test.com')
                    ->where('role', 'user')
                    ->where('role_name', 'Cliente')
                    ->where('has_telemetry', false)
                    ->where('is_active', true)
                    ->where('theme', 'dark')
                    ->where('color_palette', null)
                    ->missing('password')
                    ->missing('remember_token')
                    ->missing('two_factor_secret')
                    ->missing('two_factor_recovery_codes')
                    ->missing('preference')
                    ->missing('created_at')
                    ->missing('updated_at')
                )
            );
    }

    public function test_user_model_hides_sensitive_attributes_from_serialization(): void
    {
        $user = User::factory()->create([
            'password' => 'secret123',
            'remember_token' => 'token123',
        ]);

        $array = $user->toArray();

        $this->assertArrayNotHasKey('password', $array);
        $this->assertArrayNotHasKey('remember_token', $array);
        $this->assertArrayNotHasKey('two_factor_secret', $array);
        $this->assertArrayNotHasKey('two_factor_recovery_codes', $array);
    }

    public function test_user_preferences_can_be_retrieved_via_sanitized_endpoint(): void
    {
        $user = User::factory()->create();

        UserPreference::create([
            'user_id' => $user->id,
            'theme' => 'dark',
            'table_density' => 'compact',
            'items_per_page' => 25,
            'editor_mode' => 'markdown',
            'email_notifications' => true,
            'color_palette' => ['primary' => '#0d6efd', 'secondary' => '#6c757d'],
        ]);

        $response = $this->actingAs($user)
            ->getJson(route('admin.preferences.show'))
            ->assertOk()
            ->assertJson([
                'preference' => [
                    'theme' => 'dark',
                    'table_density' => 'compact',
                    'items_per_page' => 25,
                    'editor_mode' => 'markdown',
                    'email_notifications' => true,
                    'color_palette' => ['primary' => '#0d6efd', 'secondary' => '#6c757d'],
                ],
            ]);

        $data = $response->json('preference');
        $this->assertArrayNotHasKey('id', $data);
        $this->assertArrayNotHasKey('user_id', $data);
        $this->assertArrayNotHasKey('created_at', $data);
        $this->assertArrayNotHasKey('updated_at', $data);
    }

    public function test_preferences_edit_view_renders_with_sanitized_props(): void
    {
        $user = User::factory()->create();

        UserPreference::create([
            'user_id' => $user->id,
            'theme' => 'light',
            'table_density' => 'comfortable',
            'items_per_page' => 20,
            'editor_mode' => 'rich_text',
            'email_notifications' => false,
            'color_palette' => ['primary' => '#0284c7', 'secondary' => '#64748b'],
        ]);

        $response = $this->actingAs($user)
            ->get(route('admin.preferences.edit'))
            ->assertOk();

        $page = $response->viewData('page');
        $preferenceProp = $page['props']['preference'];

        $this->assertEquals('light', $preferenceProp['theme']);
        $this->assertEquals('comfortable', $preferenceProp['table_density']);
        $this->assertEquals(20, $preferenceProp['items_per_page']);
        $this->assertArrayNotHasKey('id', $preferenceProp);
        $this->assertArrayNotHasKey('user_id', $preferenceProp);
        $this->assertArrayNotHasKey('created_at', $preferenceProp);
    }
}
