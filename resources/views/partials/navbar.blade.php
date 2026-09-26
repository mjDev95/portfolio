<header class="site-header-fixed {{ request()->routeIs('home') ? 'navbar-curtain-hidden' : '' }}" id="site-header" data-magnetic-zone>
    {{-- Dynamic Island Cápsula Central (Centrada matemáticamente en el viewport) --}}
    <div class="dynamic-island" id="dynamic-island" data-island-state="expanded">
        {{-- 1. Bloque Compacto: Avatar + "Available for work" + Indicador Verde Pulsante 🟢 + Botón Hamburguesa --}}
        <div class="island-compact" id="island-compact">
            <a href="{{ route('home') }}" class="island-avatar-btn" data-magnetic title="Mario Joaquín Galicia">
                <div class="island-avatar-wrap">
                    <img src="{{ asset('images/avatar.png') }}" 
                         alt="Mario J. Galicia" 
                         class="island-avatar-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span class="island-avatar-fallback">MJ</span>
                </div>
            </a>
            <span class="island-status-text">Available for work</span>
            <span class="island-pulse-dot" aria-label="Available for work" title="Disponible para proyectos">
                <span class="island-pulse-ring"></span>
                <span class="island-pulse-core"></span>
            </span>
            <button type="button" 
                    id="mobile-menu-toggle" 
                    class="navbar-mobile-toggle" 
                    aria-label="Abrir menú"
                    aria-expanded="false">
                <span class="mobile-toggle-bar"></span>
                <span class="mobile-toggle-bar"></span>
            </button>
        </div>

        {{-- 2. Bloque Expandido (Desktop): Avatar + Enlaces + Theme + Contact CTA --}}
        <div class="island-expanded" id="island-expanded">
            <a href="{{ route('home') }}" class="island-avatar-btn" data-magnetic title="Mario Joaquín Galicia — Volver al inicio">
                <div class="island-avatar-wrap">
                    <img src="{{ asset('images/avatar.png') }}" 
                         alt="Mario J. Galicia" 
                         class="island-avatar-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span class="island-avatar-fallback">MJ</span>
                </div>
            </a>

            <nav class="island-nav-links" id="island-nav-links">
                <a href="{{ route('home') }}#hero-editorial-2" class="island-nav-link" data-section="hero-editorial-2" data-magnetic>Home</a>
                <a href="{{ route('about') }}" class="island-nav-link {{ request()->routeIs('about') ? 'active' : '' }}" data-section="about" data-magnetic>About</a>
                <a href="{{ route('home') }}#services" class="island-nav-link" data-section="services" data-magnetic>Services</a>
                <a href="{{ route('home') }}#proyectos" class="island-nav-link" data-section="proyectos" data-magnetic>Projects</a>
                @php
                    $navContentTypes = \Illuminate\Support\Facades\Schema::hasTable('content_types')
                        ? \App\Models\ContentType::where('is_public', true)->orderBy('order')->get()
                        : collect();
                @endphp
                @foreach ($navContentTypes as $cpt)
                    @php
                        $isActive = request()->is($cpt->public_route_slug) || request()->is($cpt->public_route_slug . '/*');
                    @endphp
                    <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" 
                       class="island-nav-link {{ $isActive ? 'active' : '' }}" 
                       data-magnetic>
                        {{ $cpt->name }}
                    </a>
                @endforeach
            </nav>

            <div class="island-actions">
                <button type="button" 
                        id="theme-toggle" 
                        class="island-theme-btn" 
                        aria-label="Cambiar modo de color"
                        data-magnetic>
                    <svg class="icon-sun" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <svg class="icon-moon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </button>

                <a href="{{ route('contact') }}" 
                   class="btn-island-cta" 
                   id="navbar-cta-btn"
                   data-magnetic>
                    <span>Contact</span>
                    <span class="btn-island-arrow">&nearr;</span>
                </a>
            </div>
        </div>
    </div>

    {{-- Modal Móvil Card Centrado (Estilo Exacto de la Referencia) --}}
    <div class="navbar-mobile-drawer" id="navbar-mobile-drawer" aria-hidden="true">
        <div class="mobile-drawer-header">
            <div class="island-avatar-wrap">
                <img src="{{ asset('images/avatar.png') }}" 
                     alt="Mario J. Galicia" 
                     class="island-avatar-img"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <span class="island-avatar-fallback">MJ</span>
            </div>
            <button type="button" 
                    id="mobile-drawer-close" 
                    class="mobile-drawer-close-btn" 
                    aria-label="Cerrar menú">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <nav class="mobile-drawer-nav">
            <a href="{{ route('home') }}#hero-editorial-2" class="mobile-nav-link">Home</a>
            <a href="{{ route('about') }}" class="mobile-nav-link {{ request()->routeIs('about') ? 'active' : '' }}">About</a>
            <a href="{{ route('home') }}#services" class="mobile-nav-link">Services</a>
            <a href="{{ route('home') }}#proyectos" class="mobile-nav-link">Projects</a>
            @foreach ($navContentTypes as $cpt)
                <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" class="mobile-nav-link">
                    {{ $cpt->name }}
                </a>
            @endforeach
        </nav>

        <div class="mobile-drawer-footer">
            <a href="{{ route('contact') }}" class="btn-drawer-contact">
                <span>Contact</span>
            </a>
            <button type="button" class="mobile-theme-toggle-btn" id="mobile-theme-toggle" aria-label="Cambiar modo de color">
                <span>Modo de color</span>
                <span class="theme-icon-indicator">◐</span>
            </button>
        </div>
    </div>
</header>
