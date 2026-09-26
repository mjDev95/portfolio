{{-- 
  Call To Action Editorial & Contacto Final
  Alineado con el sistema editorial a pantalla completa (hero-editorial.blade.php & fluid-system.css)
--}}
<section class="cta-contact-section position-relative w-100 text-center" id="contacto" data-reveal>
    <div class="cta-contact-content">
        <span class="font-mono text-fluid-xs text-muted text-uppercase tracking-widest d-block mb-sm">
            /// Get in Touch ///
        </span>
        
        <h2 class="hero-statement mx-auto text-center mb-md" style="max-width: 24ch;">
            ¿Tienes un proyecto en mente? <span class="hero-statement-faded">Hagámoslo realidad.</span>
        </h2>
        
        <p class="services-lead-text mx-auto text-center mb-xl" style="max-width: 54ch;">
            Analicemos la mejor solución de arquitectura para tu portal WordPress, diseño de UI en Figma o ingeniería Front-End a la medida con rendimiento Core Web Vitals garantizado.
        </p>
        
        <div class="d-flex justify-content-center">
            <a href="{{ route('contact') }}" 
               class="btn-pill-action btn-pill-action-lg"
               data-magnetic data-magnetic-strength="0.35">
                <span class="btn-pill-arrow-circle">&nearr;</span>
                <span>Iniciar una conversación</span>
            </a>
        </div>
    </div>
</section>
