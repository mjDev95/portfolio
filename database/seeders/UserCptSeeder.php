<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserCptSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Obtener o crear al usuario mjgaliciab@gmail.com
        $user = User::firstOrCreate(
            ['email' => 'mjgaliciab@gmail.com'],
            [
                'name' => 'Mario Galicia',
                'password' => Hash::make('admin'),
                'role_id' => 2,
                'has_telemetry' => true,
                'email_verified_at' => now(),
            ]
        );

        $user->update([
            'role_id' => 2,
            'has_telemetry' => true,
        ]);

        // 2. Categorías asociadas al usuario
        $categoryData = [
            ['name' => 'Desarrollo Web',     'slug' => 'desarrollo-web'],
            ['name' => 'Diseño UI/UX',       'slug' => 'diseno-ui-ux'],
            ['name' => 'Consultoría',        'slug' => 'consultoria'],
            ['name' => 'Arquitectura Cloud', 'slug' => 'arquitectura-cloud'],
            ['name' => 'Tutoriales',         'slug' => 'tutoriales'],
            ['name' => 'Buenas Prácticas',   'slug' => 'buenas-practicas'],
        ];

        $categories = [];
        foreach ($categoryData as $cat) {
            $categories[$cat['slug']] = Category::firstOrCreate(
                ['user_id' => $user->id, 'slug' => $cat['slug']],
                ['name' => $cat['name']]
            );
        }

        // 3. Etiquetas (Tags) asociadas al usuario
        $tagData = [
            ['name' => 'Laravel',      'slug' => 'laravel'],
            ['name' => 'React',        'slug' => 'react'],
            ['name' => 'Tailwind CSS', 'slug' => 'tailwind-css'],
            ['name' => 'Inertia.js',   'slug' => 'inertia-js'],
            ['name' => 'TypeScript',   'slug' => 'typescript'],
            ['name' => 'GSAP',         'slug' => 'gsap'],
            ['name' => 'MySQL',        'slug' => 'mysql'],
            ['name' => 'Diseño UI/UX', 'slug' => 'diseno-ui-ux'],
        ];

        $tags = [];
        foreach ($tagData as $t) {
            $tags[$t['slug']] = Tag::firstOrCreate(
                ['user_id' => $user->id, 'slug' => $t['slug']],
                ['name' => $t['name']]
            );
        }

        // 4. CPT 1: Proyectos
        $proyectosCpt = ContentType::firstOrCreate(
            ['user_id' => $user->id, 'slug' => 'proyectos'],
            [
                'name' => 'Proyectos',
                'singular_name' => 'Proyecto',
                'public_slug' => 'proyectos',
                'icon' => 'Briefcase',
                'description' => 'Portafolio de proyectos y casos de éxito profesional',
                'has_categories' => true,
                'has_tags' => true,
                'is_public' => true,
                'order' => 1,
            ]
        );

        $proyectosFields = [
            [
                'label' => 'Subtítulo',
                'name' => 'subtitle',
                'type' => 'text',
                'placeholder' => 'Lema o descripción corta',
                'is_required' => false,
                'sort_order' => 1,
            ],
            [
                'label' => 'Cliente',
                'name' => 'client',
                'type' => 'text',
                'placeholder' => 'Nombre del cliente o empresa',
                'is_required' => false,
                'sort_order' => 2,
            ],
            [
                'label' => 'Año',
                'name' => 'year',
                'type' => 'number',
                'placeholder' => '2026',
                'is_required' => false,
                'sort_order' => 3,
            ],
            [
                'label' => 'URL en Vivo',
                'name' => 'external_url',
                'type' => 'url',
                'placeholder' => 'https://ejemplo.com',
                'is_required' => false,
                'sort_order' => 4,
            ],
            [
                'label' => 'Repositorio GitHub',
                'name' => 'github_url',
                'type' => 'url',
                'placeholder' => 'https://github.com/...',
                'is_required' => false,
                'sort_order' => 5,
            ],
            [
                'label' => 'URL Video / Demo',
                'name' => 'video_facade_url',
                'type' => 'url',
                'placeholder' => 'https://...',
                'is_required' => false,
                'sort_order' => 6,
            ],
        ];

        foreach ($proyectosFields as $field) {
            $proyectosCpt->customFields()->firstOrCreate(
                ['name' => $field['name']],
                $field
            );
        }

        // 5. CPT 2: Blog
        $blogCpt = ContentType::firstOrCreate(
            ['user_id' => $user->id, 'slug' => 'blog'],
            [
                'name' => 'Blog',
                'singular_name' => 'Artículo',
                'public_slug' => 'blog',
                'icon' => 'BookOpen',
                'description' => 'Artículos técnicos, guías y reflexiones sobre desarrollo y diseño',
                'has_categories' => true,
                'has_tags' => true,
                'is_public' => true,
                'order' => 2,
            ]
        );

        $blogFields = [
            [
                'label' => 'Tiempo de Lectura (min)',
                'name' => 'reading_time',
                'type' => 'number',
                'placeholder' => '5',
                'is_required' => false,
                'sort_order' => 1,
            ],
        ];

        foreach ($blogFields as $field) {
            $blogCpt->customFields()->firstOrCreate(
                ['name' => $field['name']],
                $field
            );
        }

        // 6. Tres publicaciones para CPT Proyectos
        $proyecto1 = Content::firstOrCreate(
            [
                'user_id' => $user->id,
                'content_type_id' => $proyectosCpt->id,
                'slug' => 'plataforma-ecommerce-headless',
            ],
            [
                'title' => 'Plataforma E-Commerce Headless',
                'excerpt' => 'Arquitectura moderna de comercio electrónico de alta conversión construida con Laravel 13 y React Inertia.',
                'body' => "## Descripción del Proyecto\n\nDesarrollo integral de una solución e-commerce escalable con tiempos de respuesta menores a 600ms, integración con pasarelas de pago y sincronización de inventario en tiempo real.\n\n### Desafíos Superados\n\n- Optimización del Core Web Vitals con puntuación 99 en Lighthouse.\n- Implementación de checkout fluido en una sola página con validación reactiva.\n- Aislamiento multi-moneda y facturación automatizada.",
                'custom_values' => [
                    'subtitle' => 'Experiencia de compra ultra-rápida y modular',
                    'client' => 'Nordic Goods & Co.',
                    'year' => 2026,
                    'external_url' => 'https://example.com/nordic',
                    'github_url' => 'https://github.com/example/nordic-store',
                    'video_facade_url' => 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-43093-large.mp4',
                ],
                'status' => 'published',
                'published_at' => now()->subDays(10),
                'featured' => true,
                'sort_order' => 1,
                'meta_title' => 'E-Commerce Headless — Caso de Estudio',
                'meta_description' => 'Arquitectura de alta conversión con Laravel y React Inertia.',
            ]
        );
        $proyecto1->categories()->sync([$categories['desarrollo-web']->id, $categories['arquitectura-cloud']->id]);
        $proyecto1->tags()->sync([$tags['laravel']->id, $tags['react']->id, $tags['tailwind-css']->id, $tags['inertia-js']->id]);

        $proyecto2 = Content::firstOrCreate(
            [
                'user_id' => $user->id,
                'content_type_id' => $proyectosCpt->id,
                'slug' => 'design-system-dashboard-financiero',
            ],
            [
                'title' => 'Design System & Dashboard Financiero',
                'excerpt' => 'Sistema de diseño corporativo y panel analítico para la gestión de activos e inversiones de alto rendimiento.',
                'body' => "## Caso de Estudio UI/UX\n\nDiseño y desarrollo de una suite analítica que consolida gráficos interactivos de rendimiento bursátil, alertas de riesgo y reportes exportables en tiempo real.\n\n### Aspectos Clave\n\n- Librería de componentes accesibles con tokens de diseño en modo claro/oscuro.\n- Visualizaciones de datos con Recharts optimizadas para 60 FPS.\n- Flujo de interacción testeado con más de 50 usuarios profesionales del sector.",
                'custom_values' => [
                    'subtitle' => 'Telemetría financiera de alto impacto visual',
                    'client' => 'Apex Capital Management',
                    'year' => 2025,
                    'external_url' => 'https://example.com/apex-dashboard',
                    'github_url' => 'https://github.com/example/apex-design-system',
                ],
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'featured' => true,
                'sort_order' => 2,
                'meta_title' => 'Design System & Dashboard Financiero',
                'meta_description' => 'Sistema de diseño corporativo y visualización financiera en tiempo real.',
            ]
        );
        $proyecto2->categories()->sync([$categories['diseno-ui-ux']->id, $categories['desarrollo-web']->id]);
        $proyecto2->tags()->sync([$tags['react']->id, $tags['typescript']->id, $tags['tailwind-css']->id]);

        $proyecto3 = Content::firstOrCreate(
            [
                'user_id' => $user->id,
                'content_type_id' => $proyectosCpt->id,
                'slug' => 'motor-automatizacion-flujos-legales',
            ],
            [
                'title' => 'Motor de Automatización de Flujos Legales',
                'excerpt' => 'Plataforma web para despachos jurídicos con generación automatizada de contratos y trazabilidad de expedientes.',
                'body' => "## Visión General\n\nDigitalización completa del flujo de trabajo de un bufete jurídico internacional, eliminando el 75% del papeleo manual y acelerando el ciclo de firma digital.\n\n### Tecnologías y Estrategia\n\n- Generación dinámica de plantillas legales con control de versiones.\n- Pipeline de notificaciones asíncronas con colas de Laravel.\n- Firma criptográfica segura y almacenamiento distribuido.",
                'custom_values' => [
                    'subtitle' => 'Transformación digital para el sector legal corporativo',
                    'client' => 'LexGlobal Partners',
                    'year' => 2025,
                    'external_url' => 'https://example.com/lexglobal',
                ],
                'status' => 'published',
                'published_at' => now()->subDays(2),
                'featured' => false,
                'sort_order' => 3,
                'meta_title' => 'Automatización Legal — Caso de Estudio',
                'meta_description' => 'Plataforma web para optimización de flujos jurídicos corporativos.',
            ]
        );
        $proyecto3->categories()->sync([$categories['consultoria']->id, $categories['desarrollo-web']->id]);
        $proyecto3->tags()->sync([$tags['laravel']->id, $tags['mysql']->id, $tags['inertia-js']->id]);

        // 7. Tres publicaciones para CPT Blog
        $blog1 = Content::firstOrCreate(
            [
                'user_id' => $user->id,
                'content_type_id' => $blogCpt->id,
                'slug' => 'de-arquitecturas-rigidas-a-motores-cpt-universales-laravel',
            ],
            [
                'title' => 'De Arquitecturas Rígidas a Motores CPT Universales en Laravel',
                'excerpt' => 'Cómo diseñar una taxonomía universal multi-inquilino capaz de adaptarse a cualquier industria sin tocar la base de datos.',
                'body' => "## El problema de los modelos rígidos\n\nCuando creamos un portafolio o CMS con tablas estáticas como `projects` o `posts`, estamos asumiendo que el usuario siempre será un creativo digital o un desarrollador.\n\n### El enfoque desacoplado (CPT + EAV en JSON)\n\nAl convertir el esquema en un motor de tipos de contenido personalizados (`content_types`) y valores dinámicos (`custom_values`), permitimos que cualquier profesional defina sus propias entidades y atributos sin necesidad de crear nuevas migraciones.",
                'custom_values' => [
                    'reading_time' => 7,
                ],
                'status' => 'published',
                'published_at' => now()->subDays(7),
                'featured' => true,
                'sort_order' => 1,
                'meta_title' => 'Motores CPT Universales en Laravel 13',
                'meta_description' => 'Aprende a diseñar una taxonomía universal dinámica en Laravel.',
            ]
        );
        $blog1->categories()->sync([$categories['buenas-practicas']->id, $categories['tutoriales']->id]);
        $blog1->tags()->sync([$tags['laravel']->id, $tags['mysql']->id, $tags['inertia-js']->id]);

        $blog2 = Content::firstOrCreate(
            [
                'user_id' => $user->id,
                'content_type_id' => $blogCpt->id,
                'slug' => 'navegacion-fluida-barba-js-gsap',
            ],
            [
                'title' => 'Navegación Fluida sin Recarga con Barba.js v2 y GSAP',
                'excerpt' => 'Estrategias para orquestar transiciones cinemáticas entre vistas Blade manteniendo la sincronización de metadatos SEO.',
                'body' => "## La experiencia SPA en aplicaciones SSR\n\nBarba.js v2 nos brinda la capacidad de interceptar clicks en enlaces y realizar transiciones visuales mediante AJAX y GSAP, manteniendo la velocidad de carga de un servidor Blade tradicional.\n\n### Sincronización de Metadatos\n\nUno de los retos habituales es mantener actualizados el `<title>` y las etiquetas Open Graph sin romper la historia del navegador. Integrar un hook `beforeEnter` que parsea el HTML entrante resuelve este problema limpiamente.",
                'custom_values' => [
                    'reading_time' => 5,
                ],
                'status' => 'published',
                'published_at' => now()->subDays(4),
                'featured' => false,
                'sort_order' => 2,
                'meta_title' => 'Transiciones con Barba.js v2 y GSAP en Laravel',
                'meta_description' => 'Guía paso a paso para integrar Barba.js y transiciones animadas con GSAP.',
            ]
        );
        $blog2->categories()->sync([$categories['tutoriales']->id]);
        $blog2->tags()->sync([$tags['gsap']->id, $tags['react']->id]);

        $blog3 = Content::firstOrCreate(
            [
                'user_id' => $user->id,
                'content_type_id' => $blogCpt->id,
                'slug' => 'sistemas-diseno-tailwind-tokens-fluidos',
            ],
            [
                'title' => 'Sistemas de Diseño con Tailwind CSS y Tokens Fluidos',
                'excerpt' => 'Construcción de interfaces consistentes y accesibles mediante tipografía y espaciado proporcional usando clamp() en CSS.',
                'body' => "## Más allá de los breakpoints estáticos\n\nEl diseño responsivo moderno trasciende los saltos bruscos de pantalla. Empleando la función `clamp()` de CSS junto con utilidades semánticas en Tailwind, los componentes se adaptan suavemente a cualquier viewport.\n\n### Beneficios en Producción\n\n- Reducción drástica del CSS requerido en media queries.\n- Jerarquía tipográfica consistente tanto en dispositivos móviles compactos como en monitores ultra-panorámicos.",
                'custom_values' => [
                    'reading_time' => 4,
                ],
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'featured' => false,
                'sort_order' => 3,
                'meta_title' => 'Tokens Fluidos y Sistemas de Diseño con Tailwind',
                'meta_description' => 'Diseño responsivo avanzado utilizando funciones matemáticas en CSS y Tailwind.',
            ]
        );
        $blog3->categories()->sync([$categories['buenas-practicas']->id]);
        $blog3->tags()->sync([$tags['tailwind-css']->id, $tags['diseno-ui-ux']->id]);
    }
}
