<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Tag;
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

    public function test_blog_archive_renders_clean_editorial_header_and_initial_five_posts(): void
    {
        $category = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'WordPress Architecture',
            'slug' => 'wordpress-architecture',
        ]);

        // Crear 7 artículos para verificar que solo se renderizan 5 inicialmente
        for ($i = 1; $i <= 7; $i++) {
            $article = Content::create([
                'user_id' => $this->admin->id,
                'content_type_id' => $this->blogCpt->id,
                'title' => "Artículo de Blog {$i}",
                'slug' => "articulo-de-blog-{$i}",
                'excerpt' => "Extracto del artículo {$i}.",
                'body' => "## Contenido {$i}",
                'status' => 'published',
                'published_at' => now()->subMinutes(10 - $i),
                'custom_values' => ['reading_time' => 5],
            ]);
            $article->categories()->attach($category->id);
        }

        $response = $this->get('/blog');

        $response->assertOk()
            ->assertViewIs('public.content.blog.index')
            ->assertSee('WordPress Architecture')
            ->assertSee('data-flip-card', false)
            ->assertSee('data-flip-element="image"', false)
            ->assertSee('id="blog-scroll-sentinel"', false)
            ->assertSee('data-has-more="true"', false)
            ->assertSee('data-next-page="2"', false)
            // Se ven los primeros 5 más recientes
            ->assertSee('Artículo de Blog 7')
            ->assertSee('Artículo de Blog 6')
            ->assertSee('Artículo de Blog 5')
            ->assertSee('Artículo de Blog 4')
            ->assertSee('Artículo de Blog 3')
            // Los artículos más antiguos no están en el primer chunk de 5
            ->assertDontSee('Artículo de Blog 2')
            ->assertDontSee('Artículo de Blog 1');
    }

    public function test_blog_archive_loads_next_ten_posts_via_ajax(): void
    {
        // Crear 18 artículos
        for ($i = 1; $i <= 18; $i++) {
            Content::create([
                'user_id' => $this->admin->id,
                'content_type_id' => $this->blogCpt->id,
                'title' => sprintf('Post Paginado %02d', $i),
                'slug' => sprintf('post-paginado-%02d', $i),
                'excerpt' => "Extracto {$i}",
                'body' => "Contenido {$i}",
                'status' => 'published',
                'published_at' => now()->subMinutes(30 - $i),
            ]);
        }

        // Petición AJAX para página 2 (debe retornar 10 posts)
        $response = $this->getJson('/blog?page=2');

        $response->assertOk()
            ->assertJsonStructure([
                'html',
                'has_more',
                'next_page',
                'total',
            ])
            ->assertJson([
                'has_more' => true,
                'next_page' => 3,
                'total' => 18,
            ]);

        // Verificamos que el HTML retornado contiene los posts correspondientes
        $this->assertStringContainsString('data-flip-card', $response->json('html'));
    }

    public function test_blog_dedicated_category_view_renders_filtered_posts_and_breadcrumbs(): void
    {
        $catArchitecture = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'Architecture',
            'slug' => 'architecture',
            'description' => 'Ensayos profundos sobre arquitectura de software.',
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

        // Sin filtro en el index: muestra ambos
        $this->get('/blog')
            ->assertOk()
            ->assertSee('Post de Arquitectura')
            ->assertSee('Post de Rendimiento')
            ->assertSee('href="https://portfolio.test/blog/categoria/architecture"', false);

        // Si se accede vía query param ?categoria=architecture, se redirige 301 a la URL canónica estilo WordPress
        $this->get('/blog?categoria=architecture')
            ->assertRedirect('/blog/categoria/architecture');

        // Vista dedicada de la categoría:
        $response = $this->get('/blog/categoria/architecture');

        $response->assertOk()
            ->assertViewIs('public.content.blog.category')
            ->assertSee('Architecture')
            ->assertSee('Ensayos profundos sobre arquitectura de software.')
            ->assertSee('Post de Arquitectura')
            ->assertDontSee('Post de Rendimiento')
            ->assertSee('editorial-pill is-active', false)
            ->assertSee('pill-count', false)
            ->assertSee('https://schema.org', false)
            ->assertSee('"@type": "BreadcrumbList"', false);
    }

    public function test_blog_dedicated_category_supports_ajax_deferred_loading(): void
    {
        $cat = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'Tech Insights',
            'slug' => 'tech-insights',
        ]);

        for ($i = 1; $i <= 12; $i++) {
            $post = Content::create([
                'user_id' => $this->admin->id,
                'content_type_id' => $this->blogCpt->id,
                'title' => sprintf('Tech Note %02d', $i),
                'slug' => sprintf('tech-note-%02d', $i),
                'status' => 'published',
                'published_at' => now()->subMinutes(20 - $i),
            ]);
            $post->categories()->attach($cat->id);
        }

        // Petición AJAX al endpoint canónico de la categoría
        $response = $this->getJson('/blog/categoria/tech-insights?page=2');

        $response->assertOk()
            ->assertJsonStructure([
                'html',
                'has_more',
                'next_page',
                'total',
            ])
            ->assertJson([
                'has_more' => false,
                'total' => 12,
            ]);

        $this->assertStringContainsString('data-flip-card', $response->json('html'));
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
            ->assertSee('Siguiente Artículo de Prueba')
            ->assertSee('blog-editorial-card-body')
            ->assertDontSee('Volver a todos los ensayos');
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

    public function test_blog_archive_injects_schema_org_blog_json_ld(): void
    {
        $response = $this->get('/blog');

        $response->assertOk()
            ->assertSee('application/ld+json', false)
            ->assertSee('"@type": "Blog"', false)
            ->assertSee('Blog — ')
            ->assertSee('Mario Joaquín Galicia Blanco');
    }

    public function test_breadcrumbs_use_dynamic_text_primary_instead_of_hardcoded_white(): void
    {
        $category = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'Performance',
            'slug' => 'performance',
        ]);

        $response = $this->get('/blog/categoria/performance');

        $response->assertOk()
            ->assertSee('class="breadcrumb-current text-primary"', false)
            ->assertDontSee('class="breadcrumb-current text-white"', false);
    }

    public function test_blog_tag_archive_renders_dedicated_view_and_initial_five_posts(): void
    {
        $tag = Tag::create([
            'user_id' => $this->admin->id,
            'name' => 'GSAP Motion',
            'slug' => 'gsap-motion',
        ]);

        for ($i = 1; $i <= 7; $i++) {
            $article = Content::create([
                'user_id' => $this->admin->id,
                'content_type_id' => $this->blogCpt->id,
                'title' => "Post Tag {$i}",
                'slug' => "post-tag-{$i}",
                'excerpt' => "Extracto del post con tag {$i}.",
                'body' => "## Contenido {$i}",
                'status' => 'published',
                'published_at' => now()->subMinutes(10 - $i),
                'custom_values' => ['reading_time' => 4],
            ]);
            $article->tags()->attach($tag->id);
        }

        $response = $this->get('/blog/etiqueta/gsap-motion');

        $response->assertOk()
            ->assertViewIs('public.content.blog.tag')
            ->assertSee('#GSAP Motion')
            ->assertSee('data-flip-card', false)
            ->assertSee('id="blog-scroll-sentinel"', false)
            ->assertSee('data-has-more="true"', false)
            ->assertSee('data-next-page="2"', false)
            ->assertSee('Post Tag 7')
            ->assertSee('Post Tag 6')
            ->assertSee('Post Tag 5')
            ->assertSee('Post Tag 4')
            ->assertSee('Post Tag 3')
            ->assertDontSee('Post Tag 2')
            ->assertDontSee('Post Tag 1');
    }

    public function test_blog_tag_archive_loads_next_ten_posts_via_ajax(): void
    {
        $tag = Tag::create([
            'user_id' => $this->admin->id,
            'name' => 'Laravel Engine',
            'slug' => 'laravel-engine',
        ]);

        for ($i = 1; $i <= 18; $i++) {
            $article = Content::create([
                'user_id' => $this->admin->id,
                'content_type_id' => $this->blogCpt->id,
                'title' => sprintf('Post Tag Paginado %02d', $i),
                'slug' => sprintf('post-tag-paginado-%02d', $i),
                'excerpt' => "Extracto {$i}",
                'body' => "Contenido {$i}",
                'status' => 'published',
                'published_at' => now()->subMinutes(30 - $i),
            ]);
            $article->tags()->attach($tag->id);
        }

        $response = $this->getJson('/blog/etiqueta/laravel-engine?page=2');

        $response->assertOk()
            ->assertJsonStructure([
                'html',
                'has_more',
                'next_page',
                'total',
                'title',
                'tag_slug',
            ])
            ->assertJson([
                'has_more' => true,
                'next_page' => 3,
                'total' => 18,
                'tag_slug' => 'laravel-engine',
            ]);

        $html = $response->json('html');
        $this->assertStringContainsString('Post Tag Paginado 13', $html);
        $this->assertStringContainsString('Post Tag Paginado 04', $html);
        $this->assertStringNotContainsString('Post Tag Paginado 18', $html);
    }

    public function test_blog_tag_english_route_redirects_301_to_etiqueta(): void
    {
        $response = $this->get('/blog/tag/gsap-motion');

        $response->assertRedirect('/blog/etiqueta/gsap-motion', 301);
    }

    public function test_blog_single_renders_interactive_tag_links(): void
    {
        $tag = Tag::create([
            'user_id' => $this->admin->id,
            'name' => 'Frontend',
            'slug' => 'frontend',
        ]);

        $article = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Artículo con Tags Interactivos',
            'slug' => 'articulo-con-tags-interactivos',
            'body' => 'Contenido de prueba.',
            'status' => 'published',
            'published_at' => now(),
        ]);
        $article->tags()->attach($tag->id);

        $response = $this->get('/blog/articulo-con-tags-interactivos');

        $response->assertOk()
            ->assertSee('/blog/etiqueta/frontend', false)
            ->assertSee('#Frontend');
    }
}
