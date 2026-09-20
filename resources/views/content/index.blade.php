@extends('layouts.app')

@section('title', $contentType->name.' — '.config('app.name'))
@section('namespace', 'content-index')

@section('content')
<section class="container py-2xl" style="min-height: 100vh;">
    <h1 class="h2 mb-lg" data-reveal>{{ $contentType->name }}</h1>

    @if ($contentType->description)
        <p class="text-fluid-lg text-muted mb-xl" style="max-width: 60ch;" data-reveal>
            {{ $contentType->description }}
        </p>
    @endif

    <div class="row row-cols-1 row-cols-md-2 gap-4">
        @forelse ($contents as $item)
            <a href="{{ route('public.content.show', [$contentType->public_route_slug, $item->slug]) }}"
               class="col-md-6 text-decoration-none text-white"
               data-flip-card data-reveal data-magnetic>
                @if ($item->thumbnail)
                    <div class="media-wrap overflow-hidden mb-sm"
                         data-flip-id="content-media-{{ $item->slug }}"
                         style="aspect-ratio: 4/3; border-radius: 1rem;">
                        <img src="{{ $item->thumbnail->url }}"
                             alt="{{ $item->thumbnail->alt ?: ($item->thumbnail->caption ?: $item->title) }}"
                             title="{{ $item->thumbnail->title ?: $item->title }}"
                             class="img-fluid object-fit-cover w-100 h-100">
                    </div>
                @endif
                <h2 class="h5 mt-sm" style="margin-bottom:0;">{{ $item->title }}</h2>
                @if ($item->excerpt)
                    <p class="text-fluid-sm text-muted mt-xs">{{ $item->excerpt }}</p>
                @endif
            </a>
        @empty
            <p class="text-muted">Próximamente.</p>
        @endforelse
    </div>

    <div class="mt-xl">
        {{ $contents->links() }}
    </div>
</section>
@endsection

