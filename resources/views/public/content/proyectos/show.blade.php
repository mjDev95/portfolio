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
    {{-- Breadcrumbs Estables (24px fijo para GSAP Flip) --}}
    <div class="container mb-lg" data-detail-breadcrumbs>
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
        @if ($videoFacadeUrl)
            <div class="media-wrap hero-media-wrapper w-100 position-relative overflow-hidden aspect-16-9 bg-surface border-subtle"
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
            <div class="media-wrap hero-media-wrapper w-100 position-relative overflow-hidden aspect-16-9 bg-surface border-subtle"
                 data-flip-id="project-{{ $content->slug }}"
                 data-flip-element="image">
                <img src="{{ $heroImage->url }}"
                     alt="{{ $heroImage->alt ?: ($heroImage->caption ?: $content->title) }}"
                     title="{{ $heroImage->title ?: $content->title }}"
                     class="img-fluid object-fit-cover w-100 h-100 d-block">
            </div>
        @endif
    </div>

    {{-- Contenedor Central del Caso de Estudio (Lectura y Cabecera Editorial) --}}
    <div class="container-wide">
        {{-- Cabecera y Título Monumental --}}
        <header class="mb-2xl" data-detail-header>

            <h1 class="h1 font-heading fw-bold text-primary text-break mb-xl" data-flip-text style="letter-spacing: -0.035em;">
                {{ $content->title }}
            </h1>

            {{-- Barra Horizontal de Metadatos (Fila Única: Tipografía Grande + 3 Redes Sociales Squircle) --}}
            <div class="d-flex flex-wrap align-items-start align-items-lg-center justify-content-between gap-4 py-lg mb-3xl" data-reveal>
                <div class="d-flex flex-wrap align-items-start gap-4 gap-lg-5">
                    @foreach ($metaItems as $item)
                        <div class="d-flex flex-column gap-1">
                            <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider lh-1">{{ $item['label'] }}</span>
                            <div class="h4 font-heading fw-bold text-primary m-0">
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

                {{-- Redes Sociales Directas Squircle (Sin Modal, con Tooltips) --}}
                <div class="d-flex align-items-center gap-2 flex-shrink-0" aria-label="Compartir en redes sociales">
                    {{-- Instagram --}}
                    <button type="button" 
                            class="social-share-tile d-inline-flex align-items-center justify-content-center position-relative cursor-pointer text-decoration-none user-select-none rounded-3 border-subtle bg-surface text-primary" 
                            data-share-direct="instagram" 
                            data-share-title="{{ $content->title }}" 
                            data-share-url="{{ url()->current() }}" 
                            data-magnetic 
                            aria-label="Copiar enlace para Instagram">
                        <span class="tile-tooltip position-absolute opacity-0 font-mono text-fluid-xs text-nowrap rounded-1 border-subtle bg-primary text-primary">Instagram</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="flex-shrink-0">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </button>

                    {{-- LinkedIn --}}
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ urlencode(url()->current()) }}" 
                       class="social-share-tile d-inline-flex align-items-center justify-content-center position-relative cursor-pointer text-decoration-none user-select-none rounded-3 border-subtle bg-surface text-primary" 
                       data-share-direct="linkedin" 
                       data-share-title="{{ $content->title }}" 
                       data-share-url="{{ url()->current() }}" 
                       data-magnetic 
                       aria-label="Compartir en LinkedIn"
                       target="_blank" 
                       rel="noopener noreferrer">
                        <span class="tile-tooltip position-absolute opacity-0 font-mono text-fluid-xs text-nowrap rounded-1 border-subtle bg-primary text-primary">LinkedIn</span>
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="flex-shrink-0">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63 0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63z"/>
                        </svg>
                    </a>

                    {{-- WhatsApp --}}
                    <a href="https://api.whatsapp.com/send?text={{ urlencode($content->title . ' ' . url()->current()) }}" 
                       class="social-share-tile d-inline-flex align-items-center justify-content-center position-relative cursor-pointer text-decoration-none user-select-none rounded-3 border-subtle bg-surface text-primary" 
                       data-share-direct="whatsapp" 
                       data-share-title="{{ $content->title }}" 
                       data-share-url="{{ url()->current() }}" 
                       data-magnetic 
                       aria-label="Compartir en WhatsApp"
                       target="_blank" 
                       rel="noopener noreferrer">
                        <span class="tile-tooltip position-absolute opacity-0 font-mono text-fluid-xs text-nowrap rounded-1 border-subtle bg-primary text-primary">WhatsApp</span>
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="flex-shrink-0">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.09-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.03 2.59.12.17 1.77 2.7 4.28 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </header>

        {{-- Bloque de Narrativa, Desafío y Enlaces de Producción --}}
        @if (!empty($custom['subtitle']) || $content->excerpt || $content->tags->isNotEmpty() || $externalUrl || $githubUrl)
            <section class="row g-4 g-lg-5 mb-2xl pb-xl border-bottom-subtle" data-detail-body>
                <div class="col-12 col-lg-8">
                    @if (!empty($custom['subtitle']))
                        <p class="text-fluid-lg text-primary fw-medium leading-relaxed mb-md" data-flip-text>
                            {{ $custom['subtitle'] }}
                        </p>
                    @endif

                    @if ($content->excerpt)
                        <p class="text-fluid-base text-secondary leading-relaxed mb-md">
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

                <div class="col-12 col-lg-4">
                    @if ($externalUrl)
                        <x-btn href="{{ $externalUrl }}" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               icon="nearr" 
                               size="sm" 
                               data-magnetic>
                            Sitio en vivo
                        </x-btn>
                    @endif

                    @if ($githubUrl)
                        <x-btn href="{{ $githubUrl }}" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               variant="surface" 
                               icon="nearr" 
                               size="sm" 
                               data-magnetic>
                            Código fuente
                        </x-btn>
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
            <div class="col-12 col-lg-9 mx-auto" data-detail-body>
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
        </div>

        {{-- Enlace de Cierre hacia el Catálogo de Proyectos --}}
        <div class="pt-xl border-top-subtle d-flex justify-content-between align-items-center font-mono text-fluid-xs text-muted" data-reveal>
            <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" class="text-primary text-decoration-none d-inline-flex align-items-center gap-2" data-magnetic>
                <span>&larr;</span> <span>Volver a todos los proyectos</span>
            </a>
            <span>{{ $content->title }}</span>
        </div>
    </div>
</article>
@endsection
