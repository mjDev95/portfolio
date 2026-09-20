import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';

/**
 * Runs on every Barba `enter` step. Scoped to the incoming container so
 * selectors never touch persistent elements (nav/cursor/wipe) living
 * outside [data-barba="container"].
 */
export function initPageAnimations(container) {
    const reveals = container.querySelectorAll('[data-reveal]');

    reveals.forEach((el) => {
        gsap.fromTo(
            el,
            { autoAlpha: 0, y: 24 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                },
            },
        );
    });

    initVideoFacades(container);
}

/**
 * Click-to-load video facade: keeps the initial page weight low by only
 * injecting the real <iframe> embed after explicit user interaction.
 */
function initVideoFacades(container) {
    container.querySelectorAll('[data-video-facade]').forEach((facade) => {
        facade.addEventListener('click', () => {
            const src = facade.dataset.videoFacade;

            if (!src) {
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
            iframe.className = 'w-100 h-100 position-absolute inset-0';
            iframe.style.border = '0';

            facade.replaceChildren(iframe);
        }, { once: true });
    });
}
