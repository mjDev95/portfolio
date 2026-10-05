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
    $featuredImage = $content->thumbnail ?: $content->hero_image;
    $readingTime = $content->custom_values['reading_time'] ?? (ceil(str_word_count(strip_tags($content->body ?? '')) / 200) ?: 5);
    $category = $content->categories->first();
    $categoryName = $category?->name ?? 'Ensayos';
    $publishedDate = $content->published_at ? $content->published_at->toIso8601String() : $content->created_at->toIso8601String();
    $modifiedDate = $content->updated_at ? $content->updated_at->toIso8601String() : $publishedDate;

    // Perfil dinámico del autor desde la base de datos
    $author = $content->user ?? \App\Models\User::first();
    $authorName = $author?->name ?? 'Mario Joaquín Galicia Blanco';
    $authorAvatar = $author?->avatar_url ?? asset('images/avatar.png');
    $authorInitials = $author?->initials ?? 'MJ';
    $authorHeadline = $author?->headline ?? 'WordPress Architect • Creative Developer';
    $authorBio = $author?->bio ?: 'Creative Developer & WordPress Architect enfocado en la construcción de plataformas web de alto rendimiento, sistemas de diseño fluidos y experiencias interactivas memorables.';

    // Resolución de CTA Dinámico desde Base de Datos con Fallback Contextual Inteligente
    $custom = $content->custom_values ?? [];
    $ctaHeading = !empty($custom['cta_heading']) 
        ? $custom['cta_heading'] 
        : "¿Necesitas implementar una solución en {$categoryName} para tu marca?";
    $ctaDescription = !empty($custom['cta_description']) 
        ? $custom['cta_description'] 
        : "Como Creative Developer & WordPress Architect, colaboro con marcas y agencias diseñando y construyendo plataformas web fluidas, seguras y de alto impacto técnico.";
    $ctaButtonText = !empty($custom['cta_button_text']) 
        ? $custom['cta_button_text'] 
        : "Conversar sobre un proyecto";
    $ctaButtonUrl = !empty($custom['cta_button_url']) 
        ? $custom['cta_button_url'] 
        : route('contact');
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
            'name' => $authorName,
            'jobTitle' => $authorHeadline,
            'url' => route('home'),
        ],
        'publisher' => [
            '@type' => 'Person',
            'name' => $authorName,
            'url' => route('home'),
        ],
        'image' => $featuredImage ? $featuredImage->url : null,
    ]);
