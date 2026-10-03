{{-- 
  Footer Minimalista Editorial — Letras Grandes
  Inspiración editorial limpia con declaración monumental y grilla tipográfica de alta legibilidad.
--}}
<footer class="editorial-colophon" id="contact" data-magnetic-zone>
    <div class="colophon-container">

        <div class="colophon-main-row">
            {{-- Columna Izquierda: Símbolo de Marca + Declaración Monumental --}}
            <div class="colophon-statement-col">
                <div class="colophon-brand-sparkle" aria-hidden="true">
                    {{-- Estrella de 4 puntas cóncava editorial --}}
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0 C12 6.627 6.627 12 0 12 C6.627 12 12 17.373 12 24 C12 17.373 17.373 12 24 12 C17.373 12 12 6.627 12 0 Z"/>
                    </svg>
                </div>
                <h2 class="colophon-statement-heading h1">
                    Estaré encantado de colaborar contigo
                </h2>
            </div>

            {{-- Columna Derecha: Grilla 2x2 con Letras Grandes --}}
            <div class="colophon-links-grid">
                
                {{-- Grupo 1: Navegación --}}
                <div class="colophon-group">
                    <span class="colophon-group-title">Navegación</span>
                    <ul class="colophon-group-list">
                        <li><a href="{{ route('home') }}" class="colophon-big-link" data-magnetic>Inicio</a></li>
                        <li><a href="{{ route('about') }}" class="colophon-big-link" data-magnetic>Sobre mí</a></li>
                        @if (isset($navContentTypes) && count($navContentTypes) > 0)
                            @foreach ($navContentTypes as $cpt)
                                @php
                                    $cptSlug = is_object($cpt) ? ($cpt->public_route_slug ?? $cpt->slug ?? '') : (is_array($cpt) ? ($cpt['public_route_slug'] ?? $cpt['slug'] ?? '') : (string) $cpt);
                                    $cptName = is_object($cpt) ? ($cpt->name ?? ucfirst($cptSlug)) : (is_array($cpt) ? ($cpt['name'] ?? ucfirst($cptSlug)) : ucfirst($cptSlug));
                                @endphp
                                @if (! empty($cptSlug) && ! str_contains((string) $cptSlug, '\\'))
                                    <li>
                                        <a href="{{ route('public.content.index', $cptSlug) }}" class="colophon-big-link" data-magnetic>
                                            {{ $cptName }}
                                        </a>
                                    </li>
                                @endif
                            @endforeach
                        @else
                            <li><a href="{{ route('public.content.index', 'proyectos') }}" class="colophon-big-link" data-magnetic>Proyectos</a></li>
                            <li><a href="{{ route('public.content.index', 'blog') }}" class="colophon-big-link" data-magnetic>Blog</a></li>
                        @endif
                    </ul>
                </div>

                {{-- Grupo 2: Redes Sociales --}}
                <div class="colophon-group">
                    <span class="colophon-group-title">Redes                    </span>
                    <ul class="colophon-group-list">
                        <li><a href="https://github.com/mariojoaquingalicia" target="_blank" rel="noopener noreferrer" class="colophon-big-link" data-magnetic>GitHub</a></li>
                        <li><a href="https://www.linkedin.com/in/mario-joaquin-galicia/" target="_blank" rel="noopener noreferrer" class="colophon-big-link" data-magnetic>LinkedIn</a></li>
                        <li><a href="https://www.awwwards.com" target="_blank" rel="noopener noreferrer" class="colophon-big-link" data-magnetic>Awwwards</a></li>
                    </ul>
                </div>

              

                {{-- Grupo Contacto Directo: Correo Monumental --}}
                <div class="colophon-group colophon-group-contact">
                    <div>
                        <a href="mailto:mjgaliciab@gmail.com" class="colophon-link colophon-email-monumental" data-magnetic data-magnetic-strength="0.15">
                            <span>mjgaliciab@gmail.com</span>
                            <span class="arrow font-mono">&nearr;</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>

        {{-- Línea Base Inferior --}}
        <div class="colophon-baseline font-mono text-fluid-xs text-muted">
            <span>&copy; {{ now()->year }} Mario Joaquín Galicia Blanco &bull; Diseño y desarrollo</span>
            <button type="button" 
                    onclick="if (window.openCookieSettings) window.openCookieSettings();" 
                    class="btn-unstyled-link font-mono text-muted" 
                    data-magnetic>
                Privacidad &amp; Cookies
            </button>
            <span id="colophon-clock" data-live-clock class="font-mono text-muted">--:--:-- CST</span>
        </div>

    </div>
</footer>
