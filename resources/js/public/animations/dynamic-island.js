import gsap from 'gsap';
import { getLenis, ScrollTrigger } from '../lib/smooth-scroll';

/**
 * Dynamic Island Dual Architecture (Portavia-style):
 * 1. Desktop Island (#desktop-island):
 *    - Exclusivo para >= 1024px.
 *    - Inicia expandida en el Hero y Hero Editorial.
 *    - Al llegar a Servicios (#services, start: 'top 30%'), se compacta.
 *    - REGLA ESTRICTA: Al regresar hacia arriba en scroll, NO aplica reverse; se queda compactada.
 *    - Hover en Desktop (cuando está compactada): se expande suavemente y colapsa al salir el cursor.
 *
 * 2. Mobile Island (#mobile-island):
 *    - Exclusivo para < 1024px.
 *    - Jamás se muestra expandida como en ordenador.
 *    - Cabecera fija con avatar, status "Available for work" y toggle button.
 *    - Al abrirse, se expande estrictamente sobre el Eje Y mediante un GSAP timeline suave.
 *    - Las barras animan de hamburguesa a una "X" perfecta.
 *    - Cierre suave reversible con timeline.reverse() al hacer click en el toggle, al hacer click
 *      fuera de la cápsula, o al pulsar cualquier enlace.
 */

let servicesTrigger = null;
let isDesktopCompacted = false;
let isDesktopHovered = false;

let mobileTl = null;
let isMobileExpanded = false;
let outsideClickHandler = null;

export function initDynamicIsland() {
    cleanupDynamicIsland();

    initDesktopIsland();
    initMobileIsland();
    initAnchorScroll();
}

/**
 * ─────────────────────────────────────────────────────────────
 * 1. DESKTOP ISLAND (>= 1024px)
 * ─────────────────────────────────────────────────────────────
 */
function initDesktopIsland() {
    const desktopIsland = document.getElementById('desktop-island');
    if (!desktopIsland) return;

    const expandedBlock = document.getElementById('desktop-island-expanded');
    const compactBlock = document.getElementById('desktop-island-compact');
    if (!expandedBlock || !compactBlock) return;

    const servicesEl = document.getElementById('services');

    if (servicesEl) {
        // En la home: evaluar si ya pasamos físicamente la sección #services
        const currentY = window.scrollY || document.documentElement.scrollTop || 0;
        const servicesRect = servicesEl.getBoundingClientRect();
        const isAlreadyAtServices = servicesRect.top <= window.innerHeight * 0.3 && currentY > 1600;

        if (isAlreadyAtServices) {
            isDesktopCompacted = true;
            transitionDesktopToCompact(desktopIsland, expandedBlock, compactBlock, true);
        } else {
            isDesktopCompacted = false;
            transitionDesktopToExpanded(desktopIsland, expandedBlock, compactBlock, true);
        }

        servicesTrigger = ScrollTrigger.create({
            trigger: servicesEl,
            start: 'top 30%',
            onEnter: () => {
                if (isDesktopCompacted) return;
                isDesktopCompacted = true;
                if (!isDesktopHovered) {
                    transitionDesktopToCompact(desktopIsland, expandedBlock, compactBlock, false);
                }
            },
            // REGLA: Sin onLeaveBack (no revierte al volver arriba)
            invalidateOnRefresh: true,
        });
    } else {
        // En subpáginas sin #services (e.g. /about, /contact, /projects)
        const currentY = window.scrollY || document.documentElement.scrollTop || 0;
        if (currentY >= 300) {
            isDesktopCompacted = true;
            transitionDesktopToCompact(desktopIsland, expandedBlock, compactBlock, true);
        } else {
            isDesktopCompacted = false;
            transitionDesktopToExpanded(desktopIsland, expandedBlock, compactBlock, true);
        }

        servicesTrigger = ScrollTrigger.create({
            start: 300,
            onEnter: () => {
                if (isDesktopCompacted) return;
                isDesktopCompacted = true;
                if (!isDesktopHovered) {
                    transitionDesktopToCompact(desktopIsland, expandedBlock, compactBlock, false);
                }
            },
            invalidateOnRefresh: true,
        });
    }

    // Hover interactions en Desktop cuando está compactada (idempotente)
    if (!desktopIsland.dataset.hoverBound) {
        desktopIsland.dataset.hoverBound = 'true';
        desktopIsland.addEventListener('mouseenter', () => {
            if (window.innerWidth < 1024 || !isDesktopCompacted) return;
            isDesktopHovered = true;
            transitionDesktopToExpanded(desktopIsland, expandedBlock, compactBlock, false);
        });

        desktopIsland.addEventListener('mouseleave', () => {
            if (window.innerWidth < 1024) return;
            isDesktopHovered = false;
            if (isDesktopCompacted) {
                transitionDesktopToCompact(desktopIsland, expandedBlock, compactBlock, false);
            }
        });
    }
}

