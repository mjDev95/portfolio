@extends('layouts.app')

@section('title', 'Contacto — Mario Joaquín Galicia Blanco')
@section('meta_description', 'Contacto directo con Mario Joaquín Galicia Blanco: WordPress Architect & Front-End Engineer. Escríbeme por correo electrónico o WhatsApp sin intermediarios ni formularios.')
@section('canonical', url()->current())
@section('og_title', 'Contacto — Mario Joaquín Galicia Blanco')
@section('og_description', 'Contacto directo con Mario Joaquín Galicia Blanco. Comunicación transparente y libre de spam.')
@section('og_type', 'website')
@section('namespace', 'contact')

@push('head')
{{-- Datos Estructurados Schema.org (ContactPage) --}}
@php
    $contactSchema = [
        '@context' => 'https://schema.org',
        '@type' => 'ContactPage',
        'name' => 'Contacto — Mario Joaquín Galicia Blanco',
        'description' => 'Canales de contacto directo con Mario Joaquín Galicia Blanco: correo electrónico, WhatsApp y perfiles profesionales.',
        'url' => route('contact'),
        'mainEntity' => [
            '@type' => 'Person',
            'name' => 'Mario Joaquín Galicia Blanco',
            'email' => 'mjgaliciab@gmail.com',
            'telephone' => '+525628425556',
            'jobTitle' => 'WordPress Architect & Front-End Engineer',
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => 'Ciudad de México',
                'addressCountry' => 'MX',
            ],
            'sameAs' => [
                'https://github.com/mariojoaquingalicia',
                'https://www.linkedin.com/in/mario-joaquin-galicia/',
                'https://www.awwwards.com',
            ],
        ],
    ];
