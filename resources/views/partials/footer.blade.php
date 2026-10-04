{{-- 
  Footer Minimalista Editorial — Letras Grandes
  Inspiración editorial limpia con declaración monumental y grilla tipográfica de alta legibilidad.
--}}
<footer class="site-footer container-fluid position-relative z-index-1 bg-footer border-top-subtle pt-2xl pb-lg" id="contact" data-magnetic-zone>
    <div class="w-100">

        <div class="row g-4 g-lg-5 align-items-start mb-xl">
            {{-- Columna Izquierda: Símbolo de Marca + Declaración Monumental --}}
            <div class="col-12 col-lg-5 d-flex flex-column align-items-start">
                <div class="icon-xl text-accent flex-shrink-0 mb-md" aria-hidden="true">
                    {{-- Estrella de 4 puntas geométrica editorial --}}
                    <svg viewBox="0 0 100 100" fill="currentColor" class="w-100 h-100 d-block">
                        <path d="M46 0 H54 V28 Q54 46 72 46 H100 V54 H72 Q54 54 54 72 V100 H46 V72 Q46 54 28 54 H0 V46 H28 Q46 46 46 28 Z"/>
                    </svg>
                </div>
                <h2 class="h1 m-0 fw-semibold text-primary max-w-statement">
                    Estaré encantado de colaborar contigo
                </h2>
            </div>

            {{-- Columna Derecha: Grilla de Enlaces y Contacto --}}
            <div class="col-12 col-lg-7">
                <div class="row g-4">
                    
                    {{-- Grupo 1: Navegación --}}
                    <div class="col-12 col-sm-6 d-flex flex-column gap-2">
                        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest fw-medium d-inline-flex align-items-center gap-1">Navegación</span>
                        <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
                            <li><a href="{{ route('home') }}" class="footer-nav-link font-sans text-fluid-lg fw-normal lh-sm text-primary text-decoration-none d-inline-block" data-magnetic>Inicio</a></li>
                            <li><a href="{{ route('about') }}" class="footer-nav-link font-sans text-fluid-lg fw-normal lh-sm text-primary text-decoration-none d-inline-block" data-magnetic>Sobre mí</a></li>
                            @if (isset($navContentTypes) && count($navContentTypes) > 0)
                                @foreach ($navContentTypes as $cpt)
                                    @php
                                        $cptSlug = is_object($cpt) ? ($cpt->public_route_slug ?? $cpt->slug ?? '') : (is_array($cpt) ? ($cpt['public_route_slug'] ?? $cpt['slug'] ?? '') : (string) $cpt);
                                        $cptName = is_object($cpt) ? ($cpt->name ?? ucfirst($cptSlug)) : (is_array($cpt) ? ($cpt['name'] ?? ucfirst($cptSlug)) : ucfirst($cptSlug));
                                    @endphp
                                    @if (! empty($cptSlug) && ! str_contains((string) $cptSlug, '\\'))
                                        <li>
                                            <a href="{{ route('public.content.index', $cptSlug) }}" class="footer-nav-link font-sans text-fluid-lg fw-normal lh-sm text-primary text-decoration-none d-inline-block" data-magnetic>
                                                {{ $cptName }}
                                            </a>
                                        </li>
                                    @endif
                                @endforeach
                            @else
                                <li><a href="{{ route('public.content.index', 'proyectos') }}" class="footer-nav-link font-sans text-fluid-lg fw-normal lh-sm text-primary text-decoration-none d-inline-block" data-magnetic>Proyectos</a></li>
                                <li><a href="{{ route('public.content.index', 'blog') }}" class="footer-nav-link font-sans text-fluid-lg fw-normal lh-sm text-primary text-decoration-none d-inline-block" data-magnetic>Blog</a></li>
                            @endif
                        </ul>
                    </div>

                    {{-- Grupo 2: Redes Sociales --}}
                    <div class="col-12 col-sm-6 d-flex flex-column gap-2">
                        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest fw-medium d-inline-flex align-items-center gap-1">Redes</span>
                        <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
                            <li><a href="https://github.com/mariojoaquingalicia" target="_blank" rel="noopener noreferrer" class="footer-nav-link font-sans text-fluid-lg fw-normal lh-sm text-primary text-decoration-none d-inline-block" data-magnetic>GitHub</a></li>
                            <li><a href="https://www.linkedin.com/in/mario-joaquin-galicia/" target="_blank" rel="noopener noreferrer" class="footer-nav-link font-sans text-fluid-lg fw-normal lh-sm text-primary text-decoration-none d-inline-block" data-magnetic>LinkedIn</a></li>
                            <li><a href="https://www.awwwards.com" target="_blank" rel="noopener noreferrer" class="footer-nav-link font-sans text-fluid-lg fw-normal lh-sm text-primary text-decoration-none d-inline-block" data-magnetic>Awwwards</a></li>
                        </ul>
                    </div>

                    {{-- Grupo Contacto Directo: Correo Monumental --}}
                    <div class="col-12 mt-sm mt-lg-md">
                        <div>
                            <a href="mailto:mjgaliciab@gmail.com" class="footer-contact-link d-inline-flex align-items-baseline gap-1 text-primary text-decoration-none font-heading font-fluid-hero-statement fw-bold lh-tight text-break" data-magnetic data-magnetic-strength="0.15">
                                <span>mjgaliciab@gmail.com</span>
                                <span class="arrow d-inline-block text-accent font-mono fw-normal h2 lh-1 align-baseline">&nearr;</span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {{-- Línea Base Inferior --}}
        <div class="pt-lg border-top-subtle d-flex justify-content-between align-items-center font-mono text-fluid-xs text-muted flex-wrap gap-2">
            <span>&copy; {{ now()->year }} Mario Joaquín Galicia Blanco &bull; Diseño y desarrollo</span>
            <button type="button" 
                    onclick="if (window.openCookieSettings) window.openCookieSettings();" 
                    class="btn-unstyled font-mono text-muted" 
                    data-magnetic>
                Privacidad &amp; Cookies
            </button>
            <span id="footer-clock" data-live-clock class="font-mono text-muted">--:--:-- CST</span>
        </div>

    </div>
</footer>