function getElementTargetWidth(el, container) {
    const clone = el.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.display = 'flex';
    clone.style.pointerEvents = 'none';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.width = 'max-content';
    clone.style.opacity = '0';
    document.body.appendChild(clone);
    const contentWidth = clone.offsetWidth;
    document.body.removeChild(clone);

    const comp = window.getComputedStyle(container);
    const padLeft = parseFloat(comp.paddingLeft) || 8;
    const padRight = parseFloat(comp.paddingRight) || 8;
    const borderLeft = parseFloat(comp.borderLeftWidth) || 1;
    const borderRight = parseFloat(comp.borderRightWidth) || 1;

    return Math.ceil(contentWidth + padLeft + padRight + borderLeft + borderRight);
}

function transitionDesktopToCompact(island, expandedBlock, compactBlock, immediate = false) {
    if (immediate) {
        island.classList.add('is-compacted');
        const targetWidth = getElementTargetWidth(compactBlock, island);
        gsap.set(island, { width: targetWidth, scaleY: 1 });
        gsap.set(compactBlock, {
            position: 'relative',
            left: 'auto',
            top: 'auto',
            yPercent: 0,
            x: 0,
            scale: 1,
            filter: 'none',
            opacity: 1,
            visibility: 'visible',
            pointerEvents: 'auto',
        });
        gsap.set(expandedBlock, {
            position: 'absolute',
            left: '0.45rem',
            top: '50%',
            yPercent: -50,
            x: 0,
            scale: 0.86,
            filter: 'blur(5px)',
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
        });
        return;
    }

    gsap.killTweensOf([island, expandedBlock, compactBlock]);

    const targetWidth = getElementTargetWidth(compactBlock, island);
    const currentWidth = island.offsetWidth;
    island.style.width = currentWidth + 'px';

    gsap.set(compactBlock, {
        position: 'absolute',
        left: '0.45rem',
        top: '50%',
        yPercent: -50,
        opacity: 0,
        scale: 0.86,
        filter: 'blur(5px)',
        x: 10,
        visibility: 'visible',
        pointerEvents: 'none',
    });

    const tl = gsap.timeline({
        onComplete: () => {
            island.classList.add('is-compacted');
            gsap.set(compactBlock, {
                position: 'relative',
                left: 'auto',
                top: 'auto',
                yPercent: 0,
                x: 0,
                scale: 1,
                opacity: 1,
                filter: 'none',
                visibility: 'visible',
                pointerEvents: 'auto',
            });
            gsap.set(expandedBlock, {
                position: 'absolute',
                left: '0.45rem',
                top: '50%',
                yPercent: -50,
                x: 0,
                scale: 0.86,
                opacity: 0,
                filter: 'blur(5px)',
                visibility: 'hidden',
                pointerEvents: 'none',
            });
            island.style.width = targetWidth + 'px';
            gsap.set(island, { scaleY: 1 });
        },
    });

    // 1. Morfología física Apple: contracción fluida del ancho + compresión de volumen
    tl.to(island, {
        width: targetWidth,
        duration: 0.48,
        ease: 'power4.out',
    }, 0);

    tl.to(island, {
        scaleY: 0.94,
        duration: 0.2,
        ease: 'power2.out',
    }, 0);
    tl.to(island, {
        scaleY: 1,
        duration: 0.28,
        ease: 'power2.out',
    }, 0.2);

    // 2. El menú expandido se contrae suavemente, se desenfoca y desaparece
    tl.to(expandedBlock, {
        opacity: 0,
        scale: 0.86,
        filter: 'blur(5px)',
        x: -10,
        duration: 0.22,
        ease: 'power2.in',
    }, 0);

    // 3. Emerge el bloque compacto ("Available for work" + estrellas) con rebote elástico Apple
    tl.to(compactBlock, {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        x: 0,
        duration: 0.36,
        ease: 'back.out(1.5)',
    }, 0.12);
}

