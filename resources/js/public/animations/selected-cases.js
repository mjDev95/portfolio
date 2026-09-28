import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';

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

        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isReduced) {
            gsap.set([headerContent, ...cards], { opacity: 1, filter: 'none', y: 0 });
            return;
        }

        const headerElements = [
            headerContent.querySelector('.stodio-badge-pill'),
            headerContent.querySelector('.stodio-title'),
            headerContent.querySelector('.stodio-subtitle'),
        ].filter(Boolean);

        // 1. Revelado inicial con blur al entrar a la sección
        gsap.set(headerElements, {
            opacity: 0,
            y: 35,
            filter: 'blur(10px)',
        });

        const entranceTl = gsap.timeline({ paused: true });
        entranceTl.to(headerElements, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            stagger: 0.08,
            ease: 'power2.out',
        });

        ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            onEnter: () => entranceTl.play(),
            onLeaveBack: () => entranceTl.reverse(),
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
