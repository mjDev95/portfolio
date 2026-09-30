@extends('layouts.app')

@section('title', ($content->seo_title ?: $content->title) . ' — Proyectos — ' . config('app.name'))
@section('meta_description', $content->seo_description ?: ($content->excerpt ?: 'Caso de estudio: ' . $content->title))
@section('canonical', url()->current())
@section('og_title', ($content->seo_title ?: $content->title) . ' — ' . config('app.name'))
@section('og_description', $content->seo_description ?: $content->excerpt)
@section('og_type', 'article')
@section('namespace', 'content-show')
@section('edit_url', route('admin.content.edit', [$cpt->slug, $content->id]))
@section('edit_label', 'Editar ' . ($cpt->singular_name ?? 'Proyecto'))

@section('content')
<article class="container py-3xl" style="min-height: 100vh;">
    {{-- Breadcrumbs Estables (24px fijo para GSAP Flip) --}}
    <div class="mb-lg" data-detail-breadcrumbs>
        <x-breadcrumbs :items="[
            ['label' => 'Inicio', 'url' => route('home')],
            ['label' => 'Proyectos', 'url' => route('public.content.index', $cpt->public_route_slug)],
            ['label' => $content->title, 'url' => null]
        ]" />
    </div>

    @php
        $heroImage = $content->hero_image ?: $content->thumbnail;
        $custom = $content->custom_values ?? [];
        $client = $custom['client'] ?? null;
        $year = $custom['year'] ?? null;
        $role = $custom['role'] ?? null;
        $stack = $custom['stack'] ?? null;
        $metricsSummary = $custom['metrics_summary'] ?? null;
        $externalUrl = $custom['external_url'] ?? null;
        $githubUrl = $custom['github_url'] ?? null;
        $videoFacadeUrl = $custom['video_facade_url'] ?? null;
        $categoryName = $content->categories->first()?->name ?? ($cpt->singular_name ?? 'Proyecto');
    @endphp

    {{-- Hero Media Principal (Shared Element Transition con Flip) --}}
    @if ($videoFacadeUrl)
        <div class="media-wrap hero-media-wrapper overflow-hidden mb-2xl position-relative"
             data-video-facade="{{ $videoFacadeUrl }}"
             data-flip-id="project-{{ $content->slug }}"
             data-flip-element="image"
             style="cursor: pointer; background: #000;">
            @if ($heroImage)
                <img src="{{ $heroImage->url }}"
                     alt="{{ $heroImage->alt ?: ($heroImage->caption ?: $content->title) }}"
                     title="{{ $heroImage->title ?: $content->title }}"
                     class="img-fluid object-fit-cover w-100 h-100 d-block">
            @endif
        </div>
    @elseif ($heroImage)
        <div class="media-wrap hero-media-wrapper overflow-hidden mb-2xl"
             data-flip-id="project-{{ $content->slug }}"
             data-flip-element="image">
            <img src="{{ $heroImage->url }}"
                 alt="{{ $heroImage->alt ?: ($heroImage->caption ?: $content->title) }}"
                 title="{{ $heroImage->title ?: $content->title }}"
                 class="img-fluid object-fit-cover w-100 h-100 d-block">
        </div>
    @endif

    {{-- Cabecera Editorial del Caso de Estudio --}}
    <header class="mb-2xl" data-reveal data-detail-header>
        <div class="d-flex align-items-center gap-2 mb-sm text-fluid-xs font-mono text-muted text-uppercase tracking-wider">
            @if ($client)
                <span class="text-primary fw-semibold">{{ $client }}</span>
                <span class="text-muted">&bull;</span>
            @endif
            @if ($year)
                <span>{{ $year }}</span>
                <span class="text-muted">&bull;</span>
            @endif
            <span class="text-brand">{{ $categoryName }}</span>
        </div>

        <h1 class="h1 font-heading fw-bold text-primary text-break" data-flip-text>{{ $content->title }}</h1>

        @if (!empty($custom['subtitle']))
            <p class="text-fluid-lg text-secondary mt-sm text-break" style="max-width: 64ch;" data-flip-text>
                {{ $custom['subtitle'] }}
            </p>
        @elseif ($content->excerpt)
            <p class="text-fluid-lg text-secondary mt-sm text-break" style="max-width: 64ch;" data-flip-text>
                {{ $content->excerpt }}
            </p>
        @endif

        {{-- Taxonomías & Chips de Tecnologías --}}
        <div class="d-flex flex-wrap gap-2 align-items-center mt-md">
            @foreach ($content->categories as $category)
                <span class="data-chip">
                    {{ $category->name }}
                </span>
            @endforeach

            @if (!empty($stack))
                @foreach (array_filter(array_map('trim', explode(',', $stack))) as $tech)
                    <span class="data-chip font-mono text-fluid-xs">
                        {{ $tech }}
                    </span>
                @endforeach
            @endif

            @foreach ($content->tags as $tag)
                <span class="text-fluid-xs text-muted font-mono">#{{ $tag->name }}</span>
            @endforeach
        </div>
    </header>

    {{-- Ficha Técnica Editorial con Divisores Hairline --}}
    @if ($client || $role || $year || $externalUrl || $githubUrl)
        <section class="border-top-subtle border-bottom-subtle py-xl mb-2xl" data-reveal>
            <div class="row row-cols-2 row-cols-md-4 g-4 font-mono">
                @if ($client)
                    <div class="col">
                        <span class="d-block text-fluid-xs text-muted text-uppercase tracking-wider mb-1">Cliente</span>
                        <span class="text-fluid-sm text-primary fw-semibold">{{ $client }}</span>
                    </div>
                @endif

                @if ($role)
                    <div class="col">
                        <span class="d-block text-fluid-xs text-muted text-uppercase tracking-wider mb-1">Rol / Especialidad</span>
                        <span class="text-fluid-sm text-primary fw-semibold">{{ $role }}</span>
                    </div>
                @endif

                @if ($year)
                    <div class="col">
                        <span class="d-block text-fluid-xs text-muted text-uppercase tracking-wider mb-1">Año de Entrega</span>
                        <span class="text-fluid-sm text-primary fw-semibold">{{ $year }}</span>
                    </div>
                @endif

                @if ($externalUrl || $githubUrl)
                    <div class="col">
                        <span class="d-block text-fluid-xs text-muted text-uppercase tracking-wider mb-1">Accesos Directos</span>
                        <div class="d-flex flex-column gap-1 text-fluid-sm">
                            @if ($externalUrl)
                                <a href="{{ $externalUrl }}" target="_blank" rel="noopener noreferrer" class="text-brand text-decoration-none d-inline-flex align-items-center gap-1" data-magnetic>
                                    <span>Sitio en vivo</span> <span>&nearr;</span>
                                </a>
                            @endif
                            @if ($githubUrl)
                                <a href="{{ $githubUrl }}" target="_blank" rel="noopener noreferrer" class="text-muted hover-text-primary text-decoration-none d-inline-flex align-items-center gap-1" data-magnetic>
                                    <span>Ver código</span> <span>&nearr;</span>
                                </a>
                            @endif
                        </div>
                    </div>
                @endif
            </div>
        </section>
    @endif

    {{-- Resumen de Métricas / Impacto si existe --}}
    @if (!empty($metricsSummary))
        <section class="mb-2xl p-xl rounded-4 bg-surface-subtle border-subtle" data-reveal>
            <span class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider d-block mb-sm">
                Métricas Clave &bull; Impacto Verificable
            </span>
            <p class="text-fluid-base text-primary mb-0" style="white-space: pre-line;">
                {{ $metricsSummary }}
            </p>
        </section>
    @endif

    {{-- Cuerpo Principal del Caso de Estudio --}}
    <div class="row g-4 g-lg-5 mb-3xl">
        <div class="col-12 col-lg-8 mx-auto" data-reveal data-detail-body>
            @if ($content->body)
                <div class="prose text-primary leading-relaxed text-fluid-base text-break">
                    {!! $content->body_html !!}
                </div>
            @else
                <p class="text-muted font-italic">Este caso de estudio no cuenta con descripción detallada.</p>
            @endif

            {{-- Galería de Imágenes Secundarias del Proyecto --}}
            @if ($content->gallery->isNotEmpty())
                <div class="mt-3xl">
                    <h3 class="h4 font-heading fw-bold text-primary mb-lg">Galería del Proyecto</h3>
                    <div class="row g-4">
                        @foreach ($content->gallery as $media)
                            <div class="col-12 col-md-6">
                                <figure class="m-0">
                                    <div class="overflow-hidden border-subtle bg-surface-subtle" style="aspect-ratio: 16/10;">
                                        <img src="{{ $media->url }}"
                                             alt="{{ $media->alt ?: ($media->caption ?: ($media->title ?: $content->title)) }}"
                                             title="{{ $media->title ?: ($media->caption ?: $content->title) }}"
                                             class="w-100 h-100 object-fit-cover"
                                             loading="lazy">
                                    </div>
                                    @if ($media->caption)
                                        <figcaption class="text-fluid-xs text-muted mt-2 font-mono">{{ $media->caption }}</figcaption>
                                    @endif
                                </figure>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif
        </div>
    </div>

    {{-- Enlace de Cierre hacia el Catálogo de Proyectos --}}
    <div class="pt-xl border-top-subtle d-flex justify-content-between align-items-center font-mono text-fluid-xs text-muted" data-reveal>
        <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" class="text-primary text-decoration-none d-inline-flex align-items-center gap-2" data-magnetic>
            <span>&larr;</span> <span>Volver a todos los proyectos</span>
        </a>
        <span>{{ $content->title }}</span>
    </div>
</article>
@endsection
