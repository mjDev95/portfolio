{{-- 
  Sección: Blog Editorial / Ensayos & Artículos Recientes
  Alineada con el sistema editorial a pantalla completa (hero-editorial.blade.php & fluid-system.css)
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
            ->take(2)
            ->get()
        : collect());
    $blogRouteSlug = $blogCpt?->public_route_slug ?? 'blog';
@endphp

@if ($latestPosts->isNotEmpty())
    <section class="home-blog-section position-relative w-100" id="blog">
        <div class="home-blog-content">
            {{-- Encabezado Editorial con flex justify-content-between y botón Ver todos --}}
            <div class="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-xl gap-3" data-reveal>
                <div>
                    <span class="font-mono text-fluid-xs text-brand text-uppercase tracking-widest d-block mb-xs">
                        /// Pensamiento &amp; Ensayos ///
                    </span>
                    <h2 class="font-heading text-fluid-h2 text-primary fw-bold m-0" style="letter-spacing: -0.03em;">
                        Artículos Recientes
                    </h2>
                    <p class="text-fluid-base text-secondary fw-light mt-xs mb-0" style="max-width: 54ch;">
                        Reflexiones técnicas sobre ingeniería web, Core Web Vitals, arquitectura de temas en WordPress y diseño de interacción cinemática.
                    </p>
                </div>

                <div class="pt-sm pt-md-0 flex-shrink-0">
                    <x-btn href="{{ route('public.content.index', $blogRouteSlug) }}" 
                           icon="rarr" 
                           size="md"
                           data-magnetic>
                        Ver todos los artículos
                    </x-btn>
                </div>
            </div>

            {{-- Rejilla de Cards (Reutiliza el componente universal card-item con animación staggered) --}}
            <div class="row g-4 g-lg-5">
                @include('public.content.blog.partials.card-item', ['contents' => $latestPosts, 'cpt' => $blogCpt])
            </div>
        </div>
    </section>
@endif
