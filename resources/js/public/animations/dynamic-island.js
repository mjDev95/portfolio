import gsap from 'gsap';
import { getLenis, ScrollTrigger } from '../lib/smooth-scroll';

/**
 * Dynamic Island State Machine (Portavia-style Island):
 * - Inicia COMPLETAMENTE EXPANDIDA (Avatar, Enlaces, Theme, Contact) al aparecer tras el Hero Curtain.
 * - Permanece expandida en todo el Hero Editorial (#hero-editorial-2).
 * - COMPACTA ÚNICAMENTE al alcanzar la sección de Servicios (#services).
 * - REGLA ESTRICTA: "si está compactada y regresamos hacia arriba no deberá aplicar reverse, se debe quedar compactada".
 * - En Desktop: si está compactada, al hacer HOVER se expande temporalmente para navegar y colapsa al salir el cursor.
 * - En Móvil (< 768px): Siempre compactada mostrando avatar + available + punto verde + botón hamburguesa.
 *
 * Arquitectura CSS mutuamente excluyente: IMPOSIBLE que se superpongan textos.
 */

let servicesTrigger = null;
let isCompacted = false;
let isHovered = false;

export function initDynamicIsland() {
    const island = document.getElementById('dynamic-island');
    if (!island) return;

    cleanupDynamicIsland();

    const expandedBlock = island.querySelector('.island-expanded');
    const compactBlock = island.querySelector('.island-compact');

    if (!expandedBlock || !compactBlock) return;

    const servicesEl = document.getElementById('services');

    if (servicesEl) {
        // En la home: solo compacta si ya pasamos físicamente la sección #services
        // Si estamos en el Hero o Hero Editorial, inicia SIEMPRE expandida (completa)
        const currentY = window.scrollY || document.documentElement.scrollTop || 0;
        const servicesRect = servicesEl.getBoundingClientRect();
        const isAlreadyAtServices = servicesRect.top <= window.innerHeight * 0.3 && currentY > 1600;

        if (isAlreadyAtServices) {
            isCompacted = true;
            transitionToCompact(island, expandedBlock, compactBlock, true);
        } else {
            isCompacted = false;
            transitionToExpanded(island, expandedBlock, compactBlock, true);
        }

        servicesTrigger = ScrollTrigger.create({
            trigger: servicesEl,
            start: 'top 30%',
            onEnter: () => {
                isCompacted = true;
                if (!isHovered) {
                    transitionToCompact(island, expandedBlock, compactBlock);
                }
            },
            // REGLA DEL USUARIO: NO reversa al regresar hacia arriba. Se queda compactada.
            invalidateOnRefresh: true,
        });
    } else {
        // En subpáginas sin #services (e.g. /sobre-mi, /contacto, /proyectos)
        const currentY = window.scrollY || document.documentElement.scrollTop || 0;
        if (currentY >= 300) {
            isCompacted = true;
            transitionToCompact(island, expandedBlock, compactBlock, true);
        } else {
            isCompacted = false;
            transitionToExpanded(island, expandedBlock, compactBlock, true);
        }

        servicesTrigger = ScrollTrigger.create({
            start: 300,
            onEnter: () => {
                isCompacted = true;
                if (!isHovered) {
                    transitionToCompact(island, expandedBlock, compactBlock);
                }
            },
            invalidateOnRefresh: true,
        });
    }

    initHoverInteractions(island, expandedBlock, compactBlock);
    initAnchorScroll();
    initMobileDrawer();
}

/**
 * Transición limpia a Compacto:
 * Intercambio con display: none !important vía clase .is-compacted para imposibilitar cualquier colisión de textos
 */
function transitionToCompact(island, expandedBlock, compactBlock, immediate = false) {
    if (window.innerWidth < 768) {
        island.classList.add('is-compacted');
        return;
    }

    if (immediate) {
        island.classList.add('is-compacted');
        gsap.set(compactBlock, { opacity: 1, y: 0 });
        return;
    }

    gsap.to(expandedBlock, {
        opacity: 0,
        y: -4,
        duration: 0.14,
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

/**
 * Transición limpia a Expandido (Al hover en Desktop o estado inicial)
 */
function transitionToExpanded(island, expandedBlock, compactBlock, immediate = false) {
    if (window.innerWidth < 768) {
        return;
    }

    if (immediate) {
        island.classList.remove('is-compacted');
        gsap.set(expandedBlock, { opacity: 1, y: 0 });
        return;
    }

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
 * Desktop Hover Interactions on Compacted Pill:
 * Expande a menú completo al pasar el ratón, colapsa de nuevo al salir.
 */
function initHoverInteractions(island, expandedBlock, compactBlock) {
    island.addEventListener('mouseenter', () => {
        if (window.innerWidth < 768 || !isCompacted) return;
        isHovered = true;
        transitionToExpanded(island, expandedBlock, compactBlock);
    });

    island.addEventListener('mouseleave', () => {
        if (window.innerWidth < 768) return;
        isHovered = false;
        if (isCompacted) {
            transitionToCompact(island, expandedBlock, compactBlock);
        }
    });
}

/**
 * Smooth anchor scrolling via Lenis when clicking nav links
 */
function initAnchorScroll() {
    const links = document.querySelectorAll('.island-nav-link, .mobile-nav-link');
    links.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.includes('#')) {
                const targetId = href.split('#')[1];
                const targetEl = document.getElementById(targetId);
                const lenis = getLenis();

                if (targetEl && lenis) {
                    e.preventDefault();
                    closeMobileDrawer();
                    lenis.scrollTo(targetEl, { offset: -30, duration: 1.2 });
                }
            }
        });
    });
}

/**
 * Mobile drawer open / close handlers (< 768px)
 */
function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-drawer-close');
    const drawer = document.getElementById('navbar-mobile-drawer');
    const mobileThemeBtn = document.getElementById('mobile-theme-toggle');
    const desktopThemeBtn = document.getElementById('theme-toggle');

    if (!drawer) return;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = drawer.classList.contains('is-open');
            if (isOpen) {
                closeMobileDrawer();
            } else {
                openMobileDrawer();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMobileDrawer();
        });
    }

    if (mobileThemeBtn && desktopThemeBtn) {
        mobileThemeBtn.addEventListener('click', () => {
            desktopThemeBtn.click();
        });
    }

    document.addEventListener('click', (e) => {
        if (drawer.classList.contains('is-open') && !drawer.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
            closeMobileDrawer();
        }
    });
}

function openMobileDrawer() {
    const drawer = document.getElementById('navbar-mobile-drawer');
    if (!drawer) return;

    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');

    const navLinks = drawer.querySelectorAll('.mobile-nav-link');
    const footer = drawer.querySelector('.mobile-drawer-footer');
    gsap.fromTo(navLinks, 
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.32, stagger: 0.04, ease: 'power2.out' }
    );
    if (footer) {
        gsap.fromTo(footer,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.35, delay: 0.15, ease: 'power2.out' }
        );
    }
}

function closeMobileDrawer() {
    const drawer = document.getElementById('navbar-mobile-drawer');
    if (!drawer) return;

    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
}

/**
 * Barba lifecycle cleanup
 */
export function cleanupDynamicIsland() {
    if (servicesTrigger) {
        servicesTrigger.kill();
        servicesTrigger = null;
    }
    isCompacted = false;
    isHovered = false;
}
