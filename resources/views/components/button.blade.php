@props([
    'href' => null,
    'type' => 'button',
    'variant' => 'surface',
    'size' => 'md',
    'icon' => null,
    'iconPosition' => 'right',
    'magnetic' => true,
    'magneticStrength' => null,
    'modal' => null,
    'shareTitle' => '',
    'shareUrl' => null,
    'shareType' => 'Contenido',
    'label' => null,
])

<x-btn
    :href="$href"
    :type="$type"
    :variant="$variant"
    :size="$size"
    :icon="$icon"
    :icon-position="$iconPosition"
    :magnetic="$magnetic"
    :magnetic-strength="$magneticStrength"
    :modal="$modal"
    :share-title="$shareTitle"
    :share-url="$shareUrl"
    :share-type="$shareType"
    :label="$label"
    {{ $attributes }}
>
    {{ $slot }}
</x-btn>
