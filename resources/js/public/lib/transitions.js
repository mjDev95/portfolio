import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger, resetScroll, stopScroll, startScroll, resizeScroll, getLenis } from './smooth-scroll';
import { updateCsrfTokenFrom } from './csrf';
import { initPageAnimations } from '../animations/init-page';
import { createFlipTransitions } from './flip-transitions';
import { sendAnalyticsPing } from './tracker';
import { cleanupDynamicIsland, syncDesktopIslandState, markNavigated } from '../animations/dynamic-island';
import { closeShareModal } from './share-modal';
import { cleanupFooterReveal, initFooterReveal } from '../animations/footer';
import { cleanupMethodology } from '../animations/methodology';
import { cleanupHomeBlog } from '../animations/home-blog';
import { splitTextIntoFramerChars, animateVelixChars } from '../animations/velix-reveal';

let isBlogFilterTransition = false;

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

    barba.hooks.beforeLeave(() => {
        closeShareModal();
        stopScroll();
        markNavigated();
        cleanupDynamicIsland(true);
        cleanupFooterReveal();
        cleanupMethodology();
        cleanupHomeBlog();
        const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');
        if (mainFooter) {
            gsap.set(mainFooter, { opacity: 0 });
        }
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
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

        initPageAnimations(data.next.container);

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
            startScroll();
            resizeScroll();
            ScrollTrigger.refresh();
        });
    }

    if (typeof barba.hooks.error === 'function') {
        barba.hooks.error((data, error) => {
            console.error('[Barba] Error durante la transición de página:', error);
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
                custom({ current, next, trigger }) {
                    const isPill = Boolean(
                        trigger?.closest?.('.blog-pill-rail') ||
                        trigger?.closest?.('.editorial-pill') || 
                        trigger?.classList?.contains?.('editorial-pill')
                    );
                    const isFromBlog = ['blog-index', 'blog-category', 'blog-tag'].includes(current.namespace) ||
                                       Boolean(current.url?.path && /^\/blog(\/(categoria|etiqueta|tag)\/[^/]+)?\/?$/.test(current.url.path));
                    const isToBlog = Boolean(next.url?.path && /^\/blog(\/(categoria|etiqueta|tag)\/[^/]+)?\/?$/.test(next.url.path));

                    const match = Boolean(isPill || (isFromBlog && isToBlog));
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
                            const currentChars = currentTitleEl.dataset.velixSplit === 'true'
                                ? Array.from(currentTitleEl.querySelectorAll('.split-char, .framer-char'))
                                : splitTextIntoFramerChars(currentTitleEl);

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

                        // Animación cinemática del título de categoría/etiqueta (Velix Character Blur Reveal)
                        const titleEl = nextHeader.querySelector('h1');
                        if (titleEl) {
                            const chars = splitTextIntoFramerChars(titleEl);
                            if (chars && chars.length) {
                                animateVelixChars(chars, { duration: 0.65, delay: 0.05 });
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
            ...createFlipTransitions(),
            {
                name: 'smooth-editorial-transition',
                async leave(data) {
                    const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');
                    return gsap.to([data.current.container, mainFooter].filter(Boolean), {
                        opacity: 0,
                        y: -15,
                        duration: 0.45,
                        ease: 'power2.inOut',
                    });
                },
                async enter(data) {
                    resetScroll();
                    return gsap.from(data.next.container, {
                        opacity: 0,
                        y: 20,
                        duration: 0.55,
                        ease: 'power3.out',
                        clearProps: 'all',
                    });
                },
            },
        ],
    });
}
