{{-- 
  Hero 02: Declaración Editorial & Rejilla de 4 Estadísticas Monumentales
  (Inspiración Wabi-Sabi & Framer About Section a Ancho Completo)
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
                <path d="M0 -12 C0 -3, 3 0, 12 0 C 3 0, 0 3, 0 12 C 0 3, -3 0, -12 0 C -3 0, 0 -3, 0 -12 Z" />
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
            Hey<span class="emoji-wave">👋</span>, I'm a digital designer in Mexico City, bringing digital experiences to life with striking visuals, expressive motion, and <span class="hero-statement-faded">effortless interaction.</span>
        </h2>

        {{-- Botón Píldora con ícono circular [ (→) More About Me ] --}}
        <div class="mb-xl" data-reveal>
            <a href="{{ route('about') }}" 
               class="btn-pill-action"
               data-magnetic data-magnetic-strength="0.3">
                <span class="btn-pill-arrow-circle">&rarr;</span>
                <span>More About Me</span>
            </a>
        </div>

        {{-- Rejilla Horizontal de 4 Estadísticas Monumentales con hairline dividers (Framer Widget Stack) --}}
        <div class="hero-stats-row">
            <div class="row g-4" data-reveal>
                {{-- Métrica 01: Website launched --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="hero-stat-num">21+</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Website launched</h3>
                        <p class="hero-stat-desc">
                            We empower brands to confidently build and strengthen online presence.
                        </p>
                    </div>
                </div>

                {{-- Métrica 02: Users engaged --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="hero-stat-num">2M+</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Users engaged</h3>
                        <p class="hero-stat-desc">
                            Our designs bridge cultures, inspiring and connecting people globally.
                        </p>
                    </div>
                </div>

                {{-- Métrica 03: Client satisfaction rate --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="hero-stat-num">99%</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Client satisfaction rate</h3>
                        <p class="hero-stat-desc">
                            Building lasting connections through trust, collaboration, and creativity.
                        </p>
                    </div>
                </div>

                {{-- Métrica 04: Years of experience --}}
                <div class="col-12 col-md-6 col-lg-3 hero-stat-col">
                    <div class="hero-stat-num">5+</div>
                    <div class="hero-stat-hairline">
                        <h3 class="hero-stat-title">Years of experience</h3>
                        <p class="hero-stat-desc">
                            Innovative solutions crafted over decades for industry-leading brands.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
