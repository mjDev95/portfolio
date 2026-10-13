import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';
import { splitTextIntoChars, finalizeBlurChars, prepareBlurChars } from './shared/text-reveal';

let selectedCasesCtx = null;

export function cleanupSelectedCases() {
    if (selectedCasesCtx) {
        selectedCasesCtx.revert();
        selectedCasesCtx = null;
    }
}

/**
 * Initializes the Pinned Header & Unified Floating Cards sequence for Selected Cases
 * on the homepage:
 * - Header is vertically centered (100vh) and pins as the top of the section reaches top: 0.
 * - Title animates with character-by-character blur reveal.
 * - Single continuous cards container rises over the pinned header.
 * - Header text smoothly fades out as the cards container rises.
 * - Header unpins cleanly once covered by the cards container, freeing GPU resources.
 * - All cards are in a single unified grid, animating into view with calibrated motion.
 *
 * @param {HTMLElement} container - Incoming Barba container (or document)
 */
export function initSelectedCases(container) {
    cleanupSelectedCases();

    const section = container.querySelector('[data-selected-cases]');
    if (!section) return;

    selectedCasesCtx = gsap.context(() => {
        const pinnedHeader = section.querySelector('.showcase-pinned-hero');
        const headerContent = section.querySelector('.showcase-header-content');
        const cardsContainer = section.querySelector('.showcase-cards-container');
        const cards = Array.from(section.querySelectorAll('.project-card-wrap'));

        if (!pinnedHeader || !cardsContainer || !headerContent) return;

        const titleEl = headerContent.querySelector('.showcase-title');
        const subtitleEl = headerContent.querySelector('.showcase-subtitle');

        // Split text into individual characters for blur reveal
        const titleChars = titleEl ? splitTextIntoChars(titleEl) : [];

        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isReduced) {
            finalizeBlurChars(titleChars, titleEl);
            if (subtitleEl) gsap.set(subtitleEl, { opacity: 1, filter: 'none', y: 0 });
            gsap.set(cards, { opacity: 1, filter: 'none', y: 0 });
            return;
        }

        // 1. Configuración de entrada de texto
        if (titleChars.length) {
            prepareBlurChars(titleChars, { y: 16 });
        }

        if (subtitleEl) {
            gsap.set(subtitleEl, {
                opacity: 0,
                y: 24,
                filter: 'blur(8px)',
            });
        }

        const entranceTl = gsap.timeline({ paused: true });

        if (titleChars.length) {
            entranceTl.to(titleChars, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                webkitFilter: 'blur(0px)',
                duration: 0.75,
                ease: 'power2.out',
                stagger: { each: 0.035, from: 'start' },
                onComplete: () => finalizeBlurChars(titleChars, titleEl),
            }, 0);
        }

        if (subtitleEl) {
            entranceTl.to(subtitleEl, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                ease: 'power2.out',
            }, titleChars.length ? 0.25 : 0);
        }

        ScrollTrigger.create({
            trigger: section,
            start: 'top 85%',
            onEnter: () => entranceTl.play(),
            onLeaveBack: () => {
                titleChars.forEach((c) => c.classList.remove('is-revealed'));
                entranceTl.reverse();
            },
            onEnterBack: () => entranceTl.play(),
        });

        // 2. Anclaje (Pin) del encabezado: se ancla al tocar el top y se desancla
        // cuando el contenedor de tarjetas (con fondo sólido) cubre la pantalla.
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            endTrigger: cardsContainer,
            end: 'top top',
            pin: pinnedHeader,
            pinSpacing: false,
        });

        // 3. Desvanecimiento suave del texto mientras sube el contenedor de tarjetas
        gsap.to(headerContent, {
            opacity: 0,
            y: -30,
            filter: 'blur(8px)',
            ease: 'power1.out',
            immediateRender: false,
            scrollTrigger: {
                trigger: cardsContainer,
                start: 'top 52%',
                end: 'top 12%',
                scrub: 0.8,
            },
        });

        // 4. La animación de revelado de tarjetas es orquestada universalmente
        // por `initCardReveals` mediante el atributo `data-card-reveal`.
    }, section);
}