@endphp
<script type="application/ld+json">
{!! json_encode($schemaData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
</script>
@endpush

@section('content')
{{-- Barra de Progreso de Lectura Cinemática (2px fixed top) --}}
<div class="reading-progress-bar position-fixed top-0 left-0 w-100" id="reading-progress-bar" aria-hidden="true"></div>

<article class="py-3xl" style="min-height: 100vh;">
    {{-- Breadcrumbs Estables (24px fijo para GSAP Flip) --}}
    <div class="container mb-lg" data-detail-breadcrumbs>
        <x-breadcrumbs :items="[
            ['label' => 'Inicio', 'url' => route('home')],
            ['label' => 'Blog', 'url' => route('public.content.index', $cpt->public_route_slug)],
            ['label' => $content->title, 'url' => null]
        ]" />
    </div>

    {{-- Imagen Destacada Principal (Ancho Panorámico Extendido con GSAP Flip) --}}
    <div class="container-wide mb-2xl">
        @if ($featuredImage)
            <div class="media-wrap hero-media-wrapper w-100 position-relative overflow-hidden aspect-16-9 bg-surface border-subtle"
                 data-flip-id="post-{{ $content->slug }}"
                 data-flip-element="image">
                <img src="{{ $featuredImage->url }}"
                     alt="{{ $featuredImage->alt ?: ($featuredImage->caption ?: $content->title) }}"
                     title="{{ $featuredImage->title ?: $content->title }}"
                     class="img-fluid object-fit-cover w-100 h-100 d-block"
                     loading="eager">
            </div>
        @else
            <div class="media-wrap hero-media-wrapper w-100 position-relative overflow-hidden d-flex align-items-center justify-content-center bg-surface-subtle border-subtle"
                 data-flip-id="post-{{ $content->slug }}"
                 data-flip-element="image"
                 style="aspect-ratio: 21/9; min-height: 200px;">
                <div class="text-center p-4 font-mono text-fluid-xs text-muted text-uppercase tracking-wider">
                    <span class="text-brand fw-semibold">{{ $categoryName }}</span> &bull; <span>Ensayo Técnico</span>
                </div>
            </div>
        @endif
    </div>

    {{-- Contenedor Editorial Central (Lectura Óptima y Cabecera) --}}
    <div class="container">
        {{-- Cabecera Monumental del Artículo --}}
        <header class="editorial-article-header mb-2xl" data-detail-header>
        <h1 class="h1 font-heading fw-bold text-primary text-break mb-sm" data-flip-text style="letter-spacing: -0.035em;">
            {{ $content->title }}
        </h1>

        <div class="d-flex flex-wrap align-items-center gap-3 mb-lg">
            <div class="d-flex align-items-center gap-2 font-mono text-fluid-xs text-muted text-uppercase tracking-wider">
                @if ($category)
                    <a href="{{ route('public.content.category', [$cpt->public_route_slug, $category->slug]) }}" class="text-brand fw-semibold text-decoration-none transition-opacity hover:opacity-100" data-magnetic>
                        {{ $categoryName }}
                    </a>
                @else
                    <span class="text-brand fw-semibold">{{ $categoryName }}</span>
                @endif
                <span>&bull;</span>
                <span>{{ $content->published_at ? $content->published_at->format('d M Y') : 'Reciente' }}</span>
            </div>

            <div class="d-flex align-items-center">
                <x-btn id="btn-open-share-modal" 
                       modal="share" 
                       :share-title="$content->title" 
                       :share-type="$cpt->singular_name ?? 'Ensayo'" 
                       icon="share" 
                       icon-position="left"
                       size="sm">
                    Compartir
                </x-btn>
            </div>
        </div>

        @if ($content->excerpt)
            <p class="text-fluid-lg text-secondary text-break mb-xl" data-flip-text>
                {{ $content->excerpt }}
            </p>
        @endif
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

                    @if ($content->tags->isNotEmpty())
                        <div class="mt-4 pt-3 border-top-subtle">
                            <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider d-block mb-2">Temas clave</span>
                            <div class="d-flex flex-wrap gap-1">
                                @foreach ($content->tags as $tag)
                                    <a href="{{ route('public.content.tag', [$cpt->public_route_slug, $tag->slug]) }}" 
                                       class="data-chip font-mono text-fluid-xs text-decoration-none transition-opacity hover-opacity" 
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

            {{-- Bloque de Conversión Profesional (CTA Dinámico desde BD) --}}
            {{-- Sección Editorial de Llamada a la Acción (CTA) -- Abierta y sin caja contenedora --}}
            <section class="mt-3xl pt-2xl border-top-subtle" data-reveal>
                <div>
                    <span class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider d-block mb-3">
                        Colaboración Profesional &bull; {{ $categoryName }}
                    </span>
                    <h3 class="h3 font-heading fw-bold text-primary tracking-tight mb-3">
                        {{ $ctaHeading }}
                    </h3>
                    <p class="text-fluid-base text-secondary mb-3" style="max-width: 62ch;">
                        {{ $ctaDescription }}
                    </p>

                    {{-- Firma y Atribución del Autor en el CTA --}}
                    <div class="mb-sm">
                        <span class="d-block font-sans text-fluid-sm fw-semibold text-primary">{{ $authorName }}</span>
                        <span class="d-block font-mono text-fluid-xs text-muted">{{ $authorHeadline }}</span>
                    </div>

                    <div class="pt-1">
                        <x-btn href="{{ $ctaButtonUrl }}" 
                               icon="nearr" 
                               data-magnetic>
                            {{ $ctaButtonText }}
                        </x-btn>
                    </div>
                </div>
            </section>
        </main>
    </div>

    {{-- Sección "Otros artículos" con Cards del Archive --}}
    @if (isset($otherPosts) && $otherPosts->isNotEmpty())
        <section class="mt-3xl pt-xl">
            <div class="d-flex align-items-center justify-content-between mb-xl" data-reveal>
                <h2 class="h2 font-heading fw-bold text-primary m-0" style="letter-spacing: -0.03em;">
                    Otros artículos
                </h2>
                <x-btn href="{{ route('public.content.index', $cpt->public_route_slug) }}" 
                       icon="rarr" 
                       size="md"
                       data-magnetic>
                    Ver todos
                </x-btn>
            </div>
            <div class="row g-4 g-lg-5">
                @include('public.content.blog.partials.card-item', ['contents' => $otherPosts, 'cpt' => $cpt])
            </div>
        </section>
    @else
        <div class="mt-3xl pt-xl border-top-subtle d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 font-mono text-fluid-xs text-muted" data-reveal>
            <span>Fin de los ensayos recientes en esta serie</span>
            <x-btn href="{{ route('public.content.index', $cpt->public_route_slug) }}" 
                   icon="rarr" 
                   data-magnetic>
                Explorar catálogo completo de artículos
            </x-btn>
        </div>
    @endif
    </div>
</article>
@endsection

