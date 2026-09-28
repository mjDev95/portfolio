{{-- 
  Sección: Casos Seleccionados (Stodio Sequence — Pinned Header & Asymmetric Floating Cards)
  Adaptada con el sistema editorial fluido, cero border-radius, interacción magnética y GSAP Flip.
--}}
@php
    $cptProyectos = \App\Models\ContentType::where('slug', 'proyectos')->first();
    $cptSlug = $cptProyectos?->public_route_slug ?? 'proyectos';

    $dbProjects = $featuredContents->filter(function($c) {
        return ($c->contentType?->slug ?? '') === 'proyectos';
    })->values();

    if ($dbProjects->count() < 4) {
        $dbProjects = \App\Models\Content::query()
            ->whereHas('contentType', fn($q) => $q->where('slug', 'proyectos')->where('is_public', true))
            ->published()
            ->with(['contentType', 'categories', 'media'])
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->take(5)
            ->get();
    }

    $totalProjectsCount = \App\Models\Content::query()
        ->whereHas('contentType', fn($q) => $q->where('slug', 'proyectos')->where('is_public', true))
        ->published()
        ->count();
@endphp

<section class="stodio-showcase-section position-relative w-100" id="proyectos" data-selected-cases-stodio>

    {{-- 1. Header Centrado (Fijo con ScrollTrigger Pin) --}}
    <div class="stodio-pinned-hero" id="pinned-header">
        <div class="stodio-header-content" id="header-text-block">
            <div class="stodio-badge-pill">
                <span class="red-dot bg-brand"></span>
                <span>/// Selected Cases ///</span>
            </div>
            <h2 class="stodio-title" data-stodio-title>
                Proyectos en Producción
            </h2>
            <p class="stodio-subtitle">
                Portales institucionales de alto tráfico, sistemas de diseño en Figma y plataformas con maquetación fluida y óptimos Core Web Vitals.
            </p>
        </div>
    </div>

    {{-- 2. Rejilla de Proyectos Asimétricos Flotantes --}}
    <div class="stodio-cards-container">
        
        {{-- Fila 1: Proyectos 0 y 1 --}}
        @if ($dbProjects->count() > 0)
            <div class="stodio-card-row two-cols">
                {{-- Tarjeta 1 (Aspect 4:3) --}}
                @php
                    $item0 = $dbProjects->get(0);
                    $thumb0 = $item0->thumbnail;
                    $cat0 = $item0->categories->first()?->name ?? ($item0->contentType?->singular_name ?? 'Proyecto');
                    $url0 = route('public.content.show', [$cptSlug, $item0->slug]);
                @endphp
                <article class="stodio-card-wrap">
                    <a href="{{ $url0 }}" 
                       class="stodio-card" 
                       data-project-card
                       data-flip-card
                       data-flip-id="project-{{ $item0->slug }}"
                       data-magnetic data-magnetic-strength="0.04">
                        <figure class="stodio-media-frame aspect-4-3" 
                                data-flip-id="project-{{ $item0->slug }}"
                                data-flip-element="image">
                            @if ($thumb0)
                                <img src="{{ $thumb0->url }}" 
                                     alt="{{ $item0->title }}" 
                                     loading="eager">
                            @else
                                <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                        {{ $item0->title }}
                                    </span>
                                </div>
                            @endif
                        </figure>
                        <div class="stodio-meta-row">
                            <h3 class="stodio-project-name">{{ $item0->title }}</h3>
                            <span class="stodio-project-category">{{ $cat0 }}</span>
                        </div>
                    </a>
                </article>

                {{-- Tarjeta 2 (Aspect 16:10, Desfasada hacia abajo) --}}
                @if ($dbProjects->count() > 1)
                    @php
                        $item1 = $dbProjects->get(1);
                        $thumb1 = $item1->thumbnail;
                        $cat1 = $item1->categories->first()?->name ?? ($item1->contentType?->singular_name ?? 'Proyecto');
                        $url1 = route('public.content.show', [$cptSlug, $item1->slug]);
                    @endphp
                    <article class="stodio-card-wrap offset-col">
                        <a href="{{ $url1 }}" 
                           class="stodio-card" 
                           data-project-card
                           data-flip-card
                           data-flip-id="project-{{ $item1->slug }}"
                           data-magnetic data-magnetic-strength="0.04">
                            <figure class="stodio-media-frame aspect-16-10" 
                                    data-flip-id="project-{{ $item1->slug }}"
                                    data-flip-element="image">
                                @if ($thumb1)
                                    <img src="{{ $thumb1->url }}" 
                                         alt="{{ $item1->title }}" 
                                         loading="eager">
                                @else
                                    <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                            {{ $item1->title }}
                                        </span>
                                    </div>
                                @endif
                            </figure>
                            <div class="stodio-meta-row">
                                <h3 class="stodio-project-name">{{ $item1->title }}</h3>
                                <span class="stodio-project-category">{{ $cat1 }}</span>
                            </div>
                        </a>
                    </article>
                @endif
            </div>
        @endif

        {{-- Fila 2: Proyecto 2 (Tarjeta Central Retrato / Columna Centrada) --}}
        @if ($dbProjects->count() > 2)
            @php
                $item2 = $dbProjects->get(2);
                $thumb2 = $item2->thumbnail;
                $cat2 = $item2->categories->first()?->name ?? ($item2->contentType?->singular_name ?? 'Proyecto');
                $url2 = route('public.content.show', [$cptSlug, $item2->slug]);
            @endphp
            <div class="stodio-card-row center-col">
                <article class="stodio-card-wrap">
                    <a href="{{ $url2 }}" 
                       class="stodio-card" 
                       data-project-card
                       data-flip-card
                       data-flip-id="project-{{ $item2->slug }}"
                       data-magnetic data-magnetic-strength="0.04">
                        <figure class="stodio-media-frame aspect-portrait" 
                                data-flip-id="project-{{ $item2->slug }}"
                                data-flip-element="image">
                            @if ($thumb2)
                                <img src="{{ $thumb2->url }}" 
                                     alt="{{ $item2->title }}" 
                                     loading="lazy">
                            @else
                                <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                        {{ $item2->title }}
                                    </span>
                                </div>
                            @endif
                        </figure>
                        <div class="stodio-meta-row">
                            <h3 class="stodio-project-name">{{ $item2->title }}</h3>
                            <span class="stodio-project-category">{{ $cat2 }}</span>
                        </div>
                    </a>
                </article>
            </div>
        @endif

        {{-- Fila 3: Proyectos 3 y 4 (Asimetría Alterna) --}}
        @if ($dbProjects->count() > 3)
            <div class="stodio-card-row two-cols-alt">
                {{-- Tarjeta 4 (Aspect 16:10) --}}
                @php
                    $item3 = $dbProjects->get(3);
                    $thumb3 = $item3->thumbnail;
                    $cat3 = $item3->categories->first()?->name ?? ($item3->contentType?->singular_name ?? 'Proyecto');
                    $url3 = route('public.content.show', [$cptSlug, $item3->slug]);
                @endphp
                <article class="stodio-card-wrap">
                    <a href="{{ $url3 }}" 
                       class="stodio-card" 
                       data-project-card
                       data-flip-card
                       data-flip-id="project-{{ $item3->slug }}"
                       data-magnetic data-magnetic-strength="0.04">
                        <figure class="stodio-media-frame aspect-16-10" 
                                data-flip-id="project-{{ $item3->slug }}"
                                data-flip-element="image">
                            @if ($thumb3)
                                <img src="{{ $thumb3->url }}" 
                                     alt="{{ $item3->title }}" 
                                     loading="lazy">
                            @else
                                <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                        {{ $item3->title }}
                                    </span>
                                </div>
                            @endif
                        </figure>
                        <div class="stodio-meta-row">
                            <h3 class="stodio-project-name">{{ $item3->title }}</h3>
                            <span class="stodio-project-category">{{ $cat3 }}</span>
                        </div>
                    </a>
                </article>

                {{-- Tarjeta 5 (Aspect 4:3, Desfasada hacia abajo) --}}
                @if ($dbProjects->count() > 4)
                    @php
                        $item4 = $dbProjects->get(4);
                        $thumb4 = $item4->thumbnail;
                        $cat4 = $item4->categories->first()?->name ?? ($item4->contentType?->singular_name ?? 'Proyecto');
                        $url4 = route('public.content.show', [$cptSlug, $item4->slug]);
                    @endphp
                    <article class="stodio-card-wrap offset-col">
                        <a href="{{ $url4 }}" 
                           class="stodio-card" 
                           data-project-card
                           data-flip-card
                           data-flip-id="project-{{ $item4->slug }}"
                           data-magnetic data-magnetic-strength="0.04">
                            <figure class="stodio-media-frame aspect-4-3" 
                                    data-flip-id="project-{{ $item4->slug }}"
                                    data-flip-element="image">
                                @if ($thumb4)
                                    <img src="{{ $thumb4->url }}" 
                                         alt="{{ $item4->title }}" 
                                         loading="lazy">
                                @else
                                    <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                            {{ $item4->title }}
                                        </span>
                                    </div>
                                @endif
                            </figure>
                            <div class="stodio-meta-row">
                                <h3 class="stodio-project-name">{{ $item4->title }}</h3>
                                <span class="stodio-project-category">{{ $cat4 }}</span>
                            </div>
                        </a>
                    </article>
                @endif
            </div>
        @endif

        {{-- Botón Final hacia el archivo de proyectos --}}
        <div class="stodio-cta-wrap">
            <a href="{{ route('public.content.index', $cptSlug) }}" 
               class="stodio-all-cases-btn" 
               data-magnetic data-magnetic-strength="0.15">
                <span class="arrow">&rarr;</span>
                <span>Ver todos los proyectos</span>
                <span class="cases-count font-mono text-brand">({{ str_pad($totalProjectsCount, 2, '0', STR_PAD_LEFT) }})</span>
            </a>
        </div>

    </div>

</section>
