@extends('layouts.app')

@section('title', '#' . $tag->name . ' — Blog — ' . config('app.name'))
@section('meta_description', 'Ensayos y artículos técnicos especializados sobre #' . $tag->name . ' en el blog de Mario Joaquín Galicia Blanco.')
@section('canonical', route('public.content.tag', [$cpt->public_route_slug, $tag->slug]))
@section('og_title', '#' . $tag->name . ' — Blog — ' . config('app.name'))
@section('og_description', 'Artículos técnicos indexados bajo la etiqueta #' . $tag->name . '.')
@section('og_type', 'website')
@section('namespace', 'blog-tag')

@push('head')
{{-- Datos Estructurados Schema.org (BreadcrumbList & CollectionPage) --}}
@php
    $breadcrumbSchema = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => 'Inicio',
                'item' => route('home'),
            ],
            [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => 'Blog',
                'item' => route('public.content.index', $cpt->public_route_slug),
            ],
            [
                '@type' => 'ListItem',
                'position' => 3,
                'name' => '#' . $tag->name,
                'item' => route('public.content.tag', [$cpt->public_route_slug, $tag->slug]),
            ],
        ],
    ];

    $collectionSchema = [
        '@context' => 'https://schema.org',
        '@type' => 'CollectionPage',
        'name' => '#' . $tag->name . ' — Blog — ' . config('app.name'),
        'description' => 'Artículos técnicos indexados bajo la etiqueta #' . $tag->name . '.',
        'url' => route('public.content.tag', [$cpt->public_route_slug, $tag->slug]),
        'inLanguage' => 'es',
        'about' => [
            '@type' => 'Thing',
            'name' => $tag->name,
        ],
        'publisher' => [
            '@type' => 'Person',
            'name' => 'Mario Joaquín Galicia Blanco',
            'url' => route('home'),
        ],
    ];
@endphp
<script type="application/ld+json">
{!! json_encode($breadcrumbSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
</script>
<script type="application/ld+json">
{!! json_encode($collectionSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
</script>
@endpush

@section('content')
<section class="container py-3xl" style="min-height: 100vh;">
    {{-- Breadcrumbs Dedicados de 3 Niveles con Altura Fija de 24px --}}
    <div class="mb-xl" id="blog-header-block">
        <div class="mb-sm">
            <x-breadcrumbs :items="[
                ['label' => 'Inicio', 'url' => route('home')],
                ['label' => 'Blog', 'url' => route('public.content.index', $cpt->public_route_slug)],
                ['label' => '#' . $tag->name, 'url' => null]
            ]" />
        </div>
        <div class="d-flex align-items-center gap-3 mb-sm">
            <h1 class="h2 font-heading fw-bold m-0" data-reveal>#{{ $tag->name }}</h1>
            <span class="data-chip font-mono text-fluid-xs">{{ $total }} {{ $total === 1 ? 'artículo' : 'artículos' }}</span>
        </div>
        <p class="text-fluid-lg text-muted" style="max-width: 60ch;" data-reveal>
            Artículos y ensayos técnicos indexados bajo la etiqueta #{{ $tag->name }}.
        </p>
    </div>

    {{-- Filtro Horizontal de Etiquetas (Pill Rail Voluminoso Persistente de Tags) --}}
    @if ($tags->isNotEmpty())
        <nav class="blog-pill-rail mb-xl" id="blog-pills-nav" aria-label="Filtro de etiquetas">
            <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" 
               class="editorial-pill" 
               data-magnetic>
                <span>Todos</span>
                <sup class="pill-count">{{ $totalAll }}</sup>
            </a>

            @foreach ($tags as $t)
                <a href="{{ route('public.content.tag', [$cpt->public_route_slug, $t->slug]) }}" 
                   class="editorial-pill {{ $tag->id === $t->id ? 'is-active' : '' }}" 
                   data-magnetic>
                    <span>#{{ $t->name }}</span>
                    <sup class="pill-count">{{ $t->contents_count }}</sup>
                </a>
            @endforeach
        </nav>
    @endif

    {{-- Cuadrícula a 2 Columnas idéntica a Proyectos y Categorías --}}
    <div class="row g-4 g-lg-5" id="blog-posts-grid" data-layout="airy">
        @if ($contents->isNotEmpty())
            @include('public.content.blog.partials.card-item', ['contents' => $contents, 'cpt' => $cpt])
        @else
            <div class="col-12 py-5 text-center text-muted">
                <p class="text-fluid-lg mb-2">No hay artículos disponibles bajo la etiqueta #{{ $tag->name }}.</p>
                <p class="text-fluid-sm">
                    <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" class="text-brand">
                        Ver todos los artículos del blog
                    </a>
                </p>
            </div>
        @endif
    </div>

    {{-- Sentinel y Estados de Carga Diferida (Infinite Scroll 5 + 10 para Etiqueta) --}}
    <div id="blog-scroll-sentinel" 
         data-next-page="{{ $nextPage ?? '' }}" 
         data-has-more="{{ $hasMore ? 'true' : 'false' }}" 
         data-endpoint="{{ route('public.content.tag', [$cpt->public_route_slug, $tag->slug]) }}"
         data-tag="{{ $tag->slug }}"
         style="height: 10px; width: 100%; pointer-events: none;"></div>

    <div id="blog-scroll-loader" class="py-4 text-center d-none" aria-live="polite">
        <div class="d-inline-flex align-items-center gap-2 font-mono text-fluid-xs text-muted">
            <span class="spinner-grow spinner-grow-sm text-brand" role="status" style="width: 12px; height: 12px;"></span>
            <span>Cargando más ensayos de #{{ $tag->name }}...</span>
        </div>
    </div>

    <div id="blog-scroll-end" class="py-5 text-center {{ $hasMore ? 'd-none' : '' }}">
        <span class="font-mono text-fluid-xs text-muted opacity-50">&bull; Fin de los ensayos con la etiqueta #{{ $tag->name }} &bull;</span>
    </div>
</section>
@endsection
