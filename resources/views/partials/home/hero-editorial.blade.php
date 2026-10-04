{{-- 
  Hero 02: Declaración Editorial & Rejilla de Estadísticas Monumentales
  (Inspiración Wabi-Sabi & Framer About Section a Ancho Completo)
  - Textos 100% en español.
  - Conteo incremental de 0 al valor objetivo vía GSAP ScrollTrigger.
  - Columna de 99% removida, cuadrícula balanceada simétricamente a 3 columnas.
  - Clases atómicas dedicadas del sistema fluido (fluid-system.css).
--}}
<section id="hero-editorial-2" class="hero-editorial-section position-relative w-100">
    <div class="hero-editorial-content">

        {{-- Titular Monumental con ritmo editorial fluido a ancho completo --}}
        <h2 class="hero-statement" data-reveal>
            Hola<span class="emoji-wave">👋</span>, soy diseñador digital y desarrollador en Ciudad de México, creando experiencias digitales con impacto visual, movimiento expresivo e <span class="hero-statement-faded">interacción fluida.</span>
        </h2>

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

