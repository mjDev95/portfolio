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
}

function handleMouseLeave(event) {
    const el = event.currentTarget;
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
}

/**
 * Initializes magnetic pull on all elements with [data-magnetic] inside the container.
 * Idempotent via dataset flag. Supports custom strength via `data-magnetic-strength`.
 *
 * @param {HTMLElement|Document} container
 */
export function initMagnetic(container = document) {
    if (typeof window === 'undefined' || matchMedia('(pointer: coarse)').matches) {
        return;
    }

    const elements = container.querySelectorAll('[data-magnetic]');

    elements.forEach((el) => {
        if (el.dataset.magneticBound === 'true') return;
        el.dataset.magneticBound = 'true';

        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);
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
        delete el.dataset.magneticBound;
        gsap.killTweensOf(el);
        gsap.set(el, { x: 0, y: 0 });
    });
    activeTargets = [];
}