function transitionDesktopToExpanded(island, expandedBlock, compactBlock, immediate = false) {
    if (immediate) {
        island.classList.remove('is-compacted');
        gsap.set(island, { width: 'auto', scaleY: 1 });
        gsap.set(expandedBlock, {
            position: 'relative',
            left: 'auto',
            top: 'auto',
            yPercent: 0,
            x: 0,
            scale: 1,
            filter: 'none',
            opacity: 1,
            visibility: 'visible',
            pointerEvents: 'auto',
        });
        gsap.set(compactBlock, {
            position: 'absolute',
            left: '0.45rem',
            top: '50%',
            yPercent: -50,
            x: 0,
            scale: 0.88,
            filter: 'blur(4px)',
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
        });
        return;
    }

    gsap.killTweensOf([island, expandedBlock, compactBlock]);

    const targetWidth = getElementTargetWidth(expandedBlock, island);
    const currentWidth = island.offsetWidth;
    island.style.width = currentWidth + 'px';

    gsap.set(expandedBlock, {
        position: 'absolute',
        left: '0.45rem',
        top: '50%',
        yPercent: -50,
        opacity: 0,
        scale: 0.88,
        filter: 'blur(5px)',
        x: -10,
        visibility: 'visible',
        pointerEvents: 'none',
    });

    const tl = gsap.timeline({
        onComplete: () => {
            island.classList.remove('is-compacted');
            gsap.set(expandedBlock, {
                position: 'relative',
                left: 'auto',
                top: 'auto',
                yPercent: 0,
                x: 0,
                scale: 1,
                opacity: 1,
                filter: 'none',
                visibility: 'visible',
                pointerEvents: 'auto',
            });
            gsap.set(compactBlock, {
                position: 'absolute',
                left: '0.45rem',
                top: '50%',
                yPercent: -50,
                x: 0,
                scale: 0.88,
                opacity: 0,
                filter: 'blur(5px)',
                visibility: 'hidden',
                pointerEvents: 'none',
            });
            island.style.width = 'auto';
            gsap.set(island, { scaleY: 1 });
        },
    });

    // 1. Morfología física Apple: estiramiento elástico orgánico del ancho exterior
    tl.to(island, {
        width: targetWidth,
        duration: 0.52,
        ease: 'back.out(1.15)',
    }, 0);

    tl.to(island, {
        scaleY: 0.95,
        duration: 0.22,
        ease: 'power2.out',
    }, 0);
    tl.to(island, {
        scaleY: 1,
        duration: 0.3,
        ease: 'power2.out',
    }, 0.22);

    // 2. Desvanecimiento y contracción suave del bloque compacto
    tl.to(compactBlock, {
        opacity: 0,
        scale: 0.88,
        filter: 'blur(5px)',
        x: 10,
        duration: 0.18,
        ease: 'power2.in',
    }, 0);

    // 3. Emerge con impulso elástico el menú expandido completo
    tl.to(expandedBlock, {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        x: 0,
        duration: 0.38,
        ease: 'back.out(1.35)',
    }, 0.1);
}

/**
 * ─────────────────────────────────────────────────────────────
 * 2. MOBILE & TABLET ISLAND (< 1024px)
 * ─────────────────────────────────────────────────────────────
 */
