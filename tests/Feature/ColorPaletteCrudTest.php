<?php

namespace Tests\Feature;

use App\Models\ColorPalette;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ColorPaletteCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $client;

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
    }

    public function test_super_admin_can_list_color_palettes_via_json_api(): void
    {
        $palette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Emerald Slate',
            'primary_color' => '#059669',
            'secondary_color' => '#0F172A',
        ]);

        $response = $this->actingAs($this->admin)->getJson(route('admin.brand.palettes.index'));

        $response->assertOk();
        $response->assertJsonFragment([
            'name' => 'Emerald Slate',
            'primary_color' => '#059669',
        ]);
    }

    public function test_super_admin_can_create_new_color_palette(): void
    {
        $payload = [
            'name' => 'Nordic Frost',
            'priority' => '07',
            'tagline' => 'Minimalismo nórdico para tecnología limpia',
            'description' => 'Armonía fría basada en cian glaciar y pizarra oscura.',
            'theory_title' => 'Construcción Fría Monocromática',
            'theory_text' => 'El cian polar estimula la claridad mental y reduce la fatiga.',
            'primary_color' => '#06B6D4',
            'secondary_color' => '#1E293B',
            'tertiary_color' => '#38BDF8',
            'accent_color' => '#F43F5E',
            'dark_neutral' => '#0B0D0E',
            'light_neutral' => '#F8F9FA',
            'is_master' => false,
        ];

        $response = $this->actingAs($this->admin)->postJson(route('admin.brand.palettes.store'), $payload);

        $response->assertCreated();
        $response->assertJson([
            'success' => true,
            'palette' => [
                'name' => 'Nordic Frost',
                'primary_color' => '#06B6D4',
            ],
        ]);

        $this->assertDatabaseHas('color_palettes', [
            'name' => 'Nordic Frost',
            'primary_color' => '#06B6D4',
            'is_system' => false,
        ]);

        $palette = ColorPalette::where('name', 'Nordic Frost')->first();
        $this->assertNotEmpty($palette->slug);
        $this->assertIsArray($palette->colors);
        $this->assertGreaterThanOrEqual(2, count($palette->colors));
    }

    public function test_validation_rules_for_color_palette_creation(): void
    {
        $response = $this->actingAs($this->admin)->postJson(route('admin.brand.palettes.store'), [
            'name' => '',
            'primary_color' => 'invalid-hex',
            'secondary_color' => '',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'primary_color', 'secondary_color']);
    }

    public function test_super_admin_can_update_color_palette(): void
    {
        $palette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Sunset Violet',
            'primary_color' => '#7C3AED',
            'secondary_color' => '#F59E0B',
            'is_system' => false,
        ]);

        $response = $this->actingAs($this->admin)->putJson(route('admin.brand.palettes.update', $palette), [
            'name' => 'Sunset Violet Ultra',
            'primary_color' => '#6D28D9',
            'secondary_color' => '#D97706',
            'tagline' => 'Actualizado para alto impacto',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('color_palettes', [
            'id' => $palette->id,
            'name' => 'Sunset Violet Ultra',
            'primary_color' => '#6D28D9',
            'secondary_color' => '#D97706',
        ]);
    }

    public function test_super_admin_can_delete_color_palette(): void
    {
        $palette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Temp Palette',
            'primary_color' => '#10B981',
            'secondary_color' => '#111827',
            'is_system' => true,
        ]);

        $response = $this->actingAs($this->admin)->deleteJson(route('admin.brand.palettes.destroy', $palette));

        $response->assertOk();
        $this->assertDatabaseMissing('color_palettes', [
            'id' => $palette->id,
        ]);
    }

    public function test_deleting_active_color_palette_reassigns_user_preferences_safely(): void
    {
        $activePalette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Active Palette',
            'slug' => 'active-palette',
            'primary_color' => '#CB2128',
            'secondary_color' => '#DFB136',
        ]);

        $fallbackPalette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Fallback Palette',
            'slug' => 'fallback-palette',
            'primary_color' => '#2563EB',
            'secondary_color' => '#1D4ED8',
        ]);

        $this->admin->preference()->create([
            'color_palette_id' => $activePalette->id,
            'color_palette' => [
                'id' => $activePalette->slug,
                'name' => $activePalette->name,
                'colors' => [
                    'primary' => $activePalette->primary_color,
                    'secondary' => $activePalette->secondary_color,
                ],
            ],
        ]);

        $response = $this->actingAs($this->admin)->deleteJson(route('admin.brand.palettes.destroy', $activePalette));

        $response->assertOk();
        $this->assertDatabaseMissing('color_palettes', [
            'id' => $activePalette->id,
        ]);

        $pref = $this->admin->fresh()->preference;
        $this->assertEquals($fallbackPalette->id, $pref->color_palette_id);
    }

    public function test_regular_client_cannot_access_color_palette_crud(): void
    {
        $palette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Protected Palette',
            'primary_color' => '#3B82F6',
            'secondary_color' => '#1E3A8A',
        ]);

        // List
        $this->actingAs($this->client)->getJson(route('admin.brand.palettes.index'))->assertForbidden();

        // Create
        $this->actingAs($this->client)->postJson(route('admin.brand.palettes.store'), [
            'name' => 'Hack Palette',
            'primary_color' => '#000000',
            'secondary_color' => '#FFFFFF',
        ])->assertForbidden();

        // Update
        $this->actingAs($this->client)->putJson(route('admin.brand.palettes.update', $palette), [
            'name' => 'Hacked Name',
            'primary_color' => '#111111',
            'secondary_color' => '#222222',
        ])->assertForbidden();

        // Destroy
        $this->actingAs($this->client)->deleteJson(route('admin.brand.palettes.destroy', $palette))->assertForbidden();
    }

    public function test_super_admin_can_select_color_palette_id_in_preferences(): void
    {
        $palette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Crimson Nexus',
            'slug' => 'crimson-nexus',
            'primary_color' => '#BE123C',
            'secondary_color' => '#1D4ED8',
            'is_system' => false,
        ]);

        $response = $this->actingAs($this->admin)->putJson(route('admin.preferences.update'), [
            'color_palette_id' => $palette->id,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $this->admin->id,
            'color_palette_id' => $palette->id,
        ]);

        $pref = $this->admin->fresh()->preference;
        $this->assertEquals($palette->id, $pref->color_palette_id);
        $this->assertEquals($palette->id, $pref->colorPalette->id);
        $this->assertEquals('#BE123C', $pref->color_palette['colors']['primary']);
        $this->assertEquals('#1D4ED8', $pref->color_palette['colors']['secondary']);
    }

    public function test_preferences_edit_view_passes_palettes_and_preference_color_palette_id(): void
    {
        $palette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Cyberpunk Acid',
            'primary_color' => '#A3E635',
            'secondary_color' => '#0F172A',
        ]);

        $this->admin->preference()->create([
            'color_palette_id' => $palette->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.preferences.edit'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Preferences/Edit')
            ->has('palettes')
            ->where('preference.color_palette_id', $palette->id)
        );
    }

    public function test_client_cannot_see_super_admin_color_palettes_in_preferences(): void
    {
        $adminPalette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Super Admin Master Brand',
            'primary_color' => '#CB2128',
            'secondary_color' => '#DFB136',
            'is_master' => true,
        ]);

        $response = $this->actingAs($this->client)->get(route('admin.preferences.edit'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Preferences/Edit')
            ->where('palettes', function ($palettes) use ($adminPalette) {
                $collection = collect($palettes);

                return ! $collection->contains('id', $adminPalette->id)
                    && ! $collection->contains('is_master', true);
            })
        );
    }

    public function test_client_cannot_select_super_admin_color_palette_in_preferences(): void
    {
        $adminPalette = ColorPalette::create([
            'user_id' => $this->admin->id,
            'name' => 'Super Admin Carmine',
            'primary_color' => '#CB2128',
            'secondary_color' => '#DFB136',
            'is_master' => true,
        ]);

        $response = $this->actingAs($this->client)->putJson(route('admin.preferences.update'), [
            'color_palette_id' => $adminPalette->id,
            'color_palette' => [
                'id' => (string) $adminPalette->id,
                'colors' => [
                    'primary' => '#CB2128',
                    'secondary' => '#DFB136',
                ],
            ],
        ]);

        $response->assertOk();

        // The client's preferences must not contain the admin palette ID
        $this->assertDatabaseMissing('user_preferences', [
            'user_id' => $this->client->id,
            'color_palette_id' => $adminPalette->id,
        ]);

        $pref = $this->client->fresh()->preference;
        $this->assertNull($pref?->color_palette_id);
    }

    public function test_client_can_choose_and_save_custom_primary_and_secondary_colors(): void
    {
        $response = $this->actingAs($this->client)->putJson(route('admin.preferences.update'), [
            'color_palette_id' => null,
            'color_palette' => [
                'id' => 'custom',
                'colors' => [
                    'primary' => '#10B981',
                    'secondary' => '#334155',
                ],
            ],
        ]);

        $response->assertOk();

        $pref = $this->client->fresh()->preference;
        $this->assertNull($pref->color_palette_id);
        $this->assertEquals('#10B981', $pref->color_palette['colors']['primary']);
        $this->assertEquals('#334155', $pref->color_palette['colors']['secondary']);
    }
}
