<footer class="py-2xl border-top-subtle" data-magnetic-zone>
    <div class="container">
        
        {{-- Fila Principal: Identidad, Enlaces y Contacto --}}
        <div class="row pb-xl border-bottom-subtle">
            <div class="col-12 col-md-6 mb-lg mb-md-0">
                <span class="text-fluid-sm fw-semibold text-primary d-block mb-xs">
                    Mario Joaquín Galicia Blanco
                </span>
                <p class="text-fluid-xs text-secondary fw-light mb-md" style="max-width: 44ch; line-height: 1.6;">
                    WordPress Architect &amp; Front-End Engineer con 5 años de trayectoria creando temas a la medida, sistemas fluidos y optimización extrema de Core Web Vitals.
                </p>
                <div class="d-flex align-items-center gap-2 text-fluid-xs font-mono text-muted">
                    <span class="pulse-beacon">
                        <span class="pulse-beacon-ping"></span>
                    </span>
                    <span>Ciudad de México (CDMX) &bull; <span data-live-clock>--:-- CST</span></span>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-md-3 mb-md mb-md-0">
                <span class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted fw-semibold d-block mb-sm">
                    Contacto Directo
                </span>
                <ul class="list-unstyled d-flex flex-column gap-2 text-fluid-xs">
                    <li>
                        <a href="mailto:mjgaliciab@gmail.com" class="text-secondary hover-text-accent no-underline transition-colors" data-magnetic>
                            mjgaliciab@gmail.com
                        </a>
                    </li>
                    <li>
                        <a href="tel:+525628425556" class="text-secondary hover-text-accent no-underline transition-colors" data-magnetic>
                            +52 56 2842 5556
                        </a>
                    </li>
                    <li>
                        <a href="https://www.linkedin.com/in/mario-joaquin-galicia/" target="_blank" rel="noopener noreferrer" class="text-secondary hover-text-accent no-underline transition-colors" data-magnetic>
                            LinkedIn &rarr;
                        </a>
                    </li>
                </ul>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
                <span class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted fw-semibold d-block mb-sm">
                    Navegación
                </span>
                <ul class="list-unstyled d-flex flex-column gap-2 text-fluid-xs">
                    <li><a href="{{ route('home') }}" class="text-secondary hover-text-accent no-underline transition-colors" data-magnetic>Inicio</a></li>
                    <li><a href="{{ route('about') }}" class="text-secondary hover-text-accent no-underline transition-colors" data-magnetic>Sobre mí</a></li>
                    <li><a href="{{ route('contact') }}" class="text-secondary hover-text-accent no-underline transition-colors" data-magnetic>Contacto</a></li>
                </ul>
            </div>
        </div>

        {{-- Barra Inferior de Copyright & Consentimiento --}}
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-lg text-fluid-xs font-mono text-muted">
            <p class="m-0">
                &copy; {{ now()->year }} Mario Joaquín Galicia Blanco. Diseñado con tipografía matemática y arquitectura nativa en PHP 8.4.
            </p>

            <div class="d-flex align-items-center gap-4">
                <button type="button" onclick="if (window.openCookieSettings) window.openCookieSettings();" 
                        class="bg-transparent p-0 border-0 text-fluid-xs font-mono text-muted hover-text-accent cursor-pointer" 
                        data-magnetic>
                    Privacidad &amp; Cookies
                </button>
                <a href="#top" onclick="window.scrollTo({top: 0, behavior: 'smooth'}); return false;" 
                   class="text-fluid-xs font-mono text-muted hover-text-accent no-underline" 
                   data-magnetic>
                    Volver arriba &uarr;
                </a>
            </div>
        </div>
    </div>
</footer>
