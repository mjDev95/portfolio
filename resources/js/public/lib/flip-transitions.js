import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const LIST_NAMESPACES = ['projects-index', 'blog-index', 'content-index', 'home', 'default'];
const DETAIL_NAMESPACES = ['project-show', 'blog-show', 'content-show'];

// Snapshot handed off from a transition's `leave()` to its `enter()`.
let flipState = null;

function findOriginMedia(trigger, currentContainer) {
    const card = trigger?.closest?.('a[data-flip-card]');

    return card?.querySelector('[data-flip-id]') ?? currentContainer.querySelector('[data-flip-id]');
}

/**
 * Fades out everything in `container` EXCEPT `media` and its ancestor chain,
 * so the shared-element image never itself fades/disappears — only the rest
 * of the page (other cards, headings, captions) dims around it. Walking up
 * from `media` and fading each level's siblings (never the ancestors
 * themselves) is required because CSS opacity on an ancestor would otherwise
 * visually fade `media` too, even if `media`'s own opacity is untouched.
 */
function fadeAroundMedia(container, media, duration = 0.35) {
    if (!media) {
        return gsap.to(container, { autoAlpha: 0, y: -20, duration, ease: 'power2.inOut' });
    }

    const siblings = [];
    let node = media;

    while (node && node !== container && node.parentElement) {
        for (const sibling of node.parentElement.children) {
            if (sibling !== node) {
                siblings.push(sibling);
            }
        }
        node = node.parentElement;
    }

    return gsap.to(siblings, { autoAlpha: 0, y: -20, duration, ease: 'power2.inOut' });
}

/**
 * Fades/scales the detail page's text in, overlapping the tail end of the
 * given Flip timeline so it only becomes visible once the image is
 * essentially settled into its final position — not after a separate delay.
 */
function revealFlipTextAfter(flipTimeline, container) {
    const texts = container.querySelectorAll('[data-flip-text]');

    gsap.set(texts, { autoAlpha: 0, y: 16, scale: 0.98 });

    return gsap.timeline({ onComplete: () => { flipState = null; } })
        .add(flipTimeline)
        .to(texts, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.05 }, '-=0.15');
}

/**
 * Two Barba.js transitions implementing a GSAP Flip "shared element" effect
 * between a card thumbnail (list) and its hero image (detail), in both
 * navigation directions. They take priority over the generic wipe-transition
 * whenever the from/to namespace pair matches (list <-> detail).
 *
 * Flip lifecycle mapped onto Barba hooks:
 *  - First:  `Flip.getState()` captured in `leave()`, while the origin
 *            element is still in the (soon to be replaced) DOM.
 *  - Last:   Barba swaps the container; the target element is already laid
 *            out at its natural final position when `enter()` runs.
 *  - Invert: handled internally by `Flip.from()` — it offsets the target so
 *            it visually starts from the recorded First position.
 *  - Play:   `Flip.from()` animates from Invert to Last (`expo.inOut`).
 */
export function createFlipTransitions() {
    return [
        {
            name: 'flip-to-detail',
            from: { namespace: LIST_NAMESPACES },
            to: { namespace: DETAIL_NAMESPACES },
            leave(data) {
                const media = findOriginMedia(data.trigger, data.current.container);
                flipState = media ? Flip.getState(media, { props: 'borderRadius' }) : null;

                return fadeAroundMedia(data.current.container, media);
            },
            enter(data) {
                const target = data.next.container.querySelector('[data-flip-id]');

                if (!flipState || !target) {
                    return gsap.fromTo(data.next.container, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
                }

                const flip = Flip.from(flipState, {
                    targets: target,
                    duration: 1,
                    ease: 'expo.inOut',
                    absolute: true,
                });

                return revealFlipTextAfter(flip, data.next.container);
            },
        },
        {
            name: 'flip-to-list',
            from: { namespace: DETAIL_NAMESPACES },
            to: { namespace: LIST_NAMESPACES },
            leave(data) {
                const media = data.current.container.querySelector('[data-flip-id]');
                flipState = media ? Flip.getState(media, { props: 'borderRadius' }) : null;

                return fadeAroundMedia(data.current.container, media);
            },
            enter(data) {
                const flipId = flipState?.elements?.[0]?.getAttribute('data-flip-id');
                const target = flipId ? data.next.container.querySelector(`[data-flip-id="${flipId}"]`) : null;

                if (!flipState || !target) {
                    return gsap.fromTo(data.next.container, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
                }

                return Flip.from(flipState, {
                    targets: target,
                    duration: 0.9,
                    ease: 'expo.inOut',
                    absolute: true,
                    onComplete: () => {
                        flipState = null;
                    },
                });
            },
        },
    ];
}
