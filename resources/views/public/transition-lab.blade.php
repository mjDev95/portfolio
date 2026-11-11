<!DOCTYPE html>
<html lang="es" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Pixel Wave Transition Lab — Comparador y Calibración</title>

    @include('partials.theme-styles')
    @vite(['resources/css/fluid-system.css'])

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>

    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: #0b0c10;
            color: #ffffff;
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            min-height: 100vh;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }

        /* ── OVERLAY DE PÍXELES + AVATAR ── */
        #lab-pixel-overlay {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            z-index: 500;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        #lab-pixel-grid {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: grid;
            gap: 0 !important;
            z-index: 1;
        }

        .lab-pixel-cell {
            background-color: var(--accent, #cb2128);
            width: 100%;
            height: 100%;
            border: none !important;
            outline: none !important;
            opacity: 0;
            will-change: opacity;
        }

        #lab-pixel-avatar {
            position: relative;
            z-index: 2;
            width: 220px;
            aspect-ratio: 6621 / 8202;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0d0f12;
            opacity: 0;
            will-change: transform, opacity;
        }

        #lab-pixel-avatar svg {
            width: 100%;
            height: 100%;
            display: block;
        }

        /* ── ESCENARIO DE COMPARACIÓN (VISTA A OSCURA / VISTA B CLARA) ── */
        .lab-stage {
            position: relative;
            width: 100vw;
            min-height: 100vh;
            z-index: 1;
        }

        .lab-scene {
            position: absolute;
            inset: 0;
            width: 100%;
            min-height: 100vh;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .lab-scene.is-active {
            display: flex;
        }

        .lab-scene-a {
            background: radial-gradient(circle at 75% 75%, rgba(99, 68, 245, 0.32), transparent 48%), #0b0c10;
            color: #ffffff;
        }

        .lab-scene-b {
            background-color: #caccd1;
            color: #121418;
        }

        .lab-scene-card {
            max-width: 820px;
            text-align: center;
        }

        .lab-scene-title {
            font-family: var(--font-display, system-ui, sans-serif);
            font-size: clamp(2.8rem, 7vw, 6.5rem);
            font-weight: 800;
            letter-spacing: -0.04em;
            line-height: 0.94;
            margin-bottom: 1rem;
        }

        .lab-scene-sub {
            font-size: clamp(1rem, 1.4vw, 1.25rem);
            opacity: 0.78;
            line-height: 1.5;
        }

        /* ── BARRA SUPERIOR DE SCRUBBING RÁPIDO ── */
        .lab-top-scrubber {
            position: fixed;
            top: 0.85rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2000;
            width: min(94vw, 880px);
            background: rgba(16, 18, 24, 0.92);
            backdrop-filter: blur(14px);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 16px;
            padding: 0.75rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.55rem;
        }

        .lab-scrubber-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .lab-scrubber-slider {
            flex: 1;
            min-width: 180px;
            accent-color: var(--accent, #cb2128);
            cursor: pointer;
            height: 6px;
        }

        .lab-badge {
            font-family: var(--font-mono, monospace);
            font-size: 0.75rem;
            background: rgba(255, 255, 255, 0.08);
            padding: 0.25rem 0.6rem;
            border-radius: 6px;
            white-space: nowrap;
        }

        .lab-btn {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 8px;
            padding: 0.38rem 0.75rem;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s ease;
        }

        .lab-btn:hover {
            background: rgba(255, 255, 255, 0.18);
        }

        .lab-btn-primary {
            background: var(--accent, #cb2128);
            border-color: var(--accent, #cb2128);
            color: #ffffff;
        }

        .lab-btn-primary:hover {
            filter: brightness(1.1);
        }

        /* ── PANEL LATERAL DE CONTROLES Y JSON ── */
        .lab-drawer {
            position: fixed;
            bottom: 1rem;
            right: 1rem;
            z-index: 2000;
            width: min(94vw, 410px);
            max-height: calc(100vh - 7.5rem);
            background: rgba(16, 18, 24, 0.94);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .lab-drawer.is-collapsed .lab-drawer-body {
            display: none;
        }

        .lab-drawer-header {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
        }

        .lab-drawer-title {
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.02em;
        }

        .lab-drawer-body {
            padding: 0.85rem 1rem 1rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
        }

        .lab-section {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .lab-section-title {
            font-family: var(--font-mono, monospace);
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: rgba(255, 255, 255, 0.55);
        }

        .lab-field {
            display: flex;
            flex-direction: column;
            gap: 0.22rem;
        }

        .lab-field-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.78rem;
        }

        .lab-field-val {
            font-family: var(--font-mono, monospace);
            font-size: 0.74rem;
            color: #a5b4fc;
        }

        .lab-field input[type="range"] {
            width: 100%;
            accent-color: var(--accent, #cb2128);
            cursor: pointer;
        }

        .lab-field select,
        .lab-field input[type="text"],
        .lab-field input[type="number"] {
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.14);
            color: #ffffff;
            border-radius: 6px;
            padding: 0.35rem 0.5rem;
            font-size: 0.78rem;
        }

        .lab-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
        }

        .lab-json-box {
            width: 100%;
            min-height: 115px;
            background: #090a0d;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            color: #a7f3d0;
            font-family: var(--font-mono, monospace);
            font-size: 0.72rem;
            padding: 0.6rem;
            resize: vertical;
        }

        .lab-grid-guide .lab-pixel-cell {
            outline: 1px dashed rgba(255, 255, 255, 0.18) !important;
        }
    </style>
</head>
<body>

    <!-- OVERLAY DE LA TRANSICIÓN -->
    <div id="lab-pixel-overlay" aria-hidden="true">
        <div id="lab-pixel-grid"></div>
        <div id="lab-pixel-avatar">
            <x-svg-brand-solid />
        </div>
    </div>

    <!-- BARRA DE DESLIZAMIENTO (SCRUBBER) EN TIEMPO REAL -->
    <div class="lab-top-scrubber">
        <div class="lab-scrubber-row">
            <button type="button" class="lab-btn lab-btn-primary" id="btn-play-full">▶ Reproducir Transición</button>
            <input type="range" id="scrubber-range" class="lab-scrubber-slider" min="0" max="1" step="0.001" value="0">
            <span class="lab-badge" id="scrubber-readout">0.0% — Inicio</span>
        </div>
        <div class="lab-scrubber-row" style="justify-content: space-between;">
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                <button type="button" class="lab-btn" data-jump="0.20">Frente Entrada (20%)</button>
                <button type="button" class="lab-btn" data-jump="0.50">Cubierto + Avatar (50%)</button>
                <button type="button" class="lab-btn" data-jump="0.82">Frente Salida (82%)</button>
                <button type="button" class="lab-btn" data-jump="0">Limpiar (0%)</button>
            </div>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
                <span class="lab-badge" id="grid-metrics-badge">12×8</span>
                <button type="button" class="lab-btn" id="btn-toggle-scene">Fondo: A/B</button>
                <button type="button" class="lab-btn" id="btn-new-seed">🎲 Variar Azar</button>
            </div>
        </div>
    </div>

    <!-- ESCENARIO DE PRUEBA (PAGE A OSCURA Y PAGE B CLARA) -->
    <main class="lab-stage">
        <section class="lab-scene lab-scene-a is-active" id="scene-a">
            <div class="lab-scene-card">
                <h1 class="lab-scene-title">Pixelated Wave Transition</h1>
                <p class="lab-scene-sub">
                    Usa el deslizador superior para mover la transición cuadro por cuadro, ajusta el tamaño de los píxeles y las columnas con transparencia, y copia el JSON resultante.
                </p>
            </div>
        </section>

        <section class="lab-scene lab-scene-b" id="scene-b">
            <div class="lab-scene-card">
                <h2 class="lab-scene-title">And here is page two!</h2>
                <p class="lab-scene-sub">
                    Fondo claro de alto contraste para inspeccionar con precisión las 4 columnas/filas de píxeles semitransparentes.
                </p>
            </div>
        </section>
    </main>

    <!-- PANEL DE CALIBRACIÓN + LOCALSTORAGE + EXPORTADOR JSON -->
    <aside class="lab-drawer" id="lab-drawer">
        <div class="lab-drawer-header">
            <span class="lab-drawer-title">⚙️ Calibración Pixel Wave (Guardado en LocalStorage)</span>
            <button type="button" class="lab-btn" id="btn-collapse-drawer">Minimizar</button>
        </div>

        <div class="lab-drawer-body">
            <!-- 1. TAMAÑO DE PÍXELES Y CUADRÍCULA -->
            <div class="lab-section">
                <div class="lab-section-title">1. Tamaño de Píxeles y Orientación</div>

                <div class="lab-field">
                    <div class="lab-field-top">
                        <label for="ctrl-sizing-mode">Modo de cálculo de tamaño</label>
                    </div>
                    <select id="ctrl-sizing-mode">
                        <option value="count">Por cantidad de columnas/filas (1fr exacto)</option>
                        <option value="px">Por tamaño aproximado en px (calcula 1fr)</option>
                    </select>
                </div>

                <div class="lab-field" id="wrap-landscape-cols">
                    <div class="lab-field-top">
                        <label for="ctrl-landscape-cols">Columnas cuando Ancho &gt; Alto (PC/Laptop)</label>
                        <span class="lab-field-val" id="val-landscape-cols">12</span>
                    </div>
                    <input type="range" id="ctrl-landscape-cols" min="4" max="32" step="1" value="12">
                </div>

                <div class="lab-field" id="wrap-portrait-rows">
                    <div class="lab-field-top">
                        <label for="ctrl-portrait-rows">Filas cuando Alto &gt;= Ancho (Móvil)</label>
                        <span class="lab-field-val" id="val-portrait-rows">12</span>
                    </div>
                    <input type="range" id="ctrl-portrait-rows" min="4" max="32" step="1" value="12">
                </div>

                <div class="lab-field" id="wrap-target-px" style="display: none;">
                    <div class="lab-field-top">
                        <label for="ctrl-target-px">Tamaño objetivo del píxel (px)</label>
                        <span class="lab-field-val" id="val-target-px">120px</span>
                    </div>
                    <input type="range" id="ctrl-target-px" min="40" max="240" step="4" value="120">
                </div>

                <div class="lab-field">
                    <div class="lab-field-top">
                        <label for="ctrl-direction">Dirección de la ola</label>
                    </div>
                    <select id="ctrl-direction">
                        <option value="auto">Automática (Ancho &gt; Alto: Izq→Der | Alto &gt;= Ancho: Abajo→Arriba)</option>
                        <option value="left-to-right">Siempre Izquierda → Derecha (como el video)</option>
                        <option value="bottom-to-top">Siempre Abajo → Arriba</option>
                        <option value="right-to-left">Siempre Derecha → Izquierda</option>
                        <option value="top-to-bottom">Siempre Arriba → Abajo</option>
                    </select>
                </div>

                <label style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.76rem; cursor: pointer;">
                    <input type="checkbox" id="ctrl-show-grid-lines">
                    Mostrar líneas guía de la cuadrícula
                </label>
            </div>

            <!-- 2. FLUIDEZ Y COLUMNAS CON TRANSPARENCIA -->
            <div class="lab-section">
                <div class="lab-section-title">2. Fluidez y Columnas/Filas en Transparencia</div>

                <div class="lab-field">
                    <div class="lab-field-top">
                        <label for="ctrl-spread-lines">Columnas/Filas con transparencia (Traslape)</label>
                        <span class="lab-field-val" id="val-spread-lines">3.0</span>
                    </div>
                    <input type="range" id="ctrl-spread-lines" min="0.5" max="7.0" step="0.25" value="3.0">
                </div>

                <div class="lab-field">
                    <div class="lab-field-top">
                        <label for="ctrl-step-line">Velocidad de avance por columna/fila (s)</label>
                        <span class="lab-field-val" id="val-step-line">0.055s</span>
                    </div>
                    <input type="range" id="ctrl-step-line" min="0.020" max="0.140" step="0.005" value="0.055">
                </div>

                <div class="lab-field">
                    <div class="lab-field-top">
                        <label for="ctrl-cell-fade">Duración de fade de cada píxel (s)</label>
                        <span class="lab-field-val" id="val-cell-fade">0.100s</span>
                    </div>
                    <input type="range" id="ctrl-cell-fade" min="0.030" max="0.350" step="0.005" value="0.100">
                </div>

                <div class="lab-field">
                    <div class="lab-field-top">
                        <label for="ctrl-opacity-steps">Escalones de opacidad (0 = continuo)</label>
                        <span class="lab-field-val" id="val-opacity-steps">0 (Continuo)</span>
                    </div>
                    <input type="range" id="ctrl-opacity-steps" min="0" max="6" step="1" value="0">
                </div>

                <div class="lab-field">
                    <div class="lab-field-top">
                        <label for="ctrl-micro-jitter">Variación aleatoria extra (s)</label>
                        <span class="lab-field-val" id="val-micro-jitter">0.018s</span>
                    </div>
                    <input type="range" id="ctrl-micro-jitter" min="0" max="0.080" step="0.002" value="0.018">
                </div>

                <div class="lab-field">
                    <div class="lab-field-top">
                        <label for="ctrl-speed">Velocidad de reproducción en prueba</label>
                    </div>
                    <select id="ctrl-speed">
                        <option value="1">1x (Velocidad real)</option>
                        <option value="0.5">0.5x (Cámara lenta)</option>
                        <option value="0.25">0.25x (Ultra lenta para análisis)</option>
                    </select>
                </div>
            </div>

            <!-- 3. AVATAR Y RETENCIÓN -->
            <div class="lab-section">
                <div class="lab-section-title">3. Avatar Central (px por Media Query) y Espera</div>

                <div class="lab-grid-2">
                    <div class="lab-field">
                        <div class="lab-field-top"><label for="ctrl-av-mobile">Móvil (&lt;768px)</label></div>
                        <input type="number" id="ctrl-av-mobile" min="40" max="500" step="5" value="140">
                    </div>
                    <div class="lab-field">
                        <div class="lab-field-top"><label for="ctrl-av-tablet">Tablet (&gt;=768px)</label></div>
                        <input type="number" id="ctrl-av-tablet" min="40" max="600" step="5" value="180">
                    </div>
                    <div class="lab-field">
                        <div class="lab-field-top"><label for="ctrl-av-desktop">Laptop (&gt;=1024px)</label></div>
                        <input type="number" id="ctrl-av-desktop" min="40" max="700" step="5" value="220">
                    </div>
                    <div class="lab-field">
                        <div class="lab-field-top"><label for="ctrl-av-large">XL (&gt;=1440px)</label></div>
                        <input type="number" id="ctrl-av-large" min="40" max="800" step="5" value="260">
                    </div>
                </div>

                <div class="lab-grid-2" style="margin-top: 0.25rem;">
                    <div class="lab-field">
                        <div class="lab-field-top">
                            <label for="ctrl-av-color">Color Avatar</label>
                        </div>
                        <input type="text" id="ctrl-av-color" value="#0d0f12">
                    </div>
                    <div class="lab-field">
                        <div class="lab-field-top">
                            <label for="ctrl-hold-ms">Hold cubierto (ms)</label>
                        </div>
                        <input type="number" id="ctrl-hold-ms" min="0" max="2000" step="25" value="250">
                    </div>
                </div>

                <div class="lab-grid-2">
                    <div class="lab-field">
                        <div class="lab-field-top">
                            <label for="ctrl-av-in">Avatar In (s)</label>
                            <span class="lab-field-val" id="val-av-in">0.21s</span>
                        </div>
                        <input type="range" id="ctrl-av-in" min="0.05" max="0.80" step="0.01" value="0.21">
                    </div>
                    <div class="lab-field">
                        <div class="lab-field-top">
                            <label for="ctrl-av-out">Avatar Out (s)</label>
                            <span class="lab-field-val" id="val-av-out">0.43s</span>
                        </div>
                        <input type="range" id="ctrl-av-out" min="0.05" max="0.80" step="0.01" value="0.43">
                    </div>
                </div>
            </div>

            <!-- 4. EXPORTAR JSON -->
            <div class="lab-section" style="border-bottom: none; padding-bottom: 0;">
                <div class="lab-section-title">4. Configuración JSON (Lista para copiar)</div>
                <textarea id="lab-json-output" class="lab-json-box" readonly></textarea>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" class="lab-btn lab-btn-primary" id="btn-copy-json" style="flex: 1;">📋 Copiar JSON</button>
                    <button type="button" class="lab-btn" id="btn-reset-defaults">Restablecer</button>
                </div>
            </div>
        </div>
    </aside>

    <script>
        (() => {
            const STORAGE_KEY = 'portfolio_pixel_wave_lab_config_v1';

            const DEFAULT_CONFIG = {
                sizingMode: 'count',
                landscapeCols: 20,
                portraitRows: 15,
                targetPixelPx: 120,
                directionMode: 'auto',
                transparentSpreadLines: 4,
                stepPerLine: 0.035,
                cellFadeDuration: 0.07,
                opacitySteps: 0,
                microJitter: 0.014,
                avatarMobilePx: 210,
                avatarTabletPx: 210,
                avatarDesktopPx: 210,
                avatarLargePx: 210,
                avatarColor: '#0d0f12',
                avatarFadeInDuration: 0.21,
                holdExtraMs: 250,
                avatarFadeOutDuration: 0.43,
                seed: 369529
            };

            let config = { ...DEFAULT_CONFIG };
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
                }
            } catch (e) {}

            const overlay = document.getElementById('lab-pixel-overlay');
            const gridEl = document.getElementById('lab-pixel-grid');
            const avatarEl = document.getElementById('lab-pixel-avatar');
            const sceneA = document.getElementById('scene-a');
            const sceneB = document.getElementById('scene-b');
            const scrubber = document.getElementById('scrubber-range');
            const scrubberReadout = document.getElementById('scrubber-readout');
            const metricsBadge = document.getElementById('grid-metrics-badge');
            const jsonOutput = document.getElementById('lab-json-output');

            let cols = 12;
            let rows = 8;
            let gridCells = [];
            let masterTl = null;
            let startWithSceneA = true;

            // Generador pseudo-aleatorio con semilla fija para que al mover el deslizador no salten los cuadros
            function createSeededRandom(seedVal) {
                let s = seedVal % 2147483647;
                if (s <= 0) s += 2147483646;
                return () => {
                    s = (s * 16807) % 2147483647;
                    return (s - 1) / 2147483646;
                };
            }

            function resolveAvatarSize() {
                const vw = window.innerWidth;
                if (vw >= 1440) return config.avatarLargePx;
                if (vw >= 1024) return config.avatarDesktopPx;
                if (vw >= 768) return config.avatarTabletPx;
                return config.avatarMobilePx;
            }

            function resolveDirection() {
                if (config.directionMode !== 'auto') return config.directionMode;
                return window.innerWidth > window.innerHeight ? 'left-to-right' : 'bottom-to-top';
            }

            function buildGrid() {
                gridEl.replaceChildren();
                gridCells = [];

                const vw = window.innerWidth || 1440;
                const vh = window.innerHeight || 900;
                const aspect = vw / vh;
                const isLandscape = vw > vh;

                if (config.sizingMode === 'px') {
                    const px = Math.max(30, config.targetPixelPx || 120);
                    cols = Math.max(4, Math.round(vw / px));
                    rows = Math.max(4, Math.round(vh / px));
                } else if (isLandscape) {
                    cols = Math.max(4, Number(config.landscapeCols) || 12);
                    rows = Math.max(4, Math.round(cols / aspect));
                } else {
                    rows = Math.max(4, Number(config.portraitRows) || 12);
                    cols = Math.max(4, Math.round(rows * aspect));
                }

                gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
                gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

                const frag = document.createDocumentFragment();
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const cell = document.createElement('div');
                        cell.className = 'lab-pixel-cell';
                        frag.appendChild(cell);
                        gridCells.push({ el: cell, col: c, row: r });
                    }
                }
                gridEl.appendChild(frag);

                const cellW = Math.round(vw / cols);
                const cellH = Math.round(vh / rows);
                const dirLabel = resolveDirection() === 'left-to-right' ? 'Izq→Der' :
                                 resolveDirection() === 'bottom-to-top' ? 'Abajo→Arriba' :
                                 resolveDirection();
                metricsBadge.textContent = `${cols}×${rows} (${cellW}×${cellH}px) · ${dirLabel}`;

                avatarEl.style.width = `${resolveAvatarSize()}px`;
                avatarEl.style.color = config.avatarColor || '#0d0f12';
            }

            function buildMasterTimeline() {
                if (masterTl) {
                    masterTl.kill();
                }

                const allEls = gridCells.map((c) => c.el);
                gsap.set(allEls, { opacity: 0 });
                gsap.set(avatarEl, { opacity: 0, scale: 0.88 });

                const dir = resolveDirection();
                const isHorizontal = dir === 'left-to-right' || dir === 'right-to-left';
                const totalSteps = isHorizontal ? cols : rows;
                const stepPerLine = Number(config.stepPerLine) || 0.055;
                const lineJitterSpan = stepPerLine * (Number(config.transparentSpreadLines) || 3.0);
                const cellFadeDuration = Number(config.cellFadeDuration) || 0.100;
                const easeStr = Number(config.opacitySteps) > 0 ? `steps(${Number(config.opacitySteps)})` : 'none';
                const microJitterSpan = Number(config.microJitter) || 0;

                const groups = Array.from({ length: totalSteps }, () => []);
                gridCells.forEach((cellObj) => {
                    let lineIdx = 0;
                    if (dir === 'left-to-right') lineIdx = cellObj.col;
                    else if (dir === 'right-to-left') lineIdx = cols - 1 - cellObj.col;
                    else if (dir === 'bottom-to-top') lineIdx = rows - 1 - cellObj.row;
                    else if (dir === 'top-to-bottom') lineIdx = cellObj.row;
                    if (groups[lineIdx]) groups[lineIdx].push(cellObj);
                });

                const tl = gsap.timeline({
                    paused: true,
                    onUpdate: () => {
                        const p = tl.progress();
                        scrubber.value = p.toFixed(3);
                        let stageLabel = 'Tiempo 1: Cubriendo';
                        if (p >= 0.42 && p < 0.58) stageLabel = '100% Cubierto + Avatar';
                        else if (p >= 0.58) stageLabel = 'Tiempo 2: Destapando';
                        scrubberReadout.textContent = `${(p * 100).toFixed(1)}% — ${stageLabel}`;

                        // Conmutar escena A / B en el punto medio (50%)
                        const showSecond = p >= 0.5;
                        const activeA = startWithSceneA ? !showSecond : showSecond;
                        sceneA.classList.toggle('is-active', activeA);
                        sceneB.classList.toggle('is-active', !activeA);
                    }
                });

                // ── TIEMPO 1: ENTRADA DE LOS PÍXELES (CON AVATAR OCULTO) ──
                const rngIn = createSeededRandom(config.seed);
                let maxInEndTime = 0;

                groups.forEach((lineCells, lineIdx) => {
                    const lineBaseDelay = 0.02 + lineIdx * stepPerLine;
                    const ranks = lineCells.map((_, idx) => idx);
                    for (let i = ranks.length - 1; i > 0; i--) {
                        const j = Math.floor(rngIn() * (i + 1));
                        const tmp = ranks[i];
                        ranks[i] = ranks[j];
                        ranks[j] = tmp;
                    }

                    lineCells.forEach((cellObj, idx) => {
                        const rankProgress = ranks[idx] / Math.max(1, lineCells.length - 1);
                        const micro = (rngIn() - 0.5) * microJitterSpan;
                        const delay = Math.max(0, lineBaseDelay + rankProgress * lineJitterSpan + micro);
                        const endTime = delay + cellFadeDuration;
                        if (endTime > maxInEndTime) maxInEndTime = endTime;

                        tl.fromTo(
                            cellObj.el,
                            { opacity: 0 },
                            {
                                opacity: 1,
                                duration: cellFadeDuration,
                                ease: easeStr,
                                immediateRender: false,
                            },
                            delay
                        );
                    });
                });

                // ── ENTRADA DEL AVATAR (SOLO CUANDO YA ESTÁ 100% CUBIERTO) ──
                const avatarInDur = Number(config.avatarFadeInDuration) || 0.28;
                const holdSec = (Number(config.holdExtraMs) || 250) / 1000;
                const avatarOutDur = Number(config.avatarFadeOutDuration) || 0.24;

                const avatarInStart = maxInEndTime + 0.02;
                tl.fromTo(
                    avatarEl,
                    { opacity: 0, scale: 0.88 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: avatarInDur,
                        ease: 'power2.out',
                        immediateRender: false,
                    },
                    avatarInStart
                );

                // ── SALIDA DEL AVATAR (ANTES DE INICIAR EL DESTAPE) ──
                const avatarOutStart = avatarInStart + avatarInDur + holdSec;
                tl.to(
                    avatarEl,
                    {
                        opacity: 0,
                        scale: 0.92,
                        duration: avatarOutDur,
                        ease: 'power2.in',
                    },
                    avatarOutStart
                );

                // ── TIEMPO 2: SALIDA DE LOS PÍXELES (YA SIN EL AVATAR) ──
                const waveOutStart = avatarOutStart + avatarOutDur + 0.02;
                const rngOut = createSeededRandom(config.seed + 7919);

                groups.forEach((lineCells, lineIdx) => {
                    const lineBaseDelay = waveOutStart + lineIdx * stepPerLine;
                    const ranks = lineCells.map((_, idx) => idx);
                    for (let i = ranks.length - 1; i > 0; i--) {
                        const j = Math.floor(rngOut() * (i + 1));
                        const tmp = ranks[i];
                        ranks[i] = ranks[j];
                        ranks[j] = tmp;
                    }

                    lineCells.forEach((cellObj, idx) => {
                        const rankProgress = ranks[idx] / Math.max(1, lineCells.length - 1);
                        const micro = (rngOut() - 0.5) * microJitterSpan;
                        const delay = Math.max(waveOutStart, lineBaseDelay + rankProgress * lineJitterSpan + micro);

                        tl.fromTo(
                            cellObj.el,
                            { opacity: 1 },
                            {
                                opacity: 0,
                                duration: cellFadeDuration,
                                ease: easeStr,
                                immediateRender: false,
                            },
                            delay
                        );
                    });
                });

                masterTl = tl;
            }

            function syncControlsFromConfig() {
                document.getElementById('ctrl-sizing-mode').value = config.sizingMode;
                document.getElementById('wrap-landscape-cols').style.display = config.sizingMode === 'count' ? '' : 'none';
                document.getElementById('wrap-portrait-rows').style.display = config.sizingMode === 'count' ? '' : 'none';
                document.getElementById('wrap-target-px').style.display = config.sizingMode === 'px' ? '' : 'none';

                document.getElementById('ctrl-landscape-cols').value = config.landscapeCols;
                document.getElementById('val-landscape-cols').textContent = config.landscapeCols;

                document.getElementById('ctrl-portrait-rows').value = config.portraitRows;
                document.getElementById('val-portrait-rows').textContent = config.portraitRows;

                document.getElementById('ctrl-target-px').value = config.targetPixelPx;
                document.getElementById('val-target-px').textContent = `${config.targetPixelPx}px`;

                document.getElementById('ctrl-direction').value = config.directionMode;

                document.getElementById('ctrl-spread-lines').value = config.transparentSpreadLines;
                document.getElementById('val-spread-lines').textContent = Number(config.transparentSpreadLines).toFixed(2);

                document.getElementById('ctrl-step-line').value = config.stepPerLine;
                document.getElementById('val-step-line').textContent = `${Number(config.stepPerLine).toFixed(3)}s`;

                document.getElementById('ctrl-cell-fade').value = config.cellFadeDuration;
                document.getElementById('val-cell-fade').textContent = `${Number(config.cellFadeDuration).toFixed(3)}s`;

                document.getElementById('ctrl-opacity-steps').value = config.opacitySteps;
                document.getElementById('val-opacity-steps').textContent = Number(config.opacitySteps) === 0 ? '0 (Continuo)' : `${config.opacitySteps} escalones`;

                document.getElementById('ctrl-micro-jitter').value = config.microJitter;
                document.getElementById('val-micro-jitter').textContent = `${Number(config.microJitter).toFixed(3)}s`;

                document.getElementById('ctrl-av-mobile').value = config.avatarMobilePx;
                document.getElementById('ctrl-av-tablet').value = config.avatarTabletPx;
                document.getElementById('ctrl-av-desktop').value = config.avatarDesktopPx;
                document.getElementById('ctrl-av-large').value = config.avatarLargePx;
                document.getElementById('ctrl-av-color').value = config.avatarColor;
                document.getElementById('ctrl-hold-ms').value = config.holdExtraMs;

                document.getElementById('ctrl-av-in').value = config.avatarFadeInDuration;
                document.getElementById('val-av-in').textContent = `${Number(config.avatarFadeInDuration).toFixed(2)}s`;

                document.getElementById('ctrl-av-out').value = config.avatarFadeOutDuration;
                document.getElementById('val-av-out').textContent = `${Number(config.avatarFadeOutDuration).toFixed(2)}s`;

                jsonOutput.value = JSON.stringify(config, null, 2);
            }

            function saveAndRebuild(preserveProgress = true) {
                const prevProgress = masterTl ? masterTl.progress() : 0;
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
                } catch (e) {}
                syncControlsFromConfig();
                buildGrid();
                buildMasterTimeline();
                if (preserveProgress && masterTl) {
                    masterTl.progress(prevProgress);
                }
            }

            // Listeners de controles
            const bindInput = (id, key, isNum = true) => {
                const el = document.getElementById(id);
                if (!el) return;
                el.addEventListener('input', () => {
                    config[key] = isNum ? Number(el.value) : el.value;
                    saveAndRebuild(true);
                });
            };

            bindInput('ctrl-sizing-mode', 'sizingMode', false);
            bindInput('ctrl-landscape-cols', 'landscapeCols', true);
            bindInput('ctrl-portrait-rows', 'portraitRows', true);
            bindInput('ctrl-target-px', 'targetPixelPx', true);
            bindInput('ctrl-direction', 'directionMode', false);
            bindInput('ctrl-spread-lines', 'transparentSpreadLines', true);
            bindInput('ctrl-step-line', 'stepPerLine', true);
            bindInput('ctrl-cell-fade', 'cellFadeDuration', true);
            bindInput('ctrl-opacity-steps', 'opacitySteps', true);
            bindInput('ctrl-micro-jitter', 'microJitter', true);
            bindInput('ctrl-av-mobile', 'avatarMobilePx', true);
            bindInput('ctrl-av-tablet', 'avatarTabletPx', true);
            bindInput('ctrl-av-desktop', 'avatarDesktopPx', true);
            bindInput('ctrl-av-large', 'avatarLargePx', true);
            bindInput('ctrl-av-color', 'avatarColor', false);
            bindInput('ctrl-hold-ms', 'holdExtraMs', true);
            bindInput('ctrl-av-in', 'avatarFadeInDuration', true);
            bindInput('ctrl-av-out', 'avatarFadeOutDuration', true);

            document.getElementById('ctrl-show-grid-lines').addEventListener('change', (e) => {
                overlay.classList.toggle('lab-grid-guide', e.target.checked);
            });

            scrubber.addEventListener('input', () => {
                if (!masterTl) return;
                masterTl.pause();
                masterTl.progress(Number(scrubber.value));
            });

            document.querySelectorAll('[data-jump]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    if (!masterTl) return;
                    masterTl.pause();
                    masterTl.progress(Number(btn.getAttribute('data-jump')));
                });
            });

            document.getElementById('btn-play-full').addEventListener('click', () => {
                if (!masterTl) return;
                const speed = Number(document.getElementById('ctrl-speed').value) || 1;
                masterTl.timeScale(speed);
                masterTl.restart();
            });

            document.getElementById('btn-toggle-scene').addEventListener('click', () => {
                startWithSceneA = !startWithSceneA;
                if (masterTl) {
                    masterTl.progress(masterTl.progress());
                }
            });

            document.getElementById('btn-new-seed').addEventListener('click', () => {
                config.seed = Math.floor(Math.random() * 900000) + 1000;
                saveAndRebuild(true);
            });

            document.getElementById('btn-collapse-drawer').addEventListener('click', (e) => {
                const drawer = document.getElementById('lab-drawer');
                const collapsed = drawer.classList.toggle('is-collapsed');
                e.currentTarget.textContent = collapsed ? 'Expandir' : 'Minimizar';
            });

            document.getElementById('btn-copy-json').addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                try {
                    await navigator.clipboard.writeText(jsonOutput.value);
                    const prev = btn.textContent;
                    btn.textContent = '✅ ¡JSON Copiado!';
                    setTimeout(() => { btn.textContent = prev; }, 1600);
                } catch (err) {
                    jsonOutput.select();
                    document.execCommand('copy');
                }
            });

            document.getElementById('btn-reset-defaults').addEventListener('click', () => {
                config = { ...DEFAULT_CONFIG };
                saveAndRebuild(false);
                if (masterTl) masterTl.progress(0.20);
            });

            window.addEventListener('resize', () => {
                saveAndRebuild(true);
            });

            // Inicializar y posicionar al 20% o reproducir entrada inicial con la config guardada
            saveAndRebuild(false);
            if (masterTl) {
                masterTl.progress(0.5);
                const speed = Number(document.getElementById('ctrl-speed').value) || 1;
                masterTl.timeScale(speed);
                masterTl.tweenFromTo(0.5, 1.0);
            }
        })();
    </script>
</body>
</html>
