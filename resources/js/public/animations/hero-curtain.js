import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';
import { splitTextIntoFramerChars } from './shared/text-reveal';

let curtainCtx = null;

/**
 * Reverts the hero curtain GSAP context, terminating tweens and ScrollTriggers.
 */
export function cleanupHeroCurtain() {
    if (curtainCtx) {
        curtainCtx.revert();
        curtainCtx = null;
    }
}

/**
 * Initializes the Split-Screen Inverted Curtain Hero on the homepage.
 * Pinned via GSAP ScrollTrigger with scrubbed horizontal reveal,
 * synchronized title translation, portrait entrance, and floating navbar coordination.
 */
export function initHeroCurtain(container) {
    cleanupHeroCurtain();

    const section = container.querySelector('[data-hero-curtain]');
    const navbar = document.querySelector('.site-header-fixed');

    if (!section) {
        // En páginas sin hero curtain, aseguramos que el navbar esté completamente visible
        if (navbar) {
            navbar.classList.remove('navbar-curtain-hidden');
            gsap.set(navbar, { autoAlpha: 1, y: 0, scale: 1, pointerEvents: 'auto' });
            const islands = navbar.querySelectorAll('.nav-desktop-island, .nav-mobile-island');
            if (islands.length) {
                gsap.set(islands, { scale: 1, opacity: 1, filter: 'none', y: 0 });
            }
        }
        return;
    }

    curtainCtx = gsap.context(() => {

    const pinElement = section.querySelector('.hero-curtain-pin') || section;
    const darkLayer = section.querySelector('.hero-curtain-dark');
    const lightTitle = section.querySelector('.hero-curtain-light .hero-curtain-title');
    const darkTitle = section.querySelector('.hero-curtain-dark .hero-curtain-title');
    const portrait = section.querySelector('.hero-curtain-portrait');
    const darkBio = section.querySelector('.hero-curtain-dark .hero-curtain-bio');
    const darkSocial = section.querySelector('.hero-curtain-dark .hero-curtain-social');

    const titles = [lightTitle, darkTitle].filter(Boolean);
    const metaElements = [darkBio, darkSocial].filter(Boolean);

    // Initial state setup to avoid any first-frame jump
    if (darkLayer) {
        gsap.set(darkLayer, { clipPath: 'inset(0% 100% 0% 0%)' });
    }
    if (titles.length) {
        gsap.set(titles, { x: '14vw' });
    }

    // Split text into Velix framer characters for both layers
    const lightChars = lightTitle ? splitTextIntoFramerChars(lightTitle) : [];
    const darkChars = darkTitle ? splitTextIntoFramerChars(darkTitle) : [];

    const finalizeChars = (chars) => {
        chars.forEach((c) => {
            c.classList.add('is-revealed');
            c.style.filter = 'none';
            c.style.webkitFilter = 'none';
            c.style.transform = 'none';
            c.style.opacity = '1';
        });
    };

    // Trigger synchronized entrance animation for both titles upon entering screen
    if (lightChars.length || darkChars.length) {
        const handBadges = section.querySelectorAll('.hero-hand-badge');

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            finalizeChars([...lightChars, ...darkChars]);
            if (handBadges.length) {
                gsap.set(handBadges, { opacity: 1, scale: 1, rotate: 0 });
            }
        } else {
            const velixTl = gsap.timeline({
                delay: 0.15,
            });

            if (handBadges.length) {
                gsap.set(handBadges, { opacity: 0, scale: 0.3, rotate: -20, transformOrigin: '42% 92%' });
                velixTl.to(handBadges, {
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    duration: 0.75,
                    ease: 'back.out(2)',
                }, 0.28);
            }

            if (lightChars.length) {
                velixTl.to(lightChars, {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    webkitFilter: 'blur(0px)',
                    duration: 0.7,
                    ease: 'power2.out',
                    stagger: { each: 0.045, from: 'start' },
                    onComplete: () => finalizeChars(lightChars),
                }, 0);
            }

            if (darkChars.length) {
                velixTl.to(darkChars, {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    webkitFilter: 'blur(0px)',
                    duration: 0.7,
                    ease: 'power2.out',
                    stagger: { each: 0.045, from: 'start' },
                    onComplete: () => finalizeChars(darkChars),
                }, 0);
            }

            // Subtly fade in the light layer meta indicators shortly after the letters begin revealing
            const lightMeta = section.querySelectorAll('.hero-curtain-light .hero-curtain-top, .hero-curtain-light .hero-curtain-bottom');
            if (lightMeta.length) {
                velixTl.fromTo(lightMeta,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1 },
                    0.35,
                );
            }
        }
    }

    if (portrait) {
        gsap.set(portrait, { opacity: 0, scale: 0.94, x: 60 });
    }
    if (metaElements.length) {
        gsap.set(metaElements, { opacity: 0, y: 20 });
    }

    // Floating navbar: estrictamente oculto mientras el hero curtain esté activo
    if (navbar) {
        const isPastCurtain = window.scrollY >= 1550;
        const islands = navbar.querySelectorAll('.nav-desktop-island, .nav-mobile-island');
        if (isPastCurtain) {
            navbar.classList.remove('navbar-curtain-hidden');
            gsap.set(navbar, { autoAlpha: 1, pointerEvents: 'auto' });
            if (islands.length) {
                gsap.set(islands, { scale: 1, opacity: 1, filter: 'none', y: 0 });
            }
        } else {
            navbar.classList.add('navbar-curtain-hidden');
            gsap.set(navbar, { autoAlpha: 0, pointerEvents: 'none' });
            if (islands.length) {
                gsap.set(islands, { scale: 0.35, opacity: 0, filter: 'blur(8px)', y: -12 });
            }
        }
    }

    // Create scrub timeline pinned with ScrollTrigger
    // Anclamos pinElement (.hero-curtain-pin de 100vh) con pinSpacing: true.
    // Como el contenedor padre (.hero-curtain-container) tiene min-height: 100vh (sin height fijo),
    // el pinSpacer de 100vh + 1600px empuja a #hero-editorial-2 exactamente 1600px hacia abajo.
    // La cortina permanece anclada al 100% del viewport de borde superior a inferior,
    // y se desancla exactamente cuando el marcador rojo 'end' sube y toca el borde superior ('scroller-start').
    const tl = gsap.timeline({
        scrollTrigger: {
            id: 'hero-curtain-trigger',
            trigger: section,
            pin: pinElement,
            pinSpacing: true,
            start: 'top top',
            end: '+=1600',
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeave: () => {
                // Al terminar la cortina, revelamos la cápsula flotante tipo Apple Dynamic Island:
                // emerge de un tamaño compacto (scale 0.35, blur 8px) a escala 1 con rebote elástico premium
                if (navbar) {
                    navbar.classList.remove('navbar-curtain-hidden');
                    gsap.set(navbar, { autoAlpha: 1, pointerEvents: 'auto' });
                    const islands = navbar.querySelectorAll('.nav-desktop-island, .nav-mobile-island');
                    if (islands.length) {
                        gsap.fromTo(islands,
                            { scale: 0.35, opacity: 0, filter: 'blur(8px)', y: -12 },
                            {
                                scale: 1,
                                opacity: 1,
                                filter: 'blur(0px)',
                                y: 0,
                                duration: 0.55,
                                ease: 'back.out(1.6)',
                                pointerEvents: 'auto',
                                overwrite: 'auto',
                                clearProps: 'filter',
                            }
                        );
                    }
                }
            },
            onEnterBack: () => {
                // Al regresar haciendo scroll hacia arriba al hero curtain, se oculta en sentido inverso
                // contrayéndose hacia su semilla (scale 1 -> 0.35 con blur y opacidad)
                if (navbar) {
                    const islands = navbar.querySelectorAll('.nav-desktop-island, .nav-mobile-island');
                    if (islands.length) {
                        gsap.to(islands, {
                            scale: 0.35,
                            opacity: 0,
                            filter: 'blur(8px)',
                            y: -12,
                            duration: 0.32,
                            ease: 'power3.in',
                            overwrite: 'auto',
                            onComplete: () => {
                                navbar.classList.add('navbar-curtain-hidden');
                                gsap.set(navbar, { autoAlpha: 0, pointerEvents: 'none' });
                            },
                        });
                    } else {
                        navbar.classList.add('navbar-curtain-hidden');
                    }
                }
            },
        },
    });

    // 1. Despliegue horizontal fluido mediante inset (0% a 100% de izquierda a derecha)
    if (darkLayer) {
        tl.to(darkLayer, {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            duration: 0.85,
        }, 0);
    }

    // 3. Parallax horizontal: ambos textos idénticos se desplazan sincronizados hacia la izquierda
    if (titles.length) {
        tl.to(titles, {
            x: '-14vw',
            ease: 'none',
            duration: 0.85,
        }, 0);
    }

    // 4. Retrato emerge y escala suavemente en el cuadrante derecho
    if (portrait) {
        tl.to(portrait, {
            opacity: 1,
            scale: 1,
            x: 0,
            ease: 'power2.out',
            duration: 0.55,
        }, 0.2);
    }

    // 5. Bio y redes sociales entran en foco
    if (metaElements.length) {
        tl.to(metaElements, {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            duration: 0.4,
        }, 0.38);
    }

    // 6. Buffer de anclaje (0.85 a 1.0): mantiene la pantalla completamente revelada
    // firmemente anclada hasta que el marcador 'end' toca el borde superior ('scroller-start')
    // para desanclarse con total naturalidad sin brincos bruscos ni adelantos de sección.
    tl.to({}, { duration: 0.15 });

    // Garantizamos que la línea de tiempo inicie exactamente en progreso 0 (cortina cerrada) al montarse
    tl.progress(0);

    }, section);
}
