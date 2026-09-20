@extends('layouts.app')

@section('title', config('app.name').' — Creative Developer & UX/UI Designer')
@section('namespace', 'home')

@section('content')
<section class="container" style="min-height: 100vh; display:flex; align-items:center;">
    <div class="row">
        <div class="col-12">
            <h1 class="h1" data-reveal>Diseño y desarrollo con intención.</h1>
            <p class="text-fluid-lg text-muted mt-md" style="max-width: 42ch;" data-reveal>
                Creative Developer &amp; UX/UI Designer construyendo experiencias
                web fluidas, rápidas y memorables.
            </p>
        </div>
    </div>
</section>

<section class="container py-2xl">
    <h2 class="h3 mb-lg" data-reveal>Publicaciones destacadas</h2>

    <div class="row row-cols-1 row-cols-md-2 gap-4">
        @forelse ($featuredProjects as $item)
            <a href="{{ route('public.content.show', [$item->contentType?->public_route_slug ?? 'c', $item->slug]) }}"
               class="col-md-6 text-decoration-none text-white"
               data-reveal data-magnetic>
                @if ($item->thumbnail)
                    <div class="media-wrap overflow-hidden mb-sm" style="aspect-ratio: 4/3; border-radius: 1rem;">
                        <img src="{{ $item->thumbnail->url }}"
                             alt="{{ $item->thumbnail->alt ?: ($item->thumbnail->caption ?: $item->title) }}"
                             title="{{ $item->thumbnail->title ?: $item->title }}"
                             class="img-fluid object-fit-cover w-100 h-100">
                    </div>
                @endif
                <h3 class="h5 mt-sm" style="margin-bottom:0;">{{ $item->title }}</h3>
                @if ($item->excerpt)
                    <p class="text-fluid-sm text-muted mt-xs">{{ $item->excerpt }}</p>
                @endif
            </a>
        @empty
            <p class="text-muted">Próximamente.</p>
        @endforelse
    </div>
</section>
@endsection
