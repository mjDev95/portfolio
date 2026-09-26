{{-- 
  Lista Editorial de Casos Seleccionados (Inspiración Dennis Snellenberg & Reed.be)
  Alineada con el sistema editorial a pantalla completa (hero-editorial.blade.php & fluid-system.css)
--}}
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

        {{-- Lista Editorial tipo Dennis Snellenberg con Shared Element Flip (Reed.be) --}}
        <div class="editorial-cases-stack border-top-subtle" data-reveal>
            
            {{-- Caso 01: Next in Line Management --}}
            <a href="https://nextinlinemanagement.com/" target="_blank" rel="noopener noreferrer" 
               class="project-editorial-row" 
               data-magnetic data-magnetic-strength="0.15">
                <div class="row align-items-center g-3">
                    <div class="col-12 col-md-1 font-mono text-fluid-sm text-muted">
                        01
                    </div>
                    <div class="col-12 col-md-6">
                        <h3 class="font-heading text-fluid-h3 text-primary row-title-accent mb-xs">
                            Next in Line Management
                        </h3>
                        <span class="text-fluid-sm text-secondary fw-light">
                            Conceptualización UI/UX en Figma + Custom Theme fluido en PHP nativo
                        </span>
                    </div>
                    <div class="col-12 col-md-4 d-flex flex-wrap gap-2">
                        <span class="data-chip">Figma UI/UX</span>
                        <span class="data-chip">Fluid CSS Tokens</span>
                        <span class="data-chip">WordPress</span>
                    </div>
                    <div class="col-12 col-md-1 text-end d-none d-md-block">
                        <span class="btn-pill-arrow-circle row-arrow-shift">&nearr;</span>
                    </div>
                </div>
            </a>

            {{-- Caso 02: Accésate --}}
            <a href="https://accesate.com/es" target="_blank" rel="noopener noreferrer" 
               class="project-editorial-row" 
               data-magnetic data-magnetic-strength="0.15">
                <div class="row align-items-center g-3">
                    <div class="col-12 col-md-1 font-mono text-fluid-sm text-muted">
                        02
                    </div>
                    <div class="col-12 col-md-6">
                        <h3 class="font-heading text-fluid-h3 text-primary row-title-accent mb-xs">
                            Accésate
                        </h3>
                        <span class="text-fluid-sm text-secondary fw-light">
                            Diseño de experiencia web (UX/UI) y arquitectura de componentes Blade
                        </span>
                    </div>
                    <div class="col-12 col-md-4 d-flex flex-wrap gap-2">
                        <span class="data-chip">Laravel Blade</span>
                        <span class="data-chip">UX/UI Design</span>
                        <span class="data-chip">Modular</span>
                    </div>
                    <div class="col-12 col-md-1 text-end d-none d-md-block">
                        <span class="btn-pill-arrow-circle row-arrow-shift">&nearr;</span>
                    </div>
                </div>
            </a>

            {{-- Caso 03: Centro Médico ABC --}}
            <a href="https://centromedicoabc.com/" target="_blank" rel="noopener noreferrer" 
               class="project-editorial-row" 
               data-magnetic data-magnetic-strength="0.15">
                <div class="row align-items-center g-3">
                    <div class="col-12 col-md-1 font-mono text-fluid-sm text-muted">
                        03
                    </div>
                    <div class="col-12 col-md-6">
                        <h3 class="font-heading text-fluid-h3 text-primary row-title-accent mb-xs">
                            Centro Médico ABC
                        </h3>
                        <span class="text-fluid-sm text-secondary fw-light">
                            Portal hospitalario de alto tráfico institucional &bull; Optimización Core Web Vitals
                        </span>
                    </div>
                    <div class="col-12 col-md-4 d-flex flex-wrap gap-2">
                        <span class="data-chip">WordPress Nativo</span>
                        <span class="data-chip">LCP &lt; 1.2s</span>
                        <span class="data-chip">Alto Tráfico</span>
                    </div>
                    <div class="col-12 col-md-1 text-end d-none d-md-block">
                        <span class="btn-pill-arrow-circle row-arrow-shift">&nearr;</span>
                    </div>
                </div>
            </a>

            {{-- Caso 04: FLACSO México --}}
            <a href="https://www.flacso.edu.mx/" target="_blank" rel="noopener noreferrer" 
               class="project-editorial-row" 
               data-magnetic data-magnetic-strength="0.15">
                <div class="row align-items-center g-3">
                    <div class="col-12 col-md-1 font-mono text-fluid-sm text-muted">
                        04
                    </div>
                    <div class="col-12 col-md-6">
                        <h3 class="font-heading text-fluid-h3 text-primary row-title-accent mb-xs">
                            FLACSO México
                        </h3>
                        <span class="text-fluid-sm text-secondary fw-light">
                            Portal institucional con catálogo extenso de publicaciones académicas
                        </span>
                    </div>
                    <div class="col-12 col-md-4 d-flex flex-wrap gap-2">
                        <span class="data-chip">Catálogo CPTs</span>
                        <span class="data-chip">Taxonomías</span>
                        <span class="data-chip">SEO On-Page</span>
                    </div>
                    <div class="col-12 col-md-1 text-end d-none d-md-block">
                        <span class="btn-pill-arrow-circle row-arrow-shift">&nearr;</span>
                    </div>
                </div>
            </a>
        </div>

        {{-- Casos Dinámicos del CMS con Shared Element Transition (Reed.be Flip) --}}
        @if ($featuredContents->isNotEmpty())
            <div class="mt-2xl pt-xl border-top-subtle" data-reveal>
                <div class="d-flex justify-content-between align-items-center mb-lg">
                    <h3 class="text-fluid-h4 text-primary font-heading text-uppercase tracking-wider">
                        Casos en el CMS //
                    </h3>
                    <span class="text-fluid-xs font-mono text-muted">Shared Element Flip &bull; Reed.be</span>
                </div>

                <div class="row g-4">
                    @foreach ($featuredContents as $item)
                        @php
                            $itemThumb = $item->thumbnail;
                            $cptSlug = $item->contentType?->public_route_slug ?? 'proyectos';
                            $detailUrl = route('public.content.show', [$cptSlug, $item->slug]);
                        @endphp
                        <div class="col-12 col-md-6 col-lg-4" data-reveal>
                            <a href="{{ $detailUrl }}" 
                               class="service-card d-flex flex-column h-100 text-decoration-none" 
                               data-flip-card data-magnetic data-magnetic-strength="0.1">
                                @if ($itemThumb)
                                    <div class="overflow-hidden mb-sm rounded-3 w-100 bg-surface-subtle"
                                         style="aspect-ratio: 16/10;"
                                         data-flip-id="project-{{ $item->slug }}">
                                        <img src="{{ $itemThumb->url }}"
                                             alt="{{ $itemThumb->alt ?: ($itemThumb->caption ?: $item->title) }}"
                                             class="img-fluid object-fit-cover w-100 h-100">
                                    </div>
                                @endif
                                <h4 class="font-heading text-fluid-h4 text-primary hover-text-accent transition-colors mb-xs">
                                    {{ $item->title }}
                                </h4>
                                @if ($item->excerpt)
                                    <p class="text-fluid-xs text-secondary line-clamp-2 fw-light mb-sm flex-grow-1">
                                        {{ $item->excerpt }}
                                    </p>
                                @endif
                                <div class="mt-auto pt-xs">
                                    <span class="btn-pill-action" style="padding: 0.25rem 0.85rem 0.25rem 0.35rem;">
                                        <span class="btn-pill-arrow-circle" style="width: 1.5rem; height: 1.5rem; font-size: 0.75rem;">&rarr;</span>
                                        <span class="text-fluid-xs">Ver detalle</span>
                                    </span>
                                </div>
                            </a>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</section>
