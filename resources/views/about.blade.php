@extends('layouts.app')

@section('title', 'Sobre mí — Mario Joaquín Galicia Blanco')
@section('meta_description', 'Perfil profesional, trayectoria y experiencia de Mario Joaquín Galicia Blanco: WordPress Architect & Front-End Engineer con 5 años creando plataformas de alto tráfico y sistemas UI/UX.')
@section('namespace', 'about')

@section('content')
<div class="position-relative overflow-hidden pt-2xl pb-2xl">
    <div class="container">
        
        {{-- Breadcrumbs --}}
        <div class="mb-lg text-fluid-xs font-mono text-muted">
            <a href="{{ route('home') }}" class="text-muted hover-text-accent no-underline">Inicio</a>
            <span class="mx-2">/</span>
            <span class="text-primary">Sobre mí</span>
        </div>

        {{-- Hero Editorial Sobre Mí (Sin cajas) --}}
        <div class="row align-items-start pb-xl border-bottom-subtle" data-reveal>
            <div class="col-12 col-lg-8 mb-xl mb-lg-0">
                <span class="text-fluid-xs font-mono text-uppercase tracking-widest text-accent fw-semibold d-block mb-xs">
                    // Trayectoria &amp; Perfil
                </span>
                <h1 class="font-fluid-hero text-primary mb-md">
                    Mario Joaquín Galicia Blanco
                </h1>
                <p class="font-fluid-lead text-secondary fw-light mb-lg">
                    <span class="text-primary fw-medium">WordPress Architect &amp; Front-End Engineer</span> | UI/UX &amp; Design Systems
                </p>
                <div class="font-fluid-body text-secondary fw-light space-y-4">
                    <p>
                        Ingeniero en Entornos Virtuales y Negocios Digitales con 5 años de experiencia, especializado en ingeniería Front-End, arquitectura a la medida para WordPress y diseño de interfaces (UI/UX).
                    </p>
                    <p>
                        Amplia trayectoria programando Custom Themes desde cero en PHP nativo, implementando Custom Post Types, taxonomías y campos personalizados (metaboxes) sin depender de plugins de terceros. Capacidad comprobada para conceptualizar prototipos de alta fidelidad en Figma y trasladarlos a código con precisión milimétrica mediante sistemas CSS limpios, Design Tokens y diseño responsivo fluido con enfoque riguroso en Core Web Vitals.
                    </p>
                </div>

                <div class="d-flex flex-wrap align-items-center gap-4 mt-lg pt-sm">
                    <a href="{{ route('contact') }}" class="btn-pill-cta" data-magnetic>
                        <span>Hablemos</span>
                        <span style="font-size: 0.85rem; font-weight: 700; line-height: 1;">&nearr;</span>
                    </a>
                    <a href="mailto:mjgaliciab@gmail.com" class="text-fluid-xs font-mono text-secondary hover-text-accent no-underline" data-magnetic>
                        mjgaliciab@gmail.com &rarr;
                    </a>
                </div>
            </div>

            {{-- Ficha de Datos Clave (Abierta, con líneas) --}}
            <div class="col-12 col-lg-4 border-top-subtle border-lg-top-0 border-lg-left-subtle pl-lg-xl pt-lg pt-lg-0">
                <span class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted fw-semibold d-block mb-lg">
                    Ficha Profesional //
                </span>
                
                <div class="space-y-4 text-fluid-xs">
                    <div>
                        <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-xs">Ubicación</span>
                        <span class="fw-medium text-primary">Ciudad de México (CDMX), México</span>
                    </div>

                    <div>
                        <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-xs">Formación Universitaria</span>
                        <span class="fw-medium text-primary d-block">Ingeniería en Entornos Virtuales y Negocios Digitales</span>
                        <span class="text-muted text-fluid-xs fw-light">Universidad Tecnológica de Huejotzingo (2019 – 2023)</span>
                    </div>

                    <div>
                        <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-xs">Idiomas</span>
                        <span class="fw-medium text-primary">Español (Nativo) &bull; Inglés (Técnico / Profesional)</span>
                    </div>

                    <div>
                        <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-xs">Contacto Directo</span>
                        <a href="tel:+525628425556" class="font-mono text-accent no-underline hover-text-accent">+52 56 2842 5556</a>
                    </div>
                </div>
            </div>
        </div>

        {{-- Experiencia Laboral Estructurada en Líneas (Sin cajas) --}}
        <div class="py-2xl border-bottom-subtle" data-reveal>
            <div class="mb-xl">
                <span class="text-fluid-xs font-mono text-uppercase tracking-widest text-accent fw-semibold d-block mb-xs">
                    // Recorrido Profesional
                </span>
                <h2 class="font-fluid-section text-primary">
                    Experiencia Laboral
                </h2>
            </div>

            <div class="d-flex flex-column border-top-subtle">
                {{-- Denumeris --}}
                <div class="py-xl border-bottom-subtle">
                    <div class="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-sm">
                        <div>
                            <h3 class="font-fluid-step text-primary mb-xs">
                                Desarrollador Web (WordPress &amp; Front-End)
                            </h3>
                            <span class="text-accent fw-semibold text-fluid-sm">
                                Denumeris Interactive
                            </span>
                        </div>
                        <span class="font-mono text-fluid-xs text-muted">
                            Septiembre 2021 – Actualidad &bull; CDMX
                        </span>
                    </div>

                    <ul class="list-unstyled space-y-3 font-fluid-body text-secondary fw-light mb-lg">
                        <li class="d-flex align-items-start gap-2">
                            <span class="text-accent font-mono mt-xs">&mdash;</span>
                            <span><strong class="text-primary fw-medium">Desarrollo</strong> de temas a la medida (Custom Themes) en PHP nativo para portales institucionales de alta demanda (Centro Médico ABC, FLACSO México, Saavi Energía, Corazón Raíz y Grupo Médico San José).</span>
                        </li>
                        <li class="d-flex align-items-start gap-2">
                            <span class="text-accent font-mono mt-xs">&mdash;</span>
                            <span><strong class="text-primary fw-medium">Construcción</strong> de estructuras de contenido personalizadas con CPTs, taxonomías y metaboxes nativos en PHP, prescindiendo de plugins pesados de terceros para mantener un código limpio, seguro y auditable.</span>
                        </li>
                        <li class="d-flex align-items-start gap-2">
                            <span class="text-accent font-mono mt-xs">&mdash;</span>
                            <span><strong class="text-primary fw-medium">Optimización</strong> de tiempos de carga inicial y métricas de LCP mediante técnicas de carga diferida (lazy-loading) y depuración minuciosa de recursos bloqueantes en JavaScript y CSS.</span>
                        </li>
                        <li class="d-flex align-items-start gap-2">
                            <span class="text-accent font-mono mt-xs">&mdash;</span>
                            <span><strong class="text-primary fw-medium">Gestión</strong> del control de versiones, integración colaborativa y mantenimiento continuo de plataformas mediante flujos estructurados en Git y GitHub.</span>
                        </li>
                    </ul>

                    <div class="pt-sm d-flex flex-wrap gap-2 text-fluid-xs font-mono text-muted">
                        <span class="text-primary fw-semibold me-2">Tech:</span>
                        <span class="data-chip">WordPress</span>
                        <span class="data-chip">PHP 8.4</span>
                        <span class="data-chip">Vanilla JS</span>
                        <span class="data-chip">MySQL</span>
                        <span class="data-chip">HTML5 / CSS3</span>
                        <span class="data-chip">Bootstrap 5.3</span>
                        <span class="data-chip">Fluid Tokens</span>
                        <span class="data-chip">Git</span>
                    </div>
                </div>

                {{-- Freelance / Proyectos Seleccionados --}}
                <div class="py-xl border-bottom-subtle">
                    <div class="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-sm">
                        <div>
                            <h3 class="font-fluid-step text-primary mb-xs">
                                Ingeniero Front-End &amp; Diseñador UI/UX Independiente
                            </h3>
                            <span class="text-accent fw-semibold text-fluid-sm">
                                Proyectos Seleccionados
                            </span>
                        </div>
                        <span class="font-mono text-fluid-xs text-muted">
                            2023 – Actualidad
                        </span>
                    </div>

                    <ul class="list-unstyled space-y-3 font-fluid-body text-secondary fw-light mb-lg">
                        <li class="d-flex align-items-start gap-2">
                            <span class="text-accent font-mono mt-xs">&mdash;</span>
                            <span><strong class="text-primary fw-medium">Next in Line Management:</strong> Conceptualización del sistema visual y UI en Figma, trasladado a un Custom Theme integral con sistema CSS propio y tipografía/espaciado fluido con breakpoints adaptables, logrando una estética visual editorial minimalista de alta retención.</span>
                        </li>
                        <li class="d-flex align-items-start gap-2">
                            <span class="text-accent font-mono mt-xs">&mdash;</span>
                            <span><strong class="text-primary fw-medium">Accésate:</strong> Diseño y maquetación de la experiencia de usuario (UX/UI) para plataforma web, estructurando el sistema de componentes modulares en Laravel Blade y asegurando flujos intuitivos junto con una navegación responsiva multiplataforma.</span>
                        </li>
                    </ul>

                    <div class="pt-sm d-flex flex-wrap gap-2 text-fluid-xs font-mono text-muted">
                        <span class="text-primary fw-semibold me-2">Herramientas:</span>
                        <span class="data-chip">Figma UI/UX</span>
                        <span class="data-chip">Design Tokens</span>
                        <span class="data-chip">Fluid CSS</span>
                        <span class="data-chip">WordPress</span>
                        <span class="data-chip">Laravel Blade</span>
                        <span class="data-chip">PHP</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- Portales en Producción --}}
        <div class="py-2xl" data-reveal>
            <div class="mb-xl">
                <span class="text-fluid-xs font-mono text-uppercase tracking-widest text-accent fw-semibold d-block mb-xs">
                    // Portafolio Activo
                </span>
                <h2 class="font-fluid-section text-primary">
                    Portales en Línea
                </h2>
            </div>

            <div class="row pt-lg border-top-subtle">
                <div class="col-12 col-md-6 mb-lg">
                    <span class="text-fluid-xs font-mono text-accent text-uppercase tracking-wider d-block mb-sm">Salud &amp; Hospitalario</span>
                    <ul class="list-unstyled space-y-3 font-fluid-body">
                        <li>
                            <a href="https://centromedicoabc.com/" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-accent d-flex align-items-center justify-content-between no-underline pb-xs border-bottom-subtle" data-magnetic>
                                <span>Centro Médico ABC</span>
                                <span>&nearr;</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://grupomedicosanjose.com/" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-accent d-flex align-items-center justify-content-between no-underline pb-xs border-bottom-subtle" data-magnetic>
                                <span>Grupo Médico San José</span>
                                <span>&nearr;</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="col-12 col-md-6 mb-lg">
                    <span class="text-fluid-xs font-mono text-accent text-uppercase tracking-wider d-block mb-sm">Corporativo &amp; Energía</span>
                    <ul class="list-unstyled space-y-3 font-fluid-body">
                        <li>
                            <a href="https://www.saavienergia.com/" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-accent d-flex align-items-center justify-content-between no-underline pb-xs border-bottom-subtle" data-magnetic>
                                <span>Saavi Energía</span>
                                <span>&nearr;</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://corazonraiz.org/" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-accent d-flex align-items-center justify-content-between no-underline pb-xs border-bottom-subtle" data-magnetic>
                                <span>Corazón Raíz</span>
                                <span>&nearr;</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="col-12 col-md-6 mb-lg">
                    <span class="text-fluid-xs font-mono text-accent text-uppercase tracking-wider d-block mb-sm">Académico &amp; Social</span>
                    <ul class="list-unstyled space-y-3 font-fluid-body">
                        <li>
                            <a href="https://www.flacso.edu.mx/" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-accent d-flex align-items-center justify-content-between no-underline pb-xs border-bottom-subtle" data-magnetic>
                                <span>FLACSO México</span>
                                <span>&nearr;</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="col-12 col-md-6 mb-lg">
                    <span class="text-fluid-xs font-mono text-accent text-uppercase tracking-wider d-block mb-sm">UI/UX &amp; Plataformas</span>
                    <ul class="list-unstyled space-y-3 font-fluid-body">
                        <li>
                            <a href="https://nextinlinemanagement.com/" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-accent d-flex align-items-center justify-content-between no-underline pb-xs border-bottom-subtle" data-magnetic>
                                <span>Next in Line Management</span>
                                <span>&nearr;</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://accesate.com/es" target="_blank" rel="noopener noreferrer" class="text-primary hover-text-accent d-flex align-items-center justify-content-between no-underline pb-xs border-bottom-subtle" data-magnetic>
                                <span>Accésate</span>
                                <span>&nearr;</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection
