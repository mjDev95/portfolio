import gsap from 'gsap';

let activeTargets = [];
let cursor = null;

function handleMouseEnter() {
    cursor = cursor || document.getElementById('magnetic-cursor');
    if (cursor) {
        cursor.classList.add('is-active');
    }
}

function handleMouseMove(event) {
    const el = event.currentTarget;
    if (el.id === 'nav-magnetic-toggle' && !el.classList.contains('is-visible')) return;
    const inner = el.querySelector('[data-magnetic-inner]');
    const rect = el.getBoundingClientRect();
    const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.35;
    const deltaX = (event.clientX - rect.left - rect.width / 2) * strength;
    const deltaY = (event.clientY - rect.top - rect.height / 2) * strength;

    gsap.to(el, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
    });

    if (inner) {
        gsap.to(inner, {
            x: deltaX * 0.5,
            y: deltaY * 0.5,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto',
        });
    }
}

function handleMouseLeave(event) {
    const el = event.currentTarget;
    const inner = el.querySelector('[data-magnetic-inner]');
    cursor = cursor || document.getElementById('magnetic-cursor');
    if (cursor) {
        cursor.classList.remove('is-active');
    }

    gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
    });

    if (inner) {
        gsap.to(inner, {
            x: 0,
            y: 0,
            duration: 0.55,
            ease: 'elastic.out(1, 0.4)',
            overwrite: 'auto',
        });
    }
}

function handleTouchStart(event) {
    if (!event.touches.length) return;
    const el = event.currentTarget;
    el.__touchStartX = event.touches[0].clientX;
    el.__touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    if (!event.touches.length) return;
    const el = event.currentTarget;
    const inner = el.querySelector('[data-magnetic-inner]');
    const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.38;
    const startX = el.__touchStartX ?? event.touches[0].clientX;
    const startY = el.__touchStartY ?? event.touches[0].clientY;

    const rawX = (event.touches[0].clientX - startX) * strength;
    const rawY = (event.touches[0].clientY - startY) * strength;
    const dist = Math.hypot(rawX, rawY);
    const maxDist = 32;
    const factor = dist > maxDist ? maxDist / dist : 1;

    gsap.to(el, {
        x: rawX * factor,
        y: rawY * factor,
        duration: 0.15,
        ease: 'power1.out',
        overwrite: 'auto',
    });

    if (inner) {
        gsap.to(inner, {
            x: rawX * factor * 0.5,
            y: rawY * factor * 0.5,
            duration: 0.15,
            ease: 'power1.out',
            overwrite: 'auto',
        });
    }
}

function handleTouchEnd(event) {
    const el = event.currentTarget;
    const inner = el.querySelector('[data-magnetic-inner]');

    gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: 'elastic.out(1, 0.35)',
        overwrite: 'auto',
    });

    if (inner) {
        gsap.to(inner, {
            x: 0,
            y: 0,
            duration: 0.55,
            ease: 'elastic.out(1, 0.4)',
            overwrite: 'auto',
        });
    }
}

/**
 * Initializes magnetic pull on all elements with [data-magnetic] inside the container.
 * Supports both mouse and touch with optional [data-magnetic-inner] parallax.
 */
export function initMagnetic(container = document) {
    if (typeof window === 'undefined') return;

    const isCoarse = matchMedia('(pointer: coarse)').matches;
    const elements = container.querySelectorAll('[data-magnetic]');

    elements.forEach((el) => {
        if (el.dataset.magneticBound === 'true') return;
        el.dataset.magneticBound = 'true';

        if (!isCoarse) {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mousemove', handleMouseMove);
            el.addEventListener('mouseleave', handleMouseLeave);
        }

        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: true });
        el.addEventListener('touchend', handleTouchEnd);
        el.addEventListener('touchcancel', handleTouchEnd);

        activeTargets.push(el);
    });
}

/**
 * Cleans up magnetic listeners and resets positions.
 */
export function cleanupMagnetic() {
    activeTargets.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
        el.removeEventListener('touchcancel', handleTouchEnd);
        delete el.dataset.magneticBound;
        gsap.killTweensOf(el, 'x,y');
        gsap.set(el, { x: 0, y: 0 });
    });
    activeTargets = [];
}
