@extends('layouts.app')

@section('title', 'Proyectos — ' . config('app.name'))
@section('meta_description', 'Portafolio de proyectos y casos de éxito en arquitectura WordPress, sistemas de diseño y desarrollo web de alto impacto.')
@section('namespace', 'projects-index')

@section('content')
<section class="container py-3xl" style="min-height: 100vh;">
    {{-- Breadcrumbs & Header --}}
    <div class="mb-xl">
        <div class="mb-sm">
            <x-breadcrumbs :items="[
                ['label' => 'Inicio', 'url' => route('home')],
                ['label' => 'Proyectos', 'url' => null]
            ]" />
        </div>
        <h1 class="h2 mb-sm font-heading fw-bold" data-reveal>Proyectos</h1>
        <p class="text-fluid-lg text-muted" style="max-width: 60ch;" data-reveal>
            {{ $cpt->description ?: 'Portafolio selecto de portales institucionales, plataformas de alto tráfico, arquitecturas headless y experiencias web fluidas.' }}
        </p>
    </div>

    {{-- Grid a 2 Columnas en Container (Solo Proyectos de la Base de Datos) --}}
    <div class="row g-4 g-lg-5" data-layout="airy">
        @forelse ($contents as $item)
            @php
                $itemThumb = $item->thumbnail;
                $categoryName = $item->categories->first()?->name ?? ($cpt->singular_name ?? 'Proyecto');
                $clientName = $item->custom_values['client'] ?? null;
                $detailUrl = route('public.content.show', [$cpt->public_route_slug, $item->slug]);
            @endphp
            <div class="col-12 col-md-6" data-reveal>
                <a href="{{ $detailUrl }}" 
                   class="project-showcase-card d-block text-decoration-none" 
                   data-project-card
                   data-flip-card
                   data-flip-id="project-{{ $item->slug }}"
                   data-magnetic data-magnetic-strength="0.04">
                    <div class="project-showcase-media card-media-wrapper position-relative overflow-hidden"
                         data-flip-id="project-{{ $item->slug }}"
                         data-flip-element="image">
                        @if ($itemThumb)
                            <img src="{{ $itemThumb->url }}" 
                                 alt="{{ $item->title }}" 
                                 class="project-showcase-img w-100 h-100 object-fit-cover d-block"
                                 loading="lazy">
                        @else
                            <div class="project-placeholder-media w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4">
                                <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                                    {{ $item->title }}
                                </span>
                            </div>
                        @endif
                    </div>
                    <div class="project-showcase-body">
                            <div class="project-category-subtitle project-card-sub-details-wrapper-v3 bottom">
                                <div class="d-flex align-items-center details h5">
                                    <div>{{ $clientName }}</div>
                                    <div class="text-divider project-card-v3 mx-2"></div>
                                    <div>{{ $categoryName }} </div>
                                </div>
                            </div>
                        
                        <h2 class="project-title-heading h3 mt-2">{{ $item->title }}</h2>                    
                    </div>
                </a>
            </div>
        @empty
            <div class="col-12 py-5 text-center text-muted">
                <p class="text-fluid-lg mb-2">No hay proyectos disponibles en la base de datos.</p>
                <p class="text-fluid-sm">Vuelve a consultar pronto.</p>
            </div>
        @endforelse
    </div>

    @if ($contents->hasPages())
        <div class="mt-2xl d-flex justify-content-center">
            {{ $contents->links() }}
        </div>
    @endif
</section>
@endsection
