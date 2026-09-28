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

<section class="stodio-showcase-section position-relative w-100 overflow-hidden" id="proyectos" data-selected-cases-stodio>

    {{-- 1. Header Centrado (Fijo con ScrollTrigger Pin) --}}
    <div class="stodio-pinned-hero" id="pinned-header">
        <div class="stodio-header-content" id="header-text-block">
            <h2 class="stodio-title h1" data-stodio-title>
                Proyectos en Producción
            </h2>
            <p class="stodio-subtitle">
                Portales institucionales de alto tráfico, sistemas de diseño en Figma y plataformas con maquetación fluida y óptimos Core Web Vitals.
            </p>
        </div>
    </div>

    {{-- 2. Rejilla de Proyectos Flotantes con Sistema de Columnas y Container --}}
    <div class="stodio-cards-container position-relative w-100">
        
        {{-- Fila 1: Proyectos 0 y 1 con degradado de enmascaramiento al subir --}}
        @if ($dbProjects->count() > 0)
            <div class="stodio-card-row row-01 w-100">
                <div class="container">
                    <div class="row g-4 g-lg-5 align-items-start">
                        {{-- Tarjeta 1 (Aspect 4:3, col-12 col-md-7) --}}
                        @php
                            $item0 = $dbProjects->get(0);
                            $thumb0 = $item0->thumbnail ?? $item0->hero_image;
                            $cat0 = $item0->categories->first()?->name ?? ($item0->contentType?->singular_name ?? 'Proyecto');
                            $url0 = route('public.content.show', [$cptSlug, $item0->slug]);
                        @endphp
                        <div class="col-12 col-md-7">
                            <article class="stodio-card-wrap">
                                <a href="{{ $url0 }}" 
                                   class="stodio-card d-block" 
                                   data-project-card
                                   data-flip-card
                                   data-flip-id="project-{{ $item0->slug }}"
                                   data-magnetic data-magnetic-strength="0.04">
                                    <figure class="stodio-media-frame aspect-4-3 m-0 position-relative overflow-hidden" 
                                            data-flip-id="project-{{ $item0->slug }}"
                                            data-flip-element="image">
                                        @if ($thumb0)
                                            <img src="{{ $thumb0->url }}" 
                                                 alt="{{ $item0->title }}" 
                                                 class="w-100 h-100 object-fit-cover d-block"
                                                 loading="eager">
                                        @else
                                            <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                    {{ $item0->title }}
                                                </span>
                                            </div>
                                        @endif
                                    </figure>
                                    <div class="stodio-meta-row d-flex align-items-center justify-content-between pt-3">
                                        <h3 class="stodio-project-name m-0">{{ $item0->title }}</h3>
                                        <span class="stodio-project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat0 }}</span>
                                    </div>
                                </a>
                            </article>
                        </div>

                        {{-- Tarjeta 2 (Aspect 16:10, col-12 col-md-5, Desfasada hacia abajo) --}}
                        @if ($dbProjects->count() > 1)
                            @php
                                $item1 = $dbProjects->get(1);
                                $thumb1 = $item1->thumbnail ?? $item1->hero_image;
                                $cat1 = $item1->categories->first()?->name ?? ($item1->contentType?->singular_name ?? 'Proyecto');
                                $url1 = route('public.content.show', [$cptSlug, $item1->slug]);
                            @endphp
                            <div class="col-12 col-md-5 offset-top-col">
                                <article class="stodio-card-wrap">
                                    <a href="{{ $url1 }}" 
                                       class="stodio-card d-block" 
                                       data-project-card
                                       data-flip-card
                                       data-flip-id="project-{{ $item1->slug }}"
                                       data-magnetic data-magnetic-strength="0.04">
                                        <figure class="stodio-media-frame aspect-16-10 position-relative overflow-hidden m-0" 
                                                data-flip-id="project-{{ $item1->slug }}"
                                                data-flip-element="image">
                                            @if ($thumb1)
                                                <img src="{{ $thumb1->url }}" 
                                                     alt="{{ $item1->title }}" 
                                                     class="w-100 h-100 object-fit-cover d-block"
                                                     loading="eager">
                                            @else
                                                <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                        {{ $item1->title }}
                                                    </span>
                                                </div>
                                            @endif
                                        </figure>
                                        <div class="stodio-meta-row d-flex align-items-center justify-content-between pt-3">
                                            <h3 class="stodio-project-name m-0">{{ $item1->title }}</h3>
                                            <span class="stodio-project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat1 }}</span>
                                        </div>
                                    </a>
                                </article>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        @endif

        {{-- Fila 2: Proyecto 2 (Columna Centrada) --}}
        @if ($dbProjects->count() > 2)
            @php
                $item2 = $dbProjects->get(2);
                $thumb2 = $item2->thumbnail ?? $item2->hero_image;
                $cat2 = $item2->categories->first()?->name ?? ($item2->contentType?->singular_name ?? 'Proyecto');
                $url2 = route('public.content.show', [$cptSlug, $item2->slug]);
            @endphp
            <div class="stodio-card-row row-02 w-100">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-12 d-flex justify-content-center">
                            <div class="stodio-card-center-wrap">
                                <article class="stodio-card-wrap">
                                    <a href="{{ $url2 }}" 
                                       class="stodio-card d-block" 
                                       data-project-card
                                       data-flip-card
                                       data-flip-id="project-{{ $item2->slug }}"
                                       data-magnetic data-magnetic-strength="0.04">
                                        <figure class="stodio-media-frame aspect-16-10 position-relative overflow-hidden m-0" 
                                                data-flip-id="project-{{ $item2->slug }}"
                                                data-flip-element="image">
                                            @if ($thumb2)
                                                <img src="{{ $thumb2->url }}" 
                                                     alt="{{ $item2->title }}" 
                                                     class="w-100 h-100 object-fit-cover d-block"
                                                     loading="lazy">
                                            @else
                                                <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                        {{ $item2->title }}
                                                    </span>
                                                </div>
                                            @endif
                                        </figure>
                                        <div class="stodio-meta-row d-flex align-items-center justify-content-between pt-3">
                                            <h3 class="stodio-project-name m-0">{{ $item2->title }}</h3>
                                            <span class="stodio-project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat2 }}</span>
                                        </div>
                                    </a>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endif

        {{-- Fila 3: Proyectos 3 y 4 (o Proyecto 3 Centrado si solo hay 4) --}}
        @if ($dbProjects->count() > 3)
            <div class="stodio-card-row row-03 w-100">
                <div class="container">
                    @if ($dbProjects->count() > 4)
                        <div class="row g-4 g-lg-5 align-items-start">
                            {{-- Tarjeta 4 (Aspect 16:10, col-12 col-md-5) --}}
                            @php
                                $item3 = $dbProjects->get(3);
                                $thumb3 = $item3->thumbnail ?? $item3->hero_image;
                                $cat3 = $item3->categories->first()?->name ?? ($item3->contentType?->singular_name ?? 'Proyecto');
                                $url3 = route('public.content.show', [$cptSlug, $item3->slug]);
                            @endphp
                            <div class="col-12 col-md-5">
                                <article class="stodio-card-wrap">
                                    <a href="{{ $url3 }}" 
                                       class="stodio-card d-block" 
                                       data-project-card
                                       data-flip-card
                                       data-flip-id="project-{{ $item3->slug }}"
                                       data-magnetic data-magnetic-strength="0.04">
                                        <figure class="stodio-media-frame aspect-16-10 position-relative overflow-hidden m-0"
                                                data-flip-id="project-{{ $item3->slug }}"
                                                data-flip-element="image">
                                            @if ($thumb3)
                                                <img src="{{ $thumb3->url }}" 
                                                     alt="{{ $item3->title }}" 
                                                     class="w-100 h-100 object-fit-cover d-block"
                                                     loading="lazy">
                                            @else
                                                <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                        {{ $item3->title }}
                                                    </span>
                                                </div>
                                            @endif
                                        </figure>
                                        <div class="stodio-meta-row d-flex align-items-center justify-content-between pt-3">
                                            <h3 class="stodio-project-name m-0">{{ $item3->title }}</h3>
                                            <span class="stodio-project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat3 }}</span>
                                        </div>
                                    </a>
                                </article>
                            </div>

                            {{-- Tarjeta 5 (Aspect 4:3, col-12 col-md-7, Desfasada hacia abajo) --}}
                            @php
                                $item4 = $dbProjects->get(4);
                                $thumb4 = $item4->thumbnail ?? $item4->hero_image;
                                $cat4 = $item4->categories->first()?->name ?? ($item4->contentType?->singular_name ?? 'Proyecto');
                                $url4 = route('public.content.show', [$cptSlug, $item4->slug]);
                            @endphp
                            <div class="col-12 col-md-7 offset-top-col">
                                <article class="stodio-card-wrap">
                                    <a href="{{ $url4 }}" 
                                       class="stodio-card d-block" 
                                       data-project-card
                                       data-flip-card
                                       data-flip-id="project-{{ $item4->slug }}"
                                       data-magnetic data-magnetic-strength="0.04">
                                        <figure class="stodio-media-frame aspect-4-3 position-relative overflow-hidden m-0"
                                                data-flip-id="project-{{ $item4->slug }}"
                                                data-flip-element="image">
                                            @if ($thumb4)
                                                <img src="{{ $thumb4->url }}" 
                                                     alt="{{ $item4->title }}" 
                                                     class="w-100 h-100 object-fit-cover d-block"
                                                     loading="lazy">
                                            @else
                                                <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                        {{ $item4->title }}
                                                    </span>
                                                </div>
                                            @endif
                                        </figure>
                                        <div class="stodio-meta-row d-flex align-items-center justify-content-between pt-3">
                                            <h3 class="stodio-project-name m-0">{{ $item4->title }}</h3>
                                            <span class="stodio-project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat4 }}</span>
                                        </div>
                                    </a>
                                </article>
                            </div>
                        </div>
                    @else
                        {{-- Solo 1 proyecto en fila 3: Centrado idéntico a fila 2 --}}
                        @php
                            $item3 = $dbProjects->get(3);
                            $thumb3 = $item3->thumbnail ?? $item3->hero_image;
                            $cat3 = $item3->categories->first()?->name ?? ($item3->contentType?->singular_name ?? 'Proyecto');
                            $url3 = route('public.content.show', [$cptSlug, $item3->slug]);
                        @endphp
                        <div class="row justify-content-center">
                            <div class="col-12 d-flex justify-content-center">
                                <div class="stodio-card-center-wrap">
                                    <article class="stodio-card-wrap">
                                        <a href="{{ $url3 }}" 
                                           class="stodio-card d-block" 
                                           data-project-card
                                           data-flip-card
                                           data-flip-id="project-{{ $item3->slug }}"
                                           data-magnetic data-magnetic-strength="0.04">
                                            <figure class="stodio-media-frame aspect-16-10 position-relative overflow-hidden m-0"
                                                    data-flip-id="project-{{ $item3->slug }}"
                                                    data-flip-element="image">
                                                @if ($thumb3)
                                                    <img src="{{ $thumb3->url }}" 
                                                         alt="{{ $item3->title }}" 
                                                         class="w-100 h-100 object-fit-cover d-block"
                                                         loading="lazy">
                                                @else
                                                    <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                            {{ $item3->title }}
                                                        </span>
                                                    </div>
                                                @endif
                                            </figure>
                                            <div class="stodio-meta-row d-flex align-items-center justify-content-between pt-3">
                                                <h3 class="stodio-project-name m-0">{{ $item3->title }}</h3>
                                                <span class="stodio-project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat3 }}</span>
                                            </div>
                                        </a>
                                    </article>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        @endif

        {{-- Botón Final hacia el archivo de proyectos --}}
        <div class="stodio-cta-wrap w-100">
            <div class="container text-center">
                <a href="{{ route('public.content.index', $cptSlug) }}" 
                   class="stodio-all-cases-btn" 
                   data-magnetic data-magnetic-strength="0.15">
                    <span class="arrow">&rarr;</span>
                    <span>Ver todos los proyectos</span>
                    <span class="cases-count font-mono text-brand">({{ str_pad($totalProjectsCount, 2, '0', STR_PAD_LEFT) }})</span>
                </a>
            </div>
        </div>

    </div>

</section>
