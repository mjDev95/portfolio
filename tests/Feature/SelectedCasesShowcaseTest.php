<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SelectedCasesShowcaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_selected_cases_renders_up_to_5_projects_in_three_rows(): void
    {
        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $admin = User::factory()->create(['role_id' => $adminRole->id]);

        $cpt = ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'public_slug' => 'proyectos',
            'is_public' => true,
            'order' => 1,
        ]);

        for ($i = 1; $i <= 5; $i++) {
            Content::create([
                'user_id' => $admin->id,
                'content_type_id' => $cpt->id,
                'title' => "Proyecto Insignia {$i}",
                'slug' => "proyecto-insignia-{$i}",
                'status' => 'published',
                'published_at' => now()->subDays($i),
                'featured' => true,
                'sort_order' => $i,
                'custom_values' => [
                    'client' => "Cliente {$i}",
                    'year' => 2025,
                ],
            ]);
        }

        $response = $this->get('/');

        $response->assertStatus(200);

        // Verifica que aparezcan los 5 proyectos
        for ($i = 1; $i <= 5; $i++) {
            $response->assertSee("Proyecto Insignia {$i}");
        }

        // Verifica la presencia de las 3 filas
        $response->assertSee('row-01');
        $response->assertSee('row-02');
        $response->assertSee('row-03');

        // Verifica el componente universal CTA con el conteo de 5 proyectos
        $response->assertSee('stodio-all-cases-btn');
        $response->assertSee('Ver todos los proyectos');
        $response->assertSee('(05)');
    }

    public function test_universal_stodio_cta_component_counts_correctly_for_any_cpt(): void
    {
        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $admin = User::factory()->create(['role_id' => $adminRole->id]);

        $blogCpt = ContentType::create([
            'user_id' => $admin->id,
            'name' => 'Blog',
            'singular_name' => 'Artículo',
            'slug' => 'blog',
            'public_slug' => 'blog',
            'is_public' => true,
            'order' => 2,
        ]);

        for ($i = 1; $i <= 3; $i++) {
            Content::create([
                'user_id' => $admin->id,
                'content_type_id' => $blogCpt->id,
                'title' => "Artículo {$i}",
                'slug' => "articulo-{$i}",
                'status' => 'published',
                'published_at' => now(),
            ]);
        }

        // Renderiza el componente directamente a Blade
        $html = (string) $this->blade('<x-stodio-cta type="blog" label="Ver todos los artículos" />');

        $this->assertStringContainsString('stodio-cta-wrap', $html);
        $this->assertStringContainsString('Ver todos los artículos', $html);
        $this->assertStringContainsString('(03)', $html);
        $this->assertStringContainsString(route('public.content.index', 'blog'), $html);
    }
}
