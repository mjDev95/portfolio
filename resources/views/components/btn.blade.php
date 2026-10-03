@props([
    'href' => null,
    'type' => 'button',
    'variant' => 'surface',
    'size' => 'md',
    'active' => false,
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

@php
    $tag = $href ? 'a' : 'button';
    $resolvedUrl = $shareUrl ?: url()->current();
    $resolvedVariant = $active ? 'solid' : $variant;
    
    $classes = [
        'btn-universal',
        'btn-' . $resolvedVariant,
        $active ? 'is-active' : '',
        $size === 'lg' ? 'btn-lg' : ($size === 'sm' ? 'btn-sm' : ''),
        'border-0',
        'text-decoration-none',
        'd-inline-flex',
        'align-items-center',
        'justify-content-center',
    ];
@endphp

<{{ $tag }}
    @if ($href) href="{{ $href }}" @else type="{{ $type }}" @endif
    @if ($magnetic) data-magnetic @endif
    @if ($magneticStrength) data-magnetic-strength="{{ $magneticStrength }}" @endif
    @if ($modal === 'share')
        data-share-modal-open
        data-share-title="{{ $shareTitle }}"
        data-share-url="{{ $resolvedUrl }}"
        data-share-type="{{ $shareType }}"
        aria-haspopup="dialog"
        aria-expanded="false"
    @endif
    {{ $attributes->merge(['class' => implode(' ', array_filter($classes))]) }}
>
    <span class="btn-text">
        @if ($icon && $iconPosition === 'left')
            <span class="btn-icon btn-icon-{{ $icon }}" aria-hidden="true">
                @if ($icon === 'share')
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                @elseif (in_array($icon, ['arrow-up-right', 'nearr', 'arrow']))
                    &nearr;
                @elseif (in_array($icon, ['arrow-right', 'rarr']))
                    &rarr;
                @endif
            </span>
        @endif

        <span class="btn-label">{{ $slot->isNotEmpty() ? $slot : $label }}</span>

        @if ($icon && $iconPosition === 'right')
            <span class="btn-icon btn-icon-{{ $icon }}" aria-hidden="true">
                @if ($icon === 'share')
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                @elseif (in_array($icon, ['arrow-up-right', 'nearr', 'arrow']))
                    &nearr;
                @elseif (in_array($icon, ['arrow-right', 'rarr']))
                    &rarr;
                @endif
            </span>
        @endif
    </span>
</{{ $tag }}>
