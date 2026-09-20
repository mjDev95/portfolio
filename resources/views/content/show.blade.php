@extends('layouts.app')

@section('title', ($content->meta_title ?: $content->title).' — '.config('app.name'))
@section('meta_description', $content->meta_description ?: $content->excerpt)
@section('namespace', 'content-show')
@section('edit_url', route('admin.content.edit', [$contentType->slug, $content->id]))
@section('edit_label', 'Editar ' . $contentType->name)

@section('content')
<article class="container py-2xl" style="min-height: 100vh;">
    <div class="mb-lg">
        <a href="{{ route('public.content.index', $contentType->public_route_slug) }}"
           class="text-muted text-decoration-none text-fluid-sm" data-magnetic>
            &larr; Volver a {{ $contentType->name }}
        </a>
    </div>

    <header class="mb-xl" data-reveal>
        <h1 class="h1">{{ $content->title }}</h1>
        @if ($content->excerpt)
            <p class="text-fluid-lg text-muted mt-md" style="max-width: 55ch;">
                {{ $content->excerpt }}
            </p>
        @endif

        <div class="d-flex flex-wrap gap-3 align-items-center mt-md text-muted text-fluid-sm">
            @if ($content->published_at)
                <span>{{ $content->published_at->format('d M Y') }}</span>
            @endif

            @if ($content->categories->isNotEmpty())
                <span>&bull;</span>
                <span>{{ $content->categories->pluck('name')->join(', ') }}</span>
            @endif

            @if ($content->tags->isNotEmpty())
                <span>&bull;</span>
                <span>#{{ $content->tags->pluck('name')->join(' #') }}</span>
            @endif
        </div>
    </header>

    @if ($content->hero_image || $content->thumbnail)
        @php
            $displayImage = $content->hero_image ?: $content->thumbnail;
        @endphp
        <div class="media-wrap overflow-hidden mb-2xl"
             data-flip-id="content-media-{{ $content->slug }}"
             style="max-height: 550px; border-radius: 1.5rem;" data-reveal>
            <img src="{{ $displayImage->url }}"
                 alt="{{ $displayImage->alt ?: ($displayImage->caption ?: $content->title) }}"
                 title="{{ $displayImage->title ?: $content->title }}"
                 class="img-fluid object-fit-cover w-100 h-100">
        </div>
    @endif

    <div class="row">
        <div class="col-12 col-lg-8" data-reveal>
            @if ($content->body)
                <div class="prose text-white leading-relaxed">
                    {!! $content->body_html !!}
                </div>
            @endif
        </div>

        {{-- Barra lateral con campos personalizados dinámicos si existen --}}
        @if (!empty($content->custom_values) && count($content->custom_values) > 0)
            <div class="col-12 col-lg-4 mt-xl mt-lg-0" data-reveal>
                <div class="p-4 rounded-4" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <h3 class="h6 text-muted text-uppercase tracking-wider mb-3">Detalles</h3>
                    <dl class="mb-0">
                        @foreach ($content->custom_values as $key => $val)
                            @if (!empty($val))
                                <dt class="text-muted text-fluid-xs text-uppercase">{{ str_replace('_', ' ', $key) }}</dt>
                                <dd class="text-white text-fluid-sm mb-3 font-semibold">
                                    @if (is_bool($val))
                                        {{ $val ? 'Sí' : 'No' }}
                                    @elseif (filter_var($val, FILTER_VALIDATE_URL))
                                        <a href="{{ $val }}" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-none">
                                            Visitar enlace &rarr;
                                        </a>
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
