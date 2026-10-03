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

        // 1. Configuración de entrada de texto
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
                start: 'top 60%',
                end: 'top 15%',
                scrub: 0.8,
            },
        });

        // 4. Animación de entrada de cada tarjeta — patrón diferido:
        // El estado inicial y willChange se aplican sólo en onEnter,
        // evitando crear capas GPU para tarjetas que aún no son visibles.
        // Las tarjetas en fila visual 3+ (index >= 2) no usan blur para
        // no competir en el presupuesto del compositor con el scrub de headerContent.
        cards.forEach((card, index) => {
            const isInitialCard = index < 2;
            const useBlur = index < 2;
            const yOffset = isInitialCard ? 35 : 40;

            // Estado oculto inicial sin willChange (sin GPU layer hasta que entre)
            gsap.set(card, { opacity: 0, y: yOffset });

            let cardTween = null;

            ScrollTrigger.create({
                trigger: card,
                start: isInitialCard ? 'top 85%' : 'top 80%',
                onEnter: () => {
                    // Crear/reutilizar tween sólo cuando la tarjeta está a punto de entrar
                    if (!cardTween) {
                        const fromVars = { opacity: 0, y: yOffset, immediateRender: false };
                        const toVars = {
                            opacity: 1,
                            y: 0,
                            duration: 0.85,
                            ease: 'power3.out',
                            clearProps: 'willChange',
                        };

                        if (useBlur) {
                            fromVars.filter = 'blur(6px)';
                            fromVars.webkitFilter = 'blur(6px)';
                            toVars.filter = 'blur(0px)';
                            toVars.webkitFilter = 'blur(0px)';
                            toVars.clearProps = 'filter,webkitFilter,willChange';
                        }

                        gsap.set(card, { willChange: 'transform, opacity' });
                        cardTween = gsap.fromTo(card, fromVars, toVars);
                    } else {
                        cardTween.play();
                    }
                },
                onLeaveBack: () => {
                    if (cardTween) {
                        cardTween.reverse();
                    }
                },
            });
        });
    }, section);
}
