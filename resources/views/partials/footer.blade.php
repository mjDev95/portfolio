{{-- 
  Footer Minimalista Editorial (Editorial Colophon)
  Alineado con el sistema editorial fluido, cero sombras y tipografía matemática.
--}}
<footer class="editorial-colophon" id="contact" data-magnetic-zone>
    <div class="colophon-container">

        {{-- Enlace principal directo tipográfico monumental --}}
        <div class="colophon-lead">
            <span class="colophon-tag font-mono">Direct Inquiry &bull; {{ now()->year }}</span>
            <div>
                <a href="mailto:mjgaliciab@gmail.com" class="colophon-link" data-magnetic data-magnetic-strength="0.15">
                    <span>mjgaliciab@gmail.com</span>
                    <span class="arrow">&nearr;</span>
                </a>
            </div>
        </div>

        {{-- Grilla puramente tipográfica de metadatos (sin cajas ni cards) --}}
        <div class="colophon-meta-grid">
            
            <div class="meta-group">
                <span class="meta-label">Ubicación &bull; Horario</span>
                <p class="meta-content">
                    Ciudad de México<br>
                    <span id="colophon-clock" data-live-clock class="font-mono text-fluid-xs">--:--:-- CST</span>
                </p>
            </div>

            <div class="meta-group">
                <span class="meta-label">Navegación</span>
                <ul class="meta-list">
                    <li><a href="{{ route('home') }}" data-magnetic>Inicio <span>&nearr;</span></a></li>
                    <li><a href="{{ route('about') }}" data-magnetic>Sobre mí <span>&nearr;</span></a></li>
                    @if (isset($navContentTypes) && count($navContentTypes) > 0)
                        @foreach ($navContentTypes as $cpt)
                            @php
                                $cptSlug = is_object($cpt) ? ($cpt->public_route_slug ?? $cpt->slug ?? '') : (is_array($cpt) ? ($cpt['public_route_slug'] ?? $cpt['slug'] ?? '') : (string) $cpt);
                                $cptName = is_object($cpt) ? ($cpt->name ?? ucfirst($cptSlug)) : (is_array($cpt) ? ($cpt['name'] ?? ucfirst($cptSlug)) : ucfirst($cptSlug));
                            @endphp
                            @if (! empty($cptSlug) && ! str_contains((string) $cptSlug, '\\'))
                                <li>
                                    <a href="{{ route('public.content.index', $cptSlug) }}" data-magnetic>
                                        {{ $cptName }} <span>&nearr;</span>
                                    </a>
                                </li>
                            @endif
                        @endforeach
                    @else
                        <li><a href="{{ route('public.content.index', 'proyectos') }}" data-magnetic>Proyectos <span>&nearr;</span></a></li>
                        <li><a href="{{ route('public.content.index', 'blog') }}" data-magnetic>Escritos <span>&nearr;</span></a></li>
                    @endif
                    <li><a href="{{ route('contact') }}" data-magnetic>Contacto <span>&nearr;</span></a></li>
                </ul>
            </div>

            <div class="meta-group">
                <span class="meta-label">Redes</span>
                <ul class="meta-list">
                    <li><a href="https://github.com/mariojoaquingalicia" target="_blank" rel="noopener noreferrer" data-magnetic>GitHub <span>&nearr;</span></a></li>
                    <li><a href="https://www.linkedin.com/in/mario-joaquin-galicia/" target="_blank" rel="noopener noreferrer" data-magnetic>LinkedIn <span>&nearr;</span></a></li>
                    <li><a href="https://www.awwwards.com" target="_blank" rel="noopener noreferrer" data-magnetic>Awwwards <span>&nearr;</span></a></li>
                </ul>
            </div>

            <div class="meta-group">
                <span class="meta-label">Estatus</span>
                <p class="meta-content text-primary">
                    Disponible para proyectos selectos, arquitectura WordPress y consultoría técnica.
                </p>
            </div>

        </div>

        {{-- Pie de página final --}}
        <div class="colophon-baseline font-mono text-fluid-xs text-muted">
            <span>&copy; {{ now()->year }} Mario Joaquín Galicia Blanco &bull; Diseñado y construido a medida</span>
            <div class="d-flex align-items-center gap-3">
                <button type="button" 
                        onclick="if (window.openCookieSettings) window.openCookieSettings();" 
                        class="scroll-top" 
                        data-magnetic>
                    Privacidad &amp; Cookies
                </button>
                <button type="button" 
                        class="scroll-top" 
                        onclick="window.scrollTo({top: 0, behavior: 'smooth'})" 
                        data-barba-prevent="self" 
                        data-magnetic>
                    &uarr; Arriba
                </button>
            </div>
        </div>

    </div>
</footer>
