import gsap from 'gsap';
import { getLenis, ScrollTrigger } from '../lib/smooth-scroll';
import { buildPixelGrid, schedulePixelWave } from './shared/pixel-wave';
import { initMagnetic } from './shared/magnetic';

let swapTl = null;
let drawerTl = null;
let isDrawerOpen = false;
let boundEvents = false;
let lenisBound = false;

export function isNavDrawerOpen() {
    return isDrawerOpen;
}

export function isNavDrawerClosing() {
    return Boolean(drawerTl && drawerTl.progress() > 0);
}

function getCurrentScrollY(explicitY) {
    if (typeof explicitY === 'number') {
        return explicitY;
    }
    const lenis = getLenis();
    if (lenis && typeof lenis.scroll === 'number') {
        return lenis.scroll;
    }
    return window.scrollY || document.documentElement.scrollTop || 0;
}

function updateActiveNavLinks() {
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const links = document.querySelectorAll('.nav-flat-link, .drawer-nav-link');

    links.forEach((link) => {
        try {
            const url = new URL(link.href, window.location.origin);
            const linkPath = url.pathname.replace(/\/+$/, '') || '/';
            const isActive = linkPath === '/'
                ? currentPath === '/'
                : currentPath === linkPath || currentPath.startsWith(linkPath + '/');
            link.classList.toggle('active', isActive);
        } catch (e) {}
    });
}

function ensureSwapTimeline() {
    const flatBar = document.getElementById('nav-flat-bar');
    const toggle = document.getElementById('nav-magnetic-toggle');
    if (!flatBar || !toggle) return null;

    if (swapTl) return swapTl;

    swapTl = gsap.timeline({
        paused: true,
        onStart: () => {
            flatBar.classList.add('is-hidden');
            toggle.classList.add('is-visible');
        },
        onComplete: () => {
            flatBar.classList.add('is-hidden');
            toggle.classList.add('is-visible');
        },
        onReverseComplete: () => {
            flatBar.classList.remove('is-hidden');
            toggle.classList.remove('is-visible');
            gsap.set(toggle, { x: 0, y: 0 });
        },
    });

    swapTl
        .fromTo(
            flatBar,
            { autoAlpha: 1, y: 0 },
            { autoAlpha: 0, y: -14, duration: 0.22, ease: 'power2.in' },
            0
        )
        .fromTo(
            toggle,
            { autoAlpha: 0, scale: 0.4 },
            { autoAlpha: 1, scale: 1, duration: 0.36, ease: 'back.out(1.7)' },
            0.12
        );

    return swapTl;
}

export function syncScrollSwapState(immediate = false, explicitY = undefined) {
    const flatBar = document.getElementById('nav-flat-bar');
    const toggle = document.getElementById('nav-magnetic-toggle');
    if (!flatBar || !toggle) return;

    const tl = ensureSwapTimeline();
    if (!tl) return;

    const isDrawerActiveOrClosing = isDrawerOpen || Boolean(drawerTl && drawerTl.progress() > 0);
    const shouldShowToggle = window.innerWidth < 1024 || isDrawerActiveOrClosing || getCurrentScrollY(explicitY) > 60;

    if (shouldShowToggle) {
        flatBar.classList.add('is-hidden');
        toggle.classList.add('is-visible');
        if (immediate) {
            tl.progress(1).pause();
        } else if (tl.reversed() || (tl.paused() && tl.progress() < 1)) {
            tl.play();
        }
    } else {
        if (immediate) {
            flatBar.classList.remove('is-hidden');
            toggle.classList.remove('is-visible');
            gsap.set(toggle, { x: 0, y: 0 });
            tl.progress(0).pause();
        } else if (!tl.reversed() && tl.progress() > 0) {
            tl.reverse();
        }
    }
}

function bindScrollSync() {
    const lenis = getLenis();
    if (lenis && !lenisBound) {
        lenisBound = true;
        lenis.on('scroll', ({ scroll }) => {
            syncScrollSwapState(false, scroll);
        });
    }
}

