{{-- 
  Sección: Proyectos en Producción (Casos Seleccionados)
  Secuencia continua con encabezado anclado y cuadrícula simétrica de 2 columnas en X con desfase constante en eje Y (True Masonry).
  - Dos columnas continuas de ancho idéntico (col-12 col-md-6, aspect-16-10).
  - Desfase vertical superior estricto y uniforme en la columna derecha (.offset-top-col).
  - Separación vertical idéntica entre tarjetas (.showcase-col-gap) en ambas columnas para simetría rítmica perfecta.
  - 6 proyectos en producción con soporte Flip y cursor reactivo.
--}}
@php
    $cptProyectos = \App\Models\ContentType::where('slug', 'proyectos')->first();
    $cptSlug = $cptProyectos?->public_route_slug ?? 'proyectos';

    $dbProjects = $featuredContents->filter(function($c) {
        return ($c->contentType?->slug ?? '') === 'proyectos';
    })->values();

    if ($dbProjects->count() < 6) {
        $dbProjects = \App\Models\Content::query()
            ->whereHas('contentType', fn($q) => $q->where('slug', 'proyectos')->where('is_public', true))
            ->published()
            ->with(['contentType', 'categories', 'media'])
            ->orderByDesc('featured')
            ->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->take(6)
            ->get();
    }

    $leftProjects = $dbProjects->filter(fn($p, $i) => $i % 2 === 0)->values();
    $rightProjects = $dbProjects->filter(fn($p, $i) => $i % 2 === 1)->values();
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

    {{-- 2. Contenedor Continuo Único de Todas las Tarjetas (Masonry de 2 Columnas Simétricas) --}}
    <div class="showcase-cards-container position-relative w-100">
        <div class="container-fluid showcase-cards-inner">
            <div class="row g-4 g-lg-5 align-items-start">

                {{-- Columna Izquierda: Proyectos 1, 3, 5 (Mismo Ancho 50% y Espaciado Constante) --}}
                <div class="col-12 col-md-6 d-flex flex-column showcase-col-gap">
                    @foreach ($leftProjects as $index => $item)
                        @php
                            $thumb = $item->thumbnail ?? $item->hero_image;
                            $cat = $item->categories->first()?->name ?? ($item->contentType?->singular_name ?? 'Proyecto');
                            $url = route('public.content.show', [$cptSlug, $item->slug]);
                        @endphp
                        <article class="project-card-wrap">
                            <a href="{{ $url }}" 
                               class="project-card d-block" 
                               data-project-card
                               data-flip-card
                               data-flip-id="project-{{ $item->slug }}"
                               data-magnetic data-magnetic-strength="0.04">
                                <figure class="project-media-frame aspect-16-10 position-relative overflow-hidden m-0" 
                                        data-flip-id="project-{{ $item->slug }}"
                                        data-flip-element="image">
                                    @if ($thumb)
                                        <img src="{{ $thumb->url }}" 
                                             alt="{{ $item->title }}" 
                                             class="w-100 h-100 object-fit-cover d-block"
                                             loading="{{ $index === 0 ? 'eager' : 'lazy' }}"
                                             decoding="async">
                                    @else
                                        <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                            <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                {{ $item->title }}
                                            </span>
                                        </div>
                                    @endif
                                </figure>
                                <div class="project-meta-row d-flex align-items-baseline justify-content-between pt-3">
                                    <h3 class="project-name m-0">{{ $item->title }}</h3>
                                    <span class="project-category font-mono text-fluid-xs text-muted text-uppercase ms-3 flex-shrink-0">{{ $cat }}</span>
                                </div>
                            </a>
                        </article>
                    @endforeach
                </div>

                {{-- Columna Derecha: Proyectos 2, 4, 6 (Mismo Ancho 50% y Desfase en Y Continuo y Uniforme) --}}
                <div class="col-12 col-md-6 d-flex flex-column showcase-col-gap offset-top-col">
                    @foreach ($rightProjects as $index => $item)
                        @php
                            $thumb = $item->thumbnail ?? $item->hero_image;
                            $cat = $item->categories->first()?->name ?? ($item->contentType?->singular_name ?? 'Proyecto');
                            $url = route('public.content.show', [$cptSlug, $item->slug]);
                        @endphp
                        <article class="project-card-wrap">
                            <a href="{{ $url }}" 
                               class="project-card d-block" 
                               data-project-card
                               data-flip-card
                               data-flip-id="project-{{ $item->slug }}"
                               data-magnetic data-magnetic-strength="0.04">
                                <figure class="project-media-frame aspect-16-10 position-relative overflow-hidden m-0" 
                                        data-flip-id="project-{{ $item->slug }}"
                                        data-flip-element="image">
                                    @if ($thumb)
                                        <img src="{{ $thumb->url }}" 
                                             alt="{{ $item->title }}" 
                                             class="w-100 h-100 object-fit-cover d-block"
                                             loading="{{ $index === 0 ? 'eager' : 'lazy' }}"
                                             decoding="async">
                                    @else
                                        <div class="project-placeholder-media w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                            <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                                {{ $item->title }}
                                            </span>
                                        </div>
                                    @endif
                                </figure>
                                <div class="project-meta-row d-flex align-items-baseline justify-content-between pt-3">
                                    <h3 class="project-name m-0">{{ $item->title }}</h3>
                                    <span class="project-category font-mono text-fluid-xs text-muted text-uppercase ms-3 flex-shrink-0">{{ $cat }}</span>
                                </div>
                            </a>
                        </article>
                    @endforeach
                </div>

                {{-- Botón Final de Llamada a la Acción (Componente Reutilizable Universal) --}}
                <div class="col-12 text-center mt-card-flow">
                    <x-cpt-archive-cta :type="$cptProyectos ?? 'proyectos'" label="Ver todos los proyectos" />
                </div>

            </div>
        </div>
    </div>

</section>
