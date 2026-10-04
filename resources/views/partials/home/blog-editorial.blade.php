{{-- 
  Sección: Blog en Home — 6 Notas Horizontal Track (ScrollTrigger Scrub)
  - Encabezado en una sola fila (Our latest news a la izquierda, All News a la derecha, sin píldoras extra ni divisor).
  - Estética 100% plana Zero Shadows / Zero Glass.
  - Columnas responsivas en una sola fila continua: 4 por viewport en desktop, 3 en 1024px, 2 en tablet, 1 en móvil.
  - Desplazamiento horizontal por scroll en el eje X sincronizado con GSAP & Lenis (no es slider ni carrusel touch).
--}}
@php
    $blogCpt = $blogCpt ?? \App\Models\ContentType::where('slug', 'blog')->where('is_public', true)->first();
    $latestPosts = $latestPosts ?? ($blogCpt
        ? \App\Models\Content::query()
            ->where('content_type_id', $blogCpt->id)
            ->published()
            ->with([
                'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                'categories',
                'contentType',
            ])
            ->orderByDesc('featured')
            ->orderByDesc('published_at')
            ->take(6)
            ->get()
        : collect());
    $blogRouteSlug = $blogCpt?->public_route_slug ?? 'blog';
@endphp

@if ($latestPosts->isNotEmpty())
    <section class="home-blog-section position-relative w-100" id="blog" data-home-blog-section>
        <div class="home-blog-pin-wrap w-100 min-vh-100 d-flex flex-column" data-home-blog-pin>
            <div class="container-fluid">
                {{-- Encabezado Editorial en una sola fila (Alineación horizontal limpia a la línea de base) --}}
                <div class="d-flex align-items-baseline justify-content-between gap-3 mb-xl" data-reveal>
                    <h2 class="font-heading h1 fw-bold text-primary lh-tight mb-0">
                        Our latest news
                    </h2>

                    <div class="flex-shrink-0">
                        <a href="{{ route('public.content.index', $blogRouteSlug) }}" 
                           class="text-brand font-sans text-fluid-base fw-medium text-decoration-none d-inline-flex align-items-center gap-2"
                           data-magnetic>
                            <span>All News</span>
                            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M1 7H16.5M16.5 7L10.5 1M16.5 7L10.5 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                    </div>
                </div>

                {{-- Viewport y Riel Continuo de Desplazamiento Horizontal en Eje X --}}
                <div class="home-blog-viewport w-100 overflow-hidden" data-home-blog-viewport>
                    <div class="home-blog-track" data-home-blog-track>
                        @foreach ($latestPosts as $item)
                            @php
                                $itemThumb = $item->thumbnail;
                                $categoryName = $item->categories->first()?->name ?? 'Artículos';
                                $detailUrl = route('public.content.show', [$blogRouteSlug, $item->slug]);
                                $dateFormatted = $item->published_at 
                                    ? $item->published_at->translatedFormat('F j, Y') 
                                    : $item->created_at->translatedFormat('F j, Y');
                            @endphp
                            <article class="home-blog-card-col d-flex flex-column" data-card-reveal data-reveal>
                                <a href="{{ $detailUrl }}" 
                                   class="card-media-zoom d-flex flex-column h-100 text-decoration-none"
                                   data-blog-card
                                   data-flip-card
                                   data-flip-id="post-{{ $item->slug }}"
                                   data-magnetic data-magnetic-strength="0.02">
                                    
                                    {{-- Contenedor de Imagen con Esquinas 100% Rectas (rounded-0 + aspect-16-10) y Badge Plano (Zero Glass) --}}
                                    <div class="position-relative overflow-hidden w-100 border-subtle bg-surface rounded-0 aspect-16-10"
                                         data-flip-id="post-{{ $item->slug }}"
                                         data-flip-element="image">
                                        
                                        {{-- Badge plano de Categoría sobre la imagen (Sin Glass ni Blur) --}}
                                        <span class="position-absolute top-0 start-0 m-2 font-mono text-fluid-xs text-primary bg-surface border border-subtle rounded-0 px-2 py-1 lh-1 tracking-wider text-uppercase" style="z-index: 2; pointer-events: none;">
                                            ({{ $categoryName }})
                                        </span>

                                        @if ($itemThumb)
                                            <img src="{{ $itemThumb->url }}" 
                                                 alt="{{ $item->title }}" 
                                                 class="w-100 h-100 object-fit-cover rounded-0 d-block will-change-transform"
                                                 loading="lazy">
                                        @else
                                            <div class="w-100 h-100 d-flex align-items-center justify-content-center bg-surface rounded-0">
                                                <span class="font-mono text-fluid-xs text-muted">
                                                    ({{ strtoupper($categoryName) }})
                                                </span>
                                            </div>
                                        @endif
                                    </div>

                                    {{-- Cuerpo de la Nota con Tipografía Fluida --}}
                                    <div class="d-flex flex-column flex-grow-1 pt-xs">
                                        {{-- Título de la Nota --}}
                                        <h3 class="font-heading text-fluid-h5 fw-semibold text-primary lh-sm mb-xs">
                                            {{ $item->title }}
                                        </h3>

                                        {{-- Enlace de Acción Read More Anclado al Fondo --}}
                                        <div class="mt-auto">
                                            <span class="font-sans text-fluid-sm fw-medium text-brand">
                                                Read More
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            </article>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </section>
@endif
