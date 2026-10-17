import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';

let heroEditorialCtx = null;

/**
 * Reverts and cleans up GSAP context for hero editorial animations.
 */
export function cleanupHeroEditorial() {
    if (heroEditorialCtx) {
        heroEditorialCtx.revert();
        heroEditorialCtx = null;
    }
}

let activeCounters = [];

export function triggerHeroEditorialCounters() {
    activeCounters.forEach((run) => run());
}

/**
 * Initializes interactive animations for the Hero Editorial section:
 * - Incremental numerical count-up on statistics cards ([data-stat-counter]).
 * - Smooth ease-out interpolation from 0 to target value with optional suffix/prefix.
 * - Respects prefers-reduced-motion and cleans up via gsap.context().
 *
 * @param {HTMLElement} container - Current Barba container or document
 */
export function initHeroEditorial(container = document) {
    cleanupHeroEditorial();
    activeCounters = [];

    const section = container.querySelector('#hero-editorial-2') || container.querySelector('.hero-editorial-section');
    if (!section) return;

    const counters = Array.from(section.querySelectorAll('[data-stat-counter]'));
    if (!counters.length) return;

    heroEditorialCtx = gsap.context(() => {
        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        counters.forEach((el) => {
            const targetVal = parseFloat(el.dataset.statTarget ?? el.textContent);
            const suffix = el.dataset.statSuffix ?? '';
            const prefix = el.dataset.statPrefix ?? '';
            const decimals = parseInt(el.dataset.statDecimals ?? '0', 10);

            const formatValue = (num) => {
                const formattedNum = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
                return `${prefix}${formattedNum}${suffix}`;
            };

            if (isReduced) {
                el.textContent = formatValue(targetVal);
                return;
            }

            // Inicia la visualización en 0
            el.textContent = formatValue(0);

            const state = { value: 0 };
            let hasRun = false;

            const runCounter = () => {
                if (hasRun) return;
                hasRun = true;
                gsap.to(state, {
                    value: targetVal,
                    duration: 1.8,
                    ease: 'power2.out',
                    onUpdate: () => {
                        el.textContent = formatValue(state.value);
                    },
                    onComplete: () => {
                        el.textContent = formatValue(targetVal);
                    },
                });
            };

            activeCounters.push(runCounter);

            // También dejamos el ScrollTrigger si está en flujo normal
            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: runCounter,
            });
        });
    }, section);
}

