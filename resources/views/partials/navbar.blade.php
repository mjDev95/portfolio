<header class="site-header-fixed {{ request()->routeIs('home') ? 'navbar-curtain-hidden' : '' }}" id="site-header" data-magnetic-zone>
    {{-- ══════════════════════════════════════════════════════════════════════════
         1. ISLA DESKTOP (Exclusiva para Ordenador: min-width: 1024px)
         ══════════════════════════════════════════════════════════════════════════ --}}
    <div class="nav-desktop-island" id="desktop-island">
        {{-- Bloque Expandido Inicial (Avatar + Enlaces + Theme + Contact) --}}
        <div class="desktop-island-expanded" id="desktop-island-expanded">
            <a href="{{ route('home') }}" class="island-avatar-btn" data-magnetic title="Mario Joaquín Galicia — Volver al inicio">
                <div class="island-avatar-wrap">
                    <img src="{{ asset('images/avatar.png') }}" 
                         alt="Mario J. Galicia" 
                         class="island-avatar-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span class="island-avatar-fallback">MJ</span>
                </div>
            </a>

            <nav class="island-nav-links" id="desktop-nav-links">
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
                    @if (strtolower($cpt->public_route_slug) !== 'proyectos' && strtolower($cpt->name) !== 'proyectos' && strtolower($cpt->name) !== 'projects')
                        @php
                            $isActive = request()->is($cpt->public_route_slug) || request()->is($cpt->public_route_slug . '/*');
                        @endphp
                        <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" 
                           class="island-nav-link {{ $isActive ? 'active' : '' }}" 
                           data-magnetic>
                            {{ $cpt->name }}
                        </a>
                    @endif
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

        {{-- Bloque Compacto Desktop (Avatar + Available for work 🟢) --}}
        <div class="desktop-island-compact" id="desktop-island-compact">
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
        </div>
    </div>

    {{-- ══════════════════════════════════════════════════════════════════════════
         2. ISLA MÓVIL Y TABLET (Exclusiva para Móvil/Tablet: max-width: 1023px)
         Cápsula única que se expande estrictamente sobre el Eje Y con Timeline GSAP
         ══════════════════════════════════════════════════════════════════════════ --}}
    <div class="nav-mobile-island" id="mobile-island">
        {{-- Cabecera fija de la píldora: Avatar + Available + Dot + Toggle --}}
        <div class="mobile-island-bar" id="mobile-island-bar">
            <a href="{{ route('home') }}" class="island-avatar-btn" title="Mario Joaquín Galicia">
                <div class="island-avatar-wrap">
                    <img src="{{ asset('images/avatar.png') }}" 
                         alt="Mario J. Galicia" 
                         class="island-avatar-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span class="island-avatar-fallback">MJ</span>
                </div>
            </a>
            <div class="mobile-island-status">
                <span class="island-status-text">Available for work</span>
                <span class="island-pulse-dot" aria-label="Available for work" title="Disponible para proyectos">
                    <span class="island-pulse-ring"></span>
                    <span class="island-pulse-core"></span>
                </span>
            </div>
            <button type="button" 
                    id="mobile-island-toggle" 
                    class="mobile-island-toggle" 
                    aria-label="Abrir menú"
                    aria-expanded="false">
                <span class="toggle-bar bar-top"></span>
                <span class="toggle-bar bar-bot"></span>
            </button>
        </div>

        {{-- Cuerpo expandible: Anima de height 0 a auto sobre el eje Y con timeline --}}
        <div class="mobile-island-body" id="mobile-island-body">
            <nav class="mobile-island-nav">
                <a href="{{ route('home') }}#hero-editorial-2" class="mobile-island-link" data-section="hero-editorial-2">Home</a>
                <a href="{{ route('about') }}" class="mobile-island-link {{ request()->routeIs('about') ? 'active' : '' }}" data-section="about">About</a>
                <a href="{{ route('home') }}#services" class="mobile-island-link" data-section="services">Services</a>
                <a href="{{ route('home') }}#proyectos" class="mobile-island-link" data-section="proyectos">Projects</a>
                @foreach ($navContentTypes as $cpt)
                    @if (strtolower($cpt->public_route_slug) !== 'proyectos' && strtolower($cpt->name) !== 'proyectos' && strtolower($cpt->name) !== 'projects')
                        <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" class="mobile-island-link">
                            {{ $cpt->name }}
                        </a>
                    @endif
                @endforeach
            </nav>

            <div class="mobile-island-footer">
                <a href="{{ route('contact') }}" class="btn-mobile-contact">
                    <span>Contact</span>
                </a>
                <button type="button" class="mobile-island-theme-btn" id="mobile-island-theme-toggle" aria-label="Cambiar modo de color">
                    <span>Modo de color</span>
                    <span class="theme-icon-indicator">◐</span>
                </button>
            </div>
        </div>
    </div>
</header>

