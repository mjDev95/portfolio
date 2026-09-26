{{-- 
  Hero 01: Split-Screen Inverted Curtain Reveal (Inspiración Editorial Minimalista)
  Animado con GSAP ScrollTrigger (pin + scrub + markers activos)
--}}
<section id="hero-curtain" class="hero-curtain-container position-relative" data-hero-curtain>
    {{-- H1 semántico para accesibilidad y SEO estructurado --}}
    <h1 class="visually-hidden">hello I’m Mario — WordPress Architect &amp; Front-End Engineer</h1>

    <div class="hero-curtain-pin">
        {{-- CAPA 1: FONDO CLARO (Base invertida) --}}
        <div class="hero-curtain-layer hero-curtain-light" aria-hidden="true">
            <div class="hero-curtain-top">
                <span class="font-mono text-fluid-xs text-muted">Scroll para explorar &darr;</span>
            </div>

            <div class="hero-curtain-title-wrap">
                <div class="hero-curtain-title hero-curtain-title-light" data-velix-target>
                    <span>hello</span>
                    <span class="d-block">I’m Mario</span>
                </div>
            </div>

            <div class="hero-curtain-bottom">
                <span class="font-mono text-fluid-xs text-muted">Mario Joaquín Galicia &bull; Showcase&trade;</span>
                <span class="font-mono text-fluid-xs text-muted">mjgaliciab@gmail.com</span>
            </div>
        </div>

        {{-- CAPA 2: FONDO OSCURO (Cortina deslizante con clip-path horizontal) --}}
        <div class="hero-curtain-layer hero-curtain-dark" aria-hidden="true">
            <div class="hero-curtain-top">
                <span class="font-mono text-fluid-xs text-secondary d-none d-sm-inline">CDMX &bull; México</span>
            </div>

            {{-- Retrato editorial del autor --}}
            <div class="hero-curtain-portrait-wrap">
                <img src="{{ asset('storage/media/library/2026/09/cris-04.webp') }}" 
                     alt="Mario Joaquín Galicia Blanco" 
                     class="hero-curtain-portrait"
                     loading="eager">
            </div>

            {{-- Titular idéntico sincronizado en posición y traslación con la capa clara --}}
            <div class="hero-curtain-title-wrap">
                <div class="hero-curtain-title hero-curtain-title-dark" data-velix-target>
                    <span>hello</span>
                    <span class="d-block">I’m Mario</span>
                </div>
            </div>

            <div class="hero-curtain-bottom">
               
                <div class="hero-curtain-social font-mono text-fluid-xs">
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <span>&bull;</span>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <span>&bull;</span>
                    <a href="{{ route('contact') }}">Contacto</a>
                </div>
            </div>
        </div>
    </div>
</section>
