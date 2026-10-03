<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\CustomField;
use App\Models\Media;
use App\Models\Tag;
use App\Models\User;
use App\Services\PortfolioCacheService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // ── 1. Resolución del Usuario Administrador ─────────────────────
            // Localiza al administrador del sistema mediante username o email
            $admin = User::query()
                ->when(
                    Schema::hasColumn('users', 'username'),
                    fn ($q) => $q->where('username', 'admin')
                )
                ->where(function ($query) {
                    $query->where('email', 'admin@example.com')
                        ->orWhere('email', 'admin@admin.com')
                        ->orWhere('email', 'mjgaliciab@gmail.com')
                        ->orWhereHas('role', fn ($roleQ) => $roleQ->where('slug', 'admin'));
                })
                ->first();

            if (! $admin) {
                $admin = User::query()->firstOrFail();
            }

            $adminId = $admin->id;

            // ── 2. Resolución o Creación de Content Types (CPT) ─────────────
            $proyectosCpt = ContentType::where('slug', 'proyectos')->first()
                ?? ContentType::create([
                    'user_id' => $adminId,
                    'name' => 'Proyectos',
                    'singular_name' => 'Proyecto',
                    'slug' => 'proyectos',
                    'public_slug' => 'proyectos',
                    'icon' => 'Briefcase',
                    'description' => 'Portafolio de proyectos y casos de éxito profesional',
                    'has_categories' => true,
                    'has_tags' => true,
                    'is_public' => true,
                    'order' => 1,
                ]);

            $blogCpt = ContentType::where('slug', 'blog')->first()
                ?? ContentType::create([
                    'user_id' => $adminId,
                    'name' => 'Blog',
                    'singular_name' => 'Artículo',
                    'slug' => 'blog',
                    'public_slug' => 'blog',
                    'icon' => 'BookOpen',
                    'description' => 'Artículos técnicos, guías y reflexiones sobre desarrollo y arquitectura web',
                    'has_categories' => true,
                    'has_tags' => true,
                    'is_public' => true,
                    'order' => 2,
                ]);

            // Asignación en tabla pivote de administración si existe
            if (method_exists($admin, 'assignedContentTypes')) {
                $admin->assignedContentTypes()->syncWithoutDetaching([$proyectosCpt->id, $blogCpt->id]);
            }

            // ── 3. Metadatos y Custom Fields para los CPTs ──────────────────
            $projectFields = [
                ['name' => 'subtitle', 'label' => 'Subtítulo', 'type' => 'text', 'sort_order' => 1],
                ['name' => 'client', 'label' => 'Cliente', 'type' => 'text', 'sort_order' => 2],
                ['name' => 'year', 'label' => 'Año', 'type' => 'number', 'sort_order' => 3],
                ['name' => 'role', 'label' => 'Rol / Responsabilidad', 'type' => 'text', 'sort_order' => 4],
                ['name' => 'stack', 'label' => 'Stack Tecnológico', 'type' => 'text', 'sort_order' => 5],
                ['name' => 'metrics_summary', 'label' => 'Resumen de Métricas', 'type' => 'textarea', 'sort_order' => 6],
                ['name' => 'external_url', 'label' => 'URL en Vivo', 'type' => 'url', 'sort_order' => 7],
                ['name' => 'github_url', 'label' => 'Repositorio GitHub', 'type' => 'url', 'sort_order' => 8],
                ['name' => 'video_facade_url', 'label' => 'URL Video / Demo', 'type' => 'url', 'sort_order' => 9],
            ];

            foreach ($projectFields as $f) {
                CustomField::firstOrCreate(
                    ['content_type_id' => $proyectosCpt->id, 'name' => $f['name']],
                    array_merge($f, ['is_required' => false])
                );
            }

            $blogCustomFields = [
                ['name' => 'reading_time', 'label' => 'Tiempo de Lectura (min)', 'type' => 'number', 'sort_order' => 1],
                ['name' => 'cta_heading', 'label' => 'Titular del CTA', 'type' => 'text', 'sort_order' => 2],
                ['name' => 'cta_description', 'label' => 'Descripción / Bloque de Texto del CTA', 'type' => 'textarea', 'sort_order' => 3],
                ['name' => 'cta_button_text', 'label' => 'Texto del Botón CTA', 'type' => 'text', 'sort_order' => 4],
                ['name' => 'cta_button_url', 'label' => 'URL de Destino del Botón (opcional)', 'type' => 'url', 'sort_order' => 5],
            ];

            foreach ($blogCustomFields as $f) {
                CustomField::firstOrCreate(
                    ['content_type_id' => $blogCpt->id, 'name' => $f['name']],
                    array_merge($f, ['is_required' => false])
                );
            }

            // ── 4. Categorías Técnicas ──────────────────────────────────────
            $categoryDefinitions = [
                'Health Tech' => 'Sistemas clínicos de alta criticidad, portales hospitalarios y normativas de salud.',
                'UI/UX & Creative Direction' => 'Sistemas de diseño, microinteracciones avanzadas y dirección de arte.',
                'Data Architecture' => 'Modelado de bases de datos relacionales, optimización de queries y catálogos masivos.',
                'E-Commerce B2B' => 'Comercio electrónico modular, pasarelas transaccionales y alta conversión.',
                'Energía & Corporativo' => 'Portales institucionales, reportes corporativos ESG y ciberseguridad.',
                'WordPress Architecture' => 'Ingeniería avanzada en WordPress, Custom Themes, CPTs y eliminación de deuda técnica.',
                'Web Performance' => 'Optimización extrema de Core Web Vitals, tiempos de carga y presupuesto de rendimiento.',
                'Design Systems' => 'Arquitectura de tokens fluidos CSS, matemáticas con clamp() y componentes agnósticos.',
                'Creative Development' => 'Animación cinemática con GSAP, WebGL, Barba.js y transiciones fluidas de interfaz.',
                'Backend Architecture' => 'Diseño de APIs, microservicios, bases de datos y arquitectura de software sólida.',
                'Frontend Architecture' => 'Ecosistemas de componentes, integración de Blade con Vite y buenas prácticas frontend.',
                'UI/UX & Motion Design' => 'Diseño de interacción basado en física elástica, usabilidad y reducción de fricción.',
                'Technical SEO' => 'Datos estructurados Schema.org, indexación asíncrona y optimización para motores de búsqueda.',
                'Accesibilidad Digital' => 'Cumplimiento WCAG 2.2 AA/AAA, semántica WAI-ARIA y desarrollo web inclusivo.',
                'WordPress Security' => 'Hardening de servidores, mitigación OWASP Top 10 y auditorías de seguridad corporativa.',
            ];

            $categoryMap = [];
            foreach ($categoryDefinitions as $name => $desc) {
                $categoryMap[$name] = Category::updateOrCreate(
                    ['user_id' => $adminId, 'slug' => Str::slug($name)],
                    ['name' => $name, 'description' => $desc]
                );
            }

            // ── 5. Etiquetas de Tecnologías y Habilidades ───────────────────
            $tagList = [
                'PHP 8.4',
                'WordPress',
                'Laravel Blade',
                'Vanilla JS ES6+',
                'Redis Cache',
                'Cloudflare Workers',
                'Figma',
                'GSAP 3',
                'ScrollTrigger',
                'Flip',
                'Tailwind CSS',
                'Vite',
                'WordPress REST API',
                'Alpine.js',
                'Bootstrap 5.3',
                'MySQL',
                'WooCommerce Headless',
                'Stripe API',
                'WCAG 2.2 AAA',
                'AWS Lightsail',
                'Core Web Vitals',
                'LCP',
                'Schema.org',
                'Security Hardening',
                'Barba.js',
                'History API',
            ];

            $tagMap = [];
            foreach ($tagList as $tagName) {
                $tagMap[$tagName] = Tag::firstOrCreate(
                    ['user_id' => $adminId, 'slug' => Str::slug($tagName)],
                    ['name' => $tagName]
                );
            }

            // ── 6. Inserción de los 5 Casos de Estudio de Proyectos Insignia ─
            $proyectos = [
                [
                    'title' => 'Centro Médico ABC — Portal Institucional de Alta Concurrencia',
                    'slug' => 'centro-medico-abc-portal-institucional',
                    'subtitle' => 'Arquitectura Headless Híbrida y Optimización Core Web Vitals en Salud Crítica.',
                    'client' => 'Centro Médico ABC',
                    'year' => 2025,
                    'role' => 'WordPress Architect & Performance Lead',
                    'stack' => 'WordPress (PHP 8.4 nativo), Laravel Blade, Vanilla JS ES6+, Redis Cache, Cloudflare Workers',
                    'metrics' => [
                        'lcp' => '0.85s (reducido desde 4.1s)',
                        'pagespeed' => '100/100 Desktop / 98 Móvil',
                        'traffic' => '120,000 visitas diarias con 0% downtime',
                    ],
                    'metrics_summary' => 'LCP móvil reducido de 4.1s a 0.85s; 100/100 PageSpeed Desktop; soporte de 120k visitas diarias.',
                    'external_url' => 'https://centromedicoabc.com',
                    'github_url' => null,
                    'video_facade_url' => null,
                    'category' => 'Health Tech',
                    'tags' => ['WordPress', 'PHP 8.4', 'Laravel Blade', 'Vanilla JS ES6+', 'Redis Cache', 'Cloudflare Workers', 'Core Web Vitals', 'LCP'],
                    'sort_order' => 1,
                    'published_at' => Carbon::parse('2025-01-15 10:00:00'),
                    'excerpt' => 'Reingeniería integral del portal de salud médica de mayor reputación en México. Eliminación total de bloqueos de renderizado mediante arquitectura desacoplada, caché granular en Redis y Edge Workers.',
                    'body' => <<<'MARKDOWN'
## Resumen Ejecutivo

El **Centro Médico ABC** requería transformar su infraestructura web institucional para atender picos de tráfico masivos, optimizar la localización de especialistas médicos y cumplir con estrictos estándares internacionales de accesibilidad y privacidad sanitaria.

El ecosistema previo sufría de un *Largest Contentful Paint (LCP)* de 4.1 segundos en dispositivos móviles debido a la acumulación de plugins redundantes, estilos bloqueantes y una arquitectura monolítica no optimizada.

```
[Cliente Móvil / Desktop] ──► [Cloudflare Edge Workers] ──► [Nginx / PHP 8.4 OPcache]
                                         │                                │
                                  (Edge Cache HTML)            (Redis Object Cache)
```

### Principales Desafíos Técnicos

1. **Eliminación de la dependencia de maquetadores:** Sustitución de constructores visuales obsoletos por una arquitectura limpia en **PHP 8.4 nativo** y componentes modulares de **Laravel Blade**.
2. **Caché Perimetral y Capa de Datos:** Implementación de **Redis Object Cache** para reducir consultas SQL repetitivas en taxonomías médicas complejas y directorios de más de 1,200 médicos especialistas.
3. **Optimización de Core Web Vitals:** Estrategia de carga de recursos críticos en el *Above-the-Fold*, reduciendo el peso del bundle JavaScript a menos de 32 KB mediante código Vanilla ES6+ modular.

---

### Solución Arquitectónica Implementada

- **Renderizado Híbrido en el Edge:** Despliegue de scripts en Cloudflare Workers para el enrutamiento inteligente y sanitización de cabeceras de seguridad HTTP (CSP Nivel 3, HSTS preloaded).
- **Directorio Médico con Búsqueda Facetada:** Motor de búsqueda reactivo con tiempos de respuesta inferiores a 45ms sin recargar la página.
- **Auditoría Continua de Accesibilidad:** Cumplimiento verificado de la norma WCAG 2.1 AA en formularios de agendamiento y portal de pacientes.

### Métricas de Rendimiento Verificadas

- **LCP Móvil:** Disminución drástica de **4.1s a 0.85s**.
- **PageSpeed Insights:** **100/100 en Desktop** y **98/100 en Mobile**.
- **Capacidad de Concurrencia:** Soporte sostenido de más de **120,000 visitas diarias** durante campañas de vacunación y prevención.
MARKDOWN,
                ],
                [
                    'title' => 'Next in Line Management — Plataforma Editorial & Booking de Artistas',
                    'slug' => 'next-in-line-management-plataforma-editorial',
                    'subtitle' => 'Sistema de Diseño Fluido y Transiciones GSAP Shared-Element.',
                    'client' => 'Next in Line Management',
                    'year' => 2024,
                    'role' => 'UI/UX Designer & Senior Front-End Engineer',
                    'stack' => 'Figma, WordPress Custom Theme, GSAP 3 (Flip, ScrollTrigger), Tailwind CSS, Vite',
                    'metrics' => [
                        'retention' => '+45% en retención de sesión',
                        'cls' => 'CLS = 0 absoluto en transiciones compartidas',
                        'catalog' => 'Catálogo dinámico con navegación fluida History API',
                    ],
                    'metrics_summary' => 'Retención de sesión +45%; CLS = 0 en transiciones complejas; catálogo dinámico con History API.',
                    'external_url' => 'https://nextinlinemgmt.com',
                    'github_url' => null,
                    'video_facade_url' => null,
                    'category' => 'UI/UX & Creative Direction',
                    'tags' => ['Figma', 'WordPress', 'GSAP 3', 'ScrollTrigger', 'Flip', 'Tailwind CSS', 'Vite', 'History API'],
                    'sort_order' => 2,
                    'published_at' => Carbon::parse('2024-11-20 12:00:00'),
                    'excerpt' => 'Plataforma digital para destacada agencia internacional de talento musical y entretenimiento. Integración cinemática de GSAP Flip, diseño editorial con tokens CSS fluidos y catálogo interactivo sin saltos de página.',
                    'body' => <<<'MARKDOWN'
## Visión del Proyecto

**Next in Line Management** representa a creadores, productores y artistas de nivel mundial. El objetivo consistió en crear una identidad digital con el ritmo, la elegancia y la sofisticación de una revista editorial de lujo, fusionada con la fluidez táctil de una aplicación móvil nativa.

### Enfoque de Diseño y Motion

A diferencia de las páginas web convencionales que destruyen la continuidad visual al navegar entre perfiles de artistas, implementamos una arquitectura de **Shared Element Transitions** impulsada por **GSAP 3 Flip Plugin**:

```javascript
// Captura y transición cinemática sin desfase de coordenadas
const state = Flip.getState([artistCardImage, artistTitle]);
container.appendChild(detailView);
Flip.from(state, {
    duration: 0.65,
    ease: 'power3.inOut',
    scale: true,
    absolute: true,
});
```

### Innovaciones Destacadas

1. **Tokens Fluidos en Figma y CSS:** Cálculo exacto de tipografías y márgenes con curvas matemáticas `clamp()`, eliminando cambios bruscos entre pantallas de laptop, tablet y smartphone.
2. **Cero Salto de Diseño (CLS = 0):** Respeto estricto del *bounding box* de imágenes y contenedores para garantizar estabilidad visual perfecta.
3. **Sincronización con History API:** Navegación dinámica que actualiza URLs y metadatos Open Graph en tiempo real sin recargas completas del navegador.

### Resultados de Impacto

- **Tiempo de permanencia en el sitio:** Incremento del **45%**.
- **Tasa de conversión en solicitudes de Booking:** Aumento del **32%** en el primer trimestre.
- **Rendimiento:** 60 fotogramas por segundo (FPS) continuos en animaciones sobre pantallas Retina.
MARKDOWN,
                ],
                [
                    'title' => 'FLACSO México — Sistema de Repositorio Académico y Publicaciones',
                    'slug' => 'flacso-mexico-repositorio-academico',
                    'subtitle' => 'Modelado EAV de Datos Académicos y Búsqueda Facetada en Tiempo Real.',
                    'client' => 'FLACSO México',
                    'year' => 2024,
                    'role' => 'Full-Stack WordPress Engineer & Data Architect',
                    'stack' => 'PHP 8.4, WordPress REST API, Alpine.js, Bootstrap 5.3, MySQL',
                    'metrics' => [
                        'query_time' => 'Filtros facetados < 95ms sobre 15,000 publicaciones',
                        'cpu_reduction' => '60% de reducción en consumo de CPU de base de datos',
                        'seo_schema' => '100% de cobertura en esquemas ScholarlyArticle',
                    ],
                    'metrics_summary' => 'Filtros complejos < 95ms sobre 15,000 publicaciones; reducción de 60% en CPU; esquemas ScholarlyArticle.',
                    'external_url' => 'https://flacso.edu.mx',
                    'github_url' => null,
                    'video_facade_url' => null,
                    'category' => 'Data Architecture',
                    'tags' => ['PHP 8.4', 'WordPress REST API', 'Alpine.js', 'Bootstrap 5.3', 'MySQL', 'Schema.org'],
                    'sort_order' => 3,
                    'published_at' => Carbon::parse('2024-08-10 09:30:00'),
                    'excerpt' => 'Reestructuración integral de la biblioteca digital y repositorio científico para la Facultad Latinoamericana de Ciencias Sociales. Búsqueda facetada sub-100ms sobre más de 15,000 documentos académicos.',
                    'body' => <<<'MARKDOWN'
## El Desafío de los Datos Académicos Masivos

La sede académica de **FLACSO México** alberga más de cuatro décadas de investigación sociológica, libros arbitrados, tesis de posgrado y revistas científicas.

El repositorio anterior sufría bloqueos frecuentes causados por consultas complejas que realizaban múltiples *INNER JOINs* contra la tabla estándar `wp_postmeta`, elevando el consumo de CPU del servidor MySQL por encima del 90%.

### Solución de Arquitectura de Datos

- **Indexación y Columnas Virtuales:** Rediseño del esquema relacional y particionamiento lógico de metadatos académicos (ISBN, autores, líneas de investigación, DOI).
- **Caché Transaccional:** Almacenamiento en memoria de facetas precalculadas y normalización de taxonomías institucionales.
- **Frontend Ultraligero con Alpine.js:** Interfaz de búsqueda facetada con debounce reactivo, minimizando la carga en el cliente y permitiendo filtrado instantáneo.

```sql
-- Estrategia de optimización relacional con índices compuestos
ALTER TABLE academic_metadata
ADD INDEX idx_research_year (research_line_id, publication_year, status);
```

### Resultados Académicos y de Infraestructura

- **Tiempo de respuesta de filtros:** Reducción a **menos de 95ms** en búsquedas cruzadas sobre 15,000 documentos.
- **Eficiencia del servidor:** **Reducción del 60%** en uso de CPU y memoria en horas pico de matrícula y consulta académica.
- **Indexación en Google Scholar:** Cobertura del **100%** mediante inyección automática de metadatos estructurados `ScholarlyArticle` en formato JSON-LD.
MARKDOWN,
                ],
                [
                    'title' => 'Accésate — E-Commerce B2B & Sistema de Accesibilidad Corporativa',
                    'slug' => 'accesate-ecommerce-b2b-accesibilidad',
                    'subtitle' => 'Componentización Modular con Laravel Blade y Pasarelas de Alto Volumen.',
                    'client' => 'Accésate',
                    'year' => 2025,
                    'role' => 'Front-End Architect & UI Designer',
                    'stack' => 'Laravel Blade, WordPress / WooCommerce Headless, Tailwind CSS, Stripe API',
                    'metrics' => [
                        'checkout_boost' => '+28% en tasa de conversión de checkout',
                        'accessibility' => '100% cumplimiento normativo WCAG 2.2 AAA',
                        'bundle_size' => 'Bundle JS final optimizado de 38KB gzip',
                    ],
                    'metrics_summary' => '+28% en tasa de checkout; cumplimiento WCAG 2.2 AAA; bundle JS final de 38KB gzip.',
                    'external_url' => 'https://accesate.com',
                    'github_url' => null,
                    'video_facade_url' => null,
                    'category' => 'E-Commerce B2B',
                    'tags' => ['Laravel Blade', 'WooCommerce Headless', 'Tailwind CSS', 'Stripe API', 'WCAG 2.2 AAA'],
                    'sort_order' => 4,
                    'published_at' => Carbon::parse('2025-02-01 11:15:00'),
                    'excerpt' => 'Plataforma e-commerce especializada en tecnologías de asistencia y ergonomía laboral. Diseño universal accesible bajo estándar WCAG 2.2 AAA y flujo de pago optimizado con Stripe Elements.',
                    'body' => <<<'MARKDOWN'
## Propósito y Misión del Proyecto

**Accésate** comercializa dispositivos de asistencia para personas con discapacidad motriz, visual y auditiva en entornos corporativos y educativos. Un portal con barreras de accesibilidad contradecía frontalmente los valores de la empresa.

El proyecto exigió un rigor absoluto: diseñar una experiencia de compra B2B atractiva, moderna y visualmente sofisticada que al mismo tiempo fuera **100% operable por teclado y lectores de pantalla (NVDA, VoiceOver, JAWS)**.

### Pilares de la Implementación

1. **Semántica Nativa y Contraste Riguroso:** Implementación estricta de roles WAI-ARIA sin redundancias, garantizando contrastes de color mínimos de 7:1 en tipografías y 4.5:1 en elementos de control.
2. **Arquitectura Modular Blade:** Componentes limpios `<x-product-card>`, `<x-accessible-dialog>` y `<x-price-badge>` que impiden regresiones de código inaccesible.
3. **Checkout Seguro en un Paso:** Integración de **Stripe Elements API** con validaciones accesibles que anuncian errores de formulario a usuarios de tecnologías de asistencia en tiempo real mediante `aria-live="polite"`.

```html
<!-- Ejemplo de retroalimentación accesible en tiempo real -->
<div role="status" aria-live="polite" class="sr-only" id="checkout-announcer">
    {{ $statusMessage }}
</div>
```

### Logros de Negocio

- **Tasa de finalización de compra:** Crecimiento del **28%**.
- **Tamaño de activos:** Bundle JavaScript total de solo **38 KB gzip**.
- **Reconocimiento:** Certificación de cumplimiento **WCAG 2.2 nivel AAA** otorgada por auditores externos de accesibilidad digital.
MARKDOWN,
                ],
                [
                    'title' => 'Saavi Energía — Portal Corporativo Institucional y Reportes ESG',
                    'slug' => 'saavi-energia-portal-corporativo-esg',
                    'subtitle' => 'Rendimiento Extremo, Seguridad Empresarial y Diseño Editorial Corporativo.',
                    'client' => 'Saavi Energía',
                    'year' => 2025,
                    'role' => 'WordPress Architect & Technical Lead',
                    'stack' => 'Custom Theme PHP 8.4, Bootstrap 5.3, Vite, GSAP ScrollTrigger, AWS Lightsail',
                    'metrics' => [
                        'security' => 'Calificación A+ en auditorías de ciberseguridad SSL Labs y Qualys',
                        'vitals' => 'LCP < 1.1s y FID < 12ms en todas las plantillas corporativas',
                        'compliance' => '0 incidencias en auditorías de gobierno corporativo',
                    ],
                    'metrics_summary' => 'Calificación A+ en seguridad; LCP < 1.1s y FID < 12ms; 0 incidencias en auditorías de gobierno.',
                    'external_url' => 'https://saavienergia.com',
                    'github_url' => null,
                    'video_facade_url' => null,
                    'category' => 'Energía & Corporativo',
                    'tags' => ['PHP 8.4', 'Bootstrap 5.3', 'Vite', 'GSAP 3', 'ScrollTrigger', 'AWS Lightsail', 'Security Hardening'],
                    'sort_order' => 5,
                    'published_at' => Carbon::parse('2025-02-18 16:40:00'),
                    'excerpt' => 'Portal web institucional para uno de los mayores generadores privados de energía en México. Narrativa interactiva de memorias de sostenibilidad ESG y arquitectura protegida con estándares bancarios de ciberseguridad.',
                    'body' => <<<'MARKDOWN'
## Alcance Estratégico

**Saavi Energía** es una empresa clave en la transición energética y generación eléctrica en México. Su portal web representa el canal principal de comunicación ante inversionistas globales, autoridades regulatorias y comunidades locales.

El proyecto combinó dos prioridades habitualmente enfrentadas: una presentación visual cautivadora de los reportes de sostenibilidad ambiental, social y de gobernanza (**ESG**) mediante gráficos interactivos, junto a un **blindaje de ciberseguridad corporativa** de nivel bancario.

### Medidas de Seguridad y Endurecimiento

- **Hardening Integral de Servidor:** Nginx con reglas personalizadas de ModSecurity, bloqueo automático de escaneos maliciosos y aislamiento estricto de permisos de lectura y escritura en Linux.
- **Políticas de Seguridad de Contenido (CSP Nivel 3):** Erradicación total de scripts inline y protección absoluta contra ataques XSS (*Cross-Site Scripting*) y clickjacking.
- **Sanitización de Datos:** Integración de la suite HTMLPurifier en todos los módulos de contenido dinámico.

```nginx
# Cabeceras estrictas de protección perimetral
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-...'";
```

### Visualización Interactiva ESG

- Desarrollo de visualizadores interactivos de métricas de reducción de huella de carbono y descarbonización con **GSAP ScrollTrigger**, optimizados para no generar caídas de framerate en equipos de oficina.
- **Calificación A+** en evaluaciones de seguridad independientes por Qualys SSL Labs.
- **Tiempos de carga de página:** LCP promedio de **1.05s** en toda la red de generación.
MARKDOWN,
                ],
            ];

            foreach ($proyectos as $p) {
                $categoryObj = $categoryMap[$p['category']] ?? null;
                $projectTagIds = collect($p['tags'])
                    ->map(fn ($name) => $tagMap[$name]->id ?? null)
                    ->filter()
                    ->all();

                $projectSlug = Str::slug($p['slug']);

                $content = Content::updateOrCreate(
                    [
                        'user_id' => $adminId,
                        'content_type_id' => $proyectosCpt->id,
                        'slug' => $projectSlug,
                    ],
                    [
                        'title' => $p['title'],
                        'excerpt' => $p['excerpt'],
                        'body' => $p['body'],
                        'status' => 'published',
                        'published_at' => $p['published_at'],
                        'featured' => true,
                        'sort_order' => $p['sort_order'],
                        'meta_title' => Str::limit($p['title'], 60),
                        'meta_description' => Str::limit($p['excerpt'], 155),
                        'meta_keywords' => implode(', ', $p['tags']),
                        'custom_values' => [
                            'subtitle' => $p['subtitle'],
                            'client' => $p['client'],
                            'year' => $p['year'],
                            'role' => $p['role'],
                            'stack' => $p['stack'],
                            'metrics' => $p['metrics'],
                            'metrics_summary' => $p['metrics_summary'],
                            'external_url' => $p['external_url'],
                            'github_url' => $p['github_url'],
                            'video_facade_url' => $p['video_facade_url'],
                        ],
                    ]
                );

                if ($categoryObj) {
                    $content->categories()->syncWithoutDetaching([$categoryObj->id]);
                }
                if (! empty($projectTagIds)) {
                    $content->tags()->syncWithoutDetaching($projectTagIds);
                }
            }

            // ── 7. Inserción de los 10 Artículos Especializados del Blog ─────
            $articulos = [
                [
                    'title' => 'El declive de los constructores visuales: Por qué el PHP nativo sigue dominando el desarrollo empresarial',
                    'slug' => 'declive-constructores-visuales-php-nativo-desarrollo-empresarial',
                    'category' => 'WordPress Architecture',
                    'reading_time' => 8,
                    'cta_heading' => '¿Tu plataforma corporativa sufre de lentitud o deuda técnica por constructores visuales?',
                    'cta_description' => 'Como WordPress Architect, migro sitios críticos a temas nativos limpios en PHP 8.4 y componentes Blade, reduciendo el TTFB y eliminando la deuda técnica.',
                    'cta_button_text' => 'Solicitar diagnóstico de arquitectura',
                    'published_at' => Carbon::parse('2025-02-10 14:00:00'),
                    'featured' => true,
                    'sort_order' => 1,
                    'tags' => ['WordPress', 'PHP 8.4', 'Backend Architecture', 'Clean Code'],
                    'excerpt' => 'Una autopsia técnica del coste real de Elementor, Divi y otros page builders en proyectos de misión crítica: DOM bloat, TTFB inflado y deuda técnica corporativa que frena el crecimiento.',
                    'body' => <<<'MARKDOWN'
## La Ilusión de la Velocidad Inicial

Durante más de una década, los constructores visuales (*page builders*) como Elementor, Divi o WPBakery se promocionaron como la solución definitiva para democratizar el desarrollo web. Sin embargo, en el ámbito del **software empresarial y sitios corporativos de alta demanda**, esta supuesta agilidad inicial se convierte invariablemente en un pasivo técnico asfixiante.

Cuando un equipo de marketing solicita agregar funcionalidades avanzadas, optimizar la conversión o someter el portal a una auditoría estricta de *Core Web Vitals*, los cimientos basados en constructores visuales comienzan a colapsar.

---

### 1. El Problema del DOM Bloat y la Jerarquía Innecesaria

Un botón simple diseñado con código nativo requiere exactamente una etiqueta `<button>` o `<a>` acompañada de clases utilitarias limpias. En contraste, un constructor visual típico genera entre **8 y 18 capas anidadas de contenedores `<div>`** para posicionar el mismo botón:

```html
<!-- DOM generado por un constructor visual típico -->
<div class="elementor-element elementor-element-74921b">
  <div class="elementor-widget-container">
    <div class="elementor-button-wrapper">
      <div class="elementor-button-inner">
        <a href="#" class="elementor-button elementor-size-sm">
          <span class="elementor-button-content-wrapper">
            <span class="elementor-button-text">Contactar</span>
          </span>
        </a>
      </div>
    </div>
  </div>
</div>
```

Este exceso masivo de nodos no solo multiplica el tamaño del archivo HTML transmitido, sino que satura el motor de renderizado del navegador (*Recalculate Style* y *Layout Trees*), afectando gravemente la métrica **Interaction to Next Paint (INP)** en terminales móviles de gama media y baja.

---

### 2. Sobrecarga en la Base de Datos y Consultas Ocultas

Los maquetadores visuales serializan configuraciones de diseño dentro de la tabla `wp_postmeta` como arrays JSON gigantescos o shortcodes recursivos. Para renderizar una sola página:

- El servidor debe deserializar blobs de texto de cientos de kilobytes en cada solicitud.
- Se ejecutan filtros dinámicos que impiden la optimización nativa del motor OPcache de PHP.
- Se multiplican las llamadas a funciones de base de datos no cacheadas.

---

### 3. La Alternativa Profesional: Custom Themes con Componentes PHP 8.4

El desarrollo profesional moderno en WordPress adopta los mismos estándares que Laravel o Symfony: **código tipado estricto, separación de responsabilidades y componentes declarativos**:

```php
<?php
declare(strict_types=1);

namespace App\Components;

final readonly class ActionButton
{
    public function __construct(
        public string $label,
        public string $url,
        public string $variant = 'primary',
    ) {}

    public function render(): string
    {
        return sprintf(
            '<a href="%s" class="btn-action btn-%s">%s</a>',
            htmlspecialchars($this->url, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars($this->variant, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars($this->label, ENT_QUOTES, 'UTF-8')
        );
    }
}
```

### Conclusión

Las herramientas visuales tienen su espacio en prototipos rápidos y blogs personales. Sin embargo, para proyectos institucionales, comercio electrónico y portales con miles de visitantes diarios, el **PHP nativo y una arquitectura de componentes bien estructurada** siguen siendo imbatibles en longevidad, rendimiento y costo total de propiedad (TCO).
MARKDOWN,
                ],
                [
                    'title' => 'Core Web Vitals en producción: Estrategias técnicas para alcanzar LCP < 1.2s en WordPress',
                    'slug' => 'core-web-vitals-produccion-estrategias-lcp-wordpress',
                    'category' => 'Web Performance',
                    'reading_time' => 10,
                    'cta_heading' => '¿Necesitas optimizar los Core Web Vitals de tu portal para mejorar SEO y conversión?',
                    'cta_description' => 'Especialista en alcanzar LCP inferior a 1.2s y erradicar bloqueos de hilo principal en infraestructuras web corporativas complejas.',
                    'cta_button_text' => 'Consultar optimización de performance',
                    'published_at' => Carbon::parse('2025-02-05 11:30:00'),
                    'featured' => true,
                    'sort_order' => 2,
                    'tags' => ['Core Web Vitals', 'LCP', 'Web Performance', 'Vite', 'PHP 8.4'],
                    'excerpt' => 'Guía exhaustiva para diagnosticar y erradicar los 4 sub-componentes del Largest Contentful Paint: sub-recursos de fuentes, atributos fetchpriority y precarga selectiva en producción.',
                    'body' => <<<'MARKDOWN'
## Desglosando el Largest Contentful Paint (LCP)

Muchos desarrolladores cometen el error de tratar el *Largest Contentful Paint* como una métrica monolítica. En realidad, según las especificaciones técnicas del consorcio W3C y el equipo de Google Chrome, el tiempo total de LCP se descompone en **cuatro fases secuenciales estrictas**:

```
[──── TTFB ────][── Resource Load Delay ──][── Resource Load Duration ──][── Element Render Delay ──]
0s              0.3s                      0.7s                           0.95s (LCP Total < 1.2s)
```

1. **Time to First Byte (TTFB):** Tiempo transcurrido hasta recibir el primer byte del documento HTML.
2. **Resource Load Delay:** Tiempo entre la recepción del HTML y el momento en que el navegador comienza a descargar el elemento LCP (habitualmente la imagen del hero o tipografía principal).
3. **Resource Load Duration:** Tiempo de descarga física del recurso a través de la red.
4. **Element Render Delay:** Tiempo entre la finalización de la descarga y el pintado del elemento en pantalla.

---

### Fase 1: Minimizar el Retraso de Descarga del Recurso (Resource Load Delay)

El fallo más habitual en WordPress es el uso indiscriminado de atributos `loading="lazy"` en la imagen principal del encabezado. Cuando el hero tiene carga diferida, el navegador no inicia la petición hasta calcular el layout completo:

```html
<!-- ANTIPATRÓN: Retrasa la petición de la imagen crítica -->
<img src="hero.webp" loading="lazy" alt="Banner">

<!-- IMPLEMENTACIÓN ÓPTIMA: Prioridad máxima inmediata -->
<img src="hero.webp" fetchpriority="high" loading="eager" decoding="async" alt="Banner">
```

Además, debemos anunciar el recurso en la cabecera `<head>` mediante etiquetas `<link rel="preload">` condicionales:

```html
<link rel="preload" as="image" href="/assets/hero-banner.webp" type="image/webp" fetchpriority="high">
```

---

### Fase 2: Inyección de Critical CSS sin Dependencias Bloqueantes

El bloqueo de renderizado por hojas de estilo CSS externas infla el *Element Render Delay*. La solución consiste en aislar los estilos del *Above-the-Fold* e inyectarlos directamente en el bloque `<style>` del documento:

- **Estilos Críticos (Inline):** Estructura del navbar, tipografía del hero, rejilla inicial. Peso objetivo: `< 14 KB` para transferirse en el primer paquete TCP (*Initial Congestion Window*).
- **Estilos Secundarios (Asíncronos):** Módulos inferiores, modales, footer cargados con `rel="preload"` y swap de `media="all"`.

---

### Fase 3: Auto-alojamiento y Subset de Tipografías Web

Las llamadas externas a servicios como Google Fonts introducen conexiones DNS, TLS y descargas adicionales en dominios terceros.

1. Alojar las fuentes localmente en formato moderno **WOFF2**.
2. Realizar un *subset* eliminando glifos no utilizados (cirílico, griego, etc.), reduciendo archivos de 180 KB a solo 16 KB.
3. Declarar `font-display: swap` y precargar la fuente principal con `rel="preload"`.

### Verificación en Entorno Real

La aplicación disciplinada de estas tres fases permite situar el LCP consistentemente por debajo de **1.1 segundos en redes 4G móviles**, logrando la certificación verde en Google Search Console y una experiencia de navegación inmediata.
MARKDOWN,
                ],
                [
                    'title' => 'De Figma a Tokens CSS: Matemáticas fluidas con clamp() sin dependencias externas',
                    'slug' => 'de-figma-a-tokens-css-matematicas-fluidas-clamp',
                    'category' => 'Design Systems',
                    'reading_time' => 7,
                    'cta_heading' => '¿Deseas implementar un Design System fluido y escalable para tu marca?',
                    'cta_description' => 'Diseño y desarrollo sistemas de diseño con tokens fluidos matemáticos, garantizando consistencia absoluta entre Figma y código de producción.',
                    'cta_button_text' => 'Conversar sobre diseño y tokens',
                    'published_at' => Carbon::parse('2025-01-28 17:00:00'),
                    'featured' => false,
                    'sort_order' => 3,
                    'tags' => ['Design Systems', 'CSS', 'Figma', 'Frontend Architecture'],
                    'excerpt' => 'Cómo erradicar cientos de media queries arbitrarias implementando un motor de escala tipográfica y espaciado proporcional basado en ecuaciones lineales en CSS.',
                    'body' => <<<'MARKDOWN'
## La Fragilidad de los Breakpoints Tradicionales

El diseño web tradicional se ha fundamentado durante años en una premisa estática: definir tamaños fijos para *móvil (375px)*, *tablet (768px)* y *desktop (1440px)* unidos mediante saltos abruptos de `@media (min-width: ...)`.

Este enfoque produce dos graves problemas:
1. **Layouts rotos en pantallas intermedias** (como plegables o tablets horizontales).
2. **Hojas de estilo infladas** repletas de reglas redundantes que reescriben márgenes y tamaños una y otra vez.

---

### La Ecuación Matemática del Escalado Proporcional

La función nativa `clamp(min, preferred, max)` de CSS nos permite crear una curva de interpolación lineal entre dos anchos de pantalla específicos:

$$\text{preferred} = y\text{-intercept} + (\text{slope} \times 100\text{vw})$$

Donde la pendiente (*slope*) se calcula como:

$$\text{slope} = \frac{\text{size}_{\max} - \text{size}_{\min}}{\text{viewport}_{\max} - \text{viewport}_{\min}}$$

---

### Implementación Práctica del Sistema de Tokens

En lugar de calcular valores arbitrarios en cada selector, centralizamos los cálculos en el `:root` de nuestro sistema de diseño:

```css
:root {
  /* Límites de pantalla */
  --fluid-viewport-min: 375;
  --fluid-viewport-max: 1440;

  /* Escala de titulares monumentales */
  --fluid-h1: clamp(2.5rem, 1.85rem + 2.77vw, 4.5rem);
  --fluid-h2: clamp(2rem, 1.55rem + 1.92vw, 3.25rem);
  --fluid-body: clamp(1rem, 0.95rem + 0.21vw, 1.125rem);

  /* Escala dimensional de espaciado */
  --fluid-space-sm: clamp(0.75rem, 0.65rem + 0.42vw, 1rem);
  --fluid-space-md: clamp(1.25rem, 1rem + 1.06vw, 2rem);
  --fluid-space-xl: clamp(3rem, 2.3rem + 2.98vw, 5rem);
}
```

### Ventajas en Producción

- **Cero dependencias JavaScript:** No se requiere calcular el tamaño de ventana con `window.innerWidth`.
- **Accesibilidad Respetada:** Al expresar los mínimos y máximos en unidades relativas `rem`, el texto respeta fielmente la configuración de zoom del usuario y las directrices WCAG.
- **Reducción de Código:** Disminución de más del **40% en líneas de CSS** al suprimir media queries superfluas.
MARKDOWN,
                ],
                [
                    'title' => 'Transiciones de página tipo App con GSAP Flip y Barba.js sin arruinar el SEO',
                    'slug' => 'transiciones-pagina-tipo-app-gsap-flip-barba-seo',
                    'category' => 'Creative Development',
                    'reading_time' => 9,
                    'cta_heading' => '¿Buscas crear una experiencia web cinemática tipo App sin sacrificar SEO?',
                    'cta_description' => 'Desarrollo transiciones de página fluidas con Barba.js y GSAP Flip en arquitecturas Blade y Laravel que deleitan al usuario y retienen visitas.',
                    'cta_button_text' => 'Impulsar experiencia de usuario',
                    'published_at' => Carbon::parse('2025-01-20 10:15:00'),
                    'featured' => false,
                    'sort_order' => 4,
                    'tags' => ['GSAP 3', 'Flip', 'Barba.js', 'Creative Development', 'Technical SEO'],
                    'excerpt' => 'El contrato técnico de sincronización entre animaciones compartidas de alto impacto y la conservación íntegra del HTML para rastreadores de motores de búsqueda.',
                    'body' => <<<'MARKDOWN'
## El Dilema: SPA vs. SEO Tradicional

Durante mucho tiempo, la industria asumió que para conseguir transiciones de página fluidas y cinemáticas estilo aplicación nativa era obligatorio migrar a una SPA monolítica en React o Vue, sacrificando la velocidad de entrega del primer byte y complicando la indexación en motores de búsqueda.

La solución de ingeniería más elegante combina **lo mejor de ambos mundos**:
- **Backend Laravel / Blade:** HTML completo, semántico y renderizado en el servidor en cada petición.
- **Frontend Barba.js v2 + GSAP:** Interceptación asíncrona de hipervínculos para reemplazar únicamente el contenedor dinámico mientras el navegador conserva el contexto de renderizado.

---

### El Ciclo de Vida Crítico de la Transición

Para evitar fugas de memoria (*memory leaks*) y listeners huérfanos con bibliotecas de scroll suave como Lenis y ScrollTrigger, debemos cumplir un ciclo de vida riguroso:

```
[Click Enlace] ──► beforeLeave: Pausar Lenis, matar triggers existentes
                     │
               leave: Animación de salida (fade out / scale down)
                     │
               beforeEnter: Scroll a posición 0, actualizar title y meta tags
                     │
               enter: GSAP Flip animation entre contenedor saliente y entrante
                     │
               after: Reiniciar Lenis, invocar ScrollTrigger.refresh()
```

---

### Sincronización Dinámica de Metadatos y Schema.org

En el hook `after` de Barba.js, extraemos los metadatos de la nueva página del documento entrante y los inyectamos en el `<head>` activo:

```javascript
barba.hooks.after((data) => {
    // 1. Sincronización del título de la página
    document.title = data.next.html.match(/<title>(.*?)<\/title>/)?.[1] || document.title;

    // 2. Reemplazo del bloque JSON-LD para auditores y rastreadores
    const nextDoc = new DOMParser().parseFromString(data.next.html, 'text/html');
    const newJsonLd = nextDoc.querySelector('script[type="application/ld+json"]');
    const currentJsonLd = document.querySelector('script[type="application/ld+json"]');

    if (newJsonLd && currentJsonLd) {
        currentJsonLd.textContent = newJsonLd.textContent;
    }

    // 3. Notificación a analíticas (telemetría / GA4)
    if (typeof gtag === 'function') {
        gtag('event', 'page_view', { page_location: window.location.href });
    }
});
```

### Conclusión

La combinación de **Blade + Barba.js + GSAP Flip** permite entregar experiencias interactivas deslumbrantes con puntuaciones perfectas de SEO y rendimiento técnico.
MARKDOWN,
                ],
                [
                    'title' => 'Arquitectura de datos en WordPress: CPTs, Taxonomías y Tablas Personalizadas',
                    'slug' => 'arquitectura-datos-wordpress-cpt-taxonomias-tablas-personalizadas',
                    'category' => 'Backend Architecture',
                    'reading_time' => 8,
                    'cta_heading' => '¿Tu modelo de datos en WordPress requiere optimización o tablas personalizadas?',
                    'cta_description' => 'Estructuro arquitecturas de contenido complejas, índices de búsqueda y modelos relacionales limpios para soportar catálogos de alto volumen.',
                    'cta_button_text' => 'Consultar arquitectura de datos',
                    'published_at' => Carbon::parse('2025-01-12 15:45:00'),
                    'featured' => false,
                    'sort_order' => 5,
                    'tags' => ['WordPress', 'MySQL', 'Backend Architecture', 'Data Architecture'],
                    'excerpt' => 'Cuándo aprovechar el esquema EAV de WordPress y en qué momento es mandatorio diseñar tablas SQL relacionales dedicadas para evitar cuellos de botella.',
                    'body' => <<<'MARKDOWN'
## Las Limitaciones del Patrón EAV en WordPress

WordPress almacena los datos de contenido personalizado mediante el patrón **Entity-Attribute-Value (EAV)** a través de la tabla `wp_postmeta`. Cada campo personalizado se registra como una fila independiente con la estructura `(meta_id, post_id, meta_key, meta_value)`.

Este diseño ofrece una flexibilidad inmensa, pero a partir de cierto volumen de registros genera un problema crítico de rendimiento: **cada filtro adicional requiere un nuevo JOIN sobre la misma tabla**.

```sql
-- Consulta con 4 filtros en wp_postmeta: Rendimiento exponencialmente degradado
SELECT p.ID FROM wp_posts p
INNER JOIN wp_postmeta m1 ON (p.ID = m1.post_id AND m1.meta_key = 'precio')
INNER JOIN wp_postmeta m2 ON (p.ID = m2.post_id AND m2.meta_key = 'ciudad')
INNER JOIN wp_postmeta m3 ON (p.ID = m3.post_id AND m3.meta_key = 'habitaciones')
WHERE m1.meta_value > 200000 AND m2.meta_value = 'CDMX' ...
```

---

### La Decisión Arquitectónica: Taxonomía vs. Meta vs. Custom Table

| Requerimiento | Solución Técnica Recomendada | Razón Arquitectónica |
| :--- | :--- | :--- |
| **Categorización y Facetas** | **Taxonomías Personalizadas** | Utilizan tablas relacionales dedicadas (`wp_terms`, `wp_term_relationships`) altamente optimizadas en memoria. |
| **Metadatos Descriptivos** | **Custom Fields (`post_meta`)** | Información accesoria visualizada solo en la vista individual del post (ej. ficha técnica). |
| **Búsquedas Masivas y Rangos** | **Tablas SQL Dedicadas** | Permite índices B-Tree específicos, columnas con tipado estricto (INT, DECIMAL, DATE) y claves foráneas. |

---

### Diseño de una Tabla Personalizada de Alto Rendimiento

Para un catálogo inmobiliario o de publicaciones científicas, creamos una tabla dedicada asociada al post:

```sql
CREATE TABLE app_property_index (
    post_id BIGINT UNSIGNED NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    bedrooms TINYINT UNSIGNED NOT NULL,
    square_meters INT UNSIGNED NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    PRIMARY KEY (post_id),
    INDEX idx_price_bedrooms (price, bedrooms),
    FOREIGN KEY (post_id) REFERENCES wp_posts(ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Con este modelo relacional, las consultas de filtrado se ejecutan en **menos de 5 milisegundos**, liberando la memoria del servidor de base de datos.
MARKDOWN,
                ],
                [
                    'title' => 'Laravel Blade dentro del ecosistema WordPress: Unificando lo mejor de dos mundos',
                    'slug' => 'laravel-blade-dentro-ecosistema-wordpress',
                    'category' => 'Frontend Architecture',
                    'reading_time' => 7,
                    'cta_heading' => '¿Quieres la elegancia y velocidad de Laravel Blade en tus temas de WordPress?',
                    'cta_description' => 'Implemento componentes declarativos y motores de plantillas modernos para transformar temas heredados en código mantenible, robusto y veloz.',
                    'cta_button_text' => 'Modernizar temas a Blade',
                    'published_at' => Carbon::parse('2025-01-05 08:20:00'),
                    'featured' => false,
                    'sort_order' => 6,
                    'tags' => ['Laravel Blade', 'WordPress', 'Frontend Architecture', 'PHP 8.4'],
                    'excerpt' => 'Implementando el motor de plantillas Blade para estructurar temas limpios, componentes reutilizables con props tipadas y directivas personalizadas.',
                    'body' => <<<'MARKDOWN'
## El Desorden del PHP Mezclado con HTML

El ecosistema tradicional de temas de WordPress adolece históricamente de una falta de separación limpia entre lógica y presentación. Es común encontrar archivos `single.php` de miles de líneas donde consultas directas a la base de datos se entrelazan con bucles de renderizado y lógica condicional.

Al integrar el motor **Illuminate View (Laravel Blade)** dentro de WordPress, resolvemos de raíz este desorden arquitectónico.

---

### Creando Componentes Reutilizables y Tipados

En lugar de llamadas a `get_template_part()`, estructuramos la interfaz en componentes Blade que validan sus propiedades:

```blade
{{-- resources/views/components/card.blade.php --}}
@props([
    'title',
    'excerpt',
    'url',
    'category' => 'General',
    'featured' => false
])

<article {{ $attributes->class(['project-card', 'is-featured' => $featured]) }}>
    <span class="card-badge font-mono">{{ $category }}</span>
    <h3 class="card-title">
        <a href="{{ $url }}">{{ $title }}</a>
    </h3>
    <p class="card-excerpt">{{ $excerpt }}</p>
    <div class="card-footer">
        {{ $slot }}
    </div>
</article>
```

---

### Directivas Personalizadas para WordPress

Podemos extender el compilador de Blade para interactuar con funciones nativas de WordPress de forma limpia y concisa:

```php
// En el bootstrap del tema
Blade::directive('usercan', function ($expression) {
    return "<?php if (current_user_can({$expression})): ?>";
});

Blade::directive('endusercan', function () {
    return '<?php endif; ?>';
});
```

Permitiendo sintaxis elegante en las vistas:

```blade
@usercan('edit_posts')
    <a href="{{ get_edit_post_link() }}" class="admin-edit-pill">Editar Artículo</a>
@endusercan
```

Esta metodología eleva la experiencia de desarrollo (**DX**) y minimiza errores en entornos corporativos colaborativos.
MARKDOWN,
                ],
                [
                    'title' => 'Microinteracciones que convierten: Animación basada en intención y física elástica',
                    'slug' => 'microinteracciones-que-convierten-animacion-fisica-elastica',
                    'category' => 'UI/UX & Motion Design',
                    'reading_time' => 6,
                    'cta_heading' => '¿Quieres enriquecer la interfaz de tu producto con microinteracciones de alto impacto?',
                    'cta_description' => 'Construyo animaciones basadas en física, feedback táctil y microinteracciones fluidas que elevan la percepción de calidad y aumentan la retención.',
                    'cta_button_text' => 'Elevar interacción visual',
                    'published_at' => Carbon::parse('2024-12-18 13:00:00'),
                    'featured' => false,
                    'sort_order' => 7,
                    'tags' => ['UI/UX & Motion Design', 'GSAP 3', 'Creative Development'],
                    'excerpt' => 'El movimiento como lenguaje funcional de retroalimentación digital: curvas de desaceleración elástica, botones magnéticos y affordance visual.',
                    'body' => <<<'MARKDOWN'
## Animación con Propósito vs. Animación Gratuita

En el diseño web contemporáneo existe una delgada línea entre el dinamismo que orienta y la animación que distrae o fatiga. Una **microinteracción eficaz** no busca impresionar por exhibicionismo técnico, sino comunicar instantáneamente:

1. **Reconocimiento:** El sistema ha recibido la orden del usuario.
2. **Estado:** Qué proceso se está ejecutando en segundo plano.
3. **Resultado:** Si la acción finalizó con éxito o requiere corrección.

---

### La Física del Movimiento en Interfaces Digitales

Los objetos en el mundo real nunca se desplazan con velocidad lineal (*linear easing*). Poseen inercia, masa y fricción. Para dotar a un elemento de naturalidad, utilizamos curvas de flexión física:

```javascript
// Efecto de atracción magnética sutil en botones de llamada a la acción
const magneticBtn = document.querySelector('.btn-magnetic');

magneticBtn.addEventListener('mousemove', (e) => {
    const rect = magneticBtn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.35;

    gsap.to(magneticBtn, {
        x: x,
        y: y,
        duration: 0.3,
        ease: 'power2.out'
    });
});

magneticBtn.addEventListener('mouseleave', () => {
    gsap.to(magneticBtn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1.2, 0.4)'
    });
});
```

---

### Respeto a las Preferencias de Accesibilidad

Toda animación debe honrar estrictamente las preferencias del sistema operativo del visitante:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

El respeto al usuario y la precisión matemática en las curvas de aceleración transforman una interfaz ordinaria en una herramienta intuitiva y memorable.
MARKDOWN,
                ],
                [
                    'title' => 'SEO Técnico Avanzado para Proyectos Creativos: Datos estructurados más allá de lo básico',
                    'slug' => 'seo-tecnico-avanzado-proyectos-creativos-schema-org',
                    'category' => 'Technical SEO',
                    'reading_time' => 8,
                    'cta_heading' => '¿Necesitas una auditoría de SEO técnico y grafos de entidades Schema.org?',
                    'cta_description' => 'Configuro esquemas JSON-LD avanzados, indexación semántica y optimización técnica para maximizar la visibilidad en Google y motores de IA.',
                    'cta_button_text' => 'Auditar SEO y Schema.org',
                    'published_at' => Carbon::parse('2024-12-05 16:30:00'),
                    'featured' => false,
                    'sort_order' => 8,
                    'tags' => ['Technical SEO', 'Schema.org', 'Core Web Vitals'],
                    'excerpt' => 'Construcción de grafos conectados en Schema.org con JSON-LD para vincular autores, organizaciones, estudios de caso y artículos académicos.',
                    'body' => <<<'MARKDOWN'
## Más Allá de los Metadatos Básicos

La mayoría de los sitios web se limitan a incluir etiquetas Open Graph genéricas y un fragmento aislado de `WebSite`. Los algoritmos de indexación semántica modernos de Google demandan **grafos de entidades interconectadas** mediante la especificación oficial **Schema.org**.

Al conectar explícitamente al *autor*, sus *obras creativas*, la *organización* y el *árbol de navegación (Breadcrumbs)*, establecemos una red inequívoca de autoridad temática (**E-E-A-T**).

---

### Construcción del Grafo Conectado (@graph)

En lugar de fragmentos JSON dispersos, emitimos un único bloque centralizado:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://portfolio.test/#author",
      "name": "Mario Galicia",
      "jobTitle": "Lead Software Engineer & UI/UX Architect",
      "sameAs": [
        "https://github.com/...",
        "https://linkedin.com/in/..."
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://portfolio.test/proyectos/centro-medico-abc/#webpage",
      "url": "https://portfolio.test/proyectos/centro-medico-abc",
      "name": "Centro Médico ABC — Portal Institucional de Alta Concurrencia",
      "author": { "@id": "https://portfolio.test/#author" },
      "breadcrumb": { "@id": "https://portfolio.test/proyectos/centro-medico-abc/#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://portfolio.test/proyectos/centro-medico-abc/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://portfolio.test"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Proyectos",
          "item": "https://portfolio.test/proyectos"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Centro Médico ABC"
        }
      ]
    }
  ]
}
```

