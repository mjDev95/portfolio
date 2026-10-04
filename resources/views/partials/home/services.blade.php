{{-- 
  Sección: Servicios Especializados
  Alineada con el sistema editorial fluido a pantalla completa (fluid-system.css & reference design)
  Diseño editorial minimalista continuo con líneas divisorias hairline,
  numeración mono, tipografía de cabecera y enlaces interactivos.
--}}
<section id="services" class="services-editorial-section position-relative w-100">
    <div class="services-editorial-content">
        {{-- Encabezado: Etiqueta + Título monumental (izq) y descripción contextual (der) --}}
        <div class="services-header-row mb-xl" data-reveal>
            <div class="services-header-left">
                <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-xs tracking-widest">
                    /// Servicios Especializados ///
                </span>
                <h2 class="services-main-title">
                    Servicios
                </h2>
            </div>
            <div class="services-header-right">
                <p class="services-lead-text">
                    Soluciones de arquitectura en WordPress, ingeniería Front-End y sistemas de diseño escalables para plataformas web de alto rendimiento.
                </p>
            </div>
        </div>

        {{-- Lista Editorial de Servicios a Filas Continuas --}}
        <div class="service-editorial-list" data-reveal>
            {{-- 01: WordPress Architecture --}}
            <a href="{{ route('contact') }}" 
               class="service-editorial-item" 
               data-magnetic data-magnetic-strength="0.04"
               aria-label="Consultar sobre WordPress Architecture">
                <span class="service-item-index font-mono">01</span>
                <h3 class="service-item-title">WordPress Architecture</h3>
                <p class="service-item-desc">
                    Custom Themes nativos en PHP 8.4 puro, arquitecturas de Custom Post Types (CPTs), taxonomías y metaboxes propios sin plugins pesados de terceros.
                </p>
                <span class="service-item-arrow" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </span>
            </a>

            {{-- 02: Core Web Vitals --}}
            <a href="{{ route('contact') }}" 
               class="service-editorial-item" 
               data-magnetic data-magnetic-strength="0.04"
               aria-label="Consultar sobre Core Web Vitals">
                <span class="service-item-index font-mono">02</span>
                <h3 class="service-item-title">Core Web Vitals</h3>
                <p class="service-item-desc">
                    Optimización extrema (LCP &lt; 1.2s, CLS = 0), depuración de scripts bloqueantes, compresión WebP en el edge y eliminación radical de DOM bloating.
                </p>
                <span class="service-item-arrow" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </span>
            </a>

            {{-- 03: UI/UX & Design Systems --}}
            <a href="{{ route('contact') }}" 
               class="service-editorial-item" 
               data-magnetic data-magnetic-strength="0.04"
               aria-label="Consultar sobre UI/UX & Design Systems">
                <span class="service-item-index font-mono">03</span>
                <h3 class="service-item-title">UI/UX &amp; Design Systems</h3>
                <p class="service-item-desc">
                    Traducción 1:1 de prototipos desde Figma a código limpio, Auto-Layout, sistemas de diseño gobernados por tokens matemáticos y escala fluida con clamp().
                </p>
                <span class="service-item-arrow" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </span>
            </a>

            {{-- 04: Frontend Engineering --}}
            <a href="{{ route('contact') }}" 
               class="service-editorial-item" 
               data-magnetic data-magnetic-strength="0.04"
               aria-label="Consultar sobre Frontend Engineering">
                <span class="service-item-index font-mono">04</span>
                <h3 class="service-item-title">Frontend Engineering</h3>
                <p class="service-item-desc">
                    Componentes modulares en Laravel Blade, JavaScript ES6+ vanilla, microinteracciones magnéticas y animaciones cinemáticas orquestadas a 60fps con GSAP.
                </p>
                <span class="service-item-arrow" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </span>
            </a>

            {{-- 05: Desarrollo Web --}}
            <a href="{{ route('contact') }}" 
               class="service-editorial-item" 
               data-magnetic data-magnetic-strength="0.04"
               aria-label="Consultar sobre Desarrollo Web">
                <span class="service-item-index font-mono">05</span>
                <h3 class="service-item-title">Desarrollo Web</h3>
                <p class="service-item-desc">
                    Construcción integral de plataformas digitales a medida, sitios institucionales de alto impacto, APIs REST y tiendas headless con foco en accesibilidad WCAG y SEO técnico.
                </p>
                <span class="service-item-arrow" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </span>
            </a>
        </div>
    </div>
</section>
