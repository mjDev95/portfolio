import gsap from 'gsap';
import { ScrollTrigger } from '../../lib/smooth-scroll';

let cardRevealCtx = null;

/**
 * Universal Staggered Upward Reveal with Blur for Cards and Grid Items.
 * Activated declaratively via `[data-card-reveal]`.
 * Compatible with Barba.js v2, Lenis Smooth Scroll, and GSAP Context.
 *
 * @param {HTMLElement} container - Scoped Barba container or root element
 */
export function initCardReveals(container = document) {
    cleanupCardReveals();

    const cardElements = Array.from(container.querySelectorAll('[data-card-reveal]'));
    if (!cardElements.length) return;

    cardRevealCtx = gsap.context(() => {
        cardElements.forEach((card) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                card.classList.add('is-revealed');
                gsap.set(card, { opacity: 1, y: 0, filter: 'none', webkitFilter: 'none' });
                return;
            }

            // Estado inicial cinemático: desplazado hacia abajo con desenfoque
            gsap.set(card, {
                opacity: 0,
                y: 40,
                filter: 'blur(10px)',
                webkitFilter: 'blur(10px)',
            });

            // Desbloquear visualmente una vez que GSAP fijó las coordenadas
            card.classList.add('is-revealed');

            ScrollTrigger.create({
                trigger: card,
                start: 'top 92%',
                once: true,
                onEnter: () => {
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        filter: 'blur(0px)',
                        webkitFilter: 'blur(0px)',
                        duration: 0.85,
                        ease: 'power3.out',
                        clearProps: 'transform,filter,webkitFilter',
                    });
                },
            });
        });
    }, container);
}

/**
 * Cleanup and revert all card reveal triggers and tweens cleanly.
 */
export function cleanupCardReveals() {
    if (cardRevealCtx) {
        cardRevealCtx.revert();
        cardRevealCtx = null;
    }
}