function initMobileIsland() {
    const mobileIsland = document.getElementById('mobile-island');
    if (!mobileIsland) return;

    const toggleBtn = document.getElementById('mobile-island-toggle');
    const barTop = toggleBtn ? toggleBtn.querySelector('.bar-top') : null;
    const barBot = toggleBtn ? toggleBtn.querySelector('.bar-bot') : null;
    const mobileBody = document.getElementById('mobile-island-body');
    const navLinks = mobileIsland.querySelectorAll('.mobile-island-link');
    const footer = mobileIsland.querySelector('.mobile-island-footer');

    if (!toggleBtn || !barTop || !barBot || !mobileBody) return;

    function buildTimeline() {
        if (mobileTl) {
            mobileTl.kill();
            mobileTl = null;
        }

        // Medir altura natural del cuerpo para animación fluida en el Eje Y
        const prevH = mobileBody.style.height;
        const prevDisp = mobileBody.style.display;
        const prevVis = mobileBody.style.visibility;
        mobileBody.style.height = 'auto';
        mobileBody.style.display = 'block';
        mobileBody.style.visibility = 'hidden';
        const targetHeight = mobileBody.offsetHeight || mobileBody.scrollHeight || 340;
        mobileBody.style.height = prevH;
        mobileBody.style.display = prevDisp;
        mobileBody.style.visibility = prevVis;

        mobileTl = gsap.timeline({
            paused: true,
            reversed: true,
            onStart: () => {
                mobileIsland.classList.add('is-open');
                toggleBtn.setAttribute('aria-expanded', 'true');
            },
            onReverseComplete: () => {
                mobileIsland.classList.remove('is-open');
                toggleBtn.setAttribute('aria-expanded', 'false');
                gsap.set(mobileBody, { height: 0, opacity: 0 });
                isMobileExpanded = false;
            },
        });

        // 1. Transformación de las barras a una 'X' perfecta
        mobileTl.to(barTop, {
            y: 3,
            rotation: 45,
            duration: 0.35,
            ease: 'power3.inOut',
        }, 0);

        mobileTl.to(barBot, {
            y: -3,
            rotation: -45,
            duration: 0.35,
            ease: 'power3.inOut',
        }, 0);

        // 2. Expansión fluida de la cápsula estrictamente sobre el Eje Y
        mobileTl.fromTo(mobileBody,
            { height: 0, opacity: 0 },
            {
                height: targetHeight,
                opacity: 1,
                duration: 0.44,
                ease: 'power3.inOut',
            },
            0
        );

        // 3. Stagger de los enlaces de navegación
        if (navLinks.length) {
            mobileTl.fromTo(navLinks,
                { opacity: 0, y: 12 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    stagger: 0.035,
                    ease: 'power2.out',
                },
                0.12
            );
        }

        // 4. Stagger de las acciones del footer
        if (footer) {
            mobileTl.fromTo(footer,
                { opacity: 0, y: 8 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.28,
                    ease: 'power2.out',
                },
                0.2
            );
        }
    }

    function toggleMobile() {
        if (!mobileTl) {
            buildTimeline();
        }
        if (mobileTl.reversed()) {
            isMobileExpanded = true;
            mobileTl.play();
        } else {
            isMobileExpanded = false;
            mobileTl.reverse();
        }
    }

    function closeMobile() {
        if (mobileTl && !mobileTl.reversed()) {
            isMobileExpanded = false;
            mobileTl.reverse();
        }
    }

    if (!mobileIsland.dataset.bound) {
        mobileIsland.dataset.bound = 'true';

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobile();
        });

        // Cerrar al hacer click fuera de la cápsula
        outsideClickHandler = (e) => {
            if (isMobileExpanded && !mobileIsland.contains(e.target)) {
                closeMobile();
            }
        };
        document.addEventListener('click', outsideClickHandler);

        // Cerrar al hacer click en cualquier enlace o botón interno (excepto theme toggle)
        const interactiveLinks = mobileBody.querySelectorAll('a, button:not(#mobile-island-theme-toggle)');
        interactiveLinks.forEach((link) => {
            link.addEventListener('click', () => {
                closeMobile();
            });
        });

        // Reconstruir timeline al redimensionar la ventana (giro de pantalla móvil)
        window.addEventListener('resize', () => {
            if (window.innerWidth < 1024 && isMobileExpanded && mobileTl) {
                buildTimeline();
                mobileTl.progress(1);
            }
        });
    }
}

/**
 * ─────────────────────────────────────────────────────────────
 * 3. LENIS ANCHOR SCROLL
 * ─────────────────────────────────────────────────────────────
 */
function initAnchorScroll() {
    const links = document.querySelectorAll('.island-nav-link, .mobile-island-link');
    links.forEach((link) => {
        if (link.dataset.anchorBound === 'true') return;
        link.dataset.anchorBound = 'true';

        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.includes('#')) {
                const targetId = href.split('#')[1];
                const targetEl = document.getElementById(targetId);
                const lenis = getLenis();

                if (targetEl && lenis) {
                    e.preventDefault();
                    lenis.scrollTo(targetEl, { offset: -30, duration: 1.2 });
                }
            }
        });
    });
}

/**
 * ─────────────────────────────────────────────────────────────
 * 4. BARBA TRANSITION CLEANUP
 * ─────────────────────────────────────────────────────────────
 */
export function cleanupDynamicIsland() {
    if (servicesTrigger) {
        servicesTrigger.kill();
        servicesTrigger = null;
    }
    if (mobileTl) {
        mobileTl.kill();
        mobileTl = null;
    }
    if (outsideClickHandler) {
        document.removeEventListener('click', outsideClickHandler);
        outsideClickHandler = null;
    }

    isDesktopCompacted = false;
    isDesktopHovered = false;
    isMobileExpanded = false;
}
