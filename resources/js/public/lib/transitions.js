import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger, resetScroll, stopScroll, startScroll, resizeScroll, getLenis } from './smooth-scroll';
import { updateCsrfTokenFrom } from './csrf';
import { initPageAnimations } from '../animations/init-page';
import { createFlipTransitions } from './flip-transitions';
import { sendAnalyticsPing } from './tracker';
import { cleanupDynamicIsland, syncDesktopIslandState, markNavigated, isNavDrawerClosing, closeNavDrawer } from '../animations/dynamic-island';
import { closeShareModal } from './share-modal';
import { cleanupFooterReveal, initFooterReveal } from '../animations/footer';
import { cleanupMethodology } from '../animations/methodology';
import { cleanupLatestNewsPill } from '../animations/latest-news-pill';
import { cleanupProjectHero } from '../animations/project-hero';
import { cleanupCardReveals } from '../animations/shared/card-reveal';
import { splitTextIntoChars, animateBlurChars } from '../animations/shared/text-reveal';
import { buildPixelGrid, schedulePixelWave, PIXEL_WAVE_DEFAULTS } from '../animations/shared/pixel-wave';

let isBlogFilterTransition = false;
let animationsInitializedFor = null;

const BLOG_LISTING_PATH = /^\/blog(\/(categoria|etiqueta|tag)\/[^/]+)?\/?$/;

/**
 * Navegación interna del blog (píldoras de categoría o listado → listado).
 */
function isBlogFilterNavigation({ current, next, trigger }) {
    if (trigger?.closest?.('[data-drawer-link], .nav-flat-link')) {
        return false;
    }
    const isPill = Boolean(
        trigger?.closest?.('.blog-pill-rail') ||
        trigger?.closest?.('.editorial-pill') ||
        trigger?.classList?.contains?.('editorial-pill')
    );
    const isFromBlog = ['blog-index', 'blog-category', 'blog-tag'].includes(current.namespace) ||
                       Boolean(current.url?.path && BLOG_LISTING_PATH.test(current.url.path));
    const isToBlog = Boolean(next.url?.path && BLOG_LISTING_PATH.test(next.url.path));

    return Boolean(isPill || (isFromBlog && isToBlog));
}

const flipTransitionDefinitions = createFlipTransitions();

/**
 * La onda líquida aplica a toda navegación excepto el filtrado del blog
 * y las cards con imagen (Flip de elemento compartido).
 */
function isLiquidWipeNavigation(data) {
    if (isBlogFilterNavigation(data)) return false;
    return !flipTransitionDefinitions.some((definition) => definition.custom?.(data));
}

/**
 * Limpieza que altera lo visible de la página saliente (pins, reveals, footer).
 * En la onda líquida se ejecuta SOLO cuando la pantalla ya está cubierta.
 */
