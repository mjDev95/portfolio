<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts via Bunny Fonts (CORS enabled & privacy friendly) -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,500,600,700,800|poppins:300,400,500,600,700" rel="stylesheet" />

        <!-- Theme & Palette initialization without FOUC (User DB preference -> localStorage -> system) -->
        <script>
            (function () {
                try {
                    const dbTheme = @json(auth()->user()?->preference?->theme);
                    const localTheme = localStorage.getItem('admin_theme');
                    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    
                    let activeTheme = localTheme || dbTheme;
                    if (!activeTheme || (activeTheme !== 'dark' && activeTheme !== 'light')) {
                        activeTheme = systemDark ? 'dark' : 'light';
                    }

                    if (activeTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    localStorage.setItem('admin_theme', activeTheme);

                    // Dynamic palette application (DB preference -> localStorage -> default)
                    const userId = @json(auth()->id());
                    const isAuthenticated = Boolean(userId);
                    const isAdmin = @json(auth()->user()?->isAdmin() ?? false);
                    if (isAdmin) {
                        document.documentElement.classList.add('is-super-admin');
                    } else {
                        document.documentElement.classList.remove('is-super-admin');
                    }

                    @php
                        $user = auth()->user();
                        $pref = $user?->preference;
                        $activePalette = $pref?->colorPalette;
                        $primaryColor = $activePalette?->primary_color ?? ($pref?->color_palette['colors']['primary'] ?? null);
                        $secondaryColor = $activePalette?->secondary_color ?? ($pref?->color_palette['colors']['secondary'] ?? null);
                        $tertiaryColor = $activePalette?->tertiary_color ?? ($pref?->color_palette['colors']['tertiary'] ?? null);
                        $accentColor = $activePalette?->accent_color ?? ($pref?->color_palette['colors']['accent'] ?? null);
                    @endphp
                    const serverPrimary = @json($primaryColor);
                    const serverSecondary = @json($secondaryColor);
                    const serverTertiary = @json($tertiaryColor);
                    const serverAccent = @json($accentColor);

                    // Colores por defecto estrictos por rol
                    const defaultPrimary = isAdmin ? '#CB2128' : (!isAuthenticated ? '#CB2128' : '#2787F5');
                    const defaultSecondary = isAdmin ? '#DFB136' : (!isAuthenticated ? '#DFB136' : '#6c757d');
                    const defaultTertiary = isAdmin ? '#1D4ED8' : (!isAuthenticated ? '#1D4ED8' : '#00B4D8');
                    const defaultAccent = isAdmin ? '#F59E0B' : (!isAuthenticated ? '#F59E0B' : '#DFB136');

                    // Clave aislada por ID de usuario para evitar contaminación entre sesiones
                    const userPrefix = userId ? 'user_palette_' + userId + '_' : (isAdmin ? 'admin_palette_' : '');
                    const primary = serverPrimary || (userPrefix ? localStorage.getItem(userPrefix + 'primary') : null) || defaultPrimary;
                    const secondary = serverSecondary || (userPrefix ? localStorage.getItem(userPrefix + 'secondary') : null) || defaultSecondary;
                    const tertiary = serverTertiary || (userPrefix ? localStorage.getItem(userPrefix + 'tertiary') : null) || defaultTertiary;
                    const accent = serverAccent || (userPrefix ? localStorage.getItem(userPrefix + 'accent') : null) || defaultAccent;

                    function hexToRgb(hex) {
                        if (!hex) return null;
                        let c = hex.replace('#', '').trim();
                        if (c.length === 3) c = c.split('').map(function(x) { return x + x; }).join('');
                        if (c.length !== 6) return null;
                        const n = parseInt(c, 16);
                        return ((n >> 16) & 255) + ' ' + ((n >> 8) & 255) + ' ' + (n & 255);
                    }

                    function shade(hex, pct) {
                        let c = hex.replace('#', '').trim();
                        if (c.length === 3) c = c.split('').map(function(x) { return x + x; }).join('');
                        if (c.length !== 6) return hex;
                        const num = parseInt(c, 16);
                        const t = pct < 0 ? 0 : 255;
                        const p = Math.abs(pct) / 100;
                        const R = Math.round((t - ((num >> 16) & 255)) * p) + ((num >> 16) & 255);
                        const G = Math.round((t - ((num >> 8) & 255)) * p) + ((num >> 8) & 255);
                        const B = Math.round((t - (num & 255)) * p) + (num & 255);
                        return '#' + ((1 << 24) + (Math.max(0, Math.min(255, R)) << 16) + (Math.max(0, Math.min(255, G)) << 8) + Math.max(0, Math.min(255, B))).toString(16).slice(1);
                    }

                    const pRgb = hexToRgb(primary) || '203 33 40';
                    const sRgb = hexToRgb(secondary) || '223 177 54';
                    const tRgb = hexToRgb(tertiary) || '29 78 216';
                    const aRgb = hexToRgb(accent) || '245 158 11';

                    document.documentElement.style.setProperty('--brand-primary', primary);
                    document.documentElement.style.setProperty('--brand-primary-rgb', pRgb);
                    document.documentElement.style.setProperty('--brand-primary-hover', shade(primary, -12));
                    document.documentElement.style.setProperty('--brand-primary-dark', shade(primary, -25));
                    document.documentElement.style.setProperty('--brand-primary-subtle', shade(primary, 88));

                    document.documentElement.style.setProperty('--brand-secondary', secondary);
                    document.documentElement.style.setProperty('--brand-secondary-rgb', sRgb);
                    document.documentElement.style.setProperty('--brand-secondary-hover', shade(secondary, -12));
                    document.documentElement.style.setProperty('--brand-secondary-subtle', shade(secondary, 88));

                    document.documentElement.style.setProperty('--brand-tertiary', tertiary);
                    document.documentElement.style.setProperty('--brand-tertiary-rgb', tRgb);
                    document.documentElement.style.setProperty('--brand-tertiary-hover', shade(tertiary, -12));
                    document.documentElement.style.setProperty('--brand-tertiary-subtle', shade(tertiary, 88));

                    document.documentElement.style.setProperty('--brand-accent', accent);
                    document.documentElement.style.setProperty('--brand-accent-rgb', aRgb);
                    document.documentElement.style.setProperty('--brand-accent-hover', shade(accent, -12));
                    document.documentElement.style.setProperty('--brand-accent-subtle', shade(accent, 88));
                } catch (e) {}
            })();
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased text-base">
        @inertia
    </body>
</html>
