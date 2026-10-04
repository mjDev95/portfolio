@foreach ($contents as $item)
    @php
        $itemThumb = $item->thumbnail;
        $categoryName = $item->categories->first()?->name ?? 'Ensayo';
        $detailUrl = route('public.content.show', [$cpt->public_route_slug, $item->slug]);
    @endphp
    <div class="col-12 col-md-6" data-card-reveal>
        <a href="{{ $detailUrl }}" 
           class="blog-showcase-card project-showcase-card position-relative d-block text-decoration-none text-reset" 
           data-blog-card
           data-flip-card
           data-flip-id="post-{{ $item->slug }}"
           data-magnetic data-magnetic-strength="0.04">
            <div class="project-showcase-media card-media-wrapper position-relative w-100 overflow-hidden aspect-16-9 bg-surface border-subtle"
                 data-flip-id="post-{{ $item->slug }}"
                 data-flip-element="image">
                @if ($itemThumb)
                    <img src="{{ $itemThumb->url }}" 
                         alt="{{ $item->title }}" 
                         class="project-showcase-img w-100 h-100 object-fit-cover d-block"
                         loading="lazy">
                @else
                    <div class="project-placeholder-media w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4">
                        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-wider text-center">
                            {{ $categoryName }} &bull; Ensayo
                        </span>
                    </div>
                @endif
            </div>
            <div class="project-showcase-body mt-sm">
                <div class="project-category-subtitle font-body text-fluid-xs text-muted mb-1 project-card-sub-details-wrapper-v3 bottom">
                    <div class="d-flex align-items-center details h5 mb-0">
                        <div class="text-brand fw-semibold">{{ $categoryName }}</div>
                        @if ($item->published_at)
                            <div class="text-divider project-card-v3 mx-2"></div>
                            <div>{{ $item->published_at->format('d M Y') }}</div>
                        @endif
                    </div>
                </div>
                
                <h2 class="project-title-heading font-heading h3 mt-2 lh-tight text-primary">{{ $item->title }}</h2>
            </div>
        </a>
    </div>
@endforeach
