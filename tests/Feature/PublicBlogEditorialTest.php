<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\CustomField;
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
            ->assertDontSee('Artículo de Blog 1')
            ->assertDontSee('min de lectura');
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
            ->assertSee('is-active', false)
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
            ->assertSee('Otros artículos')
            ->assertSee('Siguiente Artículo de Prueba')
            ->assertSee('blog-showcase-card')
            ->assertDontSee('Tiempo lectura')
            ->assertDontSee('min de lectura')
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

    public function test_blog_single_renders_custom_database_cta_when_present(): void
    {
        $category = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'WordPress Architecture',
            'slug' => 'wordpress-architecture',
        ]);

        $article = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Artículo con CTA Específico',
            'slug' => 'articulo-con-cta-especifico',
            'body' => '## Análisis Técnico',
            'status' => 'published',
            'published_at' => now()->subDay(),
            'custom_values' => [
                'reading_time' => 7,
                'cta_heading' => '¿Tu plataforma sufre de lentitud o deuda técnica?',
                'cta_description' => 'Migro portales críticos a código nativo en PHP 8.4 con tiempos de carga sub-segundo.',
                'cta_button_text' => 'Solicitar diagnóstico de arquitectura',
                'cta_button_url' => 'https://ejemplo.test/contacto-directo',
            ],
        ]);
        $article->categories()->attach($category->id);

        // Crear un post más antiguo para que haya $nextPost
        $olderArticle = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Artículo Previo en Serie',
            'slug' => 'articulo-previo-en-serie',
            'body' => 'Contenido previo',
            'status' => 'published',
            'published_at' => now()->subDays(2),
        ]);

        $response = $this->get('/blog/articulo-con-cta-especifico');

        $response->assertOk()
            ->assertSee('¿Tu plataforma sufre de lentitud o deuda técnica?')
            ->assertSee('Migro portales críticos a código nativo en PHP 8.4')
            ->assertSee('Solicitar diagnóstico de arquitectura')
            ->assertSee('https://ejemplo.test/contacto-directo', false)
            ->assertSee('Otros artículos')
            ->assertSee('Artículo Previo en Serie')
            ->assertDontSee('Fin de los ensayos recientes en esta serie');
    }

    public function test_blog_single_renders_smart_category_fallback_cta_and_end_of_catalog_when_no_next_post(): void
    {
        $category = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'Data Architecture',
            'slug' => 'data-architecture',
        ]);

        // Único artículo sin CTA personalizado en custom_values
        $article = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Único Ensayo del Catálogo',
            'slug' => 'unico-ensayo-del-catalogo',
            'body' => '## Modelado de Datos',
            'status' => 'published',
            'published_at' => now(),
            'custom_values' => [
                'reading_time' => 6,
            ],
        ]);
        $article->categories()->attach($category->id);

        $response = $this->get('/blog/unico-ensayo-del-catalogo');

        $response->assertOk()
            // Fallback inteligente contextual por categoría
            ->assertSee('¿Necesitas implementar una solución en Data Architecture para tu marca?')
            ->assertSee('Como Creative Developer &amp; WordPress Architect, colaboro con marcas y agencias', false)
            ->assertSee('Conversar sobre un proyecto')
            ->assertSee(route('contact'), false)
            // Fin de catálogo: no hay $nextPost ni $otherPosts
            ->assertDontSee('Otros artículos')
            ->assertSee('Fin de los ensayos recientes en esta serie')
            ->assertSee('Explorar catálogo completo de artículos')
            ->assertSee('/blog', false);
    }

    public function test_admin_can_update_blog_post_cta_custom_fields_and_see_them_in_single(): void
    {
        $customFieldDefs = [
            ['name' => 'reading_time', 'label' => 'Tiempo de Lectura', 'type' => 'number'],
            ['name' => 'cta_heading', 'label' => 'Titular CTA', 'type' => 'text'],
            ['name' => 'cta_description', 'label' => 'Descripción CTA', 'type' => 'textarea'],
            ['name' => 'cta_button_text', 'label' => 'Botón CTA', 'type' => 'text'],
            ['name' => 'cta_button_url', 'label' => 'URL CTA', 'type' => 'url'],
        ];
        foreach ($customFieldDefs as $f) {
            CustomField::firstOrCreate(
                ['content_type_id' => $this->blogCpt->id, 'name' => $f['name']],
                array_merge($f, ['is_required' => false])
            );
        }

        $article = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Artículo para Edición CTA',
            'slug' => 'articulo-para-edicion-cta',
            'body' => 'Contenido del artículo de prueba',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $updatePayload = [
            'title' => 'Artículo con CTA Actualizado',
            'slug' => 'articulo-para-edicion-cta',
            'status' => 'published',
            'body' => 'Contenido actualizado',
            'custom_values' => [
                'reading_time' => 7,
                'cta_heading' => '¿Listo para renovar la identidad digital de tu producto?',
                'cta_description' => 'Ofrezco consultoría especializada en diseño y desarrollo web de alta fidelidad.',
                'cta_button_text' => 'Agenda tu Llamada',
                'cta_button_url' => '/contacto',
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.content.update', [$this->blogCpt->slug, $article->id]), $updatePayload);

        $response->assertRedirect();

        $freshArticle = $article->fresh();
        $this->assertEquals('¿Listo para renovar la identidad digital de tu producto?', $freshArticle->custom_values['cta_heading']);
        $this->assertEquals('/contacto', $freshArticle->custom_values['cta_button_url']);

        // Verificar que en la vista pública se renderiza el CTA actualizado
        $publicResponse = $this->get('/blog/articulo-para-edicion-cta');
        $publicResponse->assertOk()
            ->assertSee('¿Listo para renovar la identidad digital de tu producto?')
            ->assertSee('Ofrezco consultoría especializada en diseño y desarrollo web de alta fidelidad.')
            ->assertSee('Agenda tu Llamada')
            ->assertSee('/contacto', false);
    }

    public function test_blog_single_renders_dynamic_author_avatar_initials_and_headline_from_user_profile(): void
    {
        $customAuthor = User::factory()->create([
            'name' => 'Elena Rostova',
            'headline' => 'Design Systems Lead • Creative Engineer',
            'avatar' => 'images/custom-avatar.webp',
        ]);

        $article = Content::create([
            'user_id' => $customAuthor->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Design Tokens y Sistemas de Escala',
            'slug' => 'design-tokens-y-sistemas-de-escala',
            'body' => 'Contenido sobre diseño atómico y tokens.',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get('/blog/design-tokens-y-sistemas-de-escala');

        $response->assertOk()
            ->assertSee('Elena Rostova')
            ->assertSee('Design Systems Lead • Creative Engineer');
    }

    public function test_blog_single_renders_modern_share_modal_and_trigger_button(): void
    {
        $article = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Arquitectura Editorial y Componentes',
            'slug' => 'arquitectura-editorial-y-componentes',
            'body' => 'Contenido sobre componentes.',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get('/blog/arquitectura-editorial-y-componentes');

        $response->assertOk()
            ->assertSee('id="btn-open-share-modal"', false)
            ->assertSee('Compartir</span>', false)
            ->assertSee('id="global-share-modal"', false)
            ->assertSee('Compartir', false)
            ->assertSee('id="share-modal-url-input"', false)
            ->assertSee('id="btn-copy-modal-url"', false)
            ->assertSee('twitter.com/intent/tweet', false)
            ->assertSee('linkedin.com/sharing/share-offsite', false)
            ->assertSee('api.whatsapp.com/send', false);
    }

    public function test_home_page_renders_editorial_blog_section_with_recent_articles(): void
    {
        $category = Category::create([
            'user_id' => $this->admin->id,
            'name' => 'Arquitectura Web',
            'slug' => 'arquitectura-web',
        ]);

        $post1 = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Primer Ensayo en Home',
            'slug' => 'primer-ensayo-en-home',
            'body' => 'Contenido del primer ensayo.',
            'status' => 'published',
            'featured' => true,
            'published_at' => now()->subDay(),
        ]);
        $post1->categories()->attach($category);

        $post2 = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->blogCpt->id,
            'title' => 'Segundo Ensayo en Home',
            'slug' => 'segundo-ensayo-en-home',
            'body' => 'Contenido del segundo ensayo.',
            'status' => 'published',
            'featured' => false,
            'published_at' => now()->subHours(2),
        ]);
        $post2->categories()->attach($category);

        $response = $this->get('/');

        $response->assertOk()
            ->assertSee('id="blog"', false)
            ->assertSee('home-blog-section', false)
            ->assertSee('Artículos Recientes')
            ->assertSee('Primer Ensayo en Home')
            ->assertSee('Segundo Ensayo en Home')
            ->assertSee('Ver todos los artículos')
            ->assertSee('href="'.route('public.content.index', 'blog').'"', false)
            ->assertSee('data-card-reveal', false)
            ->assertSee('data-flip-card', false);
    }
}
