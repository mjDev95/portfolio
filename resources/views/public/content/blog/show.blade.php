@extends('layouts.app')

@section('title', ($content->seo_title ?: $content->title) . ' — Blog — ' . config('app.name'))
@section('meta_description', $content->seo_description ?: ($content->excerpt ?: 'Ensayo técnico sobre desarrollo web, arquitectura y diseño por Mario Joaquín Galicia Blanco.'))
@section('canonical', url()->current())
@section('og_title', ($content->seo_title ?: $content->title) . ' — ' . config('app.name'))
@section('og_description', $content->seo_description ?: $content->excerpt)
@section('og_type', 'article')
@section('namespace', 'blog-show')
@section('edit_url', route('admin.content.edit', [$cpt->slug, $content->id]))
@section('edit_label', 'Editar ' . ($cpt->singular_name ?? 'Artículo'))

@php
    $heroImage = $content->hero_image ?: $content->thumbnail;
    $readingTime = $content->custom_values['reading_time'] ?? (ceil(str_word_count(strip_tags($content->body ?? '')) / 200) ?: 5);
    $category = $content->categories->first();
    $categoryName = $category?->name ?? 'Ensayos';
    $publishedDate = $content->published_at ? $content->published_at->toIso8601String() : $content->created_at->toIso8601String();
    $modifiedDate = $content->updated_at ? $content->updated_at->toIso8601String() : $publishedDate;
@endphp

@push('head')
{{-- Datos Estructurados Schema.org (BlogPosting / TechArticle) --}}
@php
    $schemaData = array_filter([
        '@context' => 'https://schema.org',
        '@type' => 'TechArticle',
        'headline' => $content->title,
        'description' => $content->excerpt ?: $content->title,
        'inLanguage' => 'es',
        'datePublished' => $publishedDate,
        'dateModified' => $modifiedDate,
        'mainEntityOfPage' => [
            '@type' => 'WebPage',
            '@id' => url()->current(),
        ],
        'author' => [
            '@type' => 'Person',
            'name' => 'Mario Joaquín Galicia Blanco',
            'jobTitle' => 'WordPress Architect & Creative Developer',
            'url' => route('home'),
        ],
        'publisher' => [
            '@type' => 'Person',
            'name' => 'Mario Joaquín Galicia Blanco',
            'url' => route('home'),
        ],
        'image' => $heroImage ? $heroImage->url : null,
    ]);
