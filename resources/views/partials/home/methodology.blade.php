{{-- 
  Sección: Metodología Horizontal Pinned Stepper (Escenas Cinemáticas a Pantalla Completa)
  Inspirada en el diseño de referencia: Timeline horizontal continuo de borde a borde con badge de estrella deslizante,
  titulares monumentales, diagramas vectoriales minimalistas flotantes sobre el lienzo (cero look de slide/carrusel)
  y desplazamiento horizontal scrub sincronizado con Lenis.
--}}
<section class="methodology-horizontal-section position-relative w-100 d-none" id="metodologia" data-methodology-section>
    {{-- Contenedor anclado con GSAP ScrollTrigger (pin: pinElement) --}}
    <div class="methodology-pin-wrap w-100 overflow-hidden d-flex flex-column justify-content-center" data-methodology-pin>
        
        {{-- 1. Encabezado y Riel Horizontal a Ancho Completo con Gutter Fluido --}}
        <div class="methodology-header-block w-100 mb-lg">
            <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-lg">
                <div>
                    <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest d-block mb-xs">
                        /// Methodology ///
                    </span>
                    <h2 class="services-main-title">
                        Proceso de Ingeniería
                    </h2>
                </div>
                <p class="services-lead-text mb-0">
                    Un ciclo continuo que une la claridad conceptual con la precisión de código, garantizando velocidad y estabilidad técnica sin atajos.
                </p>
            </div>

            {{-- Riel Horizontal del Timeline (Stepper con Badge de Estrella Deslizante) --}}
            <div class="methodology-rail-container position-relative w-100" data-methodology-rail>
                {{-- Línea base hairline horizontal --}}
                <div class="methodology-rail-line"></div>

                {{-- Indicador deslizante activo: Badge de Estrella (✦) + Línea de unión + Nodo luminoso --}}
                <div class="methodology-active-indicator position-absolute d-flex flex-column align-items-center will-change-transform" data-methodology-indicator>
                    <span class="methodology-star-badge d-inline-flex align-items-center justify-content-center" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M46 0 H54 V28 Q54 46 72 46 H100 V54 H72 Q54 54 54 72 V100 H46 V72 Q46 54 28 54 H0 V46 H28 Q46 46 46 28 Z"/>
                        </svg>
                    </span>
                    <span class="methodology-indicator-connector" aria-hidden="true"></span>
                    <span class="methodology-indicator-node" aria-hidden="true"></span>
                </div>

                {{-- Nodos de los 4 pasos interactivos a lo largo del riel --}}
                <nav class="methodology-rail-nav d-flex justify-content-between align-items-center w-100" aria-label="Fases de metodología">
                    <button type="button" class="methodology-rail-node position-relative d-flex flex-column align-items-center is-active btn-unstyled font-mono" data-step-nav="0">
                        <span class="node-num text-fluid-xs">01</span>
                        <span class="node-label">Alinear</span>
                        <span class="node-dot" aria-hidden="true"></span>
                    </button>

                    <button type="button" class="methodology-rail-node position-relative d-flex flex-column align-items-center btn-unstyled font-mono" data-step-nav="1">
                        <span class="node-num text-fluid-xs">02</span>
                        <span class="node-label">Diseñar</span>
                        <span class="node-dot" aria-hidden="true"></span>
                    </button>

                    <button type="button" class="methodology-rail-node position-relative d-flex flex-column align-items-center btn-unstyled font-mono" data-step-nav="2">
                        <span class="node-num text-fluid-xs">03</span>
                        <span class="node-label">Construir</span>
                        <span class="node-dot" aria-hidden="true"></span>
                    </button>

                    <button type="button" class="methodology-rail-node position-relative d-flex flex-column align-items-center btn-unstyled font-mono" data-step-nav="3">
                        <span class="node-num text-fluid-xs">04</span>
                        <span class="node-label">Escalar</span>
                        <span class="node-dot" aria-hidden="true"></span>
                    </button>
                </nav>
            </div>
        </div>

        {{-- 2. Viewport y Track Horizontal a Pantalla Completa (100vw por escena, sin aspecto de slide) --}}
        <div class="methodology-viewport position-relative w-100 overflow-hidden" data-methodology-viewport>
            <div class="methodology-track d-flex flex-row flex-nowrap will-change-transform" data-methodology-track>
                
                {{-- Panel 01: Alinear --}}
                <article class="methodology-panel" data-panel-index="0">
                    <div class="methodology-panel-grid">
                        <div class="methodology-panel-content d-flex flex-column justify-content-center">
                            <span class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider d-block mb-xs">
                                Fase 01 // Claridad &amp; Arquitectura
                            </span>
                            <h3 class="methodology-panel-title mb-sm mt-1">
                                Alinear
                            </h3>
                            <p class="methodology-panel-desc mb-md">
                                Comenzamos con absoluta claridad. Entendemos tus metas de negocio, modelo de contenidos y restricciones técnicas antes de escribir una sola línea de código.
                            </p>
                            <ul class="list-unstyled mb-0 font-mono text-fluid-xs text-muted d-flex flex-column gap-1">
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Definición de Objetivos &amp; KPIs</li>
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Arquitectura de Información</li>
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Modelado de Custom Post Types</li>
                            </ul>
                        </div>

                        {{-- Diagrama Vectorial 01: Mecanismo de Cápsula & Poleas Flotante (Idéntico a la Referencia) --}}
                        <div class="methodology-panel-visual">
                            <div class="methodology-diagram-wrap">
                                <svg class="methodology-svg-diagram" viewBox="0 0 460 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    {{-- Contorno exterior punteado de cápsula / stadium --}}
                                    <rect x="20" y="30" width="420" height="160" rx="80" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 4" stroke-opacity="0.45" />
                                    {{-- Contorno interior sólido de cápsula --}}
                                    <rect x="35" y="45" width="390" height="130" rx="65" stroke="var(--accent)" stroke-width="1.2" stroke-opacity="0.85" />
                                    {{-- Polea / Círculo orbital izquierdo --}}
                                    <circle cx="120" cy="110" r="50" stroke="var(--accent)" stroke-width="1.5" />
                                    <circle cx="120" cy="110" r="30" fill="var(--accent)" fill-opacity="0.08" stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3" />
                                    <circle cx="120" cy="110" r="4" fill="var(--accent)" />
                                    {{-- Polea / Círculo orbital derecho --}}
                                    <circle cx="340" cy="110" r="50" stroke="var(--accent)" stroke-width="1.5" />
                                    <circle cx="340" cy="110" r="30" fill="var(--accent)" fill-opacity="0.08" stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3" />
                                    <circle cx="340" cy="110" r="4" fill="var(--accent)" />
                                    {{-- Banda de tensión horizontal superior e inferior --}}
                                    <line x1="120" y1="60" x2="340" y2="60" stroke="var(--accent)" stroke-width="1.5" stroke-opacity="0.9" />
                                    <line x1="120" y1="160" x2="340" y2="160" stroke="var(--accent)" stroke-width="1.5" stroke-opacity="0.9" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </article>

                {{-- Panel 02: Diseñar --}}
                <article class="methodology-panel" data-panel-index="1">
                    <div class="methodology-panel-grid">
                        <div class="methodology-panel-content d-flex flex-column justify-content-center">
                            <span class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider d-block mb-xs">
                                Fase 02 // Figma &amp; Design Systems
                            </span>
                            <h3 class="methodology-panel-title mb-sm mt-1">
                                Diseñar
                            </h3>
                            <p class="methodology-panel-desc mb-md">
                                Traducción milimétrica de prototipos en Figma a sistemas de diseño fluidos gobernados por tokens matemáticos, Auto-Layout y componentes modulares sin sombras.
                            </p>
                            <ul class="list-unstyled mb-0 font-mono text-fluid-xs text-muted d-flex flex-column gap-1">
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Tokens Matemáticos con clamp()</li>
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Escalas Tipográficas Armónicas</li>
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Estética Zero Shadows &amp; Hairlines</li>
                            </ul>
                        </div>

                        {{-- Diagrama Vectorial 02: Matriz Modular de Tokens Flotante --}}
                        <div class="methodology-panel-visual">
                            <div class="methodology-diagram-wrap">
                                <svg class="methodology-svg-diagram" viewBox="0 0 460 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    {{-- Rejilla modular de diseño en Figma --}}
                                    <rect x="30" y="30" width="400" height="160" rx="8" stroke="var(--border-subtle)" stroke-width="1.2" />
                                    <line x1="130" y1="30" x2="130" y2="190" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3 3" />
                                    <line x1="230" y1="30" x2="230" y2="190" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3 3" />
                                    <line x1="330" y1="30" x2="330" y2="190" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3 3" />
                                    <line x1="30" y1="110" x2="430" y2="110" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3 3" />
                                    {{-- Componente activo en foco --}}
                                    <rect x="145" y="45" width="170" height="130" rx="6" stroke="var(--accent)" stroke-width="1.5" fill="var(--accent)" fill-opacity="0.05" />
                                    <line x1="160" y1="70" x2="260" y2="70" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />
                                    <line x1="160" y1="90" x2="295" y2="90" stroke="var(--accent)" stroke-width="1.2" stroke-opacity="0.6" stroke-linecap="round" />
                                    <line x1="160" y1="105" x2="270" y2="105" stroke="var(--accent)" stroke-width="1.2" stroke-opacity="0.6" stroke-linecap="round" />
                                    <rect x="160" y="125" width="80" height="24" rx="12" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="2 2" />
                                    {{-- Reglas de espaciado y acotación --}}
                                    <line x1="145" y1="38" x2="315" y2="38" stroke="var(--accent)" stroke-width="1" />
                                    <path d="M145 35 L145 41 M315 35 L315 41" stroke="var(--accent)" stroke-width="1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </article>

                {{-- Panel 03: Construir --}}
                <article class="methodology-panel" data-panel-index="2">
                    <div class="methodology-panel-grid">
                        <div class="methodology-panel-content d-flex flex-column justify-content-center">
                            <span class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider d-block mb-xs">
                                Fase 03 // PHP 8.4 Nativo &amp; Blade
                            </span>
                            <h3 class="methodology-panel-title mb-sm mt-1">
                                Construir
                            </h3>
                            <p class="methodology-panel-desc mb-md">
                                Programación limpia en PHP 8.4 nativo para WordPress sin constructores visuales ni plugins invasivos. Componentes modulares Blade, cinemáticas GSAP 3 y APIs estructuradas.
                            </p>
                            <ul class="list-unstyled mb-0 font-mono text-fluid-xs text-muted d-flex flex-column gap-1">
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Custom Themes 100% PHP Nativo</li>
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Animaciones Cinemáticas GSAP 3</li>
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Render Loop a 60fps con Lenis</li>
                            </ul>
                        </div>

                        {{-- Diagrama Vectorial 03: Arquitectura Desacoplada Flotante --}}
                        <div class="methodology-panel-visual">
                            <div class="methodology-diagram-wrap">
                                <svg class="methodology-svg-diagram" viewBox="0 0 460 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    {{-- Nodo central: PHP Core --}}
                                    <rect x="180" y="80" width="100" height="60" rx="6" stroke="var(--accent)" stroke-width="1.8" fill="var(--accent)" fill-opacity="0.08" />
                                    <text x="230" y="115" text-anchor="middle" fill="var(--text-primary)" font-family="var(--font-mono)" font-size="12" font-weight="600">PHP 8.4</text>
                                    {{-- Nodos periféricos: CPTs, Blade, GSAP, APIs --}}
                                    <rect x="40" y="40" width="85" height="40" rx="4" stroke="var(--border-subtle)" stroke-width="1.2" />
                                    <text x="82" y="65" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="10">CPTs / Tax</text>

                                    <rect x="40" y="140" width="85" height="40" rx="4" stroke="var(--border-subtle)" stroke-width="1.2" />
                                    <text x="82" y="165" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="10">REST API</text>

                                    <rect x="335" y="40" width="85" height="40" rx="4" stroke="var(--border-subtle)" stroke-width="1.2" />
                                    <text x="377" y="65" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="10">Blade SSR</text>

                                    <rect x="335" y="140" width="85" height="40" rx="4" stroke="var(--border-subtle)" stroke-width="1.2" />
                                    <text x="377" y="165" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="10">GSAP Motion</text>
                                    {{-- Conectores ortogonales --}}
                                    <path d="M125 60 H 155 V 95 H 180" stroke="var(--accent)" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
                                    <path d="M125 160 H 155 V 125 H 180" stroke="var(--accent)" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
                                    <path d="M280 95 H 305 V 60 H 335" stroke="var(--accent)" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
                                    <path d="M280 125 H 305 V 160 H 335" stroke="var(--accent)" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </article>

                {{-- Panel 04: Escalar --}}
                <article class="methodology-panel" data-panel-index="3">
                    <div class="methodology-panel-grid">
                        <div class="methodology-panel-content d-flex flex-column justify-content-center">
                            <span class="font-mono text-fluid-xs text-brand text-uppercase tracking-wider d-block mb-xs">
                                Fase 04 // Core Web Vitals &amp; Despliegue
                            </span>
                            <h3 class="methodology-panel-title mb-sm mt-1">
                                Escalar
                            </h3>
                            <p class="methodology-panel-desc mb-md">
                                Optimización implacable de Core Web Vitals (LCP &lt; 1.2s, CLS = 0), monitoreo de seguridad y acompañamiento técnico continuo para asegurar estabilidad a largo plazo.
                            </p>
                            <ul class="list-unstyled mb-0 font-mono text-fluid-xs text-muted d-flex flex-column gap-1">
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Puntuaciones Lighthouse en Verde</li>
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Pipeline WebP Lossless en el Edge</li>
                                <li class="d-flex align-items-center gap-1"><span class="text-brand me-1">+</span> Monitoreo &amp; Soporte Continuo</li>
                            </ul>
                        </div>

                        {{-- Diagrama Vectorial 04: Curva Exponencial de Velocidad Flotante --}}
                        <div class="methodology-panel-visual">
                            <div class="methodology-diagram-wrap">
                                <svg class="methodology-svg-diagram" viewBox="0 0 460 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    {{-- Ejes cartesianos --}}
                                    <line x1="50" y1="180" x2="410" y2="180" stroke="var(--border-subtle)" stroke-width="1.2" />
                                    <line x1="50" y1="30" x2="50" y2="180" stroke="var(--border-subtle)" stroke-width="1.2" />
                                    {{-- Curva de rendimiento exponencial hacia LCP < 1.2s --}}
                                    <path d="M50 170 C 150 165, 230 110, 400 45" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" fill="none" />
                                    {{-- Área bajo la curva translúcida --}}
                                    <path d="M50 170 C 150 165, 230 110, 400 45 V 180 H 50 Z" fill="var(--accent)" fill-opacity="0.06" />
                                    {{-- Nodos de velocidad en la curva --}}
                                    <circle cx="160" cy="155" r="4" fill="var(--accent)" />
                                    <circle cx="280" cy="98" r="4" fill="var(--accent)" />
                                    <circle cx="400" cy="45" r="6" fill="var(--accent)" />
                                    <circle cx="400" cy="45" r="12" stroke="var(--accent)" stroke-width="1" stroke-dasharray="2 2" />
                                    {{-- Badge de métrica 100/100 --}}
                                    <rect x="330" y="15" width="85" height="22" rx="11" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="1.2" />
                                    <text x="372" y="30" text-anchor="middle" fill="var(--text-primary)" font-family="var(--font-mono)" font-size="10" font-weight="600">LCP 0.8s</text>
                                </svg>
                            </div>
                        </div>
                    </div>
                </article>

            </div>
        </div>

    </div>
</section>
