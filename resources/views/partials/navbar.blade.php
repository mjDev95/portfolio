@php
    $navItems = [
        [
            'label' => 'Home',
            'url' => route('home'),
            'section' => 'home',
            'active' => request()->routeIs('home'),
        ],
        [
            'label' => 'About',
            'url' => route('about'),
            'section' => 'about',
            'active' => request()->routeIs('about'),
        ],
    ];

    foreach ($navContentTypes ?? [] as $cpt) {
        $cptSlug = is_object($cpt) ? ($cpt->public_route_slug ?? $cpt->slug ?? '') : (is_array($cpt) ? ($cpt['public_route_slug'] ?? $cpt['slug'] ?? '') : (string) $cpt);
        $cptName = is_object($cpt) ? ($cpt->name ?? ucfirst($cptSlug)) : (is_array($cpt) ? ($cpt['name'] ?? ucfirst($cptSlug)) : ucfirst($cptSlug));
        if (! empty($cptSlug) && ! str_contains((string) $cptSlug, '\\')) {
            $navItems[] = [
                'label' => $cptName,
                'url' => route('public.content.index', $cptSlug),
                'section' => $cptSlug,
                'active' => request()->routeIs('public.content.*') && (request()->route('typeSlug') === $cptSlug),
            ];
        }
    }

    $navItems[] = [
        'label' => 'Contact',
        'url' => route('contact'),
        'section' => 'contact',
        'active' => request()->routeIs('contact'),
    ];
@endphp

<header class="site-header-fixed position-fixed top-0 left-0 right-0 w-100 py-sm px-gutter d-flex justify-content-end align-items-center pointer-events-none will-change-transform {{ request()->routeIs('home') ? 'navbar-curtain-hidden' : '' }}" id="site-header" data-magnetic-zone>
    <div class="nav-header-inner w-100 d-flex align-items-center justify-content-between position-relative pointer-events-none">
        {{-- 1. ENLACES PLANOS EN EL TOPE (Sin píldora y sin avatar; se ocultan al hacer scroll) --}}
        <nav class="nav-flat-bar d-inline-flex align-items-center gap-3 pointer-events-auto will-change-transform" id="nav-flat-bar" aria-label="Navegación principal">
            @foreach ($navItems as $item)
                <a href="{{ $item['url'] }}"
                   class="nav-flat-link font-sans text-fluid-base fw-medium text-secondary text-decoration-none position-relative py-1 {{ $item['active'] ? 'active' : '' }}"
                   data-section="{{ $item['section'] }}">
                    {{ $item['label'] }}
                </a>
            @endforeach

            <button type="button"
                    id="theme-toggle"
                    data-theme-toggle
                    class="nav-flat-theme-btn d-inline-flex align-items-center justify-content-center rounded-circle bg-transparent border-0 p-1 text-secondary cursor-pointer"
                    aria-label="Cambiar modo de color">
                <svg class="icon-sun" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg class="icon-moon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            </button>
        </nav>

        {{-- 2. TOGGLE CIRCULAR MAGNÉTICO (Siempre visible en móvil y desktop, sigue mouse y touch) --}}
        <button type="button"
                id="nav-magnetic-toggle"
                class="nav-magnetic-toggle d-inline-flex align-items-center justify-content-center rounded-circle bg-surface border-0 p-0 text-primary position-relative ms-auto cursor-pointer pointer-events-none user-select-none will-change-transform"
                data-magnetic
                data-magnetic-strength="0.38"
                aria-label="Abrir menú de navegación"
                aria-expanded="false"
                aria-controls="nav-pixel-drawer">
            <span class="nav-toggle-lines position-relative d-flex align-items-center justify-content-center pointer-events-none will-change-transform" data-magnetic-inner>
                <span class="nav-toggle-bar bar-top position-absolute left-0 w-100 d-block will-change-transform"></span>
                <span class="nav-toggle-bar bar-bot position-absolute left-0 w-100 d-block will-change-transform"></span>
            </span>
        </button>
    </div>
</header>

{{-- 3. DRAWER LATERAL CON REVELADO DE PÍXELES (50% Desktop / 100% Móvil, Derecha a Izquierda) --}}
<aside class="nav-pixel-drawer position-fixed inset-0 w-100 h-100 pointer-events-none" id="nav-pixel-drawer" aria-hidden="true">
    <div class="nav-drawer-backdrop position-absolute inset-0 pointer-events-none" id="nav-drawer-backdrop"></div>

    <div class="nav-drawer-panel position-absolute top-0 right-0 bottom-0 h-100 bg-transparent border-0 overflow-hidden d-flex flex-column pointer-events-none" id="nav-drawer-panel">
        {{-- Superficie Editorial del Drawer (Revelada sobre los píxeles de fondo) --}}
        <div class="drawer-surface position-relative z-index-2 w-100 h-100 px-gutter pt-sm pb-xl d-flex flex-column justify-content-between bg-transparent border-0 pointer-events-none" id="drawer-surface" data-drawer-surface>
            <div class="drawer-header d-flex align-items-center justify-content-between flex-shrink-0 border-0" data-drawer-reveal>
                <a href="{{ route('home') }}"
                   class="drawer-brand-link d-inline-flex align-items-center justify-content-center flex-shrink-0 text-primary text-decoration-none"
                   data-drawer-link
                   aria-label="Inicio">
                    <x-svg-brand-solid class="drawer-brand-avatar d-block" />
                </a>

                <button type="button"
                        id="mobile-island-theme-toggle"
                        data-theme-toggle
                        data-magnetic
                        data-magnetic-strength="0.35"
                        class="drawer-theme-circle-btn d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle bg-surface border-0 p-0 text-primary cursor-pointer will-change-transform"
                        aria-label="Cambiar modo de color">
                    <span class="drawer-theme-btn-inner d-inline-flex align-items-center justify-content-center pointer-events-none will-change-transform" data-magnetic-inner>
                        <svg class="icon-sun" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <svg class="icon-moon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </span>
                </button>
            </div>

            <nav class="drawer-nav d-flex flex-column align-items-start gap-2xs py-md" aria-label="Menú lateral">
                @foreach ($navItems as $item)
                    <a href="{{ $item['url'] }}"
                       class="drawer-nav-link font-heading text-primary text-decoration-none text-lowercase d-inline-block {{ $item['active'] ? 'active' : '' }}"
                       data-section="{{ $item['section'] }}"
                       data-drawer-link>
                        {{ $item['label'] }}
                    </a>
                @endforeach
            </nav>

            <div class="drawer-footer d-flex align-items-end justify-content-between border-0 pt-sm" data-drawer-reveal>
                <div class="drawer-contact-block d-flex flex-column align-items-start gap-2xs">
                    <span class="drawer-contact-eyebrow font-mono text-uppercase text-accent mb-2xs">GET IN TOUCH</span>
                    <a href="mailto:mjgaliciab@gmail.com" class="drawer-contact-item font-sans text-fluid-lg fw-normal text-primary text-decoration-none">mjgaliciab@gmail.com</a>
                    <a href="https://wa.me/525628425556" target="_blank" rel="noopener noreferrer" class="drawer-contact-item font-sans text-fluid-lg fw-normal text-primary text-decoration-none">+52 56 2842 5556</a>
                </div>
            </div>
        </div>

        {{-- Cuadrícula de Píxeles que construye el fondo del Drawer --}}
        <div class="drawer-pixel-grid position-absolute inset-0 w-100 h-100 z-index-1 d-grid gap-0 pointer-events-none" id="drawer-pixel-grid" data-drawer-pixel-grid aria-hidden="true"></div>
    </div>
</aside>
