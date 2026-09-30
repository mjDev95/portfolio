@props([
    'type' => 'proyectos',
    'label' => null,
    'count' => null,
    'route' => null,
])

@php
    // 1. Resolver el ContentType y su slug público de forma resiliente
    if ($type instanceof \App\Models\ContentType) {
        $cpt = $type;
        $cptSlug = $cpt->public_route_slug ?? $cpt->slug;
    } else {
        $cptSlug = (string) $type;
        $cpt = \App\Models\ContentType::where('slug', $cptSlug)
            ->orWhere('public_slug', $cptSlug)
            ->first();
        if ($cpt) {
            $cptSlug = $cpt->public_route_slug ?? $cpt->slug;
        }
    }

    // 2. Conteo total de contenidos publicados para este CPT
    if ($count !== null) {
        $totalCount = (int) $count;
    } elseif ($cpt) {
        $totalCount = \App\Models\Content::query()
            ->where('content_type_id', $cpt->id)
            ->published()
            ->count();
    } else {
        $totalCount = \App\Models\Content::query()
            ->whereHas('contentType', fn ($q) => $q->where('slug', $cptSlug)->orWhere('public_slug', $cptSlug))
            ->published()
            ->count();
    }

    // 3. Resolver la URL de destino
    if (! empty($route)) {
        $targetUrl = $route;
    } elseif (\Illuminate\Support\Facades\Route::has('public.content.index')) {
        $targetUrl = route('public.content.index', $cptSlug);
    } else {
        $targetUrl = url("/{$cptSlug}");
    }

    // 4. Etiqueta amigable de acción
    if (! empty($label)) {
        $actionLabel = $label;
    } elseif ($cpt) {
        $actionLabel = 'Ver todos los ' . strtolower($cpt->name);
    } else {
        $actionLabel = 'Ver todos los ' . strtolower($cptSlug);
    }
@endphp

<div {{ $attributes->merge(['class' => 'stodio-cta-wrap w-100']) }}>
    <div class="container text-center">
        <a href="{{ $targetUrl }}" 
           class="stodio-all-cases-btn" 
           data-magnetic data-magnetic-strength="0.15">
            <span class="arrow">&rarr;</span>
            <span>{{ $actionLabel }}</span>
            <span class="cases-count font-mono text-brand">({{ str_pad($totalCount, 2, '0', STR_PAD_LEFT) }})</span>
        </a>
    </div>
</div>
