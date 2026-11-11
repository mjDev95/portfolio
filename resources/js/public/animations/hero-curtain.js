import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';
import { splitTextIntoChars, finalizeBlurChars, animateBlurChars } from './shared/text-reveal';
import { triggerHeroEditorialCounters, resetHeroEditorialCounters } from './hero-editorial';

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
        // En páginas sin hero curtain, aseguramos que el contenedor del header esté visible
        if (navbar) {
            navbar.classList.remove('navbar-curtain-hidden');
            gsap.set(navbar, { autoAlpha: 1, y: 0, scale: 1 });
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

    const eyePupils = section.querySelectorAll('.eye-pupil-zoom, [data-zoom-lens]');
    const portalDisc = section.querySelector('[data-portal-disc]');
    const nextSection = container.querySelector('#hero-editorial-2') || document.querySelector('#hero-editorial-2');

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
            transformBox: 'fill-box',
            transformOrigin: '50% 50%',
        });
    }

    // Helper: calcula la posición exacta del centro del ojo en relación con el contenedor anclado (pinElement)
    function getEyeCenter() {
        const eye = section.querySelector('.hero-curtain-dark .svg-solid-eye-lens') 
                 || section.querySelector('.svg-solid-eye-lens')
                 || section.querySelector('.hero-curtain-dark [data-zoom-lens]') 
                 || section.querySelector('[data-zoom-lens]');
        const layer = section.querySelector('.hero-curtain-dark') || pinElement;
        if (eye && layer) {
            const eyeRect = eye.getBoundingClientRect();
            const layerRect = layer.getBoundingClientRect();
            return {
                x: (eyeRect.left + eyeRect.width / 2) - layerRect.left,
                y: (eyeRect.top + eyeRect.height / 2) - layerRect.top,
                radius: Math.max(12, eyeRect.width / 2),
            };
        }
        return {
            x: window.innerWidth * 0.72,
            y: window.innerHeight * 0.5,
            radius: 16,
        };
    }

    if (portalDisc) {
        const center = getEyeCenter();
        const initialRadius = Math.round(center.radius || 15);
        gsap.set(portalDisc, {
            opacity: 0,
            clipPath: `circle(${initialRadius}px at ${center.x}px ${center.y}px)`,
            webkitClipPath: `circle(${initialRadius}px at ${center.x}px ${center.y}px)`,
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
        gsap.set(portrait, { opacity: 0, scale: 0.94, x: 60, visibility: 'visible' });
        const portraitWrap = section.querySelector('.hero-curtain-portrait-wrap');
        if (portraitWrap) {
            gsap.set(portraitWrap, { visibility: 'visible' });
        }
    }
    if (metaElements.length) {
        gsap.set(metaElements, { opacity: 0, y: 20 });
    }

    // Floating navbar: estrictamente oculto mientras el hero curtain esté activo
    if (navbar) {
        const isPastCurtain = window.scrollY >= 1100;
        if (isPastCurtain) {
            navbar.classList.remove('navbar-curtain-hidden');
            gsap.set(navbar, { autoAlpha: 1, y: 0 });
        } else {
            navbar.classList.add('navbar-curtain-hidden');
            gsap.set(navbar, { autoAlpha: 0 });
        }
    }

    // Create scrub timeline pinned with ScrollTrigger
    // Anclamos pinElement (.hero-curtain-pin de 100vh) con pinSpacing: true.
    // La cortina permanece anclada durante el scroll de líneas y pintura del flat sólido.
    // Al concluir, el zoom del ojo y la revelación de la sección editorial se disparan de forma automática.
    const tl = gsap.timeline({
        scrollTrigger: {
            id: 'hero-curtain-trigger',
            trigger: section,
            pin: pinElement,
            pinSpacing: true,
            start: 'top top',
            end: '+=1250',
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeave: () => {
                if (navbar) {
                    navbar.classList.remove('navbar-curtain-hidden');
                    gsap.fromTo(
                        navbar,
                        { autoAlpha: 0, y: -10 },
                        { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' }
                    );
                }
            },
            onEnterBack: () => {
                if (navbar) {
                    gsap.to(navbar, {
                        autoAlpha: 0,
                        y: -10,
                        duration: 0.25,
                        ease: 'power2.in',
                        overwrite: 'auto',
                        onComplete: () => {
                            navbar.classList.add('navbar-curtain-hidden');
                        },
                    });
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
            duration: 0.24,
            stagger: 0.01,
            ease: 'power2.out',
        }, '<');
    }

    // 8. FASE 3: Desvanecimiento COMPLETO de las geometrías lineales (ico-lines -> opacity: 0)
    // Una vez que el sólido está completamente pintado y en su lugar final,
    // desvanecemos todos los círculos, rectángulos y líneas para dejar únicamente la silueta sólida limpia
    if (symbolLines.length) {
        tl.to(symbolLines, {
            opacity: 0,
            duration: 0.22,
            ease: 'power2.inOut',
        }, '>+0.04');
    }

    // 8.1 TIEMPO DE PERMANENCIA DEL FLAT SÓLIDO (Silueta Sólida Limpia Visible)
    // Se deja una pausa deliberada en el scroll donde SÓLO se aprecia la silueta sólida limpia (flat)
    tl.to({}, { duration: 0.28 }, '>');

    const editorialSection = document.getElementById('hero-editorial-2') || document.querySelector('.hero-editorial-section');

    // 9. FASE 4: ZOOM DEL OJO (Portal Circular Limpio que cubre el hero como transición cinemática)
    if (portalDisc) {
        // En el inicio de Phase 4, inicializamos la posición del disco portal en la pupila del ojo
        tl.set(portalDisc, {
            opacity: 1,
            clipPath: () => {
                const c = getEyeCenter();
                return `circle(${Math.round(c.radius || 15)}px at ${Math.round(c.x)}px ${Math.round(c.y)}px)`;
            },
            webkitClipPath: () => {
                const c = getEyeCenter();
                return `circle(${Math.round(c.radius || 15)}px at ${Math.round(c.x)}px ${Math.round(c.y)}px)`;
            },
        }, '>');

        // Expansión nítida del portal hasta cubrir por completo el viewport
        tl.to(portalDisc, {
            clipPath: () => {
                const c = getEyeCenter();
                const maxDist = Math.hypot(
                    Math.max(c.x, window.innerWidth - c.x),
                    Math.max(c.y, window.innerHeight - c.y)
                ) + 100;
                return `circle(${Math.ceil(maxDist)}px at ${Math.round(c.x)}px ${Math.round(c.y)}px)`;
            },
            webkitClipPath: () => {
                const c = getEyeCenter();
                const maxDist = Math.hypot(
                    Math.max(c.x, window.innerWidth - c.x),
                    Math.max(c.y, window.innerHeight - c.y)
                ) + 100;
                return `circle(${Math.ceil(maxDist)}px at ${Math.round(c.x)}px ${Math.round(c.y)}px)`;
            },
            duration: 0.55,
            ease: 'power2.inOut',
        }, '>');
    }

    // Si la siguiente sección tiene margen negativo sobre el pin de la cortina,
    // mantenemos su visibilidad oculta (opacity: 0) hasta que el portal del ojo haya cubierto completamente la pantalla
    if (editorialSection) {
        gsap.set(editorialSection, { opacity: 0, pointerEvents: 'none' });

        tl.to(editorialSection, {
            opacity: 1,
            duration: 0.25,
            ease: 'power2.out',
            onStart: () => {
                editorialSection.style.pointerEvents = 'auto';
            },
            onReverseComplete: () => {
                editorialSection.style.pointerEvents = 'none';
                resetHeroEditorialCounters();
            },
        }, '>');
    }

    // Buffer de anclaje final para permitir el desanclaje limpio
    tl.to({}, { duration: 0.15 });

    // Garantizamos que la línea de tiempo inicie exactamente en progreso 0 (cortina cerrada) al montarse
    tl.progress(0);

    }, section);
}
