import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';
import { initHeroCurtain } from './hero-curtain';
import { initVelixReveals } from './velix-reveal';

/**
 * Runs on every Barba `enter` step. Scoped to the incoming container so
 * selectors never touch persistent elements (nav/cursor/wipe) living
 * outside [data-barba="container"].
 */
export function initPageAnimations(container) {
    initHeroCurtain(container);
    initVelixReveals(container);

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
    initLiveClock();
}

let clockInterval = null;

function initLiveClock() {
    const clockElements = document.querySelectorAll('[data-live-clock]');
    if (!clockElements.length) return;

    const updateClocks = () => {
        try {
            const now = new Date();
            const timeString = new Intl.DateTimeFormat('es-MX', {
                timeZone: 'America/Mexico_City',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).format(now);

            clockElements.forEach((el) => {
                el.textContent = `${timeString} CST · CDMX`;
            });
        } catch (e) {
            // Fallback
            const now = new Date();
            const timeString = now.toTimeString().split(' ')[0];
            clockElements.forEach((el) => {
                el.textContent = `${timeString} CST · CDMX`;
            });
        }
    };

    updateClocks();

    if (!clockInterval) {
        clockInterval = setInterval(updateClocks, 1000);
    }
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
