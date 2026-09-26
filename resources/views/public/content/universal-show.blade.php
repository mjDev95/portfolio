@extends('layouts.app')

@section('title', ($content->seo_title ?: $content->title) . ' — ' . config('app.name'))
@section('meta_description', $content->seo_description ?: $content->excerpt)
@section('og_title', ($content->seo_title ?: $content->title) . ' — ' . config('app.name'))
@section('og_description', $content->seo_description ?: $content->excerpt)
@section('namespace', 'content-show')
@section('edit_url', route('admin.content.edit', [$cpt->slug, $content->id]))
@section('edit_label', 'Editar ' . ($cpt->singular_name ?? $cpt->name))

@section('content')
<article class="container py-2xl" style="min-height: 100vh;">
    <div class="mb-lg d-flex flex-wrap align-items-center justify-content-between gap-3">
        <a href="{{ route('public.content.index', $cpt->public_route_slug) }}"
           class="text-muted text-decoration-none text-fluid-sm d-inline-flex align-items-center gap-1.5" data-magnetic>
            <span>&larr;</span> Volver a {{ $cpt->name }}
        </a>
        <x-breadcrumbs :items="[
            ['label' => 'Inicio', 'url' => route('home')],
            ['label' => $cpt->name, 'url' => route('public.content.index', $cpt->public_route_slug)],
            ['label' => $content->title, 'url' => null]
        ]" />
    </div>

    <header class="mb-xl" data-reveal>
        <div class="d-flex align-items-center gap-2 mb-sm text-fluid-xs text-muted text-uppercase tracking-wider">
            <span class="badge bg-primary-subtle text-primary">{{ $cpt->singular_name ?? $cpt->name }}</span>
            @if ($content->published_at)
                <span>&bull;</span>
                <time datetime="{{ $content->published_at->toIso8601String() }}">
                    {{ $content->published_at->format('d M Y') }}
                </time>
            @endif
        </div>

        <h1 class="h1 font-bold text-primary" data-flip-text>{{ $content->title }}</h1>

        @if ($content->excerpt)
            <p class="text-fluid-lg text-muted mt-md" style="max-width: 58ch;" data-flip-text>
                {{ $content->excerpt }}
            </p>
        @endif

        <div class="d-flex flex-wrap gap-3 align-items-center mt-md text-muted text-fluid-sm">
            @if ($content->categories->isNotEmpty())
                <div class="d-flex flex-wrap gap-1.5 align-items-center">
                    <span class="text-fluid-xs text-muted">Categorías:</span>
                    @foreach ($content->categories as $category)
                        <span class="data-chip">
                            {{ $category->name }}
                        </span>
                    @endforeach
                </div>
            @endif

            @if ($content->tags->isNotEmpty())
                <div class="d-flex flex-wrap gap-1 align-items-center">
                    @foreach ($content->tags as $tag)
                        <span class="text-fluid-xs text-muted">#{{ $tag->name }}</span>
                    @endforeach
                </div>
            @endif
        </div>
    </header>

    @php
        $heroImage = $content->hero_image ?: $content->thumbnail;
    @endphp

    @if ($heroImage)
        <div class="media-wrap overflow-hidden mb-2xl"
             data-flip-id="project-{{ $content->slug }}"
             style="max-height: 580px; border-radius: 1.5rem;" data-reveal>
            <img src="{{ $heroImage->url }}"
                 alt="{{ $heroImage->alt ?: ($heroImage->caption ?: $content->title) }}"
                 title="{{ $heroImage->title ?: $content->title }}"
                 class="img-fluid object-fit-cover w-100 h-100">
        </div>
    @endif

    <div class="row g-5">
        <div class="col-12 {{ (!empty($content->custom_values) && count($content->custom_values) > 0) ? 'col-lg-8' : 'col-lg-10 mx-auto' }}" data-reveal>
            @if ($content->body)
                <div class="prose text-primary leading-relaxed text-fluid-base">
                    {!! $content->body_html !!}
                </div>
            @else
                <p class="text-muted font-italic">Esta publicación no cuenta con descripción detallada.</p>
            @endif

            {{-- Galería de imágenes secundarias si existen --}}
            @if ($content->gallery->isNotEmpty())
                <div class="mt-2xl">
                    <h3 class="h5 text-primary mb-lg">Galería</h3>
                    <div class="row row-cols-1 row-cols-md-2 g-3">
                        @foreach ($content->gallery as $media)
                            <div class="col">
                                <div class="overflow-hidden rounded-3 border-subtle bg-surface-subtle" style="aspect-ratio: 4/3;">
                                    <img src="{{ $media->url }}"
                                         alt="{{ $media->alt ?: ($media->caption ?: ($media->title ?: $content->title)) }}"
                                         title="{{ $media->title ?: ($media->caption ?: $content->title) }}"
                                         class="w-100 h-100 object-fit-cover">
                                </div>
                                @if ($media->caption)
                                    <p class="text-fluid-xs text-muted mt-1">{{ $media->caption }}</p>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif
        </div>

        {{-- Ficha Técnica con Campos Personalizados Dinámicos (EAV) --}}
        @if (!empty($content->custom_values) && count($content->custom_values) > 0)
            <div class="col-12 col-lg-4" data-reveal>
                <div class="p-4 rounded-4 sticky-top bg-surface-subtle border-subtle" style="top: 100px;">
                    <h3 class="h6 text-muted text-uppercase tracking-wider mb-3">Información Específica</h3>
                    <dl class="mb-0">
                        @php
                            $fieldsByName = ($cpt->relationLoaded('customFields') ? $cpt->customFields : $cpt->customFields()->get())->keyBy('name');
                        @endphp

                        @foreach ($content->custom_values as $key => $val)
                            @if ($val !== null && $val !== '')
                                @php
                                    $fieldDef = $fieldsByName->get($key);
                                    $label = $fieldDef ? $fieldDef->label : ucwords(str_replace('_', ' ', $key));
                                    $type = $fieldDef ? $fieldDef->type : 'text';
                                @endphp
                                <dt class="text-muted text-fluid-xs text-uppercase font-medium mb-1">{{ $label }}</dt>
                                <dd class="text-primary text-fluid-sm mb-3.5 font-semibold">
                                    @if ($type === 'boolean' || is_bool($val))
                                        <span class="badge {{ $val ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-muted' }}">
                                            {{ $val ? 'Sí / Activo' : 'No / Inactivo' }}
                                        </span>
                                    @elseif ($type === 'url' || filter_var($val, FILTER_VALIDATE_URL))
                                        <a href="{{ $val }}" target="_blank" rel="noopener noreferrer" class="text-accent text-decoration-none d-inline-flex align-items-center gap-1">
                                            <span>Abrir enlace</span> &rarr;
                                        </a>
                                    @elseif ($type === 'date')
                                        {{ \Carbon\Carbon::parse($val)->format('d M Y') }}
                                    @elseif (is_array($val))
                                        {{ implode(', ', $val) }}
                                    @else
                                        {{ $val }}
                                    @endif
                                </dd>
                            @endif
                        @endforeach
                    </dl>
                </div>
            </div>
        @endif
    </div>
</article>
@endsection

