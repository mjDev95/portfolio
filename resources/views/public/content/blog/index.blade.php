@extends('layouts.app')

@section('title', 'Blog — ' . config('app.name'))
@section('meta_description', 'Ensayos técnicos sobre arquitectura WordPress, Web Performance, sistemas de diseño fluidos y desarrollo web creativo de alto impacto.')
@section('canonical', url()->current())
@section('og_title', 'Blog — ' . config('app.name'))
@section('og_description', 'Ensayos técnicos sobre arquitectura WordPress, Web Performance y desarrollo creativo.')
@section('og_type', 'blog')
@section('namespace', 'blog-index')

@push('head')
{{-- Datos Estructurados Schema.org (Blog / CollectionPage) --}}
@php
    $blogSchema = [
        '@context' => 'https://schema.org',
        '@type' => 'Blog',
        'name' => 'Blog — ' . config('app.name'),
        'description' => 'Ensayos técnicos sobre arquitectura WordPress, Web Performance, sistemas de diseño fluidos y desarrollo web creativo de alto impacto.',
        'url' => url()->current(),
        'inLanguage' => 'es',
        'author' => [
            '@type' => 'Person',
            'name' => 'Mario Joaquín Galicia Blanco',
            'url' => route('home'),
        ],
    ];
@endphp
<script type="application/ld+json">
{!! json_encode($blogSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
</script>
@endpush

@section('content')
<section class="container py-3xl" style="min-height: 100vh;">
    {{-- Breadcrumbs & Header alineados con la estética de Proyectos --}}
    <div class="mb-xl" id="blog-header-block">
        <div class="mb-sm">
            <x-breadcrumbs :items="[
                ['label' => 'Inicio', 'url' => route('home')],
                ['label' => 'Blog', 'url' => null]
            ]" />
        </div>
        <h1 class="h2 mb-sm font-heading fw-bold" data-reveal>Blog</h1>
    </div>

    {{-- Filtro Horizontal de Categorías (Pill Rail Voluminoso Persistente) --}}
    @if ($categories->isNotEmpty())
        <nav class="blog-pill-rail mb-xl" id="blog-pills-nav" aria-label="Filtro de categorías">
            <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" 
               class="editorial-pill {{ empty($selectedCategory) ? 'is-active' : '' }}" 
               data-magnetic>
                <span>Todos</span>
                <sup class="pill-count">{{ $total }}</sup>
            </a>

            @foreach ($categories as $cat)
                <a href="{{ route('public.content.category', [$cpt->public_route_slug, $cat->slug]) }}" 
                   class="editorial-pill {{ $selectedCategory === $cat->slug ? 'is-active' : '' }}" 
                   data-magnetic>
                    <span>{{ $cat->name }}</span>
                    <sup class="pill-count">{{ $cat->contents_count }}</sup>
                </a>
            @endforeach
        </nav>
    @endif

    {{-- Cuadrícula a 2 Columnas idéntica a Proyectos con carga inicial de 5 posts --}}
    <div class="row g-4 g-lg-5" id="blog-posts-grid" data-layout="airy">
        @if ($contents->isNotEmpty())
            @include('public.content.blog.partials.card-item', ['contents' => $contents, 'cpt' => $cpt])
        @else
            <div class="col-12 py-5 text-center text-muted">
                <p class="text-fluid-lg mb-2">No hay artículos disponibles en esta categoría.</p>
                <p class="text-fluid-sm">
                    <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" class="text-brand">
                        Ver todos los artículos
                    </a>
                </p>
            </div>
        @endif
    </div>

    {{-- Sentinel y Estados de Carga Diferida (Infinite Scroll 5 + 10) --}}
    <div id="blog-scroll-sentinel" 
         data-next-page="{{ $nextPage ?? '' }}" 
         data-has-more="{{ $hasMore ? 'true' : 'false' }}" 
         data-endpoint="{{ route('public.content.index', $cpt->public_route_slug) }}"
         data-category="{{ $selectedCategory ?? '' }}"
         style="height: 10px; width: 100%; pointer-events: none;"></div>

    <div id="blog-scroll-loader" class="py-4 text-center d-none" aria-live="polite">
        <div class="d-inline-flex align-items-center gap-2 font-mono text-fluid-xs text-muted">
            <span class="spinner-grow spinner-grow-sm text-brand" role="status" style="width: 12px; height: 12px;"></span>
            <span>Cargando más ensayos...</span>
        </div>
    </div>

    <div id="blog-scroll-end" class="py-5 text-center {{ $hasMore ? 'd-none' : '' }}">
        <span class="font-mono text-fluid-xs text-muted opacity-50">&bull; Fin del catálogo de ensayos &bull;</span>
    </div>
</section>
@endsection
