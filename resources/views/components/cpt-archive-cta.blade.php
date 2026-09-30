@props([
    'type' => 'proyectos',
    'label' => null,
    'count' => null,
    'route' => null,
])

<x-stodio-cta 
    :type="$type" 
    :label="$label" 
    :count="$count" 
    :route="$route" 
    {{ $attributes }} 
/>