### Validación Automatizada en el Flujo de Despliegue

La correcta validación de estos datos estructurados mediante pruebas automatizadas previene la degradación en los *Rich Snippets* de las páginas de resultados de búsqueda (SERP).
MARKDOWN,
                ],
                [
                    'title' => 'Accesibilidad Web (WCAG 2.2 AA) como ventaja competitiva en el sector salud y educación',
                    'slug' => 'accesibilidad-web-wcag-ventaja-competitiva-salud-educacion',
                    'category' => 'Accesibilidad Digital',
                    'reading_time' => 7,
                    'cta_heading' => '¿Tu portal cumple con WCAG 2.2 y los estándares legales de accesibilidad?',
                    'cta_description' => 'Audito y adapto aplicaciones web complejas para garantizar cumplimiento normativo internacional, inclusión universal y cero fricciones operativas.',
                    'cta_button_text' => 'Solicitar auditoría WCAG',
                    'published_at' => Carbon::parse('2024-11-15 09:00:00'),
                    'featured' => false,
                    'sort_order' => 9,
                    'tags' => ['Accesibilidad Digital', 'WCAG 2.2 AAA', 'UI/UX & Motion Design'],
                    'excerpt' => 'El impacto ético, legal y comercial de crear plataformas plenamente inclusivas: cómo la accesibilidad universal potencia la usabilidad para todos los usuarios.',
                    'body' => <<<'MARKDOWN'
## La Necesidad Imperiosa del Diseño Inclusivo

En los sectores de la salud, la administración pública y la educación universitaria, una barrera de accesibilidad digital no es un simple inconveniente: es la exclusión directa de un ciudadano a información vital, citas médicas o materiales de estudio.

Con la entrada en vigor de la directriz **WCAG 2.2**, se han introducido criterios de éxito destinados a proteger a usuarios con diversidad funcional motriz y cognitiva.

---

### Claves Técnicas de WCAG 2.2 AA

1. **Target Size (Minimum) (Criterio 2.5.8):** Todo elemento interactivo (botones, enlaces táctiles) debe contar con una zona táctil mínima de **24x24 píxeles CSS**, o disponer de espaciado circundante suficiente para prevenir pulsaciones erróneas.
2. **Focus Appearance (Criterio 2.4.11):** El indicador de foco de teclado debe ser nítido, contrastado (ratio 3:1 respecto al fondo adyacente) y de grosor mínimo de 2 píxeles. Nunca debe suprimirse con `outline: none` sin proveer un reemplazo superior.
3. **Redundant Entry (Criterio 3.3.7):** En formularios de pasos múltiples (como agendamiento hospitalario), la información previamente introducida debe auto-completarse o estar disponible para selección, evitando exigir reescritura.

```css
/* Indicador de foco accesible y estéticamente refinado */
:focus-visible {
  outline: 2px solid var(--accent, #0066cc);
  outline-offset: 3px;
  border-radius: 4px;
}
```

### El Retorno de la Inversión en Accesibilidad

Las plataformas accesibles presentan un código HTML más limpio, tiempos de carga inferiores, mejor indexación en motores de búsqueda y una **reducción comprobada de hasta un 30% en llamadas a mesas de ayuda telefónica**.
MARKDOWN,
                ],
                [
                    'title' => 'Auditoría y endurecimiento de seguridad en Custom Themes empresariales',
                    'slug' => 'auditoria-endurecimiento-seguridad-custom-themes-empresariales',
                    'category' => 'WordPress Security',
                    'reading_time' => 9,
                    'cta_heading' => '¿Requieres una auditoría de seguridad y endurecimiento en temas a medida?',
                    'cta_description' => 'Implemento defensas OWASP, sanitización profunda y políticas CSP estrictas para blindar portales corporativos ante cualquier intrusión.',
                    'cta_button_text' => 'Auditar seguridad de mi plataforma',
                    'published_at' => Carbon::parse('2024-10-30 18:10:00'),
                    'featured' => false,
                    'sort_order' => 10,
                    'tags' => ['WordPress Security', 'PHP 8.4', 'Backend Architecture', 'Security Hardening'],
                    'excerpt' => 'Medidas proactivas para prevenir vulnerabilidades OWASP Top 10 en temas a medida: sanitización con HTMLPurifier, nonces criptográficos y CSP estricto.',
                    'body' => <<<'MARKDOWN'
## El Coste de Ignorar la Seguridad en el Código del Tema

A menudo las empresas asumen erróneamente que la seguridad en WordPress depende únicamente de instalar un plugin de firewall. Sin embargo, la inmensa mayoría de intrusiones corporativas tienen su origen en **código defectuoso dentro de temas personalizados**: falta de escapado de variables, omisión de nonces en llamadas AJAX y endpoints REST expuestos sin autorización.

---

### 1. El Trinomio: Sanitizar, Validar y Escapar

- **Sanitizar a la entrada:** Limpiar datos antes de procesarlos o persistirlos en la base de datos.
- **Validar la estructura:** Asegurar que un entero sea efectivamente un entero mediante tipado estricto en PHP 8.4.
- **Escapar a la salida:** Neutralizar cualquier salida HTML según el contexto de renderizado (`esc_html`, `esc_attr`, `esc_url`, `esc_js`).

```php
// Ejemplo de endpoint seguro con validación estricta
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/lead', [
        'methods' => 'POST',
        'callback' => 'handle_secure_lead',
        'permission_callback' => function () {
            return check_ajax_referer('lead_nonce', '_wpnonce', false);
        },
        'args' => [
            'email' => [
                'required' => true,
                'validate_callback' => fn ($param) => filter_var($param, FILTER_VALIDATE_EMAIL),
                'sanitize_callback' => 'sanitize_email',
            ],
        ],
    ]);
});
```

---

### 2. Eliminación de Vectores de Fuga de Información

Por defecto, WordPress expone endpoints de enumeración de usuarios en `/wp-json/wp/v2/users`. En entornos de producción corporativos, estos datos deben restringirse:

```php
add_filter('rest_endpoints', function ($endpoints) {
    if (! is_user_logged_in() && isset($endpoints['/wp-json/wp/v2/users'])) {
        unset($endpoints['/wp-json/wp/v2/users']);
    }
    return $endpoints;
});
```

La seguridad robusta no es un parche posterior, sino una disciplina integral aplicada desde la primera línea de código.
MARKDOWN,
                ],
            ];

            // Limpiar cualquier imagen en colección 'hero' de contenidos tipo Blog (estricto: 1 sola foto destacada)
            DB::table('content_media')
                ->join('contents', 'contents.id', '=', 'content_media.content_id')
                ->where('contents.content_type_id', $blogCpt->id)
                ->where('content_media.collection', 'hero')
                ->delete();

            // Obtener imágenes de biblioteca disponibles en disco para asignar 1 foto destacada por post
            $availableMediaIds = Media::query()
                ->where('mime_type', 'like', 'image/%')
                ->orderBy('id')
                ->pluck('id')
                ->all();

            foreach ($articulos as $index => $art) {
                $categoryObj = $categoryMap[$art['category']] ?? null;
                $artTagIds = collect($art['tags'])
                    ->map(fn ($name) => $tagMap[$name]->id ?? null)
                    ->filter()
                    ->all();

                $artSlug = Str::slug($art['slug']);

                $content = Content::updateOrCreate(
                    [
                        'user_id' => $adminId,
                        'content_type_id' => $blogCpt->id,
                        'slug' => $artSlug,
                    ],
                    [
                        'title' => $art['title'],
                        'excerpt' => $art['excerpt'],
                        'body' => $art['body'],
                        'status' => 'published',
                        'published_at' => $art['published_at'],
                        'featured' => $art['featured'],
                        'sort_order' => $art['sort_order'],
                        'meta_title' => Str::limit($art['title'], 60),
                        'meta_description' => Str::limit($art['excerpt'], 155),
                        'meta_keywords' => implode(', ', $art['tags']),
                        'custom_values' => array_filter([
                            'reading_time' => $art['reading_time'],
                            'cta_heading' => $art['cta_heading'] ?? null,
                            'cta_description' => $art['cta_description'] ?? null,
                            'cta_button_text' => $art['cta_button_text'] ?? null,
                            'cta_button_url' => $art['cta_button_url'] ?? null,
                        ], fn ($v) => ! is_null($v)),
                    ]
                );

                if ($categoryObj) {
                    $content->categories()->syncWithoutDetaching([$categoryObj->id]);
                }
                if (! empty($artTagIds)) {
                    $content->tags()->syncWithoutDetaching($artTagIds);
                }

                // Asignar exactamente 1 foto (Imagen Destacada / thumbnail)
                $content->media()->wherePivot('collection', 'hero')->detach();
                if (! empty($availableMediaIds)) {
                    $mediaId = $availableMediaIds[$index % count($availableMediaIds)];
                    $content->media()->syncWithoutDetaching([
                        $mediaId => [
                            'collection' => 'thumbnail',
                            'order' => 0,
                        ],
                    ]);
                }
            }

            // Garantizar que todos los posts del blog tengan exactamente 1 imagen destacada y CTA completo
            $allBlogPosts = Content::where('content_type_id', $blogCpt->id)->get();
            foreach ($allBlogPosts as $bIndex => $bPost) {
                $bPost->media()->wherePivot('collection', 'hero')->detach();
                if (! $bPost->media()->wherePivot('collection', 'thumbnail')->exists() && ! empty($availableMediaIds)) {
                    $mId = $availableMediaIds[$bIndex % count($availableMediaIds)];
                    $bPost->media()->sync([
                        $mId => [
                            'collection' => 'thumbnail',
                            'order' => 0,
                        ],
                    ]);
                }

                $cv = $bPost->custom_values ?? [];
                $dirty = false;
                if (empty($cv['cta_heading'])) {
                    $cv['cta_heading'] = '¿Interesado en llevar la tecnología y diseño de tu producto al siguiente nivel?';
                    $dirty = true;
                }
                if (empty($cv['cta_description'])) {
                    $cv['cta_description'] = 'Diseño y desarrollo soluciones web a medida con arquitectura moderna, rendimiento extremo y atención obsesiva al detalle interactivo.';
                    $dirty = true;
                }
                if (empty($cv['cta_button_text'])) {
                    $cv['cta_button_text'] = 'Hablemos de tu Proyecto';
                    $dirty = true;
                }
                if (empty($cv['cta_button_url'])) {
                    $cv['cta_button_url'] = '/contacto';
                    $dirty = true;
                }
                if ($dirty) {
                    $bPost->custom_values = $cv;
                    $bPost->save();
                }
            }

            // ── 8. Limpieza de Caché de Aplicación ───────────────────────────
            if (class_exists(PortfolioCacheService::class)) {
                PortfolioCacheService::clearAll();
            }
        });
    }
}
