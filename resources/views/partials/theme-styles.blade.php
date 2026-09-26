@php
    // Resolver el usuario administrador responsable del portafolio o el usuario en sesión
    $adminUser = \App\Models\User::whereHas('role', fn ($q) => $q->where('slug', 'admin'))->first() 
        ?? \App\Models\User::first();

    $activeUser = auth()->user() ?? $tenant ?? $adminUser;

    // 1. Resolver la paleta oficial directamente desde la base de datos (tabla color_palettes):
    // Prioridad 1: Paleta asociada al usuario autenticado (si está navegando en su sesión)
    // Prioridad 2: Paleta activa del administrador en color_palettes (definida en el panel de Identidad)
    // Prioridad 3: Paleta maestra oficial en la base de datos (is_master = true)
    // Prioridad 4: Primera paleta disponible en la base de datos
    $activePalette = (auth()->check() ? auth()->user()->preference?->colorPalette : null)
        ?? $adminUser?->preference?->colorPalette
        ?? \App\Models\ColorPalette::where('is_master', true)->first()
        ?? \App\Models\ColorPalette::first();

    if ($activePalette) {
        $primary = $activePalette->primary_color;
        $secondary = $activePalette->secondary_color;
        $accent = $activePalette->accent_color ?: $primary;
    } else {
        $primary = '#CB2128';
        $secondary = '#DFB136';
        $accent = '#F59E0B';
    }

    $sanitizeHex = function (?string $color, string $default): string {
        return ($color && preg_match('/^#[a-fA-F0-9]{3,8}$/', $color)) ? $color : $default;
    };

    $primary = $sanitizeHex($primary, '#CB2128');
    $secondary = $sanitizeHex($secondary, '#DFB136');
    $accent = $sanitizeHex($accent, $primary);
@endphp

<style id="portfolio-custom-palette">
    :root,
    html.dark,
    html.light {
        /* Colores dinámicos sincronizados desde la Base de Datos */
        --accent: {{ $primary }};
        --accent-secondary: {{ $secondary }};
        --accent-highlight: {{ $accent }};
        --accent-glow: {{ $primary }}33;
        
        --color-primary: {{ $primary }};
        --color-secondary: {{ $secondary }};
        --color-accent: {{ $primary }};

        --bs-primary: {{ $primary }};
        --bs-secondary: {{ $secondary }};

        --fluid-color-primary: {{ $primary }};
        --fluid-color-secondary: {{ $secondary }};
        --fluid-color-accent: {{ $primary }};
    }

    /* Clases utilitarias directas vinculadas al color de la Base de Datos */
    .text-accent {
        color: var(--accent) !important;
    }
    .text-accent-secondary {
        color: var(--accent-secondary) !important;
    }
    .bg-accent {
        background-color: var(--accent) !important;
    }
    .bg-accent-subtle {
        background-color: var(--accent-glow) !important;
    }
    .border-accent {
        border-color: var(--accent) !important;
    }
    .border-accent-subtle {
        border-color: var(--accent-glow) !important;
    }
    .hover-text-accent:hover {
        color: var(--accent) !important;
    }
    .hover-border-accent:hover {
        border-color: var(--accent) !important;
    }
</style>
