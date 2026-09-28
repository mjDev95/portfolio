import gsap from 'gsap';
import { ScrollTrigger } from '../../lib/smooth-scroll';

let textRevealCtx = null;

/**
 * Splits text within a DOM element into .framer-word and .framer-char spans,
 * preserving child block structure (e.g., span.d-block, em, etc.).
 *
 * @param {HTMLElement} element
 * @returns {HTMLElement[]} Array of created .framer-char elements in reading order
 */
export function splitTextIntoFramerChars(element) {
    if (!element) return [];

    // Avoid double splitting
    if (element.dataset.velixSplit === 'true') {
        return Array.from(element.querySelectorAll('.framer-char'));
    }

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const rawText = node.textContent;
            if (!rawText || !rawText.trim()) {
                return [node];
            }

            const words = rawText.trim().split(/\s+/);
            const frag = document.createDocumentFragment();

            words.forEach((word, wIdx) => {
                const wordWrapper = document.createElement('span');
                wordWrapper.className = 'framer-word';

                for (const char of word) {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'framer-char';
                    charSpan.textContent = char;
                    charSpan.style.filter = 'blur(12px)';
                    charSpan.style.webkitFilter = 'blur(12px)';
                    wordWrapper.appendChild(charSpan);
                }

                frag.appendChild(wordWrapper);

                if (wIdx < words.length - 1) {
                    const space = document.createTextNode('\u00A0');
                    frag.appendChild(space);
                }
            });

            return [frag];
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.hasAttribute('data-no-split') || node.tagName.toLowerCase() === 'svg') {
                return [node];
            }

            const children = Array.from(node.childNodes);
            node.innerHTML = '';
            children.forEach((child) => {
                const processed = processNode(child);
                processed.forEach((p) => node.appendChild(p));
            });
            return [node];
        }
        return [node];
    }

    const children = Array.from(element.childNodes);
    element.innerHTML = '';
    children.forEach((child) => {
        const processed = processNode(child);
        processed.forEach((p) => element.appendChild(p));
    });

    element.dataset.velixSplit = 'true';
    return Array.from(element.querySelectorAll('.framer-char'));
}

/**
 * Animates an array of .framer-char elements with the calibrated Velix Blur Reveal curve.
 *
 * @param {HTMLElement[]} chars
 * @param {Object} options
 * @returns {gsap.core.Tween|null}
 */
export function animateVelixChars(chars, options = {}) {
    if (!chars || !chars.length) return null;

    const finalize = () => {
        chars.forEach((c) => {
            c.classList.add('is-revealed');
            c.style.filter = 'none';
            c.style.webkitFilter = 'none';
            c.style.transform = 'none';
            c.style.opacity = '1';
        });
        options.onComplete?.();
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finalize();
        return null;
    }

    return gsap.to(chars, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        webkitFilter: 'blur(0px)',
        duration: options.duration ?? 0.7,
        ease: options.ease ?? 'power2.out',
        stagger: options.stagger ?? { each: 0.045, from: 'start' },
        delay: options.delay ?? 0.1,
        onComplete: finalize,
    });
}

/**
 * Initializes Velix Blur Reveal and smooth scroll reveals on elements marked with:
 * - [data-reveal]: text headings/paragraphs get Velix word/char blur; containers/cards get smooth fade+y.
 * - [data-velix-target], [data-blur-reveal]: always character blur reveal.
 *
 * Excludes elements inside [data-hero-curtain] because they are coordinated synchronously by hero-curtain.js.
 *
 * @param {HTMLElement} container
 */
export function initTextReveal(container = document) {
    cleanupTextReveal();

    textRevealCtx = gsap.context(() => {
        // 1. Text elements with explicit Velix targets or typography headings/paragraphs with [data-reveal]
        const explicitTargets = container.querySelectorAll('[data-velix-target], [data-blur-reveal]');
        explicitTargets.forEach((target) => {
            if (target.closest('[data-hero-curtain]')) return;

            const chars = splitTextIntoFramerChars(target);
            if (!chars.length) return;

            ScrollTrigger.create({
                trigger: target,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    animateVelixChars(chars, { delay: 0.05 });
                },
            });
        });

        // 2. Elements with [data-reveal]
        const revealElements = container.querySelectorAll('[data-reveal]');
        const textTagNames = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN'];

        revealElements.forEach((el) => {
            if (el.closest('[data-hero-curtain]') || el.dataset.velixSplit === 'true') return;

            const isText = textTagNames.includes(el.tagName) && el.children.length === 0;

            if (isText && el.textContent.trim().length > 0) {
                // Apply Velix Blur Reveal to standalone text elements with [data-reveal]
                const chars = splitTextIntoFramerChars(el);
                if (chars.length) {
                    ScrollTrigger.create({
                        trigger: el,
                        start: 'top 85%',
                        once: true,
                        onEnter: () => {
                            animateVelixChars(chars, { delay: 0.05 });
                        },
                    });
                    return;
                }
            }

            // Generic container reveal
            gsap.fromTo(
                el,
                { autoAlpha: 0, y: 24 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    clearProps: 'transform',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        once: true,
                    },
                }
            );
        });
    }, container);
}

/**
 * Reverts the text reveal GSAP context, terminating tweens and ScrollTriggers.
 */
export function cleanupTextReveal() {
    if (textRevealCtx) {
        textRevealCtx.revert();
        textRevealCtx = null;
    }
}
