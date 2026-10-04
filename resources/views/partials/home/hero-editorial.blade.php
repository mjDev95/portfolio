{{-- 
  Hero 02: Declaración Editorial & Rejilla de Estadísticas Monumentales
  (Inspiración Wabi-Sabi & Framer About Section a Ancho Completo)
  - Textos 100% en español.
  - Conteo incremental de 0 al valor objetivo vía GSAP ScrollTrigger.
  - Columna de 99% removida, cuadrícula balanceada simétricamente a 3 columnas.
  - Clases atómicas dedicadas del sistema fluido (fluid-system.css).
--}}
<section id="hero-editorial-2" class="hero-editorial-section position-relative w-100">
    {{-- Fondo sutil con arcos orbitales y estrellas de 4 puntas en SVG fluido a pantalla completa --}}
    <div class="hero-orbit-wrap" aria-hidden="true">
        <svg class="hero-orbit-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
            {{-- Líneas orbitales elípticas finas y fluidas --}}
            <ellipse cx="720" cy="450" rx="680" ry="380" stroke="currentColor" stroke-opacity="0.08" stroke-width="1.2" transform="rotate(-8 720 450)" />
            <ellipse cx="760" cy="420" rx="580" ry="320" stroke="currentColor" stroke-opacity="0.06" stroke-width="1" transform="rotate(12 760 420)" />
            <path d="M-100 620 C 350 480, 850 680, 1540 380" stroke="currentColor" stroke-opacity="0.07" stroke-width="1" stroke-dasharray="4 4" />
            
            {{-- Estrellas sutiles de 4 puntas (✦) --}}
            <g transform="translate(540, 480)" fill="currentColor" opacity="0.35">
                <path d="M0 -12 C0 -3, 3 0, 12 0 C 3 0, 0 3, 0 12 C 0 3, -3 0, -12 0 C 3 0, 0 -3, 0 -12 Z" />
            </g>
            <g transform="translate(1180, 220)" fill="currentColor" opacity="0.45">
                <path d="M0 -16 C0 -4, 4 0, 16 0 C 4 0, 0 4, 0 16 C 0 4, -4 0, -16 0 C -4 0, 0 -4, 0 -16 Z" />
            </g>
            <g transform="translate(980, 360)" fill="currentColor" opacity="0.25">
                <path d="M0 -8 C0 -2, 2 0, 8 0 C 2 0, 0 2, 0 8 C 0 2, -2 0, -8 0 C -2 0, 0 -2, 0 -8 Z" />
            </g>
        </svg>
    </div>

    <div class="hero-editorial-content">

        {{-- Titular Monumental con ritmo editorial fluido a ancho completo --}}
        <h2 class="hero-statement" data-reveal>
            Hola<span class="emoji-wave">👋</span>, soy diseñador digital y desarrollador en Ciudad de México, creando experiencias digitales con impacto visual, movimiento expresivo e <span class="hero-statement-faded">interacción fluida.</span>
        </h2>

        {{-- Botón Píldora con ícono circular [ (→) Más sobre mí ] --}}
        <div class="mb-xl" data-reveal>
            <a href="{{ route('about') }}" 
               class="btn-pill-action"
               data-magnetic data-magnetic-strength="0.3">
                <span class="btn-pill-arrow-circle">&rarr;</span>
                <span>Más sobre mí</span>
            </a>
        </div>

        {{-- Rejilla Horizontal de 3 Estadísticas Monumentales con hairline dividers y clases dedicadas del sistema fluido --}}
        <div class="hero-stats-row">
            <div class="row g-4 g-lg-5" data-reveal>
                {{-- Métrica 01: Sitios web lanzados --}}
                <div class="col-12 col-md-4 hero-stat-col">
                    <div class="font-fluid-stat-number text-primary mb-sm will-change-transform" 
                         data-stat-counter 
                         data-stat-target="21" 
                         data-stat-suffix="+">21+</div>
                    <div class="border-top-subtle pt-sm d-flex flex-column gap-1">
                        <h3 class="font-sans text-fluid-base fw-semibold text-primary m-0">Sitios web lanzados</h3>
                        <p class="font-sans text-fluid-xs text-secondary lh-base m-0">
                            Impulsando marcas para consolidar y fortalecer su presencia digital con alto rendimiento.
                        </p>
                    </div>
                </div>

                {{-- Métrica 02: Usuarios impactados --}}
                <div class="col-12 col-md-4 hero-stat-col">
                    <div class="font-fluid-stat-number text-primary mb-sm will-change-transform" 
                         data-stat-counter 
                         data-stat-target="2" 
                         data-stat-suffix="M+">2M+</div>
                    <div class="border-top-subtle pt-sm d-flex flex-column gap-1">
                        <h3 class="font-sans text-fluid-base fw-semibold text-primary m-0">Usuarios impactados</h3>
                        <p class="font-sans text-fluid-xs text-secondary lh-base m-0">
                            Diseños que conectan audiencias a nivel global con fluidez, velocidad y estabilidad técnica.
                        </p>
                    </div>
                </div>

                {{-- Métrica 03: Años de experiencia (columna 99% removida según solicitud del usuario) --}}
                <div class="col-12 col-md-4 hero-stat-col">
                    <div class="font-fluid-stat-number text-primary mb-sm will-change-transform" 
                         data-stat-counter 
                         data-stat-target="5" 
                         data-stat-suffix="+">5+</div>
                    <div class="border-top-subtle pt-sm d-flex flex-column gap-1">
                        <h3 class="font-sans text-fluid-base fw-semibold text-primary m-0">Años de experiencia</h3>
                        <p class="font-sans text-fluid-xs text-secondary lh-base m-0">
                            Soluciones técnicas e interfaces diseñadas con precisión para proyectos de alto rendimiento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

