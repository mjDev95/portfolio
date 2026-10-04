@extends('layouts.app')

@section('title', 'Sobre mí — Mario Joaquín Galicia Blanco')
@section('meta_description', 'Perfil profesional, trayectoria y experiencia de Mario Joaquín Galicia Blanco: WordPress Architect & Front-End Engineer con 5+ años creando plataformas de alto tráfico y sistemas UI/UX.')
@section('canonical', url()->current())
@section('og_title', 'Sobre mí — Mario Joaquín Galicia Blanco')
@section('og_description', 'WordPress Architect & Front-End Engineer. Custom Themes en PHP nativo, sistemas de diseño en Figma y optimización Core Web Vitals.')
@section('og_type', 'profile')
@section('namespace', 'about')

@push('head')
{{-- Datos Estructurados Schema.org (ProfilePage & Person) --}}
@php
    $aboutSchema = [
        '@context' => 'https://schema.org',
        '@type' => 'ProfilePage',
        'mainEntity' => [
            '@type' => 'Person',
            'name' => 'Mario Joaquín Galicia Blanco',
            'jobTitle' => 'WordPress Architect & Front-End Engineer',
            'description' => 'Especialista en ingeniería Front-End, arquitectura a la medida para WordPress y sistemas de diseño UI/UX.',
            'url' => route('about'),
            'image' => asset('images/avatar.png'),
            'sameAs' => [
                'https://github.com/mariojoaquingalicia',
                'https://www.linkedin.com/in/mario-joaquin-galicia/',
                'https://www.awwwards.com',
            ],
            'knowsAbout' => [
                'WordPress Architecture',
                'PHP 8.4',
                'Front-End Engineering',
                'UI/UX Design Systems',
                'Core Web Vitals',
                'Fluid CSS Systems',
                'Figma',
                'Laravel Blade',
                'GSAP Animation',
            ],
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => 'Ciudad de México',
                'addressCountry' => 'MX',
            ],
        ],
    ];
