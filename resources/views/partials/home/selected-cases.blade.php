{{-- 
  Lista Editorial de Casos Seleccionados (Dennis Snellenberg & Reed.be)
  Alineada con el sistema editorial a pantalla completa (hero-editorial.blade.php & fluid-system.css)
  Muestra exactamente los 2 proyectos insignia más recientes y botón con enlace hacia /proyectos
--}}
@php
    $displayRows = [
        [
            'num' => '01',
            'title' => 'Next in Line Management',
            'subtitle' => 'Conceptualización UI/UX en Figma + Custom Theme fluido en PHP nativo',
            'url' => 'https://nextinlinemanagement.com/',
            'is_external' => true,
            'tags' => ['Figma UI/UX', 'Fluid CSS Tokens', 'WordPress'],
        ],
        [
            'num' => '02',
            'title' => 'Accésate',
            'subtitle' => 'Diseño de experiencia web (UX/UI) y arquitectura de componentes Blade',
            'url' => 'https://accesate.com/es',
            'is_external' => true,
            'tags' => ['Laravel Blade', 'UX/UI Design', 'Modular'],
        ],
    ];
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

        {{-- Lista Editorial tipo Dennis Snellenberg (2 Casos Más Recientes) --}}
        <div class="editorial-cases-stack border-top-subtle" data-reveal>
            @foreach ($displayRows as $row)
                <a href="{{ $row['url'] }}" 
                   @if(!empty($row['is_external'])) target="_blank" rel="noopener noreferrer" @endif
                   class="project-editorial-row" 
                   data-magnetic data-magnetic-strength="0.15">
                    <div class="row align-items-center g-3">
                        <div class="col-12 col-md-1 font-mono text-fluid-sm text-muted">
                            {{ $row['num'] }}
                        </div>
                        <div class="col-12 col-md-6">
                            <h3 class="font-heading text-fluid-h3 text-primary row-title-accent mb-xs">
                                {{ $row['title'] }}
                            </h3>
                            <span class="text-fluid-sm text-secondary fw-light">
                                {{ $row['subtitle'] }}
                            </span>
                        </div>
                        <div class="col-12 col-md-4 d-flex flex-wrap gap-2">
                            @foreach ($row['tags'] as $tag)
                                <span class="data-chip">{{ $tag }}</span>
                            @endforeach
                        </div>
                        <div class="col-12 col-md-1 text-end d-none d-md-block">
                            <span class="btn-pill-arrow-circle row-arrow-shift">&nearr;</span>
                        </div>
                    </div>
                </a>
            @endforeach
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
