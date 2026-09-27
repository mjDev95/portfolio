@extends('layouts.app')

@section('title', 'Proyectos — ' . config('app.name'))
@section('meta_description', 'Portafolio de proyectos y casos de éxito en arquitectura WordPress, sistemas de diseño y desarrollo web de alto impacto.')
@section('namespace', 'projects-index')

@section('content')
@php
    $flagshipProjects = [
        [
            'title' => 'Auto Key Access',
            'category' => 'WordPress Website',
            'url' => 'https://nextinlinemanagement.com/',
            'is_external' => true,
            'is_wordpress' => true,
            'image' => asset('images/projects/auto-key-access.jpg'),
        ],
        [
            'title' => 'Clearbox Communications',
            'category' => 'WordPress Website',
            'url' => 'https://accesate.com/es',
            'is_external' => true,
            'is_wordpress' => true,
            'image' => asset('images/projects/clearbox-communications.jpg'),
        ],
        [
            'title' => 'Centro Médico ABC',
            'category' => 'WordPress Institucional',
            'url' => 'https://centromedicoabc.com/',
            'is_external' => true,
            'is_wordpress' => true,
            'image' => asset('storage/media/thumbnail/ca7b6780-1032-44f5-8cf2-72841eedd952.webp'),
        ],
        [
            'title' => 'FLACSO México',
            'category' => 'Portal Académico & CPTs',
            'url' => 'https://www.flacso.edu.mx/',
            'is_external' => true,
            'is_wordpress' => true,
            'image' => asset('storage/media/thumbnail/163e68bc-cfcd-4b0a-b6d6-1e958b5370b0.webp'),
        ],
    ];

    $cmsProjects = [];
    foreach ($contents as $item) {
        if ($item->thumbnail) {
            $cmsProjects[] = [
                'title' => $item->title,
                'category' => $item->categories->first()?->name ?? 'WordPress Website',
                'url' => route('public.content.show', [$cpt->public_route_slug, $item->slug]),
                'is_external' => false,
                'is_wordpress' => true,
                'image' => $item->thumbnail->url,
            ];
        }
    }

    $allProjects = array_merge($flagshipProjects, $cmsProjects);
@endphp

<section class="container py-2xl" style="min-height: 100vh;">
    {{-- Breadcrumbs & Header --}}
    <div class="mb-xl pt-md">
        <div class="mb-sm">
            <x-breadcrumbs :items="[
                ['label' => 'Inicio', 'url' => route('home')],
                ['label' => 'Proyectos', 'url' => null]
            ]" />
        </div>
        <h1 class="h2 mb-sm font-heading fw-bold" data-reveal>Proyectos</h1>
        <p class="text-fluid-lg text-muted" style="max-width: 60ch;" data-reveal>
            Portafolio selecto de portales institucionales, plataformas de alto tráfico, arquitecturas headless y experiencias web fluidas.
        </p>
    </div>

    {{-- Grid a 2 Columnas en Container --}}
    <div class="row g-4 g-lg-5" data-layout="airy">
        @foreach ($allProjects as $project)
            <div class="col-12 col-md-6" data-reveal>
                <a href="{{ $project['url'] }}" 
                   @if(!empty($project['is_external'])) target="_blank" rel="noopener noreferrer" @endif
                   class="project-showcase-card d-block text-decoration-none" 
                   data-project-card
                   data-magnetic data-magnetic-strength="0.04">
                    <div class="project-showcase-media position-relative overflow-hidden">
                        <img src="{{ $project['image'] }}" 
                             alt="{{ $project['title'] }}" 
                             class="project-showcase-img w-100 h-100 object-fit-cover"
                             loading="lazy">
                        
                        <div class="project-corner-badge position-absolute" aria-hidden="true">
                            <span class="badge-circle-icon">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489l-4.004-10.97A9.957 9.957 0 0 1 12 4c2.203 0 4.237.713 5.888 1.916L12.72 17.51a1.29 1.29 0 0 1-1.077.585c-.32 0-.616-.118-.846-.312L8.2 15.35c.484-.047.935-.14 1.309-.344l-2.45-6.953-2.613 7.41A9.972 9.972 0 0 0 12 22c1.928 0 3.73-.545 5.258-1.488l-3.69-10.11 3.738-9.043C15.86 2.502 13.987 2 12 2zm-4.717 6.444c.48 0 .874-.393.874-.873 0-.48-.394-.874-.874-.874H5.06a.874.874 0 1 0 0 1.747h.839l2.84 8.04 1.83-5.207-1.286-3.706h-.001zm11.455.874c0 .48.394.873.874.873h.84a.874.874 0 1 0 0-1.747h-.84a.874.874 0 0 0-.874.874zm.76 1.83l-3.212 9.309A9.948 9.948 0 0 0 22 12c0-1.794-.475-3.477-1.304-4.936l-2.194 6.084z"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div class="project-showcase-body">
                        <span class="project-category-subtitle d-block">
                            {{ $project['category'] }}
                        </span>
                        <h3 class="project-title-heading">
                            {{ $project['title'] }}
                        </h3>
                        <div class="project-view-link">
                            <span>View Project</span>
                            <span class="project-view-arrow">&nearr;</span>
                        </div>
                    </div>
                </a>
            </div>
        @endforeach
    </div>

    @if ($contents->hasPages())
        <div class="mt-2xl d-flex justify-content-center">
            {{ $contents->links() }}
        </div>
    @endif
</section>
@endsection
