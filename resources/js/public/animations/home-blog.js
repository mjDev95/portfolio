import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { ScrollTrigger, getLenis } from '../lib/smooth-scroll';

gsap.registerPlugin(Draggable);

let homeBlogCtx = null;
let homeBlogDraggable = null;

/**
 * Destroys and cleans up the GSAP context and Draggable instance for the home blog horizontal track.
 */
export function cleanupHomeBlog() {
    if (homeBlogDraggable) {
        try {
            homeBlogDraggable.kill();
        } catch (e) {
            // Ignore if already killed
        }
        homeBlogDraggable = null;
    }

    if (homeBlogCtx) {
        homeBlogCtx.revert();
        homeBlogCtx = null;
    }
}

/**
 * Initializes the Horizontal Pinned ScrollTrigger with Bi-directional Dragging for the Home Blog:
 * - Scoped strictly to the incoming Barba container.
 * - Pins the blog container while scrubbing horizontally along the X axis.
 * - Draggable integration: users can click and drag horizontally on desktop/touch to scrub smoothly.
 * - Preserves native vertical scroll entirely: touchAction 'pan-y' and proxy mapping ensure vertical scrolling is never blocked.
 * - Automatically snaps to the nearest card edge when dragging or scrolling stops.
 * - Prevents accidental link navigation during drag gestures while preserving click functionality.
 *
 * @param {HTMLElement} container - Current Barba container or document
 */
export function initHomeBlog(container) {
    cleanupHomeBlog();

    const section = container.querySelector('[data-home-blog-section]');
    if (!section) return;

    const track = section.querySelector('[data-home-blog-track]');
    const pinElement = section.querySelector('[data-home-blog-pin]') || section;
    const viewport = section.querySelector('[data-home-blog-viewport]') || section;

    if (!track) return;

    homeBlogCtx = gsap.context(() => {
        const getScrollAmount = () => {
            const viewportWidth = viewport.offsetWidth || window.innerWidth;
            return Math.max(0, track.scrollWidth - viewportWidth);
        };

        // Calcula los puntos de anclaje (snap points) para que las tarjetas nunca queden cortadas a la mitad
        const calculateSnapPoints = () => {
            const maxScroll = getScrollAmount();
            if (maxScroll <= 10) return [0, 1];

            const cards = Array.from(track.querySelectorAll('.home-blog-card-col'));
            if (!cards.length) return [0, 1];

            const rawRatios = [0];
            cards.forEach((card) => {
                const offset = Math.min(card.offsetLeft, maxScroll);
                const ratio = offset / maxScroll;
                rawRatios.push(ratio);
            });
            rawRatios.push(1);

            const uniqueRatios = Array.from(new Set(rawRatios.map((r) => Number(r.toFixed(4))))).sort((a, b) => a - b);
            const points = [0];

            uniqueRatios.forEach((ratio) => {
                // Mapear el ratio al rango de movimiento activo en el timeline (0.05 a 0.90)
                const progress = 0.05 + ratio * 0.85;
                points.push(Number(progress.toFixed(4)));
            });

            points.push(1);
            return Array.from(new Set(points)).sort((a, b) => a - b);
        };

        let snapPoints = calculateSnapPoints();

        // Distancia de scroll vertical: ritmo orgánico adaptado a la cantidad de desplazamiento
        const scrollDistance = () => Math.max(getScrollAmount() * 1.35, 1400);

        const tl = gsap.timeline({
            scrollTrigger: {
                id: 'home-blog-horizontal-trigger',
                trigger: section,
                pin: pinElement,
                pinSpacing: true,
                start: 'top top',
                end: () => '+=' + scrollDistance(),
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                snap: {
                    snapTo: (value) => gsap.utils.snap(snapPoints, value),
                    duration: { min: 0.25, max: 0.55 },
                    delay: 0.15,
                    ease: 'power2.out',
                },
                onRefresh: (self) => {
                    snapPoints = calculateSnapPoints();
                    const amount = getScrollAmount();
                    if (amount <= 10) {
                        self.disable();
                    } else {
                        self.enable();
                    }
                },
            },
        });

        // Desplazamiento horizontal lineal sincronizado con el scroll vertical
        tl.fromTo(track,
            { x: 0 },
            {
                x: () => -getScrollAmount(),
                ease: 'none',
                duration: 0.85,
            },
            0.05
        );

        // Hold final para garantizar lectura cómoda de las últimas notas antes de desanclar
        tl.to({}, { duration: 0.10 }, 0.90);

        // ─────────────────────────────────────────────────────────────
        // Integración Draggable sin afectar el scroll vertical
        // ─────────────────────────────────────────────────────────────
        const proxy = document.createElement('div');
        let startScroll = 0;
        let dragActive = false;

        homeBlogDraggable = Draggable.create(proxy, {
            trigger: viewport,
            type: 'x',
            minimumMovement: 6,
            dragClickables: false,
            cursor: 'grab',
            activeCursor: 'grabbing',
            onPressInit() {
                dragActive = false;
                const st = tl.scrollTrigger;
                if (!st) return;

                const lenis = getLenis();
                startScroll = lenis ? lenis.scroll : st.scroll();
            },
            onDrag() {
                const st = tl.scrollTrigger;
                if (!st) return;

                dragActive = true;
                track.classList.add('is-dragging');

                const cursor = document.getElementById('magnetic-cursor');
                if (cursor) {
                    cursor.classList.remove('is-project-hover', 'is-blog-hover');
                    cursor.classList.add('is-drag-hover');
                }

                const maxScroll = getScrollAmount();
                if (maxScroll <= 10) return;

                // Delta en X: arrastrar a la izquierda (-delta) incrementa el scroll para avanzar
                const deltaX = this.x - this.startX;
                const scrollSpan = st.end - st.start;
                const scrollDelta = -(deltaX / maxScroll) * scrollSpan;
                const targetScroll = gsap.utils.clamp(st.start, st.end, startScroll + scrollDelta);

                const lenis = getLenis();
                if (lenis) {
                    lenis.scrollTo(targetScroll, { immediate: true });
                } else {
                    st.scroll(targetScroll);
                }
            },
            onDragEnd() {
                track.classList.remove('is-dragging');
                const cursor = document.getElementById('magnetic-cursor');
                if (cursor) {
                    cursor.classList.remove('is-drag-hover');
                }
                setTimeout(() => {
                    dragActive = false;
                }, 80);
            },
        })[0];

        // Prevenir navegación accidental de enlaces al arrastrar
        const links = Array.from(track.querySelectorAll('a'));
        links.forEach((link) => {
            link.addEventListener('click', (e) => {
                if (dragActive) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, { capture: true });
        });
    });
}
