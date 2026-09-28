import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';
import { splitTextIntoFramerChars } from './shared/text-reveal';

let selectedCasesCtx = null;

export function cleanupSelectedCases() {
    if (selectedCasesCtx) {
        selectedCasesCtx.revert();
        selectedCasesCtx = null;
    }
}

/**
 * Initializes the Pinned Header & Floating Asymmetric Cards sequence for Selected Cases
 * on the homepage, based on the Webflow Stodio Sequence reference:
 * - Header is vertically centered (100vh) and pins as the top of the section reaches top: 0.
 * - Title animates with Velix character-by-character blur reveal (identical to "hello I'm Mario").
 * - Cards rise over the pinned header.
 * - Row 1 features a soft gradient overlay (linear-gradient) that masks the centered text as it reaches it.
 * - Header text smoothly fades/blurs out, reaching opacity 0 as the row touches the top of the viewport.
 * - Subsequent rows feature solid background (var(--bg-primary)), ensuring zero text collision in forward or reverse.
 *
 * @param {HTMLElement} container - Incoming Barba container (or document)
 */
export function initSelectedCases(container) {
    cleanupSelectedCases();

    const section = container.querySelector('[data-selected-cases-stodio]');
    if (!section) return;

    selectedCasesCtx = gsap.context(() => {
        const pinnedHeader = section.querySelector('.stodio-pinned-hero');
        const headerContent = section.querySelector('.stodio-header-content');
        const cardsContainer = section.querySelector('.stodio-cards-container');
        const cards = Array.from(section.querySelectorAll('.stodio-card-wrap'));

        if (!pinnedHeader || !cardsContainer || !headerContent) return;

        const titleEl = headerContent.querySelector('.stodio-title');
        const subtitleEl = headerContent.querySelector('.stodio-subtitle');

        // Split text into individual characters for Velix blur reveal
        const titleChars = titleEl ? splitTextIntoFramerChars(titleEl) : [];

        const finalizeChars = (chars) => {
            chars.forEach((c) => {
                c.classList.add('is-revealed');
                c.style.filter = 'none';
                c.style.webkitFilter = 'none';
                c.style.transform = 'none';
                c.style.opacity = '1';
            });
        };

        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isReduced) {
            finalizeChars(titleChars);
            if (subtitleEl) gsap.set(subtitleEl, { opacity: 1, filter: 'none', y: 0 });
            gsap.set(cards, { opacity: 1, filter: 'none', y: 0 });
            return;
        }

        // 1. Configuración de entrada con blur reveal letra por letra (estilo "hello I'm Mario")
        if (titleChars.length) {
            gsap.set(titleChars, {
                opacity: 0,
                y: 16,
                filter: 'blur(12px)',
                webkitFilter: 'blur(12px)',
            });
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
                onComplete: () => finalizeChars(titleChars),
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
            start: 'top 80%',
            onEnter: () => entranceTl.play(),
            onLeaveBack: () => {
                titleChars.forEach((c) => c.classList.remove('is-revealed'));
                entranceTl.reverse();
            },
            onEnterBack: () => entranceTl.play(),
        });

        // 2. Anclaje (Pin) del encabezado en el centro del viewport cuando la sección toca el top
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            endTrigger: cardsContainer,
            end: 'bottom bottom',
            pin: pinnedHeader,
            pinSpacing: false,
        });

        // 3. Desvanecimiento suave del texto coordinado con la primera fila:
        // Inicia cuando la fila 1 sube al 55% y culmina cuando la fila toca el borde superior (10%).
        // Acompañado del degradado de fondo en .row-01 y fondos sólidos en .row-02 y .row-03.
        gsap.to(headerContent, {
            opacity: 0,
            y: -30,
            filter: 'blur(8px)',
            ease: 'power1.out',
            immediateRender: false,
            scrollTrigger: {
                trigger: cardsContainer,
                start: 'top 55%',
                end: 'top 10%',
                scrub: 0.8,
            },
        });

        // 4. Animación bidireccional de entrada y salida para cada tarjeta
        cards.forEach((card, index) => {
            const isInitialCard = index < 2;

            const cardAnimation = gsap.fromTo(
                card,
                {
                    filter: isInitialCard ? 'blur(8px)' : 'blur(16px)',
                    y: isInitialCard ? 45 : 85,
                    opacity: 0,
                },
                {
                    filter: 'blur(0px)',
                    y: 0,
                    opacity: 1,
                    duration: 0.9,
                    ease: 'power3.out',
                    paused: true,
                }
            );

            ScrollTrigger.create({
                trigger: card,
                start: isInitialCard ? 'top 85%' : 'top 78%',
                onEnter: () => cardAnimation.play(),
                onLeaveBack: () => cardAnimation.reverse(),
            });
        });
    }, section);
}
