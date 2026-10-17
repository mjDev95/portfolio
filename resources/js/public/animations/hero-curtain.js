import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';
import { splitTextIntoChars, finalizeBlurChars } from './shared/text-reveal';

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
    const brandSymbols = section.querySelectorAll('.hero-curtain-brand-symbol');
    const symbolSolids = section.querySelectorAll('[data-symbol-solid]');
    const symbolLines = section.querySelectorAll('[data-symbol-lines]');

    // Elementos vectoriales de líneas y sólidos
    const lineElements = section.querySelectorAll('.brand-vector-lines path, .brand-vector-lines circle, .brand-vector-lines ellipse, .brand-vector-lines rect');
    const rectElements = section.querySelectorAll('.brand-vector-lines rect');
    const circleElements = section.querySelectorAll('.brand-vector-lines circle, .brand-vector-lines ellipse');
    const pathElements = section.querySelectorAll('.brand-vector-lines path');
    const vectorSolidPaths = section.querySelectorAll('.brand-vector-solid path');

    const titles = [lightTitle, darkTitle].filter(Boolean);
    const metaElements = [darkBio, darkSocial].filter(Boolean);

    // Initial state setup to avoid any first-frame jump
    if (darkLayer) {
        gsap.set(darkLayer, { clipPath: 'inset(0% 100% 0% 0%)' });
    }
    if (titles.length) {
        gsap.set(titles, { x: '14vw' });
    }
    if (brandSymbols.length) {
        gsap.set(brandSymbols, { opacity: 1, scale: 1, x: 0, y: 0 });
    }
    if (symbolSolids.length) {
        gsap.set(symbolSolids, { opacity: 0 });
    }
    if (symbolLines.length) {
        gsap.set(symbolLines, { opacity: 1 });
    }

    // Inicializar círculos y rectángulos en escala 0 y opacidad 0 (burbujas cerradas en sus propios centros)
    if (lineElements.length) {
        gsap.set(lineElements, {
            scale: 0,
            opacity: 0,
            transformBox: 'fill-box',
            transformOrigin: '50% 50%',
        });
    }

    if (vectorSolidPaths.length) {
        gsap.set(vectorSolidPaths, {
            opacity: 0,
            scale: 0.95,
            transformBox: 'fill-box',
            transformOrigin: '50% 50%',
        });
    }

    // Split text into character spans for both layers
    const lightChars = lightTitle ? splitTextIntoChars(lightTitle) : [];
    const darkChars = darkTitle ? splitTextIntoChars(darkTitle) : [];

    // Trigger synchronized entrance animation for both titles upon entering screen
    if (lightChars.length || darkChars.length) {
        const handBadges = section.querySelectorAll('.hero-hand-badge');

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            finalizeBlurChars([...lightChars, ...darkChars], lightTitle);
            finalizeBlurChars([], darkTitle);
            if (handBadges.length) {
                gsap.set(handBadges, { opacity: 1, scale: 1, rotate: 0 });
            }
        } else {
            const blurRevealTl = gsap.timeline({
                delay: 0.15,
            });

            if (handBadges.length) {
                gsap.set(handBadges, { opacity: 0, scale: 0.3, rotate: -20, transformOrigin: '42% 92%' });
                blurRevealTl.to(handBadges, {
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    duration: 0.75,
                    ease: 'back.out(2)',
                }, 0.28);
            }

            if (lightChars.length) {
                blurRevealTl.to(lightChars, {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    webkitFilter: 'blur(0px)',
                    duration: 0.7,
                    ease: 'power2.out',
                    stagger: { each: 0.045, from: 'start' },
                    onComplete: () => finalizeBlurChars(lightChars, lightTitle),
                }, 0);
            }

            if (darkChars.length) {
                blurRevealTl.to(darkChars, {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    webkitFilter: 'blur(0px)',
                    duration: 0.7,
                    ease: 'power2.out',
                    stagger: { each: 0.045, from: 'start' },
                    onComplete: () => finalizeBlurChars(darkChars, darkTitle),
                }, 0);
            }

            // Subtly fade in the light layer meta indicators shortly after the letters begin revealing
            const lightMeta = section.querySelectorAll('.hero-curtain-light .hero-curtain-top, .hero-curtain-light .hero-curtain-bottom');
            if (lightMeta.length) {
                blurRevealTl.fromTo(lightMeta,
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

    // 6. FASE 1: Explosión orgánica de burbujas (Líneas completas)
    // Se crea una subtimeline dedicada para las formas lineales.
    const linesTl = gsap.timeline();

    if (rectElements.length) {
        linesTl.to(rectElements, {
            scale: 1,
            opacity: 1,
            duration: 0.28,
            stagger: {
                each: 0.04,
                from: 'random',
            },
            ease: 'back.out(1.8)',
        }, 0);
    }

    if (circleElements.length) {
        linesTl.to(circleElements, {
            scale: 1,
            opacity: 1,
            duration: 0.28,
            stagger: {
                each: 0.015,
                from: 'random',
            },
            ease: 'back.out(1.7)',
        }, 0.04);
    }

    if (pathElements.length) {
        linesTl.to(pathElements, {
            scale: 1,
            opacity: 1,
            duration: 0.28,
            stagger: {
                each: 0.02,
                from: 'center',
            },
            ease: 'power2.out',
        }, 0.08);
    }

    // Incrustamos el florecimiento de líneas al inicio del scroll de la cortina (inicia en 0.08)
    tl.add(linesTl, 0.08);

    // 7. FASE 2: Pintado / Revelado de la Silueta Sólida (ico-sould)
    // ESTRICTO: Se programa con '>+0.12' para iniciar SÓLO DESPUÉS de que linesTl haya concluido al 100%
    // más un margen de espera de seguridad donde todas las figuras ya están inmóviles en su sitio
    if (symbolSolids.length) {
        tl.to(symbolSolids, {
            opacity: 1,
            duration: 0.24,
            ease: 'power2.out',
        }, '>+0.12');
    }

    if (vectorSolidPaths.length) {
        tl.to(vectorSolidPaths, {
            opacity: 1,
            scale: 1,
            duration: 0.24,
            stagger: 0.01,
            ease: 'power2.out',
        }, '<');
    }

    // 8. FASE 3: Desvanecimiento de las geometrías lineales (ico-lines -> opacity: 0)
    // Una vez que el sólido está completamente pintado y en su lugar final,
    // desvanecemos suavemente todos los círculos, rectángulos y líneas para dejar únicamente la silueta sólida limpia
    if (symbolLines.length) {
        tl.to(symbolLines, {
            opacity: 0,
            duration: 0.18,
            ease: 'power2.inOut',
        }, '>+0.04');
    }

    // 7. Buffer de anclaje (0.85 a 1.0): mantiene la pantalla completamente revelada
    // firmemente anclada hasta que el marcador 'end' toca el borde superior ('scroller-start')
    // para desanclarse con total naturalidad sin brincos bruscos ni adelantos de sección.
    tl.to({}, { duration: 0.15 });

    // Garantizamos que la línea de tiempo inicie exactamente en progreso 0 (cortina cerrada) al montarse
    tl.progress(0);

    }, section);
}
