{{-- 
  Lista Editorial de Casos Seleccionados (Dennis Snellenberg & Reed.be)
  Alineada con el sistema editorial a pantalla completa (hero-editorial.blade.php & fluid-system.css)
  Muestra exactamente los 2 proyectos más recientes de la base de datos y botón hacia /proyectos
--}}
@php
    $dbProjects = $featuredContents->filter(function($c) {
        return ($c->contentType?->slug ?? '') === 'proyectos';
    })->take(2)->values();

    if ($dbProjects->count() < 2) {
        $dbProjects = \App\Models\Content::query()
            ->whereHas('contentType', fn($q) => $q->where('slug', 'proyectos')->where('is_public', true))
            ->published()
            ->with(['contentType', 'categories'])
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->take(2)
            ->get();
    }
@endphp

<section class="selected-cases-section position-relative w-100" id="proyectos">
    <div class="selected-cases-content">
        {{-- Encabezado Editorial a Pantalla Completa --}}
        <div class="services-header-row mb-xl" data-reveal>
            <div class="services-header-left">
                <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-xs tracking-widest">
                    /// Selected Cases ///
                </span>
                <h2 class="services-main-title">
                    Proyectos en Producción
                </h2>
            </div>
            <div class="services-header-right">
                <p class="services-lead-text">
                    Portales institucionales de alto tráfico, sistemas de diseño en Figma y plataformas con maquetación fluida y óptimos Core Web Vitals.
                </p>
            </div>
        </div>

        {{-- Lista Editorial tipo Dennis Snellenberg (2 Proyectos de la Base de Datos) --}}
        <div class="editorial-cases-stack border-top-subtle" data-reveal>
            @forelse ($dbProjects as $index => $item)
                @php
                    $cptSlug = $item->contentType?->public_route_slug ?? 'proyectos';
                    $url = route('public.content.show', [$cptSlug, $item->slug]);
                    $num = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
                @endphp
                <a href="{{ $url }}" 
                   class="project-editorial-row" 
                   data-magnetic data-magnetic-strength="0.15">
                    <div class="row align-items-center g-3">
                        <div class="col-12 col-md-1 font-mono text-fluid-sm text-muted">
                            {{ $num }}
                        </div>
                        <div class="col-12 col-md-6">
                            <h3 class="font-heading text-fluid-h3 text-primary row-title-accent mb-xs">
                                {{ $item->title }}
                            </h3>
                            @if ($item->excerpt)
                                <span class="text-fluid-sm text-secondary fw-light">
                                    {{ $item->excerpt }}
                                </span>
                            @endif
                        </div>
                        <div class="col-12 col-md-4 d-flex flex-wrap gap-2">
                            @foreach ($item->categories as $category)
                                <span class="data-chip">{{ $category->name }}</span>
                            @endforeach
                        </div>
                        <div class="col-12 col-md-1 text-end d-none d-md-block">
                            <span class="btn-pill-arrow-circle row-arrow-shift">&nearr;</span>
                        </div>
                    </div>
                </a>
            @empty
                <div class="py-xl text-center text-muted">
                    <p class="font-mono text-fluid-sm mb-0">No hay proyectos publicados en la base de datos.</p>
                </div>
            @endforelse
        </div>

        {{-- Botón Editorial hacia el Archive de Proyectos (/proyectos) --}}
        <div class="d-flex justify-content-center mt-2xl pt-lg border-top-subtle" data-reveal>
            <a href="{{ route('public.content.index', 'proyectos') }}" 
               class="btn-pill-action btn-pill-action-lg" 
               data-magnetic data-magnetic-strength="0.15">
                <span class="btn-pill-arrow-circle">&nearr;</span>
                <span class="font-heading fw-medium">Ver todos los proyectos</span>
            </a>
        </div>
    </div>
</section>
