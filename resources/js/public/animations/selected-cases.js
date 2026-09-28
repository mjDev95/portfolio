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
 * on the homepage, based on Stodio Sequence with editorial aesthetics and bidirectional blur reveals.
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

        // 1. Entrance blur reveal of centered header text BEFORE it pins
        gsap.set(headerContent, {
            opacity: 0,
            y: 35,
            filter: 'blur(12px)',
        });

        const entranceAnimation = gsap.to(headerContent, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.0,
            ease: 'power2.out',
            paused: true,
        });

        ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            onEnter: () => entranceAnimation.play(),
            onLeaveBack: () => entranceAnimation.reverse(),
        });

        // 2. Pinning the header while cards scroll over it
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            endTrigger: cardsContainer,
            end: 'bottom bottom',
            pin: pinnedHeader,
            pinSpacing: false,
        });

        // 3. Smooth scrubbed fade-out & blur of header text as cards rise
        gsap.to(headerContent, {
            opacity: 0,
            y: -40,
            filter: 'blur(8px)',
            ease: 'power1.out',
            scrollTrigger: {
                trigger: cardsContainer,
                start: 'top 55%',
                end: 'top 15%',
                scrub: 0.8,
            },
        });

        // 4. Bidirectional card entrance animations with calibrated blur and y-offset
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
