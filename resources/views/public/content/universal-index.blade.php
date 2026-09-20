@extends('layouts.app')

@section('title', $cpt->name . ' — ' . config('app.name'))
@section('meta_description', $cpt->description ?: 'Explora todas las publicaciones de ' . $cpt->name . ' en ' . config('app.name'))
@section('og_title', $cpt->name . ' — ' . config('app.name'))
@section('og_description', $cpt->description ?: 'Explora todas las publicaciones de ' . $cpt->name)
@section('namespace', 'content-index')

@section('content')
<section class="container py-2xl" style="min-height: 100vh;">
    <div class="mb-xl">
        <div class="mb-sm">
            <x-breadcrumbs :items="[
                ['label' => 'Inicio', 'url' => route('home')],
                ['label' => $cpt->name, 'url' => null]
            ]" />
        </div>
        <h1 class="h2 mb-sm" data-reveal>{{ $cpt->name }}</h1>

        @if ($cpt->description)
            <p class="text-fluid-lg text-muted" style="max-width: 60ch;" data-reveal>
                {{ $cpt->description }}
            </p>
        @endif
    </div>

    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        @forelse ($contents as $item)
            @php
                $itemThumb = $item->thumbnail;
                $detailUrl = route('public.content.show', [$cpt->public_route_slug, $item->slug]);
            @endphp
            <div class="col" data-reveal>
                <a href="{{ $detailUrl }}"
                   class="d-block text-decoration-none text-white h-100 rounded-4 p-3 transition-all"
                   style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);"
                   data-flip-card data-magnetic>
                    @if ($itemThumb)
                        <div class="media-wrap overflow-hidden mb-3"
                             data-flip-id="content-media-{{ $item->slug }}"
                             style="aspect-ratio: 16/10; border-radius: 1rem;">
                            <img src="{{ $itemThumb->url }}"
                                 alt="{{ $itemThumb->alt ?: ($itemThumb->caption ?: $item->title) }}"
                                 title="{{ $itemThumb->title ?: $item->title }}"
                                 class="img-fluid object-fit-cover w-100 h-100">
                        </div>
                    @else
                        <div class="media-wrap overflow-hidden mb-3 d-flex align-items-center justify-center text-muted"
                             style="aspect-ratio: 16/10; border-radius: 1rem; background: rgba(255,255,255,0.04);">
                            <span class="text-fluid-xs text-uppercase tracking-wider">{{ $cpt->singular_name ?? $cpt->name }}</span>
                        </div>
                    @endif

                    @if ($item->categories->isNotEmpty())
                        <div class="d-flex flex-wrap gap-1.5 mb-2">
                            @foreach ($item->categories as $category)
                                <span class="badge bg-secondary-subtle text-white font-normal" style="font-size: 0.75rem; border-radius: 6px;">
                                    {{ $category->name }}
                                </span>
                            @endforeach
                        </div>
                    @endif

                    <h2 class="h5 font-semibold text-white mb-2 line-clamp-2">{{ $item->title }}</h2>

                    @if ($item->excerpt)
                        <p class="text-fluid-sm text-muted mb-3 line-clamp-2">{{ $item->excerpt }}</p>
                    @endif

                    <div class="d-flex align-items-center justify-between text-fluid-xs text-muted mt-auto pt-2" style="border-top: 1px solid rgba(255,255,255,0.06);">
                        <span>{{ $item->published_at ? $item->published_at->format('d M Y') : $item->created_at->format('d M Y') }}</span>
                        <span class="text-primary font-semibold">Ver detalle &rarr;</span>
                    </div>
                </a>
            </div>
        @empty
            <div class="col-12 py-5 text-center text-muted">
                <p class="text-fluid-lg mb-2">No hay publicaciones disponibles en {{ $cpt->name }}.</p>
                <p class="text-fluid-sm">Vuelve a consultar pronto.</p>
            </div>
        @endforelse
    </div>

    @if ($contents->hasPages())
        <div class="mt-2xl d-flex justify-content-center">
            {{ $contents->links() }}
        </div>
    @endif
</section>
@endsection

