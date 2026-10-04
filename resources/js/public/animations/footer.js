import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';

let footerTween = null;

/**
 * Initializes continuous scroll-driven footer reveal (Framer / AI Creator style).
 * Interpolates footerWrapper smoothly from translateY(-250px) to 0px via ScrollTrigger scrub.
 */
export function initFooterReveal() {
    const footerWrapper = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper');
    if (!footerWrapper) return;

    // Clean up any existing trigger or tween before registering
    cleanupFooterReveal();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(footerWrapper, { y: 0, clearProps: 'transform' });
        return;
    }

    footerTween = gsap.fromTo(
        footerWrapper,
        { y: -100 },
        {
            y: 0,
            ease: 'none',
            scrollTrigger: {
                id: 'footer-scroll-trigger',
                trigger: footerWrapper,
                start: 'top bottom', // Starts when top of footer enters bottom of viewport
                end: 'bottom bottom',   // Completes when user reaches bottom of document
                scrub: 1.2,            // Organic inertia tied to Lenis smooth scroll
                invalidateOnRefresh: true,
            },
        }
    );
}

/**
 * Cleans up footer ScrollTrigger and resets inline transforms.
 */
export function cleanupFooterReveal() {
    const trigger = ScrollTrigger.getById('footer-scroll-trigger');
    if (trigger) {
        trigger.kill();
    }

    if (footerTween) {
        footerTween.kill();
        footerTween = null;
    }

    const footerWrapper = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper');
    if (footerWrapper) {
        gsap.set(footerWrapper, { clearProps: 'transform' });
    }
}

