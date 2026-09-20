@php
    $currentTenant = $tenant ?? auth()->user() ?? \App\Models\User::first();
    $palette = $currentTenant?->theme_settings['color_palette']['colors'] 
        ?? $currentTenant?->preference?->color_palette['colors'] 
        ?? $currentTenant?->getSetting('color_palette.colors') 
        ?? null;

    $sanitizeHex = function (?string $color, string $default): string {
        return ($color && preg_match('/^#[a-fA-F0-9]{3,8}$/', $color)) ? $color : $default;
    };
@endphp

@if(!empty($palette) && is_array($palette))
<style id="portfolio-custom-palette">
    :root {
        /* 2 Colores de Marca Principales (Bootstrap 5) */
        --bs-primary: {{ $sanitizeHex($palette['primary'] ?? null, '#0d6efd') }};
        --bs-secondary: {{ $sanitizeHex($palette['secondary'] ?? null, '#6c757d') }};

        /* Colores de Estado Opcionales */
        @if(!empty($palette['success']))
            --bs-success: {{ $sanitizeHex($palette['success'], '#198754') }};
        @endif
        @if(!empty($palette['danger']))
            --bs-danger: {{ $sanitizeHex($palette['danger'], '#dc3545') }};
        @endif
        @if(!empty($palette['warning']))
            --bs-warning: {{ $sanitizeHex($palette['warning'], '#ffc107') }};
        @endif
        @if(!empty($palette['info']))
            --bs-info: {{ $sanitizeHex($palette['info'], '#0dcaf0') }};
        @endif

        /* Aliases de compatibilidad fluida y animaciones GSAP */
        --fluid-color-primary: var(--bs-primary);
        --fluid-color-secondary: var(--bs-secondary);
        --fluid-color-accent: var(--bs-primary);
    }
</style>
@endif
