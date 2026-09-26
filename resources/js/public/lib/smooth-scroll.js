import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis;

/**
 * Creates a single Lenis instance for the lifetime of the document and
 * wires it to GSAP's ticker so ScrollTrigger stays in sync with the
 * virtual smooth-scroll position instead of the native scroll event.
 *
 * Must only be called once (in main.js), NOT re-created on every Barba
 * transition — Barba only swaps [data-barba="container"], the <html>/
 * <body> scroll context Lenis controls never gets destroyed.
 */
export function initSmoothScroll() {
    if (lenis) {
        return lenis;
    }

    lenis = new Lenis({
        autoRaf: false,
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return lenis;
}

export function getLenis() {
    return lenis;
}

export function stopScroll() {
    lenis?.stop();
}

export function startScroll() {
    lenis?.start();
}

export function resizeScroll() {
    lenis?.resize();
}

/**
 * Called on Barba beforeEnter & after — snaps scroll back to the top of
 * the new page instantly (no animation) even when Lenis is paused, and
 * zeros internal offsets so ScrollTrigger recalculates from scroll = 0.
 */
export function resetScroll() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true });
        lenis.scroll = 0;
        lenis.targetScroll = 0;
        lenis.animatedScroll = 0;
        lenis.velocity = 0;
        lenis.resize();
    }

    ScrollTrigger.update();
}

export { ScrollTrigger };

