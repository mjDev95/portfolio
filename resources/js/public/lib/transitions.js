import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger, resetScroll, stopScroll, startScroll, resizeScroll } from './smooth-scroll';
import { updateCsrfTokenFrom } from './csrf';
import { initPageAnimations } from '../animations/init-page';
import { createFlipTransitions } from './flip-transitions';
import { sendAnalyticsPing } from './tracker';
import { cleanupDynamicIsland } from '../animations/dynamic-island';

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
 * Barba.js v2 lifecycle wiring with GSAP and Lenis.
 *
 * Order per navigation:
 *  1. beforeLeave  -> stop Lenis scroll, kill every ScrollTrigger bound to outgoing DOM.
 *  2. leave        -> animate outgoing page transition.
 *  3. (barba swaps [data-barba="container"] under the hood)
 *  4. beforeEnter  -> sync CSRF meta + <title> + SEO/OG tags, snap scroll to top (0, immediate).
 *  5. enter        -> animate incoming page transition.
 *  6. after        -> initialize animations scoped to data.next.container,
 *                     resume Lenis (start), recalculate scroll limits (resize),
 *                     recompute trigger positions (ScrollTrigger.refresh()),
 *                     re-bind interactive listeners and send analytics.
 */
export function initBarba({ onAfterEnter } = {}) {
    barba.hooks.beforeLeave(() => {
        stopScroll();
        cleanupDynamicIsland();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    });

    barba.hooks.beforeEnter((data) => {
        updateCsrfTokenFrom(data.next.html);
        resetScroll();
        syncPageMetadata(data.next.html);
    });

    barba.hooks.after((data) => {
        resetScroll();
        startScroll();
        resizeScroll();
        initPageAnimations(data.next.container);
        ScrollTrigger.refresh();
        sendAnalyticsPing(window.location.pathname);
        if (typeof window.updateAdminBarContext === 'function') {
            window.updateAdminBarContext(data.next.container);
        }
        onAfterEnter?.();
    });

    barba.init({
        preventRunning: true,
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