@endphp
<script type="application/ld+json">
{!! json_encode($contactSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
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
                ['label' => 'Contacto', 'url' => null]
            ]" />
        </div>

        {{-- Etiqueta Monospace Editorial --}}
        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest d-block mb-xs" data-reveal>
            /// Get in Touch ///
        </span>

        {{-- Titular Monumental Editorial con ritmo fluido --}}
        <h1 class="hero-statement" data-reveal>
            Iniciemos una conversación. <span class="hero-statement-faded">Comunicación directa, transparente y sin intermediarios.</span>
        </h1>

        {{-- Subtítulo contextual --}}
        <p class="services-lead-text mb-xl" data-reveal style="max-width: 58ch;">
            Para garantizar la confidencialidad, evitar vectores de ataque y erradicar por completo el spam automatizado, este portal prescinde de formularios web. Escríbeme directamente por correo electrónico o iniciemos una conversación por WhatsApp.
        </p>

        {{-- Status Beacon de Disponibilidad en Tiempo Real --}}
        <div class="mb-2xl" data-reveal>
            <div class="d-inline-flex align-items-center gap-2 px-3 py-2 border-subtle bg-surface-subtle rounded-pill text-fluid-xs font-mono">
                <span class="pulse-beacon bg-success flex-shrink-0">
                    <span class="pulse-beacon-ping bg-success"></span>
                </span>
                <span class="text-primary fw-medium">Disponible para nuevos proyectos</span>
                <span class="text-muted">&bull;</span>
                <span class="text-secondary">Respuesta habitual en &lt; 24h</span>
            </div>
        </div>

        {{-- Centro Editorial Monumental: Dirección de Correo Principal --}}
        <div class="py-2xl border-top-subtle border-bottom-subtle mb-3xl" data-reveal>
            <div class="d-flex flex-wrap justify-content-between align-items-baseline mb-md">
                <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest">
                    Dirección Principal //
                </span>
                <span class="font-mono text-fluid-xs text-muted">
                    CDMX (GMT-6) &bull; Canales Cifrados
                </span>
            </div>

            <a href="mailto:mjgaliciab@gmail.com" 
               class="hero-statement text-break d-inline-block text-decoration-none hover-text-brand" 
               style="font-size: clamp(2.2rem, 5.8vw, 5.5rem); line-height: 1.1; margin-bottom: var(--fluid-s-xl);"
               data-magnetic data-magnetic-strength="0.12">
                mjgaliciab@gmail.com
            </a>

            {{-- Acciones Interactivas en Botones Píldora --}}
            <div class="d-flex flex-wrap align-items-center gap-3">
                <button type="button" 
                        class="btn-pill-action btn-unstyled" 
                        data-copy-email="mjgaliciab@gmail.com" 
                        data-magnetic data-magnetic-strength="0.25">
                    <span class="btn-pill-arrow-circle">📋</span>
                    <span data-copy-label>Copiar dirección</span>
                </button>

                <a href="mailto:mjgaliciab@gmail.com" 
                   class="btn-pill-action" 
                   data-magnetic data-magnetic-strength="0.3">
                    <span class="btn-pill-arrow-circle">&nearr;</span>
                    <span>Abrir en tu cliente de correo</span>
                </a>

                <a href="https://wa.me/525628425556?text=Hola%20Mario,%20me%20gustar%C3%ADa%20conversar%20sobre%20un%20proyecto" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn-pill-action" 
                   data-magnetic data-magnetic-strength="0.3">
                    <span class="btn-pill-arrow-circle">&nearr;</span>
                    <span>WhatsApp directo</span>
                </a>
            </div>
        </div>

        {{-- Rejilla de 4 Canales de Información con Hairlines (.hero-stats-row style) --}}
        <div class="hero-stats-row mb-3xl">
            <div class="row g-4 g-lg-5" data-reveal>
                {{-- 01: Canal Inmediato --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider mb-xs">01. Canal Inmediato</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Email</h3>
                        <p class="hero-stat-desc">
                            <a href="mailto:mjgaliciab@gmail.com" class="text-primary hover-text-brand font-mono text-fluid-xs text-decoration-none" data-magnetic>
                                mjgaliciab@gmail.com &nearr;
                            </a>
                        </p>
                    </div>
                </div>

                {{-- 02: Mensajería Directa --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider mb-xs">02. Mensajería Directa</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">WhatsApp</h3>
                        <p class="hero-stat-desc">
                            <a href="https://wa.me/525628425556" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-brand font-mono text-fluid-xs text-decoration-none" data-magnetic>
                                +52 56 2842 5556 &nearr;
                            </a>
                        </p>
                    </div>
                </div>

                {{-- 03: Ubicación & Base --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider mb-xs">03. Ubicación &amp; Base</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Ciudad de México</h3>
                        <p class="hero-stat-desc">
                            Zona Horaria GMT-6 (CST). Colaboración remota con México, EE.UU. y Europa.
                        </p>
                    </div>
                </div>

                {{-- 04: Redes Profesionales --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider mb-xs">04. Plataformas</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Perfiles Activos</h3>
                        <p class="hero-stat-desc d-flex gap-2">
                            <a href="https://github.com/mariojoaquingalicia" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-brand font-mono text-fluid-xs" data-magnetic>GitHub</a>
                            <span>&bull;</span>
                            <a href="https://www.linkedin.com/in/mario-joaquin-galicia/" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-brand font-mono text-fluid-xs" data-magnetic>LinkedIn</a>
                            <span>&bull;</span>
                            <a href="https://www.awwwards.com" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-brand font-mono text-fluid-xs" data-magnetic>Awwwards</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {{-- Sección: Áreas de Colaboración (Stack de Service Cards) --}}
        <div class="services-editorial-section pt-0 w-100 mb-2xl">
            <div class="services-header-row mb-xl" data-reveal>
                <div class="services-header-left">
                    <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-xs tracking-widest">
                        /// Scope of Work ///
                    </span>
                    <h2 class="services-main-title">
                        ¿En qué puedo colaborar contigo?
                    </h2>
                </div>
                <div class="services-header-right">
                    <p class="services-lead-text">
                        Ingeniería a la medida y sistemas de diseño para empresas, agencias y estudios que exigen una experiencia web sin concesiones.
                    </p>
                </div>
            </div>

            <div class="services-cards-stack d-flex flex-column" data-reveal>
                {{-- 001 WordPress Architecture --}}
                <article class="service-card" data-magnetic data-magnetic-strength="0.08">
                    <div class="service-card-index font-mono">001</div>
                    <div class="service-card-title">
                        <h3>WordPress Architecture</h3>
                    </div>
                    <div class="service-card-tags">
                        <ul class="list-unstyled mb-0">
                            <li><span class="tag-plus">+</span> Custom Themes</li>
                            <li><span class="tag-plus">+</span> PHP 8.4 Nativo</li>
                            <li><span class="tag-plus">+</span> CPTs &amp; Taxonomías</li>
                        </ul>
                    </div>
                    <div class="service-card-desc">
                        <p class="mb-0">
                            Desarrollo integral desde cero sin constructores visuales ni plugins invasivos. Seguridad y auditabilidad absoluta.
                        </p>
                    </div>
                </article>

                {{-- 002 Front-End Engineering --}}
                <article class="service-card" data-magnetic data-magnetic-strength="0.08">
                    <div class="service-card-index font-mono">002</div>
                    <div class="service-card-title">
                        <h3>Front-End Engineering</h3>
                    </div>
                    <div class="service-card-tags">
                        <ul class="list-unstyled mb-0">
                            <li><span class="tag-plus">+</span> GSAP 3 &amp; ScrollTrigger</li>
                            <li><span class="tag-plus">+</span> Barba.js v2 SPA</li>
                            <li><span class="tag-plus">+</span> Fluid Design Tokens</li>
                        </ul>
                    </div>
                    <div class="service-card-desc">
                        <p class="mb-0">
                            Microinteracciones orgánicas, Shared Element Transitions y render loops fluidos a 60fps sincronizados con Lenis.
                        </p>
                    </div>
                </article>

                {{-- 003 Design Systems en Figma --}}
                <article class="service-card" data-magnetic data-magnetic-strength="0.08">
                    <div class="service-card-index font-mono">003</div>
                    <div class="service-card-title">
                        <h3>Design Systems</h3>
                    </div>
                    <div class="service-card-tags">
                        <ul class="list-unstyled mb-0">
                            <li><span class="tag-plus">+</span> Figma Auto-Layout</li>
                            <li><span class="tag-plus">+</span> Escalas Tipográficas</li>
                            <li><span class="tag-plus">+</span> Zero Shadows Aesthetic</li>
                        </ul>
                    </div>
                    <div class="service-card-desc">
                        <p class="mb-0">
                            Traducción milimétrica de prototipos en Figma a código limpio, modular y completamente reutilizable.
                        </p>
                    </div>
                </article>

                {{-- 004 Core Web Vitals --}}
                <article class="service-card" data-magnetic data-magnetic-strength="0.08">
                    <div class="service-card-index font-mono">004</div>
                    <div class="service-card-title">
                        <h3>Core Web Vitals</h3>
                    </div>
                    <div class="service-card-tags">
                        <ul class="list-unstyled mb-0">
                            <li><span class="tag-plus">+</span> LCP &lt; 1.2s</li>
                            <li><span class="tag-plus">+</span> WebP Lossless Pipeline</li>
                            <li><span class="tag-plus">+</span> Zero Layout Shift (CLS)</li>
                        </ul>
                    </div>
                    <div class="service-card-desc">
                        <p class="mb-0">
                            Auditorías Lighthouse rigurosas y optimización técnica extrema para portales institucionales de alto tráfico.
                        </p>
                    </div>
                </article>
            </div>
        </div>
    </div>
</section>
@endsection
