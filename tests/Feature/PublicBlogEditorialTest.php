<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicBlogEditorialTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private ContentType $blogCpt;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();

        $this->blogCpt = ContentType::create([
            'user_id' => $this->admin->id,
            'name' => 'Blog',
            'singular_name' => 'Artículo',
            'slug' => 'blog',
            'public_slug' => 'blog',
            'is_public' => true,
            'has_categories' => true,
            'has_tags' => true,
            'order' => 2,
        ]);
    }

    public function test_blog_archive_renders_editorial_hero_metrics_and_pill_rail(): void
    {
        $category = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'WordPress Architecture',
            'slug' => 'wordpress-architecture',
        ]);

        $article = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'El declive de los constructores visuales',
            'slug' => 'el-declive-de-los-constructores-visuales',
            'excerpt' => 'Por qué el PHP nativo sigue dominando el desarrollo empresarial.',
            'body' => "## Análisis técnico\n\nEl código nativo supera a cualquier constructor visual.",
            'status' => 'published',
            'published_at' => now(),
            'custom_values' => ['reading_time' => 7],
        ]);
        $article->categories()->attach($category->id);

        $response = $this->get('/blog');

        $response->assertOk()
            ->assertViewIs('public.content.blog.index')
            ->assertSee('Pensamiento,')
            ->assertSee('Arquitectura &amp; Código', false)
            ->assertSee('data-live-clock', false)
            ->assertSee('WordPress Architecture')
            ->assertSee('El declive de los constructores visuales')
            ->assertSee('data-flip-card', false)
            ->assertSee('data-flip-id="post-el-declive-de-los-constructores-visuales"', false)
            ->assertSee('data-flip-element="image"', false);
    }

    public function test_blog_archive_supports_category_filtering(): void
    {
        $catArchitecture = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'Architecture',
            'slug' => 'architecture',
        ]);

        $catPerformance = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'Performance',
            'slug' => 'performance',
        ]);

        $post1 = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Post de Arquitectura',
            'slug' => 'post-arquitectura',
            'status' => 'published',
            'published_at' => now(),
        ]);
        $post1->categories()->attach($catArchitecture->id);

        $post2 = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Post de Rendimiento',
            'slug' => 'post-rendimiento',
            'status' => 'published',
            'published_at' => now(),
        ]);
        $post2->categories()->attach($catPerformance->id);

        // Sin filtro: muestra ambos
        $this->get('/blog')
            ->assertSee('Post de Arquitectura')
            ->assertSee('Post de Rendimiento');

        // Filtrado por Architecture
        $this->get('/blog?categoria=architecture')
            ->assertSee('Post de Arquitectura')
            ->assertDontSee('Post de Rendimiento');
    }

    public function test_blog_single_renders_reading_progress_breadcrumbs_and_toc_structure(): void
    {
        $article = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Core Web Vitals en Producción',
            'slug' => 'core-web-vitals-en-produccion',
            'excerpt' => 'Estrategias técnicas para alcanzar LCP bajo 1.2 segundos.',
            'body' => "## La métrica LCP\n\nOptimización de fuentes e imágenes críticas.\n\n### Estrategias de Caché\n\nUso de Redis y Cloudflare.",
            'status' => 'published',
            'published_at' => now(),
            'custom_values' => ['reading_time' => 8],
        ]);

        $nextArticle = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Siguiente Artículo de Prueba',
            'slug' => 'siguiente-articulo-de-prueba',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        $response = $this->get('/blog/core-web-vitals-en-produccion');

        $response->assertOk()
            ->assertViewIs('public.content.blog.show')
            ->assertSee('id="reading-progress-bar"', false)
            ->assertSee('data-detail-breadcrumbs', false)
            ->assertSee('Core Web Vitals en Producción')
            ->assertSee('data-flip-text', false)
            ->assertSee('data-flip-id="post-core-web-vitals-en-produccion"', false)
            ->assertSee('id="toc-list"', false)
            ->assertSee('prose-editorial')
            ->assertSee('Siguiente Ensayo en el Catálogo')
            ->assertSee('Siguiente Artículo de Prueba');
    }

    public function test_blog_single_injects_schema_org_tech_article_json_ld(): void
    {
        $article = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'SEO Técnico para Desarrolladores',
            'slug' => 'seo-tecnico-para-desarrolladores',
            'excerpt' => 'Implementando Schema.org en aplicaciones modernas.',
            'body' => 'Contenido técnico de prueba.',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get('/blog/seo-tecnico-para-desarrolladores');

        $response->assertOk()
            ->assertSee('application/ld+json', false)
            ->assertSee('"@type": "TechArticle"', false)
            ->assertSee('SEO Técnico para Desarrolladores')
            ->assertSee('Mario Joaquín Galicia Blanco');
    }
}