@endphp
<script type="application/ld+json">
{!! json_encode($aboutSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
</script>
@endpush

@section('content')
<section class="hero-editorial-section position-relative w-100" style="min-height: 100vh;">
    {{-- Fondo sutil con arcos orbitales y estrellas de 4 puntas en SVG fluido --}}
    <div class="hero-orbit-wrap" aria-hidden="true">
        <svg class="hero-orbit-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="720" cy="450" rx="680" ry="380" stroke="currentColor" stroke-opacity="0.08" stroke-width="1.2" transform="rotate(-8 720 450)" />
            <ellipse cx="760" cy="420" rx="580" ry="320" stroke="currentColor" stroke-opacity="0.06" stroke-width="1" transform="rotate(12 760 420)" />
            <path d="M-100 620 C 350 480, 850 680, 1540 380" stroke="currentColor" stroke-opacity="0.07" stroke-width="1" stroke-dasharray="4 4" />
            <g transform="translate(540, 480)" fill="currentColor" opacity="0.35">
                <path d="M0 -12 C0 -3, 3 0, 12 0 C 3 0, 0 3, 0 12 C 0 3, -3 0, -12 0 C -3 0, 0 -3, 0 -12 Z" />
            </g>
            <g transform="translate(1180, 220)" fill="currentColor" opacity="0.45">
                <path d="M0 -16 C0 -4, 4 0, 16 0 C 4 0, 0 4, 0 16 C 0 4, -4 0, -16 0 C -4 0, 0 -4, 0 -16 Z" />
            </g>
            <g transform="translate(980, 360)" fill="currentColor" opacity="0.25">
                <path d="M0 -8 C0 -2, 2 0, 8 0 C 2 0, 0 2, 0 8 C 0 2, -2 0, -8 0 C -2 0, 0 -2, 0 -8 Z" />
            </g>
        </svg>
    </div>

    <div class="hero-editorial-content">
        {{-- Breadcrumbs Estables (24px constantes sin salto) --}}
        <div class="mb-xl" data-detail-breadcrumbs>
            <x-breadcrumbs :items="[
                ['label' => 'Inicio', 'url' => route('home')],
                ['label' => 'Sobre mí', 'url' => null]
            ]" />
        </div>

        {{-- Etiqueta Monospace Editorial --}}
        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest d-block mb-xs" data-reveal>
            /// Profile &amp; Engineering ///
        </span>

        {{-- Titular Monumental con ritmo editorial fluido a ancho completo --}}
        <h1 class="hero-statement" data-reveal>
            Mario Joaquín Galicia Blanco <span class="hero-statement-faded">&mdash; WordPress Architect &amp; Front-End Engineer combinando rigor tipográfico, arquitectura en PHP nativo y rendimiento Core Web Vitals intransigente.</span>
        </h1>

        {{-- Subtítulo contextual --}}
        <p class="services-lead-text mb-xl" data-reveal style="max-width: 58ch;">
            Ingeniero en Entornos Virtuales y Negocios Digitales con más de 5 años de trayectoria profesional, especializado en el desarrollo de portales institucionales de alto tráfico, sistemas de diseño en Figma y código limpio sin maquetadores visuales ni plugins invasivos.
        </p>

        {{-- Botones de Acción Editorial --}}
        <div class="d-flex flex-wrap gap-3 align-items-center mb-2xl" data-reveal>
            <a href="{{ route('contact') }}" 
               class="btn-pill-action"
               data-magnetic data-magnetic-strength="0.3">
                <span class="btn-pill-arrow-circle">&nearr;</span>
                <span>Hablemos de tu proyecto</span>
            </a>

            <button type="button" 
                    class="btn-pill-action btn-unstyled" 
                    data-copy-email="mjgaliciab@gmail.com" 
                    data-magnetic data-magnetic-strength="0.25">
                <span class="btn-pill-arrow-circle">📋</span>
                <span data-copy-label>Copiar correo</span>
            </button>
        </div>

        {{-- Rejilla Horizontal de 4 Estadísticas Monumentales con hairline dividers (.hero-stats-row) --}}
        <div class="hero-stats-row mb-3xl">
            <div class="row g-4 g-lg-5" data-reveal>
                {{-- Métrica 01: Años de experiencia --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="hero-stat-num">5+</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Años de experiencia</h3>
                        <p class="hero-stat-desc">
                            Desarrollando portales de alto impacto para marcas líderes e instituciones.
                        </p>
                    </div>
                </div>

                {{-- Métrica 02: Sitios lanzados --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="hero-stat-num">21+</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Sitios lanzados</h3>
                        <p class="hero-stat-desc">
                            Custom Themes en PHP nativo con código limpio, auditable y seguro.
                        </p>
                    </div>
                </div>

                {{-- Métrica 03: Satisfacción de clientes --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="hero-stat-num">99%</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Satisfacción garantizada</h3>
                        <p class="hero-stat-desc">
                            Relaciones profesionales fundadas en rigor técnico y atención minuciosa.
                        </p>
                    </div>
                </div>

                {{-- Métrica 04: Core Web Vitals --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="hero-stat-num">&lt; 1.2s</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">LCP Core Web Vitals</h3>
                        <p class="hero-stat-desc">
                            Puntajes verdes constantes en Lighthouse y tiempos de respuesta inmediatos.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {{-- Manifiesto de Ingeniería & Ficha Técnica Hairline Abierta (Sin Cajas) --}}
        <div class="py-2xl border-top-subtle border-bottom-subtle mb-3xl" data-reveal>
            <div class="row g-4 g-lg-5">
                {{-- Columna Izquierda: Manifiesto Editorial --}}
                <div class="col-12 col-lg-7 pe-lg-4">
                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest d-block mb-xs">
                        /// Filosofía de Código ///
                    </span>
                    <h2 class="services-main-title mb-md">
                        Diseño y desarrollo con intención
                    </h2>

                    <div class="services-lead-text d-flex flex-column gap-3 mb-0" style="max-width: 100%;">
                        <p>
                            Mi metodología profesional prescinde deliberadamente de constructores visuales pesados como Elementor o Divi, y del uso indiscriminado de plugins externos que comprometen la estabilidad, la velocidad y la seguridad de las plataformas.
                        </p>
                        <p>
                            Cada portal se concibe desde sus cimientos en <strong>PHP 8.4 nativo</strong> mediante Custom Themes, Custom Post Types desacoplados, taxonomías personalizadas y metaboxes propios. Esta disciplina asegura una base de código liviana, predecible y enteramente auditable.
                        </p>
                        <p>
                            En el frente visual, traduzco maquetas complejas de Figma a la web respetando <strong>tokens fluidos matemáticos</strong> basados en funciones <code>clamp()</code>, eliminando quiebres arbitrarios y sustentando una estética editorial plana (Zero Shadows) con desenfoques de cristal y líneas hairline sutiles.
                        </p>
                    </div>
                </div>

                {{-- Columna Derecha: Ficha Técnica Hairline --}}
                <div class="col-12 col-lg-5 ps-lg-4 border-top-subtle border-lg-top-0 border-lg-left-subtle pt-xl pt-lg-0">
                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest d-block mb-md">
                        /// Ficha Profesional ///
                    </span>

                    <div class="d-flex flex-column gap-3">
                        <div class="methodology-step-row py-2">
                            <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-1">Base &amp; Ubicación</span>
                            <span class="font-heading h4 text-primary d-block mb-0">Ciudad de México, México</span>
                            <span class="font-mono text-fluid-xs text-secondary">Zona horaria GMT-6 / CST</span>
                        </div>

                        <div class="methodology-step-row py-2">
                            <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-1">Formación Académica</span>
                            <span class="font-heading h4 text-primary d-block mb-0">Ing. en Entornos Virtuales y Negocios Digitales</span>
                            <span class="text-fluid-xs text-secondary">Universidad Tecnológica de Huejotzingo (2019 – 2023)</span>
                        </div>

                        <div class="methodology-step-row py-2">
                            <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-1">Modalidad de Trabajo</span>
                            <span class="font-heading h4 text-primary d-block mb-0">Remoto / Híbrido</span>
                            <span class="text-fluid-xs text-secondary">Colaboración activa con clientes en México, EE.UU. y LATAM</span>
                        </div>

                        <div class="methodology-step-row py-2">
                            <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-1">Idiomas</span>
                            <span class="font-heading h4 text-primary d-block mb-0">Español (Nativo) &bull; Inglés (Profesional Técnico)</span>
                        </div>

                        <div class="methodology-step-row py-2">
                            <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-1">Canales Directos</span>
                            <div class="d-flex flex-wrap gap-3 mt-1">
                                <a href="mailto:mjgaliciab@gmail.com" class="font-mono text-fluid-xs text-brand text-decoration-none" data-magnetic>
                                    mjgaliciab@gmail.com &nearr;
                                </a>
                                <a href="https://wa.me/525628425556" target="_blank" rel="noopener noreferrer" class="font-mono text-fluid-xs text-secondary text-decoration-none hover-text-brand" data-magnetic>
                                    WhatsApp &nearr;
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Metodología & Principios de Ingeniería en 4 Pasos (Wabi-Sabi Rows) --}}
        <div class="methodology-section pt-0 w-100 mb-3xl">
            <div class="methodology-content p-0">
                <div class="row align-items-start g-4 g-lg-5">
                    {{-- Encabezado lateral --}}
                    <div class="col-12 col-lg-5" data-reveal>
                        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest d-block mb-xs">
                            /// Methodology ///
                        </span>
                        <h2 class="services-main-title mb-md">
                            Principios de Ingeniería
                        </h2>
                        <p class="services-lead-text mb-lg">
                            Un proceso riguroso que fusiona la dirección de arte con la solidez de la programación, garantizando estabilidad y velocidad sin compromisos.
                        </p>
                        <div class="service-card p-lg d-block">
                            <span class="font-mono text-fluid-xs text-brand fw-bold text-uppercase d-block mb-xs">
                                Garantía Técnica
                            </span>
                            <p class="text-fluid-sm text-secondary fw-light mb-0">
                                Arquitectura modular auditable, cero dependencias frágiles y cumplimiento estricto de estándares de accesibilidad y SEO técnico.
                            </p>
                        </div>
                    </div>

                    {{-- Pasos editoriales en líneas --}}
                    <div class="col-12 col-lg-7 d-flex flex-column" data-reveal>
                        <div class="methodology-step-row">
                            <div class="d-flex align-items-baseline justify-content-between mb-xs">
                                <span class="font-mono text-brand fw-bold text-fluid-xs text-uppercase tracking-wider">01. Arquitectura Nativa</span>
                                <span class="text-fluid-xs font-mono text-muted">PHP 8.4</span>
                            </div>
                            <h3 class="font-heading text-fluid-h3 text-primary mb-xs">
                                Custom Themes &amp; Cero Plugins
                            </h3>
                            <p class="text-fluid-sm text-secondary fw-light mb-0">
                                Modelado de datos personalizado con Custom Post Types y metaboxes propios. Máxima estabilidad, auditabilidad de código y cero vulnerabilidades de terceros.
                            </p>
                        </div>

                        <div class="methodology-step-row">
                            <div class="d-flex align-items-baseline justify-content-between mb-xs">
                                <span class="font-mono text-brand fw-bold text-fluid-xs text-uppercase tracking-wider">02. Diseño de Sistemas</span>
                                <span class="text-fluid-xs font-mono text-muted">Figma UI/UX</span>
                            </div>
                            <h3 class="font-heading text-fluid-h3 text-primary mb-xs">
                                Tokens Matemáticos &amp; Zero Shadows
                            </h3>
                            <p class="text-fluid-sm text-secondary fw-light mb-0">
                                Estructuración de Design Tokens de espaciado, escalas tipográficas y componentes modulares que responden orgánicamente a cualquier resolución sin saltos de layout.
                            </p>
                        </div>

                        <div class="methodology-step-row">
                            <div class="d-flex align-items-baseline justify-content-between mb-xs">
                                <span class="font-mono text-brand fw-bold text-fluid-xs text-uppercase tracking-wider">03. Performance Web</span>
                                <span class="text-fluid-xs font-mono text-muted">Core Web Vitals</span>
                            </div>
                            <h3 class="font-heading text-fluid-h3 text-primary mb-xs">
                                LCP &lt; 1.2s &amp; Cero Recursos Bloqueantes
                            </h3>
                            <p class="text-fluid-sm text-secondary fw-light mb-0">
                                Optimización rigurosa de tiempos de carga inicial, compresión WebP sin pérdida y depuración minuciosa de scripts para alcanzar puntajes verdes constantes en Lighthouse.
                            </p>
                        </div>

                        <div class="methodology-step-row">
                            <div class="d-flex align-items-baseline justify-content-between mb-xs">
                                <span class="font-mono text-brand fw-bold text-fluid-xs text-uppercase tracking-wider">04. Cinemática SPA Híbrida</span>
                                <span class="text-fluid-xs font-mono text-muted">GSAP + Barba</span>
                            </div>
                            <h3 class="font-heading text-fluid-h3 text-primary mb-xs">
                                Transiciones Fluidas &amp; Lenis Scroll
                            </h3>
                            <p class="text-fluid-sm text-secondary fw-light mb-0">
                                Orquestación del ciclo de vida en Barba.js v2, Shared Element Transitions con GSAP Flip y render loop unificado a 60fps sincronizado con Lenis Smooth Scroll.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Experiencia Laboral Estructurada en Stack de Service Cards (.service-card) --}}
        <div class="services-editorial-section pt-0 w-100 mb-3xl">
            <div class="services-header-row mb-xl" data-reveal>
                <div class="services-header-left">
                    <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-xs tracking-widest">
                        /// Experience ///
                    </span>
                    <h2 class="services-main-title">
                        Trayectoria Profesional
                    </h2>
                </div>
                <div class="services-header-right">
                    <p class="services-lead-text">
                        Colaboración directa en proyectos de alto tráfico para el sector salud, educativo, corporativo y energético en México y Norteamérica.
                    </p>
                </div>
            </div>

            <div class="services-cards-stack d-flex flex-column" data-reveal>
                {{-- Denumeris Interactive --}}
                <article class="service-card" data-magnetic data-magnetic-strength="0.08">
                    <div class="service-card-index font-mono">001</div>
                    <div class="service-card-title">
                        <h3>Denumeris Interactive</h3>
                        <span class="font-mono text-fluid-xs text-muted d-block mt-1">Sept 2021 – Actualidad &bull; CDMX</span>
                    </div>
                    <div class="service-card-tags">
                        <ul class="list-unstyled mb-0">
                            <li><span class="tag-plus">+</span> Custom Themes</li>
                            <li><span class="tag-plus">+</span> PHP 8.4 Nativo</li>
                            <li><span class="tag-plus">+</span> CPTs &amp; Taxonomías</li>
                            <li><span class="tag-plus">+</span> Core Web Vitals</li>
                        </ul>
                    </div>
                    <div class="service-card-desc">
                        <p class="mb-0">
                            Desarrollador Web Senior a cargo de temas a la medida para portales de alto impacto como Centro Médico ABC, FLACSO México, Saavi Energía, Corazón Raíz y Grupo Médico San José.
                        </p>
                    </div>
                </article>

                {{-- Práctica Independiente --}}
                <article class="service-card" data-magnetic data-magnetic-strength="0.08">
                    <div class="service-card-index font-mono">002</div>
                    <div class="service-card-title">
                        <h3>Práctica Independiente</h3>
                        <span class="font-mono text-fluid-xs text-muted d-block mt-1">2019 – Actualidad &bull; Remoto</span>
                    </div>
                    <div class="service-card-tags">
                        <ul class="list-unstyled mb-0">
                            <li><span class="tag-plus">+</span> Design Systems</li>
                            <li><span class="tag-plus">+</span> GSAP &amp; Barba.js</li>
                            <li><span class="tag-plus">+</span> Figma UI/UX</li>
                            <li><span class="tag-plus">+</span> Auditorías Técnicas</li>
                        </ul>
                    </div>
                    <div class="service-card-desc">
                        <p class="mb-0">
                            Consultoría de ingeniería Front-End, diseño de sistemas en Figma y construcción de arquitecturas headless y temas nativos para agencias de diseño y startups.
                        </p>
                    </div>
                </article>
            </div>
        </div>

        {{-- Call To Action Editorial de Cierre (.cta-contact-section style) --}}
        <div class="cta-contact-section position-relative w-100 text-center py-2xl border-top-subtle" data-reveal>
            <div class="cta-contact-content mx-auto" style="max-width: 64ch;">
                <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest d-block mb-sm">
                    /// Get in Touch ///
                </span>

                <h2 class="hero-statement mx-auto text-center mb-md">
                    ¿Tienes un proyecto en mente? <span class="hero-statement-faded">Hagámoslo realidad.</span>
                </h2>

                <p class="services-lead-text mx-auto text-center mb-xl">
                    Analicemos la mejor solución de arquitectura para tu portal web, diseño de sistemas en Figma o ingeniería Front-End con rendimiento Core Web Vitals garantizado.
                </p>

                <div class="d-flex justify-content-center">
                    <a href="{{ route('contact') }}" 
                       class="btn-pill-action btn-pill-action-lg"
                       data-magnetic data-magnetic-strength="0.35">
                        <span class="btn-pill-arrow-circle">&nearr;</span>
                        <span>Iniciar una conversación</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>
@endsection