function runOutgoingVisualCleanup() {
    closeNavDrawer(true);
    cleanupFooterReveal();
    cleanupMethodology();
    cleanupLatestNewsPill();
    cleanupProjectHero();
    cleanupCardReveals();
    const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');
    if (mainFooter) {
        gsap.set(mainFooter, { opacity: 0 });
    }
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

function syncPageMetadata(html) {
    if (!html) return;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 1. Title
        const newTitle = doc.querySelector('title')?.textContent;
        if (newTitle) {
            document.title = newTitle;
        }

        // 2. Meta description
        const newDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
        let currentDesc = document.querySelector('meta[name="description"]');
        if (newDesc !== undefined && newDesc !== null) {
            if (!currentDesc) {
                currentDesc = document.createElement('meta');
                currentDesc.setAttribute('name', 'description');
                document.head.appendChild(currentDesc);
            }
            currentDesc.setAttribute('content', newDesc);
        }

        // 3. Link Canonical
        const newCanonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.href;
        let currentCanonical = document.querySelector('link[rel="canonical"]');
        if (newCanonical) {
            if (!currentCanonical) {
                currentCanonical = document.createElement('link');
                currentCanonical.setAttribute('rel', 'canonical');
                document.head.appendChild(currentCanonical);
            }
            currentCanonical.setAttribute('href', newCanonical);
        }

        // 4. Open Graph & Twitter Cards
        const metaTags = [
            { key: 'og:title', type: 'property' },
            { key: 'og:description', type: 'property' },
            { key: 'og:url', type: 'property' },
            { key: 'og:type', type: 'property' },
            { key: 'og:image', type: 'property' },
            { key: 'og:site_name', type: 'property' },
            { key: 'twitter:card', type: 'name' },
            { key: 'twitter:title', type: 'name' },
            { key: 'twitter:description', type: 'name' },
            { key: 'twitter:image', type: 'name' },
        ];

        metaTags.forEach(({ key, type }) => {
            const incoming = doc.querySelector(`meta[${type}="${key}"]`) || doc.querySelector(`meta[name="${key}"]`) || doc.querySelector(`meta[property="${key}"]`);
            let current = document.querySelector(`meta[${type}="${key}"]`) || document.querySelector(`meta[name="${key}"]`) || document.querySelector(`meta[property="${key}"]`);

            if (incoming) {
                const content = incoming.getAttribute('content');
                if (!current) {
                    current = document.createElement('meta');
                    current.setAttribute(type, key);
                    document.head.appendChild(current);
                }
                current.setAttribute('content', content || '');
            } else if (current) {
                current.remove();
            }
        });

        // 5. Reemplazo de Scripts JSON-LD (Schema.org estructurado)
        const incomingJsonLd = doc.querySelectorAll('script[type="application/ld+json"]');
        if (incomingJsonLd.length > 0) {
            // Eliminar los bloques JSON-LD existentes en <head>
            document.querySelectorAll('head script[type="application/ld+json"]').forEach((script) => {
                script.remove();
            });

            // Inyectar los nuevos bloques JSON-LD con datos frescos
            incomingJsonLd.forEach((jsonScript) => {
                const scriptEl = document.createElement('script');
                scriptEl.type = 'application/ld+json';
                scriptEl.textContent = jsonScript.textContent;
                document.head.appendChild(scriptEl);
            });
        }
    } catch (e) {
        console.warn('[Barba] Error sincronizando metadatos y SEO:', e);
    }
}

/**
 * Monitors images inside the incoming container to trigger lenis.resize()
 * and ScrollTrigger.refresh() as they load, preventing zero-height / limit = 0 issues.
 */
function watchImagesForScrollResize(container) {
    if (!container) return;

    const images = Array.from(container.querySelectorAll('img'));
    if (!images.length) return;

    const onImageSettled = () => {
        resizeScroll();
        ScrollTrigger.refresh();
    };

    images.forEach((img) => {
        if (!img.complete) {
            img.addEventListener('load', onImageSettled, { once: true });
            img.addEventListener('error', onImageSettled, { once: true });
        }
    });

    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            resizeScroll();
            ScrollTrigger.refresh();
        });
        ro.observe(container);

        setTimeout(() => {
            ro.disconnect();
        }, 2500);
    }
}



let initialRevealFallbackTimer = null;
let pixelCols = 0;
let pixelRows = 0;
let pixelGridCells = [];
let isPixelWaveRunning = false;
let pixelResizeBound = false;

const PIXEL_WAVE_CONFIG = {
    ...PIXEL_WAVE_DEFAULTS,
    avatarFadeInDuration: 0.21,
    holdExtraMs: 250,
    avatarFadeOutDuration: 0.43,
};

function buildFluidPixelGrid(initialOpacity = 0) {
    const overlay = document.getElementById('transition-wipe');
    if (!overlay) return [];

    const gridContainer = overlay.querySelector('[data-pixel-grid]') || overlay;
    const gridState = buildPixelGrid(gridContainer, {
        initialOpacity,
        cellClass: 'pixel-wave-cell',
        ...PIXEL_WAVE_CONFIG,
    });

    pixelGridCells = gridState.cells;
    pixelCols = gridState.cols;
    pixelRows = gridState.rows;

    if (!pixelResizeBound) {
        pixelResizeBound = true;
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (!isPixelWaveRunning) {
                    buildFluidPixelGrid(0);
                }
            }, 200);
        });
    }

    return pixelGridCells;
}

/**
 * Espera a que las fuentes, las imágenes visibles del contenedor entrante y 2 frames de pintado
 * estén completamente listos, más un tiempo extra de retención (extraHoldMs) antes de destapar.
 */
