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
        return Array.from(element.querySelectorAll('.split-char, .framer-char'));
    }

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const rawText = node.textContent;
            if (!rawText || !rawText.trim()) {
                return [node];
            }

            const leadingSpace = /^\s+/.test(rawText);
            const trailingSpace = /\s+$/.test(rawText);
            const words = rawText.trim().split(/\s+/);
            const frag = document.createDocumentFragment();

            if (leadingSpace) {
                frag.appendChild(document.createTextNode('\u00A0'));
            }

            words.forEach((word, wIdx) => {
                if (!word) return;
                const wordWrapper = document.createElement('span');
                wordWrapper.className = 'split-word';

                for (const char of word) {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'split-char';
                    charSpan.textContent = char;
                    charSpan.style.filter = 'blur(12px)';
                    charSpan.style.webkitFilter = 'blur(12px)';
                    wordWrapper.appendChild(charSpan);
                }

                frag.appendChild(wordWrapper);

                if (wIdx < words.length - 1) {
                    frag.appendChild(document.createTextNode('\u00A0'));
                }
            });

            if (trailingSpace) {
                frag.appendChild(document.createTextNode('\u00A0'));
            }

            return [frag];
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.hasAttribute('data-no-split') || node.tagName.toLowerCase() === 'svg') {
                node.classList.add('split-char');
                node.style.filter = 'blur(12px)';
                node.style.webkitFilter = 'blur(12px)';
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
    return Array.from(element.querySelectorAll('.split-char, .framer-char'));
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

    gsap.set(chars, {
        opacity: 0,
        y: 16,
        filter: 'blur(12px)',
        webkitFilter: 'blur(12px)',
    });

    const staggerAmount = Math.min(chars.length * 0.035, 1.1);

    return gsap.to(chars, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        webkitFilter: 'blur(0px)',
        duration: options.duration ?? 0.75,
        ease: options.ease ?? 'power2.out',
        stagger: options.stagger ?? { amount: staggerAmount, from: 'start' },
        delay: options.delay ?? 0.05,
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
        // 1. Text elements with explicit Velix targets, [data-blur-reveal], or section H2s
        const explicitTargets = container.querySelectorAll('[data-velix-target], [data-blur-reveal], h2.hero-statement, h2.services-main-title');
        explicitTargets.forEach((target) => {
            if (target.closest('[data-hero-curtain]') || target.closest('[data-selected-cases]')) return;
            if (target.dataset.velixSplit === 'true') return;

            const chars = splitTextIntoFramerChars(target);
            if (!chars.length) return;

            const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (isReduced) {
                chars.forEach((c) => {
                    c.classList.add('is-revealed');
                    c.style.filter = 'none';
                    c.style.webkitFilter = 'none';
                    c.style.transform = 'none';
                    c.style.opacity = '1';
                });
                return;
            }

            gsap.set(chars, {
                opacity: 0,
                y: 16,
                filter: 'blur(12px)',
                webkitFilter: 'blur(12px)',
            });

            const tl = gsap.timeline({ paused: true });
            const staggerAmount = Math.min(chars.length * 0.035, 1.1);

            tl.to(chars, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                webkitFilter: 'blur(0px)',
                duration: 0.75,
                ease: 'power2.out',
                stagger: { amount: staggerAmount, from: 'start' },
                onComplete: () => {
                    chars.forEach((c) => {
                        c.classList.add('is-revealed');
                        c.style.filter = 'none';
                        c.style.webkitFilter = 'none';
                        c.style.transform = 'none';
                        c.style.opacity = '1';
                    });
                },
            });

            const triggerEl = target.closest('#main-footer') ? target.closest('#main-footer') : target;

            ScrollTrigger.create({
                trigger: triggerEl,
                start: target.closest('#main-footer') ? 'top 90%' : 'top 85%',
                onEnter: () => tl.play(),
                onLeaveBack: () => {
                    chars.forEach((c) => c.classList.remove('is-revealed'));
                    tl.reverse();
                },
                onEnterBack: () => tl.play(),
            });

            // Si el elemento ya está dentro del viewport visible al inicializarse, disparar inmediatamente
            const rect = triggerEl.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
                tl.play();
            }
        });

        // 2. Elements with [data-reveal]
        const revealElements = container.querySelectorAll('[data-reveal]');
        const textTagNames = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN'];

        revealElements.forEach((el) => {
            if (el.closest('[data-hero-curtain]') || el.closest('[data-selected-cases]') || el.dataset.velixSplit === 'true') return;

            const isText = textTagNames.includes(el.tagName) && el.children.length === 0;

            if (isText && el.textContent.trim().length > 0) {
                // Apply Velix Blur Reveal to standalone text elements with [data-reveal]
                const chars = splitTextIntoFramerChars(el);
                if (chars.length) {
                    const elRect = el.getBoundingClientRect();
                    if (elRect.top < window.innerHeight * 0.85 && elRect.bottom > 0) {
                        animateVelixChars(chars, { delay: 0.05 });
                    } else {
                        ScrollTrigger.create({
                            trigger: el,
                            start: 'top 85%',
                            once: true,
                            onEnter: () => {
                                animateVelixChars(chars, { delay: 0.05 });
                            },
                        });
                    }
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
