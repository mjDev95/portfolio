@extends('layouts.app')

@section('title', $category->name . ' — Blog — ' . config('app.name'))
@section('meta_description', $category->description ?: 'Ensayos y artículos técnicos especializados sobre ' . $category->name . ' en el blog de Mario Joaquín Galicia Blanco.')
@section('canonical', route('public.content.category', [$cpt->public_route_slug, $category->slug]))
@section('og_title', $category->name . ' — Blog — ' . config('app.name'))
@section('og_description', $category->description ?: 'Artículos técnicos sobre ' . $category->name . '.')
@section('og_type', 'website')
@section('namespace', 'blog-category')

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
                'name' => $category->name,
                'item' => route('public.content.category', [$cpt->public_route_slug, $category->slug]),
            ],
        ],
    ];

    $collectionSchema = [
        '@context' => 'https://schema.org',
        '@type' => 'CollectionPage',
        'name' => $category->name . ' — Blog — ' . config('app.name'),
        'description' => $category->description ?: 'Artículos técnicos sobre ' . $category->name . '.',
        'url' => route('public.content.category', [$cpt->public_route_slug, $category->slug]),
        'inLanguage' => 'es',
        'about' => [
            '@type' => 'Thing',
            'name' => $category->name,
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
                ['label' => $category->name, 'url' => null]
            ]" />
        </div>
        <h1 class="h2 mb-sm font-heading fw-bold" data-reveal>{{ $category->name }}</h1>
    </div>

    {{-- Filtro Horizontal de Categorías (Pill Rail Voluminoso Persistente con x-btn) --}}
    @if ($categories->isNotEmpty())
        <nav class="blog-pill-rail d-flex align-items-center flex-wrap mx-0 w-100 mb-xl" id="blog-pills-nav" aria-label="Filtro de categorías">
            <x-btn :href="route('public.content.index', $cpt->public_route_slug)"
                   :active="empty($selectedCategory)"
                   size="sm">
                <span>Todos</span>
                <sup class="pill-count">{{ $categories->sum('contents_count') }}</sup>
            </x-btn>

            @foreach ($categories as $cat)
                <x-btn :href="route('public.content.category', [$cpt->public_route_slug, $cat->slug])"
                       :active="$selectedCategory === $cat->slug"
                       size="sm">
                    <span>{{ $cat->name }}</span>
                    <sup class="pill-count">{{ $cat->contents_count }}</sup>
                </x-btn>
            @endforeach
        </nav>
    @endif

    {{-- Cuadrícula a 2 Columnas idéntica a Proyectos con carga inicial de 5 posts --}}
    <div class="row g-4 g-lg-5" id="blog-posts-grid" data-layout="airy">
        @if ($contents->isNotEmpty())
            @include('public.content.blog.partials.card-item', ['contents' => $contents, 'cpt' => $cpt])
        @else
            <div class="col-12 py-5 text-center text-muted">
                <p class="text-fluid-lg mb-2">No hay artículos disponibles en {{ $category->name }}.</p>
                <p class="text-fluid-sm">
                    <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" class="text-brand">
                        Ver todos los artículos del blog
                    </a>
                </p>
            </div>
        @endif
    </div>

    {{-- Sentinel y Estados de Carga Diferida (Infinite Scroll 5 + 10 para Categoría) --}}
    <div id="blog-scroll-sentinel" 
         data-next-page="{{ $nextPage ?? '' }}" 
         data-has-more="{{ $hasMore ? 'true' : 'false' }}" 
         data-endpoint="{{ route('public.content.category', [$cpt->public_route_slug, $category->slug]) }}"
         data-category="{{ $category->slug }}"
         style="height: 10px; width: 100%; pointer-events: none;"></div>

    <div id="blog-scroll-loader" class="py-4 text-center d-none" aria-live="polite">
        <div class="d-inline-flex align-items-center gap-2 font-mono text-fluid-xs text-muted">
            <span class="spinner-grow spinner-grow-sm text-brand" role="status" style="width: 12px; height: 12px;"></span>
            <span>Cargando más ensayos de {{ $category->name }}...</span>
        </div>
    </div>

    <div id="blog-scroll-end" class="py-5 text-center {{ $hasMore ? 'd-none' : '' }}">
        <span class="font-mono text-fluid-xs text-muted opacity-50">&bull; Fin de los ensayos en {{ $category->name }} &bull;</span>
    </div>
</section>
@endsection
