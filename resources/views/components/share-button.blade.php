@props([
    'id' => null,
    'title' => '',
    'url' => null,
    'type' => 'Contenido',
    'label' => 'Compartir',
    'class' => '',
])

<x-btn
    :id="$id"
    modal="share"
    :share-title="$title"
    :share-url="$url"
    :share-type="$type"
    icon="share"
    icon-position="left"
    :title="'Compartir ' . $type"
    {{ $attributes->merge(['class' => $class]) }}
>{{ $label }}</x-btn>