@endphp
<script type="application/ld+json">
{!! json_encode($schemaData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
</script>
@endpush

@section('content')
{{-- Barra de Progreso de Lectura Cinemática (2px fixed top) --}}
<div class="reading-progress-bar" id="reading-progress-bar" aria-hidden="true"></div>

<article class="container py-3xl" style="min-height: 100vh;">
    {{-- Breadcrumbs Estables (24px fijo para GSAP Flip) --}}
    <div class="mb-lg" data-detail-breadcrumbs>
        <x-breadcrumbs :items="[
            ['label' => 'Inicio', 'url' => route('home')],
            ['label' => 'Blog', 'url' => route('public.content.index', $cpt->public_route_slug)],
            ['label' => $content->title, 'url' => null]
        ]" />
    </div>

    {{-- Hero Media Principal (Shared Element Transition con Flip) --}}
    @if ($heroImage)
        <div class="media-wrap hero-media-wrapper overflow-hidden mb-2xl"
             data-flip-id="post-{{ $content->slug }}"
             data-flip-element="image">
            <img src="{{ $heroImage->url }}"
                 alt="{{ $heroImage->alt ?: ($heroImage->caption ?: $content->title) }}"
                 title="{{ $heroImage->title ?: $content->title }}"
                 class="img-fluid object-fit-cover w-100 h-100 d-block"
                 loading="eager">
        </div>
    @else
        <div class="media-wrap hero-media-wrapper overflow-hidden mb-2xl d-flex align-items-center justify-content-center bg-surface-subtle border-subtle"
             data-flip-id="post-{{ $content->slug }}"
             data-flip-element="image"
             style="aspect-ratio: 21/9; min-height: 200px;">
            <div class="text-center p-4 font-mono text-fluid-xs text-muted text-uppercase tracking-wider">
                <span class="text-brand fw-semibold">{{ $categoryName }}</span> &bull; <span>Ensayo Técnico</span>
            </div>
        </div>
    @endif

    {{-- Cabecera Monumental del Artículo --}}
    <header class="editorial-article-header mb-2xl" data-detail-header>
        <h1 class="h1 font-heading fw-bold text-primary text-break mb-sm" data-flip-text style="letter-spacing: -0.035em;">
            {{ $content->title }}
        </h1>

        <div class="d-flex align-items-center gap-2 mb-lg font-mono text-fluid-xs text-muted text-uppercase tracking-wider">
            @if ($category)
                <a href="{{ route('public.content.category', [$cpt->public_route_slug, $category->slug]) }}" class="text-brand fw-semibold text-decoration-none hover-opacity" data-magnetic>
                    {{ $categoryName }}
                </a>
            @else
                <span class="text-brand fw-semibold">{{ $categoryName }}</span>
            @endif
            <span>&bull;</span>
            <span>{{ $content->published_at ? $content->published_at->format('d M Y') : 'Reciente' }}</span>
        </div>

        @if ($content->excerpt)
            <p class="text-fluid-lg text-secondary text-break mb-xl" style="max-width: 66ch;" data-flip-text>
                {{ $content->excerpt }}
            </p>
        @endif

        {{-- Rail de Autor & Acciones Rápidas del Artículo --}}
        <div class="author-actions-rail d-flex flex-wrap align-items-center justify-content-between gap-4 py-md border-top-subtle border-bottom-subtle">
            <div class="d-flex align-items-center gap-3">
                <div class="author-avatar-wrap">
                    <img src="{{ asset('images/avatar.png') }}" 
                         alt="Mario J. Galicia" 
                         class="author-avatar-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span class="author-avatar-fallback font-mono">MJ</span>
                </div>
                <div>
                    <span class="d-block font-sans text-fluid-sm fw-semibold text-primary">Mario Joaquín Galicia Blanco</span>
                    <span class="d-block font-mono text-fluid-xs text-muted">WordPress Architect &bull; Creative Developer</span>
                </div>
            </div>

            <div class="d-flex align-items-center gap-2">
                <button type="button" 
                        class="btn-social-share" 
                        id="btn-copy-article-url"
                        onclick="navigator.clipboard.writeText(window.location.href); const btn = this; btn.classList.add('is-copied'); setTimeout(() => btn.classList.remove('is-copied'), 2000);"
                        data-magnetic 
                        title="Copiar enlace del artículo">
                    <span class="share-label font-mono text-fluid-xs">Copiar enlace</span>
                    <span class="share-feedback font-mono text-fluid-xs">&check; Copiado</span>
                </button>

                <a href="https://twitter.com/intent/tweet?text={{ urlencode($content->title) }}&url={{ urlencode(url()->current()) }}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn-social-share" 
                   data-magnetic 
                   title="Compartir en X">
                    <span class="font-mono text-fluid-xs">&nearr; X</span>
                </a>

                <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ urlencode(url()->current()) }}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn-social-share" 
                   data-magnetic 
                   title="Compartir en LinkedIn">
                    <span class="font-mono text-fluid-xs">&nearr; LinkedIn</span>
                </a>
            </div>
        </div>
    </header>

    {{-- Layout Editorial a Doble Columna (TOC Sticky + Cuerpo de Lectura) --}}
    <div class="row g-4 g-lg-5 mb-3xl">
        {{-- Columna Lateral: Table of Contents & Ficha Rápida (Desktop) --}}
        <aside class="col-12 col-lg-4 col-xl-3 d-none d-lg-block">
            <div class="toc-sidebar-sticky">
                <div class="p-4 rounded-4 bg-surface-subtle border-subtle mb-4">
                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider d-block mb-3">
                        Índice del Ensayo
                    </span>
                    <nav id="toc-nav" class="toc-navigation">
                        <ul id="toc-list" class="toc-list list-unstyled mb-0 d-flex flex-column gap-2 font-sans text-fluid-xs">
                            {{-- Poblado dinámicamente vía JS con los h2 y h3 del artículo --}}
                            <li class="toc-placeholder text-muted font-mono text-fluid-xs">Generando índice...</li>
                        </ul>
                    </nav>
                </div>

                <div class="p-4 rounded-4 bg-surface-subtle border-subtle font-mono text-fluid-xs">
                    <span class="text-muted text-uppercase tracking-wider d-block mb-2">Estructura &bull; Datos</span>
                    <div class="d-flex justify-content-between py-1 border-bottom-subtle">
                        <span class="text-muted">Tiempo lectura:</span>
                        <span class="text-primary fw-semibold">{{ $readingTime }} minutos</span>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom-subtle">
                        <span class="text-muted">Categoría:</span>
                        <span class="text-brand fw-semibold">{{ $categoryName }}</span>
                    </div>
                    <div class="d-flex justify-content-between py-1">
                        <span class="text-muted">Formato:</span>
                        <span class="text-primary">Ensayo Técnico</span>
                    </div>

                    @if ($content->tags->isNotEmpty())
                        <div class="mt-3 pt-3 border-top-subtle">
                            <span class="text-muted text-uppercase tracking-wider d-block mb-2">Temas clave</span>
                            <div class="d-flex flex-wrap gap-1">
                                @foreach ($content->tags as $tag)
                                    <a href="{{ route('public.content.tag', [$cpt->public_route_slug, $tag->slug]) }}" 
                                       class="data-chip font-mono text-fluid-xs text-decoration-none transition-opacity hover:opacity-100" 
                                       data-magnetic>
                                        #{{ $tag->name }}
                                    </a>
                                @endforeach
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </aside>

        {{-- Columna Central: Contenido de Lectura (.prose-editorial) --}}
        <main class="col-12 col-lg-8 col-xl-9" data-detail-body>
            <div class="prose-editorial text-primary" id="article-prose-content">
                @if ($content->body)
                    {!! $content->body_html !!}
                @else
                    <p class="text-muted font-italic">Este artículo no cuenta con contenido extendido disponible.</p>
                @endif
            </div>

            {{-- Firma del Autor / Colophon Editorial --}}
            <section class="mt-3xl pt-2xl border-top-subtle" data-reveal>
                <div class="p-4 p-md-5 rounded-4 bg-surface-subtle border-subtle d-flex flex-column flex-md-row gap-4 align-items-md-center">
                    <div class="author-avatar-wrap author-avatar-lg flex-shrink-0">
                        <img src="{{ asset('images/avatar.png') }}" 
                             alt="Mario J. Galicia" 
                             class="author-avatar-img"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <span class="author-avatar-fallback font-mono">MJ</span>
                    </div>
                    <div>
                        <span class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider d-block mb-1">
                            Escrito por el Autor
                        </span>
                        <h4 class="h5 font-heading fw-bold text-primary mb-2">Mario Joaquín Galicia Blanco</h4>
                        <p class="text-fluid-sm text-secondary mb-3">
                            Especialista en arquitectura WordPress de alta escala, optimización de Core Web Vitals, sistemas de diseño fluidos y desarrollo web creativo. Disponible para consultoría y proyectos selectos.
                        </p>
                        <a href="{{ route('contact') }}" class="btn-pill-action text-decoration-none d-inline-flex" data-magnetic>
                            <span>Conversar sobre un proyecto</span>
                            <span class="btn-pill-arrow-circle">&nearr;</span>
                        </a>
                    </div>
                </div>
            </section>

            {{-- Cinematic Bridge al Siguiente Artículo ("Up Next") --}}
            @if (isset($nextPost) && $nextPost)
                @php
                    $nextThumb = $nextPost->thumbnail;
                    $nextCat = $nextPost->categories->first()?->name ?? 'Artículo';
                    $nextReadTime = $nextPost->custom_values['reading_time'] ?? 5;
                    $nextUrl = route('public.content.show', [$cpt->public_route_slug, $nextPost->slug]);
                @endphp
                <section class="mt-3xl pt-2xl border-top-subtle" data-reveal>
                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider d-block mb-3">
                        Siguiente Ensayo en el Catálogo &rarr;
                    </span>
                    <a href="{{ $nextUrl }}" 
                       class="blog-editorial-card d-block text-decoration-none border-subtle bg-surface-subtle overflow-hidden"
                       data-flip-card
                       data-flip-id="post-{{ $nextPost->slug }}"
                       data-magnetic data-magnetic-strength="0.03">
                        <div class="row g-0 align-items-center">
                            @if ($nextThumb)
                                <div class="col-12 col-md-4">
                                    <div class="position-relative overflow-hidden" 
                                         data-flip-id="post-{{ $nextPost->slug }}"
                                         data-flip-element="image"
                                         style="aspect-ratio: 16/10;">
                                        <img src="{{ $nextThumb->url }}" 
                                             alt="{{ $nextPost->title }}" 
                                             class="w-100 h-100 object-fit-cover blog-zoom-img">
                                    </div>
                                </div>
                            @endif
                            <div class="col-12 {{ $nextThumb ? 'col-md-8' : 'col-12' }} p-4 p-md-5 blog-editorial-card-body">
                                <div class="d-flex align-items-center gap-2 mb-2 font-mono text-fluid-xs text-muted text-uppercase tracking-wider">
                                    <span class="text-brand fw-semibold">{{ $nextCat }}</span>
                                    <span>&bull;</span>
                                    <span>{{ $nextReadTime }} min de lectura</span>
                                </div>
                                <h3 class="h4 font-heading fw-bold text-primary mb-2">{{ $nextPost->title }}</h3>
                                @if ($nextPost->excerpt)
                                    <p class="text-fluid-sm text-secondary line-clamp-2 mb-3">{{ $nextPost->excerpt }}</p>
                                @endif
                                <span class="text-brand font-mono text-fluid-xs fw-semibold d-inline-flex align-items-center gap-1">
                                    <span>Continuar leyendo</span> <span>&nearr;</span>
                                </span>
                            </div>
                        </div>
                    </a>
                </section>
            @endif
        </main>
    </div>
</article>
@endsection