function buildDrawerTimeline() {
    const drawer = document.getElementById('nav-pixel-drawer');
    const gridEl = document.getElementById('drawer-pixel-grid');
    const surface = document.getElementById('drawer-surface');
    const backdrop = document.getElementById('nav-drawer-backdrop');
    const toggle = document.getElementById('nav-magnetic-toggle');
    if (!drawer || !gridEl || !surface) return;

    if (drawerTl) {
        drawerTl.kill();
    }

    const isDesktop = window.innerWidth >= 1024;
    const panelWidth = isDesktop ? (window.innerWidth || 1440) * 0.5 : (window.innerWidth || 390);
    const panelHeight = window.innerHeight || 900;

    const gridState = buildPixelGrid(gridEl, {
        initialOpacity: 0,
        cellClass: 'drawer-pixel-cell',
        cols: isDesktop ? 10 : null,
        width: panelWidth,
        height: panelHeight,
    });

    const barTop = toggle?.querySelector('.bar-top');
    const barBot = toggle?.querySelector('.bar-bot');

    if (barTop && barBot) {
        gsap.set(barTop, { y: -4, rotation: 0 });
        gsap.set(barBot, { y: 4, rotation: 0 });
    }
    gsap.set(surface, { opacity: 0 });
    if (backdrop) gsap.set(backdrop, { opacity: 0 });

    drawerTl = gsap.timeline({
        paused: true,
        reversed: true,
        onStart: () => {
            drawer.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            toggle?.setAttribute('aria-expanded', 'true');
            getLenis()?.stop();
        },
        onReverseComplete: () => {
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            toggle?.setAttribute('aria-expanded', 'false');
            isDrawerOpen = false;
            const wipe = document.getElementById('transition-wipe');
            if (!wipe || wipe.style.visibility === 'hidden') {
                getLenis()?.start();
            }
            syncScrollSwapState(false);
        },
    });

    if (barTop && barBot) {
        drawerTl.to(barTop, { y: 0, rotation: 45, duration: 0.32, ease: 'power2.inOut' }, 0);
        drawerTl.to(barBot, { y: 0, rotation: -45, duration: 0.32, ease: 'power2.inOut' }, 0);
    }

    if (backdrop) {
        drawerTl.to(backdrop, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0);
    }

    const waveEndTime = schedulePixelWave(drawerTl, gridState, {
        fromOpacity: 0,
        toOpacity: 1,
        direction: 'right-to-left',
        startOffset: 0,
    });

    drawerTl.to(
        surface,
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
        Math.max(0.15, waveEndTime - 0.08)
    );
}

export function openNavDrawer() {
    if (!drawerTl) buildDrawerTimeline();
    if (!drawerTl) return;
    isDrawerOpen = true;
    drawerTl.timeScale(1).play();
}

export function closeNavDrawer(immediate = false) {
    if (!drawerTl) return;
    isDrawerOpen = false;
    if (immediate) {
        drawerTl.pause(0);
        const drawer = document.getElementById('nav-pixel-drawer');
        const toggle = document.getElementById('nav-magnetic-toggle');
        drawer?.classList.remove('is-open');
        drawer?.setAttribute('aria-hidden', 'true');
        toggle?.setAttribute('aria-expanded', 'false');
        syncScrollSwapState(true, 0);
        return;
    }
    drawerTl.timeScale(1.35).reverse();
}

export function toggleNavDrawer() {
    if (!drawerTl || drawerTl.reversed()) {
        openNavDrawer();
    } else {
        closeNavDrawer();
    }
}

function bindGlobalDrawerEvents() {
    if (boundEvents) return;
    boundEvents = true;

    ScrollTrigger.addEventListener('refresh', () => {
        syncScrollSwapState(false);
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('#nav-magnetic-toggle')) {
            e.stopPropagation();
            toggleNavDrawer();
            return;
        }
        const drawerLink = e.target.closest('[data-drawer-link]');
        if (isDrawerOpen && drawerLink) {
            const href = drawerLink.getAttribute('href');
            if (href) {
                try {
                    const targetUrl = new URL(href, window.location.origin);
                    const curPath = window.location.pathname.replace(/\/+$/, '') || '/';
                    const nextPath = targetUrl.pathname.replace(/\/+$/, '') || '/';
                    if (targetUrl.origin === window.location.origin && curPath === nextPath && !targetUrl.hash) {
                        e.preventDefault();
                        e.stopPropagation();
                        closeNavDrawer(false);
                        return;
                    }
                } catch (_) {}
            }
            closeNavDrawer(false);
            return;
        }
        if (isDrawerOpen && e.target.closest('#nav-drawer-backdrop')) {
            closeNavDrawer(false);
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isDrawerOpen) {
            closeNavDrawer();
        }
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            syncScrollSwapState(true);
            if (!isDrawerOpen) {
                buildDrawerTimeline();
            }
        }, 200);
    });
}

function initAnchorScroll() {
    const links = document.querySelectorAll('.nav-flat-link, .drawer-nav-link');
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

export function initDynamicIsland() {
    const header = document.getElementById('site-header');
    const drawer = document.getElementById('nav-pixel-drawer');
    if (!header) return;

    initMagnetic(header);
    if (drawer) initMagnetic(drawer);
    updateActiveNavLinks();
    ensureSwapTimeline();
    bindScrollSync();
    syncScrollSwapState(true);
    requestAnimationFrame(() => syncScrollSwapState(true));

    if (!drawerTl) {
        buildDrawerTimeline();
    }

    initAnchorScroll();
    bindGlobalDrawerEvents();
}

export function cleanupDynamicIsland(immediate = false) {
    if (isDrawerOpen || isNavDrawerClosing()) {
        closeNavDrawer(immediate);
    }
}

export function syncDesktopIslandState(immediate = true) {
    updateActiveNavLinks();
    syncScrollSwapState(immediate, 0);
}

export function markNavigated() {}
export function isDesktopIslandCompacted() { return true; }
export function accommodateDynamicIsland() {}
