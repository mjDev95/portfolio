import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger, resetScroll, stopScroll, startScroll, resizeScroll } from './smooth-scroll';
import { updateCsrfTokenFrom } from './csrf';
import { initPageAnimations } from '../animations/init-page';
import { createFlipTransitions } from './flip-transitions';
import { sendAnalyticsPing } from './tracker';
import { cleanupDynamicIsland, syncDesktopIslandState, markNavigated } from '../animations/dynamic-island';
import { closeShareModal } from './share-modal';

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
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    });

    barba.hooks.beforeEnter((data) => {
        updateCsrfTokenFrom(data.next.html);
        resetScroll();
        syncPageMetadata(data.next.html);
        markNavigated();
        syncDesktopIslandState(true);
    });

    barba.hooks.after((data) => {
        // Prioridad máxima: desbloquear scroll y posicionar en el tope inmediatamente
        startScroll();
        resetScroll();
        resizeScroll();
        ScrollTrigger.refresh();

        // Sincronización final de metadatos, canonical, Open Graph y JSON-LD
        syncPageMetadata(data.next.html);

        initPageAnimations(data.next.container);

        // Recálculo continuo de altura al cargar imágenes del contenedor entrante
        watchImagesForScrollResize(data.next.container);

        ScrollTrigger.refresh();

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
            const colophon = document.querySelector('.editorial-colophon');
            if (colophon) gsap.set(colophon, { clearProps: 'opacity' });
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

                    return Boolean(isPill || (isFromBlog && isToBlog));
                },
                async leave(data) {
                    stopScroll();
                    const currentContainer = data.current.container;
                    const currentGrid = currentContainer.querySelector('#blog-posts-grid');
                    const currentEnd = currentContainer.querySelector('#blog-scroll-end');
                    const currentLoader = currentContainer.querySelector('#blog-scroll-loader');
                    const currentHeader = currentContainer.querySelector('#blog-header-block');

                    // Desvanecemos suavemente el header y utilidades
                    const othersToFade = [currentEnd, currentLoader, currentHeader].filter(Boolean);
                    if (othersToFade.length) {
                        gsap.to(othersToFade, {
                            opacity: 0,
                            duration: 0.16,
                            ease: 'power2.in',
                        });
                    }

                    // Salida escalonada y elegante de las tarjetas
                    const cardsToFade = currentGrid ? Array.from(currentGrid.children) : [];
                    if (cardsToFade.length) {
                        return gsap.to(cardsToFade, {
                            opacity: 0,
                            y: -12,
                            duration: 0.2,
                            stagger: 0.02,
                            ease: 'power2.in',
                        });
                    }
                },
                async enter(data) {
                    resetScroll();
                    const nextContainer = data.next.container;
                    const nextGrid = nextContainer.querySelector('#blog-posts-grid');
                    const nextHeader = nextContainer.querySelector('#blog-header-block');

                    if (nextHeader) {
                        gsap.fromTo(nextHeader,
                            { opacity: 0 },
                            { opacity: 1, duration: 0.25, ease: 'power2.out', clearProps: 'all' }
                        );
                    }

                    if (nextGrid) {
                        const newCards = Array.from(nextGrid.children);
                        if (newCards.length > 0) {
                            return gsap.fromTo(newCards,
                                { opacity: 0, y: 45, filter: 'blur(12px)', webkitFilter: 'blur(12px)' },
                                {
                                    opacity: 1,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    webkitFilter: 'blur(0px)',
                                    duration: 0.85,
                                    stagger: 0.18,
                                    ease: 'power3.out',
                                    clearProps: 'transform,filter,webkitFilter',
                                }
                            );
                        } else {
                            return gsap.fromTo(nextGrid,
                                { opacity: 0, y: 10 },
                                { opacity: 1, y: 0, duration: 0.28, ease: 'power3.out', clearProps: 'all' }
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
                    return gsap.to(data.current.container, {
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
