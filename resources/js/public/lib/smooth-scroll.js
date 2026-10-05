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

    lenis.on('scroll', ({ scroll }) => {
        ScrollTrigger.update();
        try {
            sessionStorage.setItem('portfolio_scroll_' + window.location.pathname, Math.round(scroll));
        } catch (e) {}
    });

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Restauración limpia de scroll en refresco de página sin flash de la cabecera
    try {
        const savedScroll = parseInt(sessionStorage.getItem('portfolio_scroll_' + window.location.pathname), 10);
        if (savedScroll > 150) {
            lenis.scrollTo(savedScroll, { immediate: true, force: true });
            lenis.scroll = savedScroll;
            lenis.targetScroll = savedScroll;
            lenis.animatedScroll = savedScroll;
            ScrollTrigger.update();
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('is-restoring-scroll');
                ScrollTrigger.refresh();
            });
        } else {
            document.documentElement.classList.remove('is-restoring-scroll');
        }
    } catch (e) {
        document.documentElement.classList.remove('is-restoring-scroll');
    }

    // Timeout defensivo para garantizar visibilidad incondicional
    setTimeout(() => {
        document.documentElement.classList.remove('is-restoring-scroll');
    }, 400);

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

