{{-- 
  Hero 01: Split-Screen Inverted Curtain Reveal (Inspiración Editorial Minimalista)
  Animado con GSAP ScrollTrigger (pin + scrub + markers activos)
--}}
<section id="hero-curtain" class="hero-curtain-container position-relative" data-hero-curtain>
    {{-- H1 semántico para accesibilidad y SEO estructurado --}}
    <h1 class="visually-hidden">Hola, soy Mario — WordPress Architect &amp; Front-End Engineer</h1>

    <div class="hero-curtain-pin">
        {{-- CAPA 1: FONDO CLARO (Base invertida) --}}
        <div class="hero-curtain-layer hero-curtain-light" aria-hidden="true">
            <div class="hero-curtain-top">
                <span class="font-mono text-fluid-xs text-muted">Scroll para explorar &darr;</span>
            </div>

            <div class="hero-curtain-title-wrap">
                <div class="hero-curtain-title hero-curtain-title-light" data-velix-target>
                    <span>hola</span><span class="hero-hand-badge js-waving-hand" data-no-split aria-hidden="true"><svg width="126" height="134" viewBox="0 0 126 134" fill="none" xmlns="http://www.w3.org/2000/svg" class="hero-hand-svg" aria-hidden="true"><g class="hero-hand-motion"><path d="M108.696 11.3129C112.254 14.122 112.77 18.6214 110.187 21.7874L76.8945 62.833C69.5654 71.4229 71.4135 75.0019 78.8332 68.1082L113.112 37.3874C116.041 34.8282 120.417 35.0075 123.63 38.8264C126.842 42.6454 126.308 46.7986 123.382 49.3601L85.4414 83.1441C81.6182 86.8841 79.1486 89.9547 77.8215 92.3712C77.9815 92.0584 78.1716 91.7294 78.3991 91.3868C71.7598 87.8453 62.3529 83.6414 51.5133 85.3545C37.4457 87.5733 29.6497 95.3661 25.4299 101.304C22.0279 106.091 22.9229 110.183 28.7865 103.687C36.1892 95.4781 55.3708 82.4385 77.6041 96.3885C77.5944 96.3725 77.5869 96.3551 77.5774 96.3389C77.818 96.6582 78.1559 96.9383 78.6103 97.1668C82.9028 99.3292 88.1538 93.9225 94.1573 91.8112C103.3 88.5943 111.526 90.4992 114.474 95.6917C117.744 101.447 113.566 105.126 111.705 105.561C108.03 106.427 101.93 107.904 92.5816 110.917C86.0301 113.028 82.1321 117.542 82.1043 117.575C80.2984 119.426 50.0339 147.41 18.586 124.519C-12.861 101.628 3.65172 70.3015 10.3111 61.1528C16.9699 52.0048 20.7863 46.7613 28.3847 31.9653L36.8576 9.89745C38.3269 6.14552 42.2551 4.2031 46.8641 5.88272C51.473 7.56252 53.0847 11.7277 51.6186 15.4819L42.4016 38.8127C36.7154 55.1647 41.6699 53.5457 48.7604 39.8358L67.5177 4.06055C69.4382 0.358051 73.9073 -1.13058 78.0084 0.932153C82.1071 2.99816 83.4843 7.52523 81.5639 11.2277L60.7785 50.1842C56.7953 57.062 57.4613 62.6323 64.3383 54.1415L98.2749 11.9893C100.861 8.83118 105.138 8.50389 108.696 11.3129Z" fill="currentColor"/></g></svg></span>
                    <span class="d-block">soy Mario</span>
                </div>
            </div>

            <div class="hero-curtain-bottom">
                <span class="font-mono text-fluid-xs text-muted">Mario Joaquín Galicia &bull; Portafolio&trade;</span>
                <span class="font-mono text-fluid-xs text-muted">mjgaliciab@gmail.com</span>
            </div>
        </div>

        {{-- CAPA 2: FONDO OSCURO (Cortina deslizante con clip-path horizontal) --}}
        <div class="hero-curtain-layer hero-curtain-dark" aria-hidden="true">
            <div class="hero-curtain-top">
                <span class="font-mono text-fluid-xs text-secondary d-none d-sm-inline">CDMX &bull; México</span>
            </div>

            {{-- Retrato editorial del autor --}}
            @php
                $portraitRel = 'storage/media/library/2026/09/cris-04.webp';
                $portraitPhysical = storage_path('app/public/media/library/2026/09/cris-04.webp');
                $hasPortrait = file_exists(public_path($portraitRel)) || file_exists($portraitPhysical);
            @endphp
            @if ($hasPortrait)
                <div class="hero-curtain-portrait-wrap">
                    <img src="{{ asset($portraitRel) }}" 
                         alt="Mario Joaquín Galicia Blanco" 
                         class="hero-curtain-portrait"
                         loading="eager"
                         onerror="this.parentElement.style.display='none';">
                </div>
            @endif

            {{-- Titular idéntico sincronizado en posición y traslación con la capa clara --}}
            <div class="hero-curtain-title-wrap">
                <div class="hero-curtain-title hero-curtain-title-dark" data-velix-target>
                    <span>hola</span><span class="hero-hand-badge js-waving-hand" data-no-split aria-hidden="true"><svg width="126" height="134" viewBox="0 0 126 134" fill="none" xmlns="http://www.w3.org/2000/svg" class="hero-hand-svg" aria-hidden="true"><g class="hero-hand-motion"><path d="M108.696 11.3129C112.254 14.122 112.77 18.6214 110.187 21.7874L76.8945 62.833C69.5654 71.4229 71.4135 75.0019 78.8332 68.1082L113.112 37.3874C116.041 34.8282 120.417 35.0075 123.63 38.8264C126.842 42.6454 126.308 46.7986 123.382 49.3601L85.4414 83.1441C81.6182 86.8841 79.1486 89.9547 77.8215 92.3712C77.9815 92.0584 78.1716 91.7294 78.3991 91.3868C71.7598 87.8453 62.3529 83.6414 51.5133 85.3545C37.4457 87.5733 29.6497 95.3661 25.4299 101.304C22.0279 106.091 22.9229 110.183 28.7865 103.687C36.1892 95.4781 55.3708 82.4385 77.6041 96.3885C77.5944 96.3725 77.5869 96.3551 77.5774 96.3389C77.818 96.6582 78.1559 96.9383 78.6103 97.1668C82.9028 99.3292 88.1538 93.9225 94.1573 91.8112C103.3 88.5943 111.526 90.4992 114.474 95.6917C117.744 101.447 113.566 105.126 111.705 105.561C108.03 106.427 101.93 107.904 92.5816 110.917C86.0301 113.028 82.1321 117.542 82.1043 117.575C80.2984 119.426 50.0339 147.41 18.586 124.519C-12.861 101.628 3.65172 70.3015 10.3111 61.1528C16.9699 52.0048 20.7863 46.7613 28.3847 31.9653L36.8576 9.89745C38.3269 6.14552 42.2551 4.2031 46.8641 5.88272C51.473 7.56252 53.0847 11.7277 51.6186 15.4819L42.4016 38.8127C36.7154 55.1647 41.6699 53.5457 48.7604 39.8358L67.5177 4.06055C69.4382 0.358051 73.9073 -1.13058 78.0084 0.932153C82.1071 2.99816 83.4843 7.52523 81.5639 11.2277L60.7785 50.1842C56.7953 57.062 57.4613 62.6323 64.3383 54.1415L98.2749 11.9893C100.861 8.83118 105.138 8.50389 108.696 11.3129Z" fill="currentColor"/></g></svg></span>
                    <span class="d-block">soy Mario</span>
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
