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
<article class="py-3xl" style="min-height: 100vh;">
    @php
        $heroImage = $content->hero_image ?: $content->thumbnail;
        $custom = $content->custom_values ?? [];
        $client = $custom['client'] ?? null;
        $year = $custom['year'] ?? null;
        $role = $custom['role'] ?? null;
        $stack = $custom['stack'] ?? null;
        $summary = $custom['summary'] ?? null;
        $externalUrl = $custom['external_url'] ?? null;
        $githubUrl = $custom['github_url'] ?? null;
        $videoFacadeUrl = $custom['video_facade_url'] ?? null;
        $category = $content->categories->first();
        $categoryName = $category?->name ?? ($cpt->singular_name ?? 'Proyecto');

        $previewUrl = $externalUrl ?: $githubUrl;
        $previewLabel = '—';
        $isExternal = false;
        if ($externalUrl) {
            $parsedHost = parse_url($externalUrl, PHP_URL_HOST);
            $previewLabel = $parsedHost ? preg_replace('/^www\./', '', $parsedHost) : $externalUrl;
            $isExternal = true;
        } elseif ($githubUrl) {
            $previewLabel = 'GitHub';
            $isExternal = true;
        } elseif (!empty($stack)) {
            $previewLabel = $stack;
        }

        $metaItems = [
            [
                'label' => 'Categoría',
                'value' => $categoryName,
                'url' => $category ? route('public.content.category', [$cpt->public_route_slug, $category->slug]) : null,
                'external' => false,
            ],
            [
                'label' => 'Cliente',
                'value' => $client ?: ($role ?: 'Independiente'),
                'url' => null,
                'external' => false,
            ],
            [
                'label' => 'Fecha',
                'value' => $content->published_at ? $content->published_at->translatedFormat('j M Y') : ($year ?: 'Reciente'),
                'url' => null,
                'external' => false,
            ],
            [
                'label' => 'Preview',
                'value' => $previewLabel,
                'url' => $previewUrl,
                'external' => $isExternal,
            ],
        ];
    @endphp

    {{-- Hero Media Principal (Ancho Panorámico Extendido con GSAP Flip) --}}
    <div class="container-wide mb-2xl">
        <div class="row">
            <div class="col-12">
                {{-- Breadcrumbs Estables (24px fijo para GSAP Flip) --}}
                <div class="mb-sm h6">
                    <x-breadcrumbs :items="[
                        ['label' => 'Inicio', 'url' => route('home')],
                        ['label' => 'Proyectos', 'url' => route('public.content.index', $cpt->public_route_slug)],
                        ['label' => $content->title, 'url' => null]
                    ]" />
                </div>
                {{-- Cabecera y Título Monumental --}}
                <header class="mb-2xl" data-detail-header>

                    <h1 class="h1 font-heading fw-bold text-primary text-break mb-sm" data-flip-text data-title-blur-reveal style="letter-spacing: -0.035em;">
                        {{ $content->title }}
                    </h1>

                    {{-- Barra Horizontal de Metadatos (Fila Única: Tipografía Grande + 3 Redes Sociales Squircle) --}}
                    <div class="d-flex flex-wrap align-items-start align-items-lg-center justify-content-between gap-4 py-lg mb-3xl" data-detail-meta>
                        <div class="d-flex flex-wrap align-items-start gap-4 gap-lg-5">
                            @foreach ($metaItems as $item)
                                <div class="d-flex flex-column gap-1">
                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider lh-1">{{ $item['label'] }}</span>
                                    <div class="h5 font-heading fw-bold text-primary m-0">
                                        @if ($item['url'])
                                            <a href="{{ $item['url'] }}" 
                                            class="text-primary text-decoration-none hover-text-brand d-inline-flex align-items-center gap-1"
                                            @if ($item['external']) target="_blank" rel="noopener noreferrer" @endif
                                            data-magnetic>
                                                <span>{{ $item['value'] }}</span>
                                                @if ($item['external'])
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width: var(--fluid-s-xs); height: var(--fluid-s-xs); opacity: 0.6;"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                                @endif
                                            </a>
                                        @else
                                            <span class="{{ $item['value'] === '—' ? 'text-secondary' : '' }}">{{ $item['value'] }}</span>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>

                        {{-- Redes Sociales Directas Redondas (Sin Modal, con Tooltips) --}}
                        <div class="d-flex align-items-center gap-2 flex-shrink-0" aria-label="Compartir en redes sociales">
                            {{-- Instagram --}}
                            <button type="button" 
                                    class="btn-circle-action position-relative cursor-pointer text-decoration-none user-select-none" 
                                    data-share-direct="instagram" 
                                    data-share-title="{{ $content->title }}" 
                                    data-share-url="{{ url()->current() }}" 
                                    data-magnetic 
                                    aria-label="Copiar enlace para Instagram">
                                <span class="tile-tooltip position-absolute opacity-0 font-mono text-fluid-xs text-nowrap rounded-1 border-subtle bg-primary text-primary">Instagram</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="flex-shrink-0">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </button>

                            {{-- LinkedIn --}}
                            <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ urlencode(url()->current()) }}" 
                            class="btn-circle-action position-relative cursor-pointer text-decoration-none user-select-none" 
                            data-share-direct="linkedin" 
                            data-share-title="{{ $content->title }}" 
                            data-share-url="{{ url()->current() }}" 
                            data-magnetic 
                            aria-label="Compartir en LinkedIn"
                            target="_blank" 
                            rel="noopener noreferrer">
                                <span class="tile-tooltip position-absolute opacity-0 font-mono text-fluid-xs text-nowrap rounded-1 border-subtle bg-primary text-primary">LinkedIn</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="flex-shrink-0">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                            </a>

                            {{-- WhatsApp --}}
                            <a href="https://api.whatsapp.com/send?text={{ urlencode($content->title . ' ' . url()->current()) }}" 
                            class="btn-circle-action position-relative cursor-pointer text-decoration-none user-select-none" 
                            data-share-direct="whatsapp" 
                            data-share-title="{{ $content->title }}" 
                            data-share-url="{{ url()->current() }}" 
                            data-magnetic 
                            aria-label="Compartir en WhatsApp"
                            target="_blank" 
                            rel="noopener noreferrer">
                                <span class="tile-tooltip position-absolute opacity-0 font-mono text-fluid-xs text-nowrap rounded-1 border-subtle bg-primary text-primary">WhatsApp</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="flex-shrink-0">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </header>
            </div>
        </div>

        @if ($videoFacadeUrl)
            <div class="media-wrap hero-media-wrapper w-100 position-relative overflow-hidden aspect-21-9 bg-surface border-subtle"
                 data-video-facade="{{ $videoFacadeUrl }}"
                 data-flip-id="project-{{ $content->slug }}"
                 data-flip-element="image"
                 data-project-hero-effect
                 style="cursor: pointer; background: #000;">
                @if ($heroImage)
                    <img src="{{ $heroImage->url }}"
                         alt="{{ $heroImage->alt ?: ($heroImage->caption ?: $content->title) }}"
                         title="{{ $heroImage->title ?: $content->title }}"
                         class="img-fluid object-fit-cover w-100 h-100 d-block hero-parallax-media">
                @endif
            </div>
        @elseif ($heroImage)
            <div class="media-wrap hero-media-wrapper w-100 position-relative overflow-hidden aspect-21-9 bg-surface border-subtle"
                 data-flip-id="project-{{ $content->slug }}"
                 data-flip-element="image"
                 data-project-hero-effect>
                <img src="{{ $heroImage->url }}"
                     alt="{{ $heroImage->alt ?: ($heroImage->caption ?: $content->title) }}"
                     title="{{ $heroImage->title ?: $content->title }}"
                     class="img-fluid object-fit-cover w-100 h-100 d-block hero-parallax-media">
            </div>
        @else
            <div class="media-wrap hero-media-wrapper project-placeholder-media w-100 position-relative overflow-hidden aspect-21-9 d-flex flex-column align-items-center justify-content-center p-4 bg-surface border-subtle"
                 data-flip-id="project-{{ $content->slug }}"
                 data-flip-element="image">
                <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                    {{ $content->title }}
                </span>
            </div>
        @endif
    </div>

    {{-- Contenedor Central del Caso de Estudio (Lectura y Cabecera Editorial) --}}
    <div class="container-wide mt-2xl resumen-container">
        {{-- Bloque de Narrativa, Desafío y Enlaces de Producción --}}
        @if (!empty($summary) || $content->excerpt || $content->tags->isNotEmpty() || $externalUrl || $githubUrl)
            <section class="row g-4 g-lg-5 mb-2xl pb-xl border-bottom-subtle" data-detail-body>
                <div class="col-12">
                    @if (!empty($summary))
                        <div class="prose h3 font-heading text-primary fw-medium leading-relaxed  mb-md" data-flip-text>
                            {!! $content->summary_html !!}
                        </div>
                    @endif

                    @if ($content->excerpt && empty($summary))
                        <p class="text-fluid-base leading-relaxed mb-md">
                            {{ $content->excerpt }}
                        </p>
                    @endif

                    @if ($content->tags->isNotEmpty())
                        <div class="d-flex flex-wrap gap-2 align-items-center mt-md">
                            @foreach ($content->tags as $tag)
                                <span class="text-fluid-xs text-muted font-mono">#{{ $tag->name }}</span>
                            @endforeach
                        </div>
                    @endif
                </div>
            </section>
        @endif
    </div>
            {{-- Cuerpo Principal del Caso de Estudio --}}

        <section class="container-wide mt-5" data-detail-body>
            
                    @if ($content->body)
                        <div class="prose text-primary leading-relaxed text-fluid-base text-break">
                            {!! $content->body_html !!}
                        </div>
                    @else
                        <p class="text-muted font-italic">Este caso de estudio no cuenta con descripción detallada.</p>
                    @endif

                    {{-- Galería de Imágenes Secundarias del Proyecto --}}
                    @if ($content->gallery->isNotEmpty())
                        <div class="mt-3xl pt-xl border-top-subtle">
                            <div class="d-flex align-items-center justify-content-between mb-xl">
                                <h3 class="h3 font-heading fw-bold text-primary m-0">Galería del Proyecto</h3>
                                <span class="font-mono text-fluid-xs text-muted">{{ $content->gallery->count() }} imágenes</span>
                            </div>
                            <div class="row g-4">
                                @foreach ($content->gallery as $media)
                                    <div class="col-12 col-md-6">
                                        <figure class="m-0">
                                            <div class="overflow-hidden border-subtle bg-surface-subtle rounded-3" style="aspect-ratio: 16/10;">
                                                <img src="{{ $media->url }}"
                                                    alt="{{ $media->alt ?: ($media->caption ?: ($media->title ?: $content->title)) }}"
                                                    title="{{ $media->title ?: ($media->caption ?: $content->title) }}"
                                                    class="w-100 h-100 object-fit-cover d-block"
                                                    loading="lazy">
                                            </div>
                                            @if ($media->caption)
                                                <figcaption class="text-fluid-xs text-muted mt-xs font-mono">{{ $media->caption }}</figcaption>
                                            @endif
                                        </figure>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endif
                </div>
          
        </section>

    {{-- Interlinking SEO: Siguiente Proyecto (Diseño Editorial Plano, Sin Cajas) --}}
    @if ($nextProject)
        @php
            $nextThumb = $nextProject->thumbnail;
            $nextUrl = route('public.content.show', [$cpt->public_route_slug, $nextProject->slug]);
        @endphp
        <section class="container-wide mt-3xl pt-2xl border-top-subtle" data-reveal>
            <div class="row g-4 g-lg-5 align-items-center" data-card-reveal>
                {{-- Columna Izquierda: Imagen destacada con GSAP Flip --}}
                <div class="col-12 col-lg-7">
                    <a href="{{ $nextUrl }}" 
                       class="d-block overflow-hidden text-decoration-none" 
                       data-flip-card
                       data-flip-id="project-{{ $nextProject->slug }}"
                       data-magnetic data-magnetic-strength="0.02">
                        <div class="media-wrap w-100 overflow-hidden aspect-16-10 bg-surface-subtle border-subtle"
                             data-flip-id="project-{{ $nextProject->slug }}"
                             data-flip-element="image">
                            @if ($nextThumb)
                                <img src="{{ $nextThumb->url }}" 
                                     alt="{{ $nextProject->title }}" 
                                     class="img-fluid object-fit-cover w-100 h-100 d-block transition-transform"
                                     loading="lazy">
                            @else
                                <div class="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4">
                                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider">
                                        {{ $nextProject->title }}
                                    </span>
                                </div>
                            @endif
                        </div>
                    </a>
                </div>

                {{-- Columna Derecha: Numerador, Título, Extracto y Botón a 45° --}}
                <div class="col-12 col-lg-5 ps-lg-4">

                    <h2 class="h2 font-heading fw-bold text-primary tracking-tight lh-tight mb-3">
                        <a href="{{ $nextUrl }}" 
                           class="text-reset text-decoration-none hover-text-brand"
                           data-flip-card
                           data-flip-id="project-{{ $nextProject->slug }}">
                            {{ $nextProject->title }}
                        </a>
                    </h2>

                    @if ($nextProject->excerpt)
                        <p class="h5 text-secondary leading-relaxed mb-4">
                            {{ $nextProject->excerpt }}
                        </p>
                    @endif

                    <div class="pt-1">
                        <a href="{{ $nextUrl }}" 
                           class="btn-circle-action" 
                           aria-label="Ver siguiente proyecto: {{ $nextProject->title }}"
                           data-flip-card
                           data-flip-id="project-{{ $nextProject->slug }}"
                           data-magnetic data-magnetic-strength="0.08">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    @endif
</article>
@endsection
