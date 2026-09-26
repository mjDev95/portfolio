{{-- 
  Sección: Servicios (What I do?)
  Alineada con el sistema editorial fluido a pantalla completa (hero-editorial.blade.php & fluid-system.css)
--}}
<section id="services" class="services-editorial-section position-relative w-100">
    <div class="services-editorial-content">
        {{-- Encabezado: Etiqueta + Título monumental (izq) y descripción contextual (der) --}}
        <div class="services-header-row mb-xl" data-reveal>
            <div class="services-header-left">
                <span class="font-mono text-fluid-xs text-muted text-uppercase d-block mb-xs tracking-widest">
                    /// Services ///
                </span>
                <h2 class="services-main-title">
                    What I do?
                </h2>
            </div>
            <div class="services-header-right">
                <p class="services-lead-text">
                    I craft thoughtful digital experiences through design, branding, and development, helping businesses grow with clarity and creativity.
                </p>
            </div>
        </div>

        {{-- Lista / Stack de Cards de Servicios --}}
        <div class="services-cards-stack d-flex flex-column" data-reveal>
            {{-- Card 001: Brand Identity --}}
            <article class="service-card" data-magnetic data-magnetic-strength="0.1">
                <div class="service-card-index font-mono">001</div>
                <div class="service-card-title">
                    <h3>Brand Identity</h3>
                </div>
                <div class="service-card-tags">
                    <ul class="list-unstyled mb-0">
                        <li><span class="tag-plus">+</span> Logo Design</li>
                        <li><span class="tag-plus">+</span> Visual Identity</li>
                        <li><span class="tag-plus">+</span> Brand Book</li>
                    </ul>
                </div>
                <div class="service-card-desc">
                    <p class="mb-0">
                        Visual systems that make your business unforgettable and differentiate you from competitors.
                    </p>
                </div>
            </article>

            {{-- Card 002: Web Design --}}
            <article class="service-card" data-magnetic data-magnetic-strength="0.1">
                <div class="service-card-index font-mono">002</div>
                <div class="service-card-title">
                    <h3>Web Design</h3>
                </div>
                <div class="service-card-tags">
                    <ul class="list-unstyled mb-0">
                        <li><span class="tag-plus">+</span> Landing Page</li>
                        <li><span class="tag-plus">+</span> Copy Writing</li>
                        <li><span class="tag-plus">+</span> No-code Development</li>
                    </ul>
                </div>
                <div class="service-card-desc">
                    <p class="mb-0">
                        Custom websites that look stunning, perform flawlessly, and convert visitors into customers.
                    </p>
                </div>
            </article>

            {{-- Card 003: UX/UI Design --}}
            <article class="service-card" data-magnetic data-magnetic-strength="0.1">
                <div class="service-card-index font-mono">003</div>
                <div class="service-card-title">
                    <h3>UX/UI Design</h3>
                </div>
                <div class="service-card-tags">
                    <ul class="list-unstyled mb-0">
                        <li><span class="tag-plus">+</span> Wireframing</li>
                        <li><span class="tag-plus">+</span> Prototyping</li>
                        <li><span class="tag-plus">+</span> Product Design</li>
                    </ul>
                </div>
                <div class="service-card-desc">
                    <p class="mb-0">
                        Strategic UX/UI design that turns confused visitors into confident, converting loyal customers.
                    </p>
                </div>
            </article>

            {{-- Card 004: Digital Marketing --}}
            <article class="service-card" data-magnetic data-magnetic-strength="0.1">
                <div class="service-card-index font-mono">004</div>
                <div class="service-card-title">
                    <h3>Digital Marketing</h3>
                </div>
                <div class="service-card-tags">
                    <ul class="list-unstyled mb-0">
                        <li><span class="tag-plus">+</span> Social Media Marketing</li>
                        <li><span class="tag-plus">+</span> Marketing Strategy</li>
                        <li><span class="tag-plus">+</span> SEO &amp; Optimisation</li>
                    </ul>
                </div>
                <div class="service-card-desc">
                    <p class="mb-0">
                        Data-driven campaigns that reach your ideal customers and drive measurable business growth.
                    </p>
                </div>
            </article>
        </div>
    </div>
</section>
