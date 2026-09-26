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
                isDesktopCompacted = true;
                if (!isDesktopHovered) {
                    transitionDesktopToCompact(desktopIsland, expandedBlock, compactBlock, false);
                }
            },
            invalidateOnRefresh: true,
        });
    }

    // Hover interactions en Desktop cuando está compactada
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

function transitionDesktopToCompact(island, expandedBlock, compactBlock, immediate = false) {
    if (immediate) {
        island.classList.add('is-compacted');
        gsap.set(compactBlock, { opacity: 1, y: 0 });
        return;
    }

    gsap.killTweensOf([expandedBlock, compactBlock]);
    gsap.to(expandedBlock, {
        opacity: 0,
        y: -4,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
            island.classList.add('is-compacted');
            gsap.fromTo(compactBlock,
                { opacity: 0, y: 4 },
                { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
            );
        },
    });
}

function transitionDesktopToExpanded(island, expandedBlock, compactBlock, immediate = false) {
    if (immediate) {
        island.classList.remove('is-compacted');
        gsap.set(expandedBlock, { opacity: 1, y: 0 });
        return;
    }

    gsap.killTweensOf([expandedBlock, compactBlock]);
    gsap.to(compactBlock, {
        opacity: 0,
        y: 4,
        duration: 0.12,
        ease: 'power2.in',
        onComplete: () => {
            island.classList.remove('is-compacted');
            gsap.fromTo(expandedBlock,
                { opacity: 0, y: -4 },
                { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
            );
        },
    });
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

/**
 * ─────────────────────────────────────────────────────────────
 * 3. LENIS ANCHOR SCROLL
 * ─────────────────────────────────────────────────────────────
 */
function initAnchorScroll() {
    const links = document.querySelectorAll('.island-nav-link, .mobile-island-link');
    links.forEach((link) => {
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
