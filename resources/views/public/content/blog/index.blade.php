@extends('layouts.app')

@section('title', 'Blog Editorial — ' . config('app.name'))
@section('meta_description', 'Ensayos técnicos sobre arquitectura WordPress, Web Performance, sistemas de diseño fluidos y desarrollo web creativo de alto impacto.')
@section('canonical', url()->current())
@section('og_title', 'Blog Editorial — ' . config('app.name'))
@section('og_description', 'Ensayos técnicos sobre arquitectura WordPress, Web Performance y desarrollo creativo.')
@section('og_type', 'blog')
@section('namespace', 'blog-index')

@section('content')
<section class="container py-3xl" style="min-height: 100vh;">
    {{-- Breadcrumbs Estables (24px fijo para GSAP Flip) --}}
    <div class="mb-lg">
        <x-breadcrumbs :items="[
            ['label' => 'Inicio', 'url' => route('home')],
            ['label' => 'Blog', 'url' => null]
        ]" />
    </div>

    {{-- Hero Monumental del Blog --}}
    <header class="editorial-blog-hero mb-2xl" data-reveal>
        <span class="editorial-tag-accent font-mono text-fluid-xs text-uppercase tracking-wider d-block mb-sm">
            Ensayos Técnicos &bull; Pensamiento &bull; Arquitectura Digital
        </span>

        <h1 class="h1 font-heading fw-bold text-primary mb-md" style="letter-spacing: -0.035em;">
            Pensamiento, <span class="hero-statement-faded">Arquitectura &amp; Código.</span>
        </h1>

        <p class="text-fluid-lg text-secondary mb-xl" style="max-width: 62ch;">
            {{ $cpt->description ?: 'Reflexiones rigurosas sobre ingeniería de software en WordPress, optimización extrema de Core Web Vitals, sistemas de diseño fluidos y transiciones cinemáticas.' }}
        </p>

        {{-- Barra de Métricas Editoriales Vivas --}}
        <div class="editorial-live-bar d-flex flex-wrap align-items-center gap-3 font-mono text-fluid-xs text-muted border-top-subtle border-bottom-subtle py-sm">
            <div class="d-flex align-items-center gap-2">
                <span class="pulse-beacon bg-brand">
                    <span class="pulse-beacon-ping bg-brand"></span>
                </span>
                <span class="text-primary fw-semibold">{{ $contents->total() }} {{ $contents->total() === 1 ? 'Escrito' : 'Escritos' }}</span>
            </div>
            <span class="text-muted d-none d-sm-inline">&bull;</span>
            <div class="d-none d-sm-flex align-items-center gap-1.5">
                <span>Catálogo Activo</span>
                <span>({{ $categories->count() }} Categorías)</span>
            </div>
            <span class="text-muted ms-auto d-none d-md-inline">&bull;</span>
            <div class="ms-auto ms-md-0 d-flex align-items-center gap-1.5">
                <span class="text-muted">CDMX:</span>
                <span id="blog-header-clock" data-live-clock class="text-primary">--:--:-- CST</span>
            </div>
        </div>
    </header>

    {{-- Filtro Horizontal de Categorías (Pill Rail Interactivo) --}}
    @if ($categories->isNotEmpty())
        <nav class="blog-pill-rail mb-2xl" aria-label="Filtro de categorías" data-reveal>
            <div class="d-flex align-items-center gap-2 overflow-x-auto py-1">
                <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" 
                   class="data-chip {{ empty($selectedCategory) ? 'is-active' : '' }}" 
                   data-magnetic>
                    <span>Todos</span>
                    <span class="text-muted opacity-75">({{ $contents->total() }})</span>
                </a>

                @foreach ($categories as $cat)
                    <a href="{{ route('public.content.index', [$cpt->public_route_slug, 'categoria' => $cat->slug]) }}" 
                       class="data-chip {{ $selectedCategory === $cat->slug ? 'is-active' : '' }}" 
                       data-magnetic>
                        <span>{{ $cat->name }}</span>
                        <span class="text-muted opacity-75">({{ $cat->contents_count }})</span>
                    </a>
                @endforeach
            </div>
        </nav>
    @endif

    {{-- Composición Asimétrica de Publicaciones --}}
    @if ($contents->isNotEmpty())
        @php
            $leadArticle = $contents->first();
            $secondaryArticles = $contents->slice(1);
            $leadThumb = $leadArticle->thumbnail;
            $leadCategory = $leadArticle->categories->first()?->name ?? 'Arquitectura';
            $leadReadingTime = $leadArticle->custom_values['reading_time'] ?? (ceil(str_word_count(strip_tags($leadArticle->body ?? '')) / 200) ?: 5);
            $leadDetailUrl = route('public.content.show', [$cpt->public_route_slug, $leadArticle->slug]);
        @endphp

        {{-- 1. Lead Essay Monumental (Formato Panorámico 16:9) --}}
        <div class="mb-3xl" data-reveal>
            <article class="blog-feature-card border-subtle bg-surface-subtle overflow-hidden">
                <div class="row g-0 align-items-stretch">
                    <div class="col-12 col-lg-7">
                        <a href="{{ $leadDetailUrl }}" 
                           class="d-block h-100 position-relative overflow-hidden text-decoration-none"
                           data-flip-card
                           data-flip-id="post-{{ $leadArticle->slug }}"
                           data-magnetic data-magnetic-strength="0.03">
                            <div class="blog-feature-media w-100 h-100 position-relative overflow-hidden"
                                 data-flip-id="post-{{ $leadArticle->slug }}"
                                 data-flip-element="image">
                                @if ($leadThumb)
                                    <img src="{{ $leadThumb->url }}" 
                                         alt="{{ $leadArticle->title }}" 
                                         class="w-100 h-100 object-fit-cover d-block blog-zoom-img"
                                         loading="eager">
                                @else
                                    <div class="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-5 bg-surface text-muted font-mono text-fluid-xs text-uppercase tracking-wider">
                                        <span>{{ $leadCategory }}</span>
                                    </div>
                                @endif
                                <div class="blog-pill-floating font-mono text-fluid-xs">
                                    <span>Insignia &bull; 01</span>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-12 col-lg-5 d-flex flex-column justify-content-between p-4 p-lg-5">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-sm font-mono text-fluid-xs text-muted text-uppercase tracking-wider">
                                <span class="text-brand fw-semibold">{{ $leadCategory }}</span>
                                <span>&bull;</span>
                                <span>{{ $leadArticle->published_at ? $leadArticle->published_at->format('d M Y') : 'Reciente' }}</span>
                                <span>&bull;</span>
                                <span>{{ $leadReadingTime }} min lectura</span>
                            </div>

                            <h2 class="h3 font-heading fw-bold text-primary mb-md">
                                <a href="{{ $leadDetailUrl }}" class="text-decoration-none text-primary hover-text-secondary transition-colors">
                                    {{ $leadArticle->title }}
                                </a>
                            </h2>

                            @if ($leadArticle->excerpt)
                                <p class="text-fluid-base text-secondary line-clamp-3 mb-lg">
                                    {{ $leadArticle->excerpt }}
                                </p>
                            @endif
                        </div>

                        <div class="pt-md border-top-subtle d-flex align-items-center justify-content-between">
                            <a href="{{ $leadDetailUrl }}" 
                               class="btn-pill-action text-decoration-none" 
                               data-magnetic>
                                <span>Leer ensayo completo</span>
                                <span class="btn-pill-arrow-circle">&nearr;</span>
                            </a>
                            <span class="font-mono text-fluid-xs text-muted">#{{ $leadArticle->slug }}</span>
                        </div>
                    </div>
                </div>
            </article>
        </div>

        {{-- 2. Grilla Editorial Escalonada a 2 Columnas (Artículos Restantes) --}}
        @if ($secondaryArticles->isNotEmpty())
            <div class="row g-4 g-lg-5 mb-3xl">
                @foreach ($secondaryArticles as $index => $item)
                    @php
                        $thumb = $item->thumbnail;
                        $catName = $item->categories->first()?->name ?? 'Ingeniería';
                        $readTime = $item->custom_values['reading_time'] ?? (ceil(str_word_count(strip_tags($item->body ?? '')) / 200) ?: 4);
                        $detailUrl = route('public.content.show', [$cpt->public_route_slug, $item->slug]);
                        $orderNumber = str_pad($loop->iteration + 1, 2, '0', STR_PAD_LEFT);
                    @endphp
                    <div class="col-12 col-md-6" data-reveal>
                        <article class="blog-editorial-card h-100 d-flex flex-column border-subtle bg-surface-subtle overflow-hidden">
                            <a href="{{ $detailUrl }}" 
                               class="blog-card-media-link d-block position-relative overflow-hidden text-decoration-none"
                               data-flip-card
                               data-flip-id="post-{{ $item->slug }}"
                               data-magnetic data-magnetic-strength="0.04">
                                <div class="blog-card-media position-relative overflow-hidden"
                                     data-flip-id="post-{{ $item->slug }}"
                                     data-flip-element="image"
                                     style="aspect-ratio: 16/10;">
                                    @if ($thumb)
                                        <img src="{{ $thumb->url }}" 
                                             alt="{{ $item->title }}" 
                                             class="w-100 h-100 object-fit-cover d-block blog-zoom-img"
                                             loading="lazy">
                                    @else
                                        <div class="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4 bg-surface text-muted font-mono text-fluid-xs text-uppercase tracking-wider">
                                            <span>{{ $catName }}</span>
                                        </div>
                                    @endif
                                    <div class="editorial-index-badge font-mono text-fluid-xs">
                                        {{ $orderNumber }}
                                    </div>
                                </div>
                            </a>

                            <div class="p-4 d-flex flex-column flex-grow-1 justify-content-between">
                                <div>
                                    <div class="d-flex align-items-center gap-2 mb-2 font-mono text-fluid-xs text-muted text-uppercase tracking-wider">
                                        <span class="text-brand fw-semibold">{{ $catName }}</span>
                                        <span>&bull;</span>
                                        <span>{{ $readTime }} min</span>
                                    </div>

                                    <h3 class="h5 font-heading fw-bold text-primary mb-2 line-clamp-2">
                                        <a href="{{ $detailUrl }}" class="text-decoration-none text-primary hover-text-secondary transition-colors">
                                            {{ $item->title }}
                                        </a>
                                    </h3>

                                    @if ($item->excerpt)
                                        <p class="text-fluid-sm text-secondary mb-3 line-clamp-2">
                                            {{ $item->excerpt }}
                                        </p>
                                    @endif
                                </div>

                                <div class="pt-3 border-top-subtle d-flex align-items-center justify-content-between font-mono text-fluid-xs text-muted">
                                    <span>{{ $item->published_at ? $item->published_at->format('d M Y') : 'Publicado' }}</span>
                                    <a href="{{ $detailUrl }}" class="text-primary text-decoration-none d-inline-flex align-items-center gap-1 hover-text-brand transition-colors" data-magnetic>
                                        <span>Leer</span> <span>&nearr;</span>
                                    </a>
                                </div>
                            </div>
                        </article>
                    </div>
                @endforeach
            </div>
        @endif

        {{-- Paginación Editorial --}}
        @if ($contents->hasPages())
            <div class="mt-2xl d-flex justify-content-center" data-reveal>
                {{ $contents->links() }}
            </div>
        @endif
    @else
        <div class="py-5xl text-center text-muted border-subtle rounded-4 bg-surface-subtle" data-reveal>
            <p class="text-fluid-xl mb-2 text-primary font-heading">No se encontraron artículos.</p>
            <p class="text-fluid-base mb-4 text-secondary">No hay publicaciones disponibles en esta categoría.</p>
            <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" class="btn-pill-action text-decoration-none d-inline-flex" data-magnetic>
                <span>Ver todos los escritos</span>
                <span class="btn-pill-arrow-circle">&rarr;</span>
            </a>
        </div>
    @endif

    {{-- Cierre con CTA de Archivo Universal --}}
    <div class="mt-3xl" data-reveal>
        <x-cpt-archive-cta :cpt="$cpt" />
    </div>
</section>
@endsection
