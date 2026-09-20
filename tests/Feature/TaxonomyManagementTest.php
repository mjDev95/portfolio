<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxonomyManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_categories_page_for_cpt_with_counts(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'has_categories' => true,
            'has_tags' => true,
            'is_public' => true,
        ]);

        $category = Category::create([
            'user_id' => $user->id,
            'content_type_id' => $cpt->id,
            'name' => 'Laravel Framework',
            'slug' => 'laravel-framework',
            'description' => 'Artículos dedicados a Laravel',
        ]);

        $content = Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $user->id,
            'title' => 'Novedades de Laravel 13',
            'slug' => 'novedades-laravel-13',
            'status' => 'published',
        ]);
        $content->categories()->attach($category->id);

        $response = $this->actingAs($user)->get(route('admin.content.categories.index', $cpt->slug));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Content/Taxonomies/Index')
            ->where('taxonomyType', 'categories')
            ->where('contentType.slug', 'articulos')
            ->has('items.data', 1)
            ->where('items.data.0.name', 'Laravel Framework')
            ->where('items.data.0.contents_count', 1)
        );
    }

    public function test_user_can_create_new_category_for_cpt(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'has_categories' => true,
            'has_tags' => true,
            'is_public' => true,
        ]);

        $response = $this->actingAs($user)->post(route('admin.content.categories.store', $cpt->slug), [
            'name' => 'Fintech & Bancos',
            'slug' => 'fintech-bancos',
            'description' => 'Aplicaciones bancarias y billeteras digitales',
        ]);

        $response->assertRedirect(route('admin.content.categories.index', $cpt->slug));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('categories', [
            'user_id' => $user->id,
            'content_type_id' => $cpt->id,
            'name' => 'Fintech & Bancos',
            'slug' => 'fintech-bancos',
            'description' => 'Aplicaciones bancarias y billeteras digitales',
        ]);
    }

    public function test_user_can_update_category_for_cpt(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'has_categories' => true,
            'has_tags' => true,
            'is_public' => true,
        ]);

        $category = Category::create([
            'user_id' => $user->id,
            'content_type_id' => $cpt->id,
            'name' => 'Diseño UI',
            'slug' => 'diseno-ui',
        ]);

        $response = $this->actingAs($user)->put(route('admin.content.categories.update', [$cpt->slug, $category->id]), [
            'name' => 'Diseño UI & UX Avanzado',
            'slug' => 'diseno-ui-ux-avanzado',
            'description' => 'Sistemas de diseño modernos',
        ]);

        $response->assertRedirect(route('admin.content.categories.index', $cpt->slug));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Diseño UI & UX Avanzado',
            'slug' => 'diseno-ui-ux-avanzado',
            'description' => 'Sistemas de diseño modernos',
        ]);
    }

    public function test_user_can_delete_category_without_deleting_contents(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'has_categories' => true,
            'has_tags' => true,
            'is_public' => true,
        ]);

        $category = Category::create([
            'user_id' => $user->id,
            'content_type_id' => $cpt->id,
            'name' => 'Categoría Obsoleta',
            'slug' => 'categoria-obsoleta',
        ]);

        $content = Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $user->id,
            'title' => 'Artículo que no debe eliminarse',
            'slug' => 'articulo-permanente',
            'status' => 'published',
        ]);
        $content->categories()->attach($category->id);

        $response = $this->actingAs($user)->delete(route('admin.content.categories.destroy', [$cpt->slug, $category->id]));

        $response->assertRedirect(route('admin.content.categories.index', $cpt->slug));
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
        $this->assertDatabaseHas('contents', ['id' => $content->id]);
        $this->assertEquals(0, $content->categories()->count());
    }

    public function test_user_can_view_tags_page_for_cpt_with_counts(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'has_categories' => true,
            'has_tags' => true,
            'is_public' => true,
        ]);

        $tag = Tag::create([
            'user_id' => $user->id,
            'name' => 'React 19',
            'slug' => 'react-19',
        ]);

        $content = Content::create([
            'content_type_id' => $cpt->id,
            'user_id' => $user->id,
            'title' => 'Server Actions en React 19',
            'slug' => 'server-actions-react-19',
            'status' => 'published',
        ]);
        $content->tags()->attach($tag->id);

        $response = $this->actingAs($user)->get(route('admin.content.tags.index', $cpt->slug));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Content/Taxonomies/Index')
            ->where('taxonomyType', 'tags')
            ->has('items.data', 1)
            ->where('items.data.0.name', 'React 19')
            ->where('items.data.0.contents_count', 1)
        );
    }

    public function test_user_can_create_update_and_delete_tags(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'has_categories' => true,
            'has_tags' => true,
            'is_public' => true,
        ]);

        // Crear Tag
        $response = $this->actingAs($user)->post(route('admin.content.tags.store', $cpt->slug), [
            'name' => 'TypeScript',
            'slug' => 'typescript',
        ]);
        $response->assertRedirect(route('admin.content.tags.index', $cpt->slug));
        $this->assertDatabaseHas('tags', [
            'user_id' => $user->id,
            'name' => 'TypeScript',
            'slug' => 'typescript',
        ]);

        $tag = Tag::where('slug', 'typescript')->first();

        // Actualizar Tag
        $updateResponse = $this->actingAs($user)->put(route('admin.content.tags.update', [$cpt->slug, $tag->id]), [
            'name' => 'TypeScript 5.x',
            'slug' => 'typescript-5',
        ]);
        $updateResponse->assertRedirect(route('admin.content.tags.index', $cpt->slug));
        $this->assertDatabaseHas('tags', [
            'id' => $tag->id,
            'name' => 'TypeScript 5.x',
            'slug' => 'typescript-5',
        ]);

        // Eliminar Tag
        $deleteResponse = $this->actingAs($user)->delete(route('admin.content.tags.destroy', [$cpt->slug, $tag->id]));
        $deleteResponse->assertRedirect(route('admin.content.tags.index', $cpt->slug));
        $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
    }

    public function test_returns_404_if_cpt_does_not_have_categories_or_tags(): void
    {
        $user = User::factory()->create();

        $cpt = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Testimonios',
            'singular_name' => 'Testimonio',
            'slug' => 'testimonios',
            'has_categories' => false,
            'has_tags' => false,
            'is_public' => true,
        ]);

        $this->actingAs($user)->get(route('admin.content.categories.index', $cpt->slug))->assertNotFound();
        $this->actingAs($user)->get(route('admin.content.tags.index', $cpt->slug))->assertNotFound();
    }
}