async function waitForIncomingPageReady(container, extraHoldMs = PIXEL_WAVE_CONFIG.holdExtraMs) {
    const tasks = [];

    if (document.fonts?.ready) {
        tasks.push(document.fonts.ready.catch(() => {}));
    }

    if (container) {
        const vh = window.innerHeight || 900;
        const images = Array.from(container.querySelectorAll('img')).filter((img) => {
            if (img.complete && img.naturalWidth > 0) return false;
            const rect = img.getBoundingClientRect();
            return img.loading !== 'lazy' || (rect.top < vh * 1.25 && rect.bottom > -100);
        });

        images.forEach((img) => {
            tasks.push(
                new Promise((resolve) => {
                    const done = () => resolve();
                    if (typeof img.decode === 'function') {
                        img.decode().then(done).catch(done);
                    } else {
                        img.addEventListener('load', done, { once: true });
                        img.addEventListener('error', done, { once: true });
                    }
                })
            );
        });
    }

    await Promise.race([
        Promise.all(tasks),
        new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);

    await new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(resolve, extraHoldMs);
            });
        });
    });
}

function scheduleBottomToTopPixelWave(tl, { fromOpacity, toOpacity, startOffset = 0, seedOffset = 0 }) {
    return schedulePixelWave(
        tl,
        { cells: pixelGridCells, cols: pixelCols, rows: pixelRows },
        {
            ...PIXEL_WAVE_CONFIG,
            fromOpacity,
            toOpacity,
            startOffset,
            seedOffset,
        }
    );
}

/**
 * Entrada por URL directa / recarga: el documento nace cubierto con nuestro color de acento
 * y el avatar centrado; espera a que la página esté 100% lista + margen extra y baja la opacidad de los cuadros.
 */
export function playInitialLiquidReveal() {
    const wipe = document.getElementById('transition-wipe');
    if (!wipe) return;

    const avatar = wipe.querySelector('[data-pixel-avatar]');
    buildFluidPixelGrid(1);
    wipe.style.backgroundColor = 'transparent';
    if (avatar) {
        gsap.set(avatar, { opacity: 1, scale: 1 });
    }

    const hideWipe = () => {
        if (initialRevealFallbackTimer) {
            clearTimeout(initialRevealFallbackTimer);
            initialRevealFallbackTimer = null;
        }
        isPixelWaveRunning = false;
        wipe.style.backgroundColor = 'transparent';
        const allElements = pixelGridCells.map((c) => c.el);
        if (allElements.length) {
            gsap.set(allElements, { opacity: 0 });
        }
        if (avatar) {
            gsap.set(avatar, { opacity: 0, scale: 0.92 });
        }
        gsap.set(wipe, { visibility: 'hidden', pointerEvents: 'none' });
    };

    if (!pixelGridCells.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        hideWipe();
        return;
    }

    isPixelWaveRunning = true;
    gsap.set(wipe, { visibility: 'visible' });

    const reveal = () => {
        const avatarFadeOutDuration = avatar ? PIXEL_WAVE_CONFIG.avatarFadeOutDuration : 0;
        const tl = gsap.timeline({ onComplete: hideWipe });

        // Primero se oculta el avatar mientras la pantalla sigue 100% cubierta
        if (avatar) {
            tl.to(
                avatar,
                {
                    opacity: 0,
                    scale: 0.92,
                    duration: avatarFadeOutDuration,
                    ease: 'power2.in',
                },
                0
            );
        }

        // Y ya sin el avatar, baja la opacidad de los cuadros
        scheduleBottomToTopPixelWave(tl, {
            fromOpacity: 1,
            toOpacity: 0,
            startOffset: avatarFadeOutDuration + 0.02,
            seedOffset: 99,
        });
    };

    const initialContainer = document.querySelector('[data-barba="container"]');
    waitForIncomingPageReady(initialContainer, PIXEL_WAVE_CONFIG.holdExtraMs).then(reveal);

    // Salvaguarda: la pantalla jamás queda cubierta
    initialRevealFallbackTimer = setTimeout(hideWipe, 4500);
}

/**
 * Barba.js v2 lifecycle wiring with GSAP and Lenis.
 */
