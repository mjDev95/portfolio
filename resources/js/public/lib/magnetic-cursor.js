import gsap from 'gsap';
import { initMagnetic } from '../animations/shared/magnetic';

/**
 * Lightweight magnetic cursor + universal [data-magnetic] delegation.
 */
export function initMagneticCursor() {
    initMagnetic(document);

    const cursor = document.getElementById('magnetic-cursor');
    if (!cursor || matchMedia('(pointer: coarse)').matches) {
        return {
            refreshMagneticTargets: () => initMagnetic(document),
        };
    }

    const quickX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const quickY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });

    window.addEventListener('mousemove', (event) => {
        quickX(event.clientX);
        quickY(event.clientY);
    });

    document.addEventListener('mouseover', (event) => {
        const target = event.target;
        if (!target) return;

        if (target.closest?.('[data-project-card]')) {
            cursor.classList.remove('is-blog-hover', 'is-drag-hover');
            cursor.classList.add('is-project-hover');
            return;
        }

        if (target.closest?.('[data-blog-card]')) {
            cursor.classList.remove('is-project-hover', 'is-drag-hover');
            cursor.classList.add('is-blog-hover');
            return;
        }

        cursor.classList.remove('is-project-hover', 'is-blog-hover', 'is-drag-hover');
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-active', 'is-project-hover', 'is-blog-hover', 'is-drag-hover');
    });

    return {
        refreshMagneticTargets: () => initMagnetic(document),
    };
}
