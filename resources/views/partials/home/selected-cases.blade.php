{{-- 
  Sección: Proyectos en Producción (Casos Seleccionados)
  Secuencia continua con encabezado anclado y rejilla asimétrica en contenedor unificado.
--}}
@php
    $cptProyectos = \App\Models\ContentType::where('slug', 'proyectos')->first();
    $cptSlug = $cptProyectos?->public_route_slug ?? 'proyectos';

    $dbProjects = $featuredContents->filter(function($c) {
        return ($c->contentType?->slug ?? '') === 'proyectos';
    })->values();

    if ($dbProjects->count() < 5) {
        $dbProjects = \App\Models\Content::query()
            ->whereHas('contentType', fn($q) => $q->where('slug', 'proyectos')->where('is_public', true))
            ->published()
            ->with(['contentType', 'categories', 'media'])
            ->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->take(5)
            ->get();
    }
@endphp

<section class="showcase-section position-relative w-100" id="proyectos" data-selected-cases>

    {{-- 1. Encabezado Centrado (Anclado con ScrollTrigger Pin) --}}
    <div class="showcase-pinned-hero" id="showcase-pinned-header">
        <div class="showcase-header-content" id="showcase-header-text">
            <h2 class="showcase-title h1" data-showcase-title>
                Proyectos en Producción
            </h2>
            <p class="showcase-subtitle">
                Portales institucionales de alto tráfico, sistemas de diseño en Figma y plataformas con maquetación fluida y óptimos Core Web Vitals.
            </p>
        </div>
    </div>

    {{-- 2. Contenedor Continuo Único de Todas las Tarjetas (Un solo .container y un solo .row) --}}
    <div class="showcase-cards-container position-relative w-100">
        <div class="container-fluid showcase-cards-inner">
            <div class="row g-4 g-lg-5 align-items-start">

                {{-- Fila Visual 1: Tarjeta 1 (Aspect 4:3, col-12 col-md-7) --}}
                @if ($dbProjects->count() > 0)
                    @php
                        $item0 = $dbProjects->get(0);
                        $thumb0 = $item0->thumbnail ?? $item0->hero_image;
                        $cat0 = $item0->categories->first()?->name ?? ($item0->contentType?->singular_name ?? 'Proyecto');
                        $url0 = route('public.content.show', [$cptSlug, $item0->slug]);
                    @endphp
                    <div class="col-12 col-md-7">
                        <article class="project-card-wrap">
                            <a href="{{ $url0 }}" 
                               class="project-card d-block" 
                               data-project-card
                               data-flip-card
                               data-flip-id="project-{{ $item0->slug }}"
                               data-magnetic data-magnetic-strength="0.04">
                                <figure class="project-media-frame aspect-4-3 m-0 position-relative overflow-hidden" 
                                        data-flip-id="project-{{ $item0->slug }}"
                                        data-flip-element="image">
                                    @if ($thumb0)
                                        <img src="{{ $thumb0->url }}" 
                                             alt="{{ $item0->title }}" 
                                             class="w-100 h-100 object-fit-cover d-block"
                                             loading="eager"
                                             decoding="async">
                                    @else
                                        <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                            <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                {{ $item0->title }}
                                            </span>
                                        </div>
                                    @endif
                                </figure>
                                <div class="project-meta-row d-flex align-items-center justify-content-between pt-3">
                                    <h3 class="project-name m-0">{{ $item0->title }}</h3>
                                    <span class="project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat0 }}</span>
                                </div>
                            </a>
                        </article>
                    </div>
                @endif

                {{-- Fila Visual 1: Tarjeta 2 (Aspect 16:10, col-12 col-md-5, Desfasada hacia abajo) --}}
                @if ($dbProjects->count() > 1)
                    @php
                        $item1 = $dbProjects->get(1);
                        $thumb1 = $item1->thumbnail ?? $item1->hero_image;
                        $cat1 = $item1->categories->first()?->name ?? ($item1->contentType?->singular_name ?? 'Proyecto');
                        $url1 = route('public.content.show', [$cptSlug, $item1->slug]);
                    @endphp
                    <div class="col-12 col-md-5 offset-top-col">
                        <article class="project-card-wrap">
                            <a href="{{ $url1 }}" 
                               class="project-card d-block" 
                               data-project-card
                               data-flip-card
                               data-flip-id="project-{{ $item1->slug }}"
                               data-magnetic data-magnetic-strength="0.04">
                                <figure class="project-media-frame aspect-16-10 position-relative overflow-hidden m-0" 
                                        data-flip-id="project-{{ $item1->slug }}"
                                        data-flip-element="image">
                                    @if ($thumb1)
                                        <img src="{{ $thumb1->url }}" 
                                             alt="{{ $item1->title }}" 
                                             class="w-100 h-100 object-fit-cover d-block"
                                             loading="eager"
                                             decoding="async">
                                    @else
                                        <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                            <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                {{ $item1->title }}
                                            </span>
                                        </div>
                                    @endif
                                </figure>
                                <div class="project-meta-row d-flex align-items-center justify-content-between pt-3">
                                    <h3 class="project-name m-0">{{ $item1->title }}</h3>
                                    <span class="project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat1 }}</span>
                                </div>
                            </a>
                        </article>
                    </div>
                @endif

                {{-- Fila Visual 2: Tarjeta 3 Centrada (Aspect 16:10, col-12 col-md-8 mx-auto) --}}
                @if ($dbProjects->count() > 2)
                    @php
                        $item2 = $dbProjects->get(2);
                        $thumb2 = $item2->thumbnail ?? $item2->hero_image;
                        $cat2 = $item2->categories->first()?->name ?? ($item2->contentType?->singular_name ?? 'Proyecto');
                        $url2 = route('public.content.show', [$cptSlug, $item2->slug]);
                    @endphp
                    <div class="col-12 d-flex justify-content-center mt-card-flow">
                        <div class="card-center-wrap w-100">
                            <article class="project-card-wrap">
                                <a href="{{ $url2 }}" 
                                   class="project-card d-block text-decoration-none text-reset" 
                                   data-project-card
                                   data-flip-card
                                   data-flip-id="project-{{ $item2->slug }}"
                                   data-magnetic data-magnetic-strength="0.04">
                                    <figure class="project-media-frame aspect-16-10 position-relative overflow-hidden m-0" 
                                            data-flip-id="project-{{ $item2->slug }}"
                                            data-flip-element="image">
                                        @if ($thumb2)
                                            <img src="{{ $thumb2->url }}" 
                                                 alt="{{ $item2->title }}" 
                                                 class="w-100 h-100 object-fit-cover d-block"
                                                 loading="lazy"
                                                 decoding="async">
                                        @else
                                            <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                    {{ $item2->title }}
                                                </span>
                                            </div>
                                        @endif
                                    </figure>
                                    <div class="project-meta-row d-flex align-items-center justify-content-between pt-3">
                                        <h3 class="project-name m-0">{{ $item2->title }}</h3>
                                        <span class="project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat2 }}</span>
                                    </div>
                                </a>
                            </article>
                        </div>
                    </div>
                @endif

                {{-- Fila Visual 3: Tarjetas 4 y 5 (o Tarjeta 4 Centrada si solo hay 4) --}}
                @if ($dbProjects->count() > 3)
                    @if ($dbProjects->count() > 4)
                        {{-- Tarjeta 4 (Aspect 16:10, col-12 col-md-5) --}}
                        @php
                            $item3 = $dbProjects->get(3);
                            $thumb3 = $item3->thumbnail ?? $item3->hero_image;
                            $cat3 = $item3->categories->first()?->name ?? ($item3->contentType?->singular_name ?? 'Proyecto');
                            $url3 = route('public.content.show', [$cptSlug, $item3->slug]);
                        @endphp
                        <div class="col-12 col-md-5 mt-card-flow">
                            <article class="project-card-wrap">
                                <a href="{{ $url3 }}" 
                                   class="project-card d-block" 
                                   data-project-card
                                   data-flip-card
                                   data-flip-id="project-{{ $item3->slug }}"
                                   data-magnetic data-magnetic-strength="0.04">
                                    <figure class="project-media-frame aspect-16-10 position-relative overflow-hidden m-0"
                                            data-flip-id="project-{{ $item3->slug }}"
                                            data-flip-element="image">
                                        @if ($thumb3)
                                            <img src="{{ $thumb3->url }}" 
                                                 alt="{{ $item3->title }}" 
                                                 class="w-100 h-100 object-fit-cover d-block"
                                                 loading="lazy"
                                                 decoding="async">
                                        @else
                                            <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                    {{ $item3->title }}
                                                </span>
                                            </div>
                                        @endif
                                    </figure>
                                    <div class="project-meta-row d-flex align-items-center justify-content-between pt-3">
                                        <h3 class="project-name m-0">{{ $item3->title }}</h3>
                                        <span class="project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat3 }}</span>
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
                            <article class="project-card-wrap">
                                <a href="{{ $url4 }}" 
                                   class="project-card d-block" 
                                   data-project-card
                                   data-flip-card
                                   data-flip-id="project-{{ $item4->slug }}"
                                   data-magnetic data-magnetic-strength="0.04">
                                    <figure class="project-media-frame aspect-4-3 position-relative overflow-hidden m-0"
                                            data-flip-id="project-{{ $item4->slug }}"
                                            data-flip-element="image">
                                        @if ($thumb4)
                                            <img src="{{ $thumb4->url }}" 
                                                 alt="{{ $item4->title }}" 
                                                 class="w-100 h-100 object-fit-cover d-block"
                                                 loading="lazy"
                                                 decoding="async">
                                        @else
                                            <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                    {{ $item4->title }}
                                                </span>
                                            </div>
                                        @endif
                                    </figure>
                                    <div class="project-meta-row d-flex align-items-center justify-content-between pt-3">
                                        <h3 class="project-name m-0">{{ $item4->title }}</h3>
                                        <span class="project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat4 }}</span>
                                    </div>
                                </a>
                            </article>
                        </div>
                    @else
                        {{-- Solo 1 proyecto en fila 3: Centrado idéntico a fila 2 --}}
                        @php
                            $item3 = $dbProjects->get(3);
                            $thumb3 = $item3->thumbnail ?? $item3->hero_image;
                            $cat3 = $item3->categories->first()?->name ?? ($item3->contentType?->singular_name ?? 'Proyecto');
                            $url3 = route('public.content.show', [$cptSlug, $item3->slug]);
                        @endphp
                        <div class="col-12 d-flex justify-content-center mt-card-flow">
                            <div class="card-center-wrap w-100">
                                <article class="project-card-wrap">
                                    <a href="{{ $url3 }}" 
                                       class="project-card d-block text-decoration-none text-reset" 
                                       data-project-card
                                       data-flip-card
                                       data-flip-id="project-{{ $item3->slug }}"
                                       data-magnetic data-magnetic-strength="0.04">
                                        <figure class="project-media-frame aspect-16-10 position-relative overflow-hidden m-0"
                                                data-flip-id="project-{{ $item3->slug }}"
                                                data-flip-element="image">
                                            @if ($thumb3)
                                                <img src="{{ $thumb3->url }}" 
                                                     alt="{{ $item3->title }}" 
                                                     class="w-100 h-100 object-fit-cover d-block"
                                                     loading="lazy"
                                                     decoding="async">
                                            @else
                                                <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                        {{ $item3->title }}
                                                    </span>
                                                </div>
                                            @endif
                                        </figure>
                                        <div class="project-meta-row d-flex align-items-center justify-content-between pt-3">
                                            <h3 class="project-name m-0">{{ $item3->title }}</h3>
                                            <span class="project-category font-mono text-fluid-xs text-muted text-uppercase">{{ $cat3 }}</span>
                                        </div>
                                    </a>
                                </article>
                            </div>
                        </div>
                    @endif
                @endif

                {{-- Botón Final de Llamada a la Acción (Componente Reutilizable Universal) --}}
                <div class="col-12 text-center mt-card-flow">
                    <x-cpt-archive-cta :type="$cptProyectos ?? 'proyectos'" label="Ver todos los proyectos" />
                </div>

            </div>
        </div>
    </div>

</section>
