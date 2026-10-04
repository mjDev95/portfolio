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

    let targets = [];

    const quickX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const quickY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });

    window.addEventListener('mousemove', (event) => {
        quickX(event.clientX);
        quickY(event.clientY);
    });

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
        });
    }

    function handleMouseLeave(event) {
        const el = event.currentTarget;
        cursor.classList.remove('is-active');
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.65,
            ease: 'elastic.out(1, 0.4)',
        });
    }

    function handleMouseEnter() {
        cursor.classList.add('is-active');
    }

    // Delegated hover detection for project cards (arrow), blog cards (eye), and draggable track (< >)
    document.addEventListener('mouseover', (event) => {
        const target = event.target;
        if (!target) return;

        // 1. Tarjeta de proyecto -> Flecha hacia arriba
        if (target.closest?.('[data-project-card]')) {
            cursor.classList.remove('is-blog-hover', 'is-drag-hover');
            cursor.classList.add('is-project-hover');
            return;
        }

        // 2. Tarjeta de nota/blog -> Ojito de lectura
        if (target.closest?.('[data-blog-card]')) {
            cursor.classList.remove('is-project-hover', 'is-drag-hover');
            cursor.classList.add('is-blog-hover');
            return;
        }

        // 3. Zona dragueable del blog -> Flechas < >
        if (target.closest?.('[data-home-blog-viewport], [data-home-blog-track]')) {
            cursor.classList.remove('is-project-hover', 'is-blog-hover');
            cursor.classList.add('is-drag-hover');
            return;
        }

        cursor.classList.remove('is-project-hover', 'is-blog-hover', 'is-drag-hover');
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-active', 'is-project-hover', 'is-blog-hover', 'is-drag-hover');
    });

    function refreshMagneticTargets() {
        targets.forEach((el) => {
            el.removeEventListener('mouseenter', handleMouseEnter);
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
        });

        targets = Array.from(document.querySelectorAll('[data-magnetic]'));

        targets.forEach((el) => {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mousemove', handleMouseMove);
            el.addEventListener('mouseleave', handleMouseLeave);
        });
    }

    refreshMagneticTargets();

    return { refreshMagneticTargets };
}
