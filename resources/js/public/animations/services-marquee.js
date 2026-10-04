import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';

let servicesMarqueeCtx = null;
let tickerFn = null;

/**
 * Reverts and clears GSAP context and ticker listeners for the services marquee ribbon.
 */
export function cleanupServicesMarquee() {
    if (tickerFn) {
        gsap.ticker.remove(tickerFn);
        tickerFn = null;
    }

    if (servicesMarqueeCtx) {
        servicesMarqueeCtx.revert();
        servicesMarqueeCtx = null;
    }
}

/**
 * Initializes the infinite horizontal services marquee ribbon:
 * - Scoped to the incoming Barba container.
 * - Continuous infinite marquee translation using gsap.utils.wrap(-50, 0).
 * - Reacts dynamically to scroll direction with damped interpolation (lerp).
 * - Scrolling down drives the ribbon to the left (-1).
 * - Scrolling up gently reverses the ribbon to the right (+1).
 * - Full reduced-motion safeguard and zero CPU leaks on Barba page transitions.
 *
 * @param {HTMLElement} container - Current Barba container or document
 */
export function initServicesMarquee(container = document) {
    cleanupServicesMarquee();

    const section = container.querySelector('[data-services-ribbon]');
    if (!section) return;

    const marquee = section.querySelector('[data-services-marquee]');
    if (!marquee) return;

    servicesMarqueeCtx = gsap.context(() => {
        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let currentX = 0;
        const speed = isReduced ? 0.005 : 0.015;
        let targetDirection = -1; // -1 = izquierda, 1 = derecha
        let currentDirection = -1;

        const wrapPercent = gsap.utils.wrap(-50, 0);

        tickerFn = (time, deltaTime) => {
            // Amortiguación orgánica de cambio de sentido al scrollear
            currentDirection += (targetDirection - currentDirection) * 0.025;

            // Factor de tiempo normalizado a 60fps
            const deltaFactor = deltaTime ? deltaTime / 16.666 : 1;
            currentX += speed * currentDirection * deltaFactor;

            const wrappedX = wrapPercent(currentX);
            gsap.set(marquee, { xPercent: wrappedX });
        };

        gsap.ticker.add(tickerFn);

        // Detectar la dirección global de scroll
        ScrollTrigger.create({
            id: 'services-marquee-direction',
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                targetDirection = self.direction === 1 ? -1 : 1;
            },
        });
    }, section);
}
