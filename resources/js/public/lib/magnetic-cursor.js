import gsap from 'gsap';

/**
 * Lightweight magnetic cursor. Re-queries `[data-magnetic]` targets on
 * every call to `refreshMagneticTargets()` so newly injected Barba
 * container content is picked up without re-initializing the cursor
 * itself (the cursor element lives outside the Barba container).
 */
export function initMagneticCursor() {
    const cursor = document.getElementById('magnetic-cursor');

    if (!cursor || matchMedia('(pointer: coarse)').matches) {
        return { refreshMagneticTargets: () => {} };
    }

    const quickX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const quickY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });

    window.addEventListener('mousemove', (event) => {
        quickX(event.clientX);
        quickY(event.clientY);
    });

    let targets = [];

    const onEnter = () => cursor.classList.add('is-active');
    const onLeave = () => cursor.classList.remove('is-active');

    function refreshMagneticTargets() {
        targets.forEach((el) => {
            el.removeEventListener('mouseenter', onEnter);
            el.removeEventListener('mouseleave', onLeave);
        });

        targets = Array.from(document.querySelectorAll('[data-magnetic]'));

        targets.forEach((el) => {
            el.addEventListener('mouseenter', onEnter);
            el.addEventListener('mouseleave', onLeave);
        });
    }

    refreshMagneticTargets();

    return { refreshMagneticTargets };
}
