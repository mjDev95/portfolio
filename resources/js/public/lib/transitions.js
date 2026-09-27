import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger, resetScroll, stopScroll, startScroll, resizeScroll } from './smooth-scroll';
import { updateCsrfTokenFrom } from './csrf';
import { initPageAnimations } from '../animations/init-page';
import { createFlipTransitions } from './flip-transitions';
import { sendAnalyticsPing } from './tracker';
import { cleanupDynamicIsland, syncDesktopIslandState } from '../animations/dynamic-island';

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

        // 3. Open Graph tags
        const ogTags = ['og:title', 'og:description', 'og:url', 'og:type'];
        ogTags.forEach((property) => {
            const newMeta = doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content');
            let currentMeta = document.querySelector(`meta[property="${property}"]`);
            if (newMeta !== undefined && newMeta !== null) {
                if (!currentMeta) {
                    currentMeta = document.createElement('meta');
                    currentMeta.setAttribute('property', property);
                    document.head.appendChild(currentMeta);
                }
                currentMeta.setAttribute('content', newMeta);
            }
        });
    } catch (e) {
        console.warn('[Barba] Error sincronizando metadatos:', e);
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

    barba.hooks.beforeLeave(() => {
        stopScroll();
        if (typeof window !== 'undefined') {
            window.__hasNavigatedInternal = true;
            window.__portfolioPillWasCompacted = true;
        }
        syncDesktopIslandState(true);
        cleanupDynamicIsland(true);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    });

    barba.hooks.beforeEnter((data) => {
        updateCsrfTokenFrom(data.next.html);
        resetScroll();
        syncPageMetadata(data.next.html);
        if (typeof window !== 'undefined' && window.__hasNavigatedInternal) {
            syncDesktopIslandState(true);
        }
    });

    barba.hooks.after((data) => {
        // Prioridad máxima: desbloquear scroll y posicionar en el tope inmediatamente
        startScroll();
        resetScroll();
        resizeScroll();
        ScrollTrigger.refresh();

        initPageAnimations(data.next.container);

        // Recálculo continuo de altura al cargar imágenes del contenedor entrante
        watchImagesForScrollResize(data.next.container);

        ScrollTrigger.refresh();
        sendAnalyticsPing(window.location.pathname);
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
