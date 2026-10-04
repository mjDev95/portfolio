import gsap from 'gsap';
import { ScrollTrigger, getLenis } from '../lib/smooth-scroll';

let methodologyCtx = null;

/**
 * Reverts and clears the GSAP context for the methodology section.
 */
export function cleanupMethodology() {
    if (methodologyCtx) {
        methodologyCtx.revert();
        methodologyCtx = null;
    }
}

/**
 * Initializes the Horizontal Pinned Stepper sequence for the Methodology section:
 * - Pins the inner 100vh viewport (`[data-methodology-pin]`) when its section touches top: 0.
 * - Translates the 4-panel track horizontally across 75% of its width (-75% xPercent).
 * - Interpolates the star badge active indicator along the timeline rail in perfect lockstep.
 * - Activates the matching step indicator node as scroll progresses.
 * - Enables direct interactive clicking on milestone nodes to glide smoothly to that phase.
 *
 * @param {HTMLElement} container - Incoming Barba container (or document)
 */
export function initMethodology(container) {
    cleanupMethodology();

    const section = container.querySelector('[data-methodology-section]');
    if (!section) return;

    const pinElement = section.querySelector('[data-methodology-pin]') || section;
    const track = section.querySelector('[data-methodology-track]');
    const railContainer = section.querySelector('[data-methodology-rail]');
    const indicator = section.querySelector('[data-methodology-indicator]');
    const nodes = Array.from(section.querySelectorAll('[data-step-nav]'));

    if (!track || !railContainer || !indicator || !nodes.length) return;

    methodologyCtx = gsap.context(() => {
        // Helper: calculate absolute X coordinate of the center of each step node relative to the rail
        const getNodeCenters = () => {
            const railRect = railContainer.getBoundingClientRect();
            return nodes.map((node) => {
                const r = node.getBoundingClientRect();
                return (r.left + r.width / 2) - railRect.left;
            });
        };

        let centers = getNodeCenters();

        // Initial indicator placement at step 0
        if (centers[0] !== undefined) {
            gsap.set(indicator, { x: centers[0] });
        }

        // Exact pixel scroll distance: ensures the last panel reaches flush with the right boundary
        const getScrollAmount = () => {
            const parentWidth = track.parentElement ? track.parentElement.offsetWidth : window.innerWidth;
            return Math.max(0, track.scrollWidth - parentWidth);
        };

        // Scroll distance along Y axis: generous distance gives organic, comfortable pacing
        const scrollDistance = () => Math.max(window.innerWidth * 2.2, 2200);

        const tl = gsap.timeline({
            scrollTrigger: {
                id: 'methodology-horizontal-trigger',
                trigger: section,
                pin: pinElement,
                pinSpacing: true,
                start: 'top top',
                end: () => '+=' + scrollDistance(),
                scrub: 0.5,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onRefresh: (self) => {
                    centers = getNodeCenters();
                    if (centers[0] !== undefined) {
                        updateIndicator(self.progress);
                    }
                },
                onUpdate: (self) => {
                    updateIndicator(self.progress);
                },
            },
        });

        // 1. Horizontal track translation with Start Hold & End Hold:
        // - 0.00 to 0.05: Start hold on Phase 01 (gives user orientation before moving)
        // - 0.05 to 0.80: Smooth linear translation of all panels to exact end
        // - 0.80 to 1.00: True End hold on Phase 04 (guarantees Phase 04 is 100% visible, fully settled and readable before unpinning)
        tl.fromTo(track, 
            { x: 0 },
            {
                x: () => -getScrollAmount(),
                ease: 'none',
                duration: 0.75,
            },
            0.05
        );

        // Explicit End Hold dummy tween: forces tl.duration() to 1.00 so progress 0.80-1.00 is a true hold
        tl.to({}, { duration: 0.20 }, 0.80);

        // Update the star indicator position and active node classes
        function updateIndicator(progress) {
            if (!centers.length || centers[0] === undefined) return;

            // Map overall scroll progress to translation progress (0.05 to 0.80)
            const moveProgress = gsap.utils.clamp(0, 1, (progress - 0.05) / 0.75);

            const numSegments = nodes.length - 1; // 3 segments between 4 nodes
            const segmentSize = 1 / numSegments; // ~0.3333

            let targetX = centers[0];
            if (moveProgress <= segmentSize) {
                const p = moveProgress / segmentSize;
                targetX = centers[0] + (centers[1] - centers[0]) * p;
            } else if (moveProgress <= segmentSize * 2) {
                const p = (moveProgress - segmentSize) / segmentSize;
                targetX = centers[1] + (centers[2] - centers[1]) * p;
            } else {
                const p = Math.min(1, (moveProgress - segmentSize * 2) / segmentSize);
                targetX = centers[2] + (centers[3] - centers[2]) * p;
            }

            gsap.set(indicator, { x: targetX });

            // Active milestone class: perfectly synchronized with movement
            let activeIndex = 0;
            if (moveProgress >= 0.80) {
                activeIndex = 3;
            } else if (moveProgress >= 0.45) {
                activeIndex = 2;
            } else if (moveProgress >= 0.15) {
                activeIndex = 1;
            } else {
                activeIndex = 0;
            }

            nodes.forEach((node, idx) => {
                if (idx === activeIndex) {
                    node.classList.add('is-active');
                } else {
                    node.classList.remove('is-active');
                }
            });
        }

        // Click-to-navigate on milestone buttons
        // Target ratios place each phase comfortably in its active reading state
        const nodeTargetRatios = [0.02, 0.05 + 0.75 * (1 / 3), 0.05 + 0.75 * (2 / 3), 0.88];

        nodes.forEach((node, idx) => {
            node.addEventListener('click', (e) => {
                e.preventDefault();
                const st = ScrollTrigger.getById('methodology-horizontal-trigger');
                if (!st) return;

                const stepRatio = nodeTargetRatios[idx] ?? (idx / (nodes.length - 1));
                const targetScroll = st.start + (st.end - st.start) * stepRatio;
                const lenis = getLenis();

                if (lenis) {
                    lenis.scrollTo(targetScroll, { duration: 1 });
                } else {
                    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                }
            });
        });
    });
}
