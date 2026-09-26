{{-- 
  Metodología & Trayectoria en 4 Pasos (Inspiración Wabi-Sabi)
  Alineada con el sistema editorial a pantalla completa (hero-editorial.blade.php & fluid-system.css)
--}}
<section class="methodology-section position-relative w-100" id="metodologia">
    <div class="methodology-content">
        <div class="row align-items-start g-5">
            {{-- Columna Izquierda: Encabezado, Resumen y Garantía --}}
            <div class="col-12 col-lg-5" data-reveal>
                <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest d-block mb-xs">
                    /// Methodology ///
                </span>
                <h2 class="services-main-title mb-md">
                    Proceso en 4 Pasos
                </h2>
                <p class="services-lead-text mb-lg">
                    Un ritmo editorial metódico que une el descubrimiento visual con la ingeniería de código, garantizando estabilidad y velocidad sin atajos.
                </p>

                {{-- Card de Garantía de Estabilidad --}}
                <div class="service-card p-lg mb-lg d-block">
                    <span class="font-mono text-fluid-xs text-accent fw-bold text-uppercase d-block mb-xs">
                        Garantía de Estabilidad
                    </span>
                    <p class="text-fluid-sm text-secondary fw-light mb-0">
                        Código probado en dispositivos reales, validación rigurosa de accesibilidad (a11y) y soporte de ajustes post-lanzamiento.
                    </p>
                </div>

                {{-- Botón Píldora de Acción Editorial --}}
                <div>
                    <a href="{{ route('contact') }}" 
                       class="btn-pill-action"
                       data-magnetic data-magnetic-strength="0.3">
                        <span class="btn-pill-arrow-circle">&rarr;</span>
                        <span>Iniciar una consulta</span>
                    </a>
                </div>
            </div>

            {{-- Columna Derecha: Pasos en Líneas Editoriales (Sin cajas rígidas) --}}
            <div class="col-12 col-lg-7 d-flex flex-column" data-reveal>
                {{-- Fase 01 --}}
                <div class="methodology-step-row">
                    <div class="d-flex align-items-baseline justify-content-between mb-xs">
                        <span class="font-mono text-accent fw-bold text-fluid-xs text-uppercase tracking-wider">Fase 01</span>
                        <span class="text-fluid-xs font-mono text-muted">Figma UI/UX</span>
                    </div>
                    <h3 class="font-heading text-fluid-h3 text-primary mb-xs">
                        Descubrimiento &amp; Arquitectura de Información
                    </h3>
                    <p class="text-fluid-sm text-secondary fw-light mb-0">
                        Análisis de objetivos, jerarquía de contenido, definición de modelos de datos y prototipos de alta fidelidad en Figma estructurados con Auto-Layout y componentes escalables.
                    </p>
                </div>

                {{-- Fase 02 --}}
                <div class="methodology-step-row">
                    <div class="d-flex align-items-baseline justify-content-between mb-xs">
                        <span class="font-mono text-accent fw-bold text-fluid-xs text-uppercase tracking-wider">Fase 02</span>
                        <span class="text-fluid-xs font-mono text-muted">Design Systems</span>
                    </div>
                    <h3 class="font-heading text-fluid-h3 text-primary mb-xs">
                        Diseño de Sistemas &amp; Prototipado en Figma
                    </h3>
                    <p class="text-fluid-sm text-secondary fw-light mb-0">
                        Estructuración de Design Tokens de color, espaciado y tipografía matemática, listos para traducirse a código con total precisión y consistencia visual multiplataforma.
                    </p>
                </div>

                {{-- Fase 03 --}}
                <div class="methodology-step-row">
                    <div class="d-flex align-items-baseline justify-content-between mb-xs">
                        <span class="font-mono text-accent fw-bold text-fluid-xs text-uppercase tracking-wider">Fase 03</span>
                        <span class="text-fluid-xs font-mono text-muted">PHP 8.4 Nativo</span>
                    </div>
                    <h3 class="font-heading text-fluid-h3 text-primary mb-xs">
                        Ingeniería Front-End &amp; Custom Theme Nativo
                    </h3>
                    <p class="text-fluid-sm text-secondary fw-light mb-0">
                        Programación de Custom Post Types, taxonomías y metaboxes directamente en PHP sin constructores pesados. Maquetación fluida con tokens CSS matemáticos y cinéticas GSAP.
                    </p>
                </div>

                {{-- Fase 04 --}}
                <div class="methodology-step-row">
                    <div class="d-flex align-items-baseline justify-content-between mb-xs">
                        <span class="font-mono text-accent fw-bold text-fluid-xs text-uppercase tracking-wider">Fase 04</span>
                        <span class="text-fluid-xs font-mono text-muted">Core Web Vitals</span>
                    </div>
                    <h3 class="font-heading text-fluid-h3 text-primary mb-xs">
                        Optimización, Seguridad &amp; Despliegue
                    </h3>
                    <p class="text-fluid-sm text-secondary fw-light mb-0">
                        Auditoría Lighthouse integral (LCP &lt; 1.5s, CLS 0), sanitización contra XSS/SQLi con HTMLPurifier y preparación para despliegues continuos con cero fricción.
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>