export function initBarba({ onAfterEnter } = {}) {
    if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    barba.hooks.before(() => {
        markNavigated();
    });

    barba.hooks.beforeLeave((data) => {
        closeShareModal();
        stopScroll();
        markNavigated();
        cleanupDynamicIsland(false);

        // Onda líquida: la página saliente debe permanecer intacta hasta quedar cubierta
        if (!isLiquidWipeNavigation(data)) {
            runOutgoingVisualCleanup();
        }
    });

    barba.hooks.beforeEnter((data) => {
        updateCsrfTokenFrom(data.next.html);
        if (!isBlogFilterTransition) {
            resetScroll();
            try {
                if (data.next?.url?.path) {
                    sessionStorage.removeItem('portfolio_scroll_' + data.next.url.path);
                }
            } catch (e) {}
        }
        syncPageMetadata(data.next.html);
        markNavigated();
        syncDesktopIslandState(true);
    });

    barba.hooks.after((data) => {
        // Prioridad máxima: desbloquear scroll y posicionar en el tope inmediatamente
        startScroll();
        if (!isBlogFilterTransition) {
            resetScroll();
        }
        isBlogFilterTransition = false;
        resizeScroll();
        ScrollTrigger.refresh();

        // Sincronización final de metadatos, canonical, Open Graph y JSON-LD
        syncPageMetadata(data.next.html);

        // La onda líquida ya inicializa las animaciones antes de descubrir la página
        if (animationsInitializedFor !== data.next.container) {
            initPageAnimations(data.next.container);
        }
        animationsInitializedFor = null;

        // Recálculo continuo de altura al cargar imágenes del contenedor entrante
        watchImagesForScrollResize(data.next.container);

        const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');
        if (mainFooter) {
            mainFooter.style.visibility = 'visible';
            gsap.to(mainFooter, {
                opacity: 1,
                duration: 0.35,
                ease: 'power2.out',
                clearProps: 'opacity,visibility',
            });
        }

        initFooterReveal();

        requestAnimationFrame(() => {
            ScrollTrigger.refresh();
        });

        // Rastreo de Analíticas: Disparo de page_view para Google Analytics (gtag), Tag Manager (dataLayer) y telemetría
        const currentPath = window.location.pathname;
        const currentUrl = window.location.href;
        const currentTitle = document.title;

        if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_view', {
                page_title: currentTitle,
                page_location: currentUrl,
                page_path: currentPath,
            });
        }

        if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({
                event: 'page_view',
                page_title: currentTitle,
                page_location: currentUrl,
                page_path: currentPath,
            });
        }

        sendAnalyticsPing(currentPath);

        if (typeof window.updateAdminBarContext === 'function') {
            window.updateAdminBarContext(data.next.container);
        }
        onAfterEnter?.();
    });

    // Hook de contingencia: bajo cualquier reseteo o excepción el scroll jamás queda bloqueado
    if (typeof barba.hooks.reset === 'function') {
        barba.hooks.reset(() => {
            closeNavDrawer(true);
            const wipe = document.getElementById('transition-wipe');
            if (wipe) {
                gsap.set(wipe, { visibility: 'hidden', pointerEvents: 'none' });
            }
            startScroll();
            resizeScroll();
            ScrollTrigger.refresh();
        });
    }

    if (typeof barba.hooks.error === 'function') {
        barba.hooks.error((data, error) => {
            console.error('[Barba] Error durante la transición de página:', error);
            closeNavDrawer(true);
            const wipe = document.getElementById('transition-wipe');
            if (wipe) {
                gsap.set(wipe, { visibility: 'hidden', pointerEvents: 'none' });
            }
            const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');
            if (mainFooter) {
                mainFooter.style.visibility = 'visible';
                gsap.set(mainFooter, { clearProps: 'opacity,visibility' });
            }
            startScroll();
            resizeScroll();
            ScrollTrigger.refresh();
        });
    }

    barba.init({
        preventRunning: true,
        requestError: (trigger, action, url, response) => {
            console.error('[Barba] Error en petición:', url, response);
            startScroll();
            resizeScroll();
            ScrollTrigger.refresh();
            return false;
        },
        prevent: ({ el, href }) => {
            if (!href) return false;
            try {
                const url = new URL(href, window.location.origin);
                if (url.origin !== window.location.origin) return true;
                return /^\/(admin|login|logout|api|storage)/.test(url.pathname);
            } catch (e) {
                return false;
            }
        },
        transitions: [
            // ── Transición persistente entre categorías del blog (cero parpadeo ni destrucción de píldoras) ──
            {
                name: 'blog-category-filter',
                custom(data) {
                    const match = isBlogFilterNavigation(data);
                    if (match) {
                        isBlogFilterTransition = true;
                    }
                    return match;
                },
                async leave(data) {
                    isBlogFilterTransition = true;
                    stopScroll();

                    // Feedback visual inmediato en la píldora clickeada para cero latencia percibida
                    if (data.trigger) {
                        const pillRail = data.trigger.closest('.blog-pill-rail');
                        if (pillRail) {
                            const clickedPill = data.trigger.closest('.btn-universal') || data.trigger;
                            pillRail.querySelectorAll('.btn-universal').forEach((btn) => {
                                btn.classList.remove('is-active', 'btn-solid');
                                btn.classList.add('btn-surface');
                            });
                            clickedPill.classList.add('is-active', 'btn-solid');
                            clickedPill.classList.remove('btn-surface');
                        }
                    }

                    const currentContainer = data.current.container;
                    const currentGrid = currentContainer.querySelector('#blog-posts-grid');
                    const currentEnd = currentContainer.querySelector('#blog-scroll-end');
                    const currentLoader = currentContainer.querySelector('#blog-scroll-loader');
                    const currentHeader = currentContainer.querySelector('#blog-header-block');

                    // Salida cinemática carácter por carácter del título actual
                    let titleExitTween = null;
                    if (currentHeader) {
                        const currentTitleEl = currentHeader.querySelector('h1');
                        if (currentTitleEl) {
                            // Si ya fue dividido en chars por la entrada, usarlos; si no, dividir ahora
                            const currentChars = currentTitleEl.dataset.textSplit === 'true'
                                ? Array.from(currentTitleEl.querySelectorAll('.split-char'))
                                : splitTextIntoChars(currentTitleEl);

                            if (currentChars && currentChars.length) {
                                // Quitar is-revealed y estilos inline con !important que bloquean a GSAP
                                currentChars.forEach((c) => {
                                    c.classList.remove('is-revealed');
                                    c.style.removeProperty('opacity');
                                    c.style.removeProperty('filter');
                                    c.style.removeProperty('-webkit-filter');
                                    c.style.removeProperty('transform');
                                    c.style.removeProperty('will-change');
                                });

                                // Transformación de letras: scramble de glifos + dispersión orgánica
                                const glyphs = '!<>-_\\/[]{}=+*^?#%&01';
                                const order = gsap.utils.shuffle(currentChars.map((_, i) => i));
                                const step = Math.min(0.3 / currentChars.length, 0.03);
                                const tl = gsap.timeline();

                                currentChars.forEach((c, i) => {
                                    // Congelar el ancho para que el cambio de glifo no provoque saltos de layout
                                    c.style.width = `${c.getBoundingClientRect().width}px`;
                                    c.style.textAlign = 'center';

                                    tl.to(c, {
                                        opacity: 0,
                                        x: gsap.utils.random(-14, 14),
                                        y: gsap.utils.random(-30, 30),
                                        rotation: gsap.utils.random(-35, 35),
                                        scale: gsap.utils.random(0.5, 1.4),
                                        filter: 'blur(10px)',
                                        webkitFilter: 'blur(10px)',
                                        duration: 0.45,
                                        ease: 'power3.in',
                                        onUpdate() {
                                            if (this.progress() < 0.85 && Math.random() < 0.6) {
                                                c.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
                                            }
                                        },
                                    }, order.indexOf(i) * step);
                                });

                                titleExitTween = tl;
                            }
                        }

                        // Desvanecemos el resto del header (breadcrumbs, etc.) sin tocar el h1 que ya anima
                        const headerChildren = Array.from(currentHeader.children).filter(
                            (el) => el.tagName !== 'H1',
                        );
                        if (headerChildren.length) {
                            gsap.to(headerChildren, { opacity: 0, duration: 0.16, ease: 'power2.in' });
                        }
                    }

                    // Desvanecemos utilidades de scroll
                    const utilsToFade = [currentEnd, currentLoader].filter(Boolean);
                    if (utilsToFade.length) {
                        gsap.to(utilsToFade, { opacity: 0, duration: 0.12, ease: 'power2.in' });
                    }

                    // Salida escalonada y elegante de las tarjetas (paralela a la del título)
                    const cardsToFade = currentGrid ? Array.from(currentGrid.children) : [];
                    const cardsExitTween = cardsToFade.length
                        ? gsap.to(cardsToFade, {
                            opacity: 0,
                            y: -10,
                            duration: 0.18,
                            stagger: 0.02,
                            ease: 'power2.in',
                        })
                        : null;

                    // Esperar a que terminen tanto las tarjetas como la transformación del título
                    return Promise.all([cardsExitTween, titleExitTween].filter(Boolean));
                },
                async enter(data) {
                    const nextContainer = data.next.container;
                    const nextGrid = nextContainer.querySelector('#blog-posts-grid');
                    const nextHeader = nextContainer.querySelector('#blog-header-block');

                    // Scroll contextual suave: si el usuario está muy abajo en el feed (>320px),
                    // reubicar suavemente hacia el rail de categorías; si ya está en la zona superior,
                    // preservar la estabilidad del viewport sin ningún salto brusco.
                    const lenis = getLenis();
                    const currentScroll = lenis ? lenis.scroll : window.scrollY;
                    const pillNav = nextContainer.querySelector('#blog-pills-nav');
                    if (currentScroll > 320 && pillNav) {
                        const targetOffset = pillNav.getBoundingClientRect().top + currentScroll - 90;
                        if (lenis) {
                            lenis.scrollTo(targetOffset, { duration: 0.45, immediate: false });
                        } else {
                            window.scrollTo({ top: targetOffset, behavior: 'smooth' });
                        }
                    }

                    if (nextHeader) {
                        gsap.fromTo(nextHeader,
                            { opacity: 0 },
                            { opacity: 1, duration: 0.22, ease: 'power2.out', clearProps: 'opacity,visibility' }
                        );

                        // Animación cinemática del título de categoría/etiqueta (Character Blur Reveal)
                        const titleEl = nextHeader.querySelector('h1');
                        if (titleEl) {
                            const chars = splitTextIntoChars(titleEl);
                            if (chars && chars.length) {
                                animateBlurChars(chars, { duration: 0.65, delay: 0.05 });
                            }
                        }
                    }

                    if (nextGrid) {
                        const newCards = Array.from(nextGrid.children);
                        if (newCards.length > 0) {
                            return gsap.fromTo(newCards,
                                { opacity: 0, y: 30, filter: 'blur(8px)', webkitFilter: 'blur(8px)' },
                                {
                                    opacity: 1,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    webkitFilter: 'blur(0px)',
                                    duration: 0.45,
                                    stagger: 0.04,
                                    ease: 'power2.out',
                                    clearProps: 'transform,filter,webkitFilter',
                                }
                            );
                        } else {
                            return gsap.fromTo(nextGrid,
                                { opacity: 0, y: 10 },
                                { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', clearProps: 'all' }
                            );
                        }
                    }
                },
            },
            // Shared-element (Flip) transitions between list <-> detail pages;
            // Barba picks these over the generic wipe below when the from/to
            // namespace pair matches (see flip-transitions.js).
            ...flipTransitionDefinitions,
            {
                name: 'editorial-kinetic-wipe',
                async leave(data) {
                    const wipe = document.getElementById('transition-wipe');
                    const avatar = wipe ? wipe.querySelector('[data-pixel-avatar]') : null;
                    const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');
                    stopScroll();

                    if (wipe) {
                        if (initialRevealFallbackTimer) {
                            clearTimeout(initialRevealFallbackTimer);
                            initialRevealFallbackTimer = null;
                        }

                        const isLandscapeNow = (window.innerWidth || 1440) > (window.innerHeight || 900);
                        const isGridLandscape = pixelCols > pixelRows;
                        if (!pixelGridCells.length || isLandscapeNow !== isGridLandscape) {
                            buildFluidPixelGrid(0);
                        }

                        isPixelWaveRunning = true;
                        const allElements = pixelGridCells.map((c) => c.el);
                        gsap.killTweensOf(allElements);
                        if (avatar) {
                            gsap.killTweensOf(avatar);
                            gsap.set(avatar, { opacity: 0, scale: 0.88 });
                        }
                        wipe.style.backgroundColor = 'transparent';
                        gsap.set(allElements, { opacity: 0 });
                        gsap.set(wipe, { visibility: 'visible', pointerEvents: 'auto' });

                        // TIEMPO 1A: ENTRADA DE LA OLA (SUBE LA OPACIDAD CON AVATAR OCULTO)
                        const fromDrawer = isNavDrawerClosing() || Boolean(data?.trigger?.closest?.('[data-drawer-link]'));
                        await new Promise((resolve) => {
                            const tl = gsap.timeline({ onComplete: resolve });
                            scheduleBottomToTopPixelWave(tl, {
                                fromOpacity: 0,
                                toOpacity: 1,
                                startOffset: fromDrawer ? 0.22 : 0.02,
                                seedOffset: 0,
                            });
                        });

                        gsap.set(allElements, { opacity: 1 });
                        // Pantalla 100% cubierta: se desmonta la vista saliente y recién ahora aparece el avatar
                        runOutgoingVisualCleanup();

                        if (avatar) {
                            await gsap.to(avatar, {
                                opacity: 1,
                                scale: 1,
                                duration: PIXEL_WAVE_CONFIG.avatarFadeInDuration,
                                ease: 'power2.out',
                            });
                        }
                        return;
                    }

                    return gsap.to([data.current.container, mainFooter].filter(Boolean), {
                        opacity: 0,
                        y: -15,
                        duration: 0.45,
                        ease: 'power2.inOut',
                    });
                },
                async enter(data) {
                    const wipe = document.getElementById('transition-wipe');
                    const avatar = wipe ? wipe.querySelector('[data-pixel-avatar]') : null;
                    const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');

                    try {
                        if (wipe && pixelGridCells.length) {
                            const outgoing = data.current.container;
                            outgoing.replaceChildren();
                            outgoing.style.display = 'none';

                            resetScroll();
                            gsap.set(data.next.container, { opacity: 1, visibility: 'visible', clearProps: 'transform' });
                            if (mainFooter) {
                                gsap.set(mainFooter, { opacity: 1, visibility: 'visible' });
                            }
                            resizeScroll();

                            // RETENCIÓN EN COBERTURA TOTAL: mantener cuadros en opacidad 1 y avatar visible
                            // hasta que la nueva página esté 100% cargada + holdExtraMs
                            await waitForIncomingPageReady(data.next.container, PIXEL_WAVE_CONFIG.holdExtraMs);

                            // Primero desaparece por completo el avatar mientras la pantalla sigue 100% cubierta
                            if (avatar) {
                                await gsap.to(avatar, {
                                    opacity: 0,
                                    scale: 0.92,
                                    duration: PIXEL_WAVE_CONFIG.avatarFadeOutDuration,
                                    ease: 'power2.in',
                                });
                            }

                            // Ya sin el avatar, inician las animaciones de la nueva página y el destape de los cuadros
                            initPageAnimations(data.next.container);
                            animationsInitializedFor = data.next.container;
                            resizeScroll();
                            ScrollTrigger.refresh();

                            const allElements = pixelGridCells.map((c) => c.el);

                            // TIEMPO 2: SALIDA DE LA OLA (BAJA LA OPACIDAD)
                            await new Promise((resolve) => {
                                const tl = gsap.timeline({
                                    onComplete: () => {
                                        isPixelWaveRunning = false;
                                        gsap.set(wipe, { visibility: 'hidden', pointerEvents: 'none' });
                                        gsap.set(allElements, { opacity: 0 });
                                        if (avatar) {
                                            gsap.set(avatar, { opacity: 0, scale: 0.92 });
                                        }
                                        resolve();
                                    },
                                });

                                scheduleBottomToTopPixelWave(tl, {
                                    fromOpacity: 1,
                                    toOpacity: 0,
                                    startOffset: 0.02,
                                    seedOffset: 99,
                                });
                            });
                            return;
                        }

                        resetScroll();
                        await gsap.from(data.next.container, {
                            opacity: 0,
                            y: 20,
                            duration: 0.55,
                            ease: 'power3.out',
                            clearProps: 'transform',
                        });
                    } finally {
                        gsap.set(data.next.container, { opacity: 1, visibility: 'visible', clearProps: 'transform' });
                    }
                },
            },
        ],
    });
}
