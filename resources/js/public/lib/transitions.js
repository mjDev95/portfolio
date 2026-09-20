import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger, resetScroll } from './smooth-scroll';
import { updateCsrfTokenFrom } from './csrf';
import { initPageAnimations } from '../animations/init-page';
import { createFlipTransitions } from './flip-transitions';
import { sendAnalyticsPing } from './tracker';

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
 * Barba.js v2 lifecycle wiring.
 *
 * Order per navigation:
 *  1. beforeLeave  -> kill every ScrollTrigger bound to the outgoing DOM
 *                     (prevents duplicated/zombie triggers = memory leak).
 *  2. leave        -> curtain wipe slides up to fully cover the viewport.
 *  3. (barba swaps [data-barba="container"] under the hood)
 *  4. beforeEnter  -> sync CSRF meta + <title> + SEO/OG tags, reset Lenis scroll to 0.
 *  5. enter        -> curtain wipe slides off-screen, revealing new page.
 *  6. after        -> re-run reveal animations scoped to new container,
 *                     ScrollTrigger.refresh() to recompute trigger positions,
 *                     re-bind the magnetic cursor to the new DOM nodes.
 */
export function initBarba({ onAfterEnter } = {}) {
    barba.hooks.beforeLeave(() => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    });

    barba.hooks.beforeEnter((data) => {
        updateCsrfTokenFrom(data.next.html);
        resetScroll();
        syncPageMetadata(data.next.html);
    });

    barba.hooks.after((data) => {
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
                name: 'wipe-transition',
                leave() {
                    return new Promise((resolve) => {
                        gsap.to('#transition-wipe', {
                            yPercent: 0,
                            duration: 0.6,
                            ease: 'power2.inOut',
                            onComplete: resolve,
                        });
                    });
                },
                enter() {
                    return new Promise((resolve) => {
                        gsap.to('#transition-wipe', {
                            yPercent: -101,
                            duration: 0.6,
                            ease: 'power2.inOut',
                            onComplete: () => {
                                gsap.set('#transition-wipe', { yPercent: 101 });
                                resolve();
                            },
                        });
                    });
                },
            },
        ],
    });
}
