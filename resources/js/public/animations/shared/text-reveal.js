import gsap from 'gsap';
import { ScrollTrigger } from '../../lib/smooth-scroll';

let textRevealCtx = null;

/**
 * Splits text within a DOM element into .split-word and .split-char spans,
 * preserving existing child DOM nodes (e.g., span.d-block, em, svg, etc.).
 *
 * @param {HTMLElement} element
 * @returns {HTMLElement[]} Array of created .split-char elements in reading order
 */
export function splitTextIntoChars(element) {
    if (!element) return [];

    // Avoid double splitting
    if (element.dataset.textSplit === 'true') {
        return Array.from(element.querySelectorAll('.split-char'));
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

    element.dataset.textSplit = 'true';
    return Array.from(element.querySelectorAll('.split-char'));
}

/**
 * Prepares character spans with initial hidden blurred states (anti-FOUC).
 *
 * @param {HTMLElement[]} chars
 * @param {Object} options
 */
export function prepareBlurChars(chars, options = {}) {
    if (!chars || !chars.length) return;

    gsap.set(chars, {
        opacity: options.opacity ?? 0,
        y: options.y ?? 16,
        filter: options.filter ?? 'blur(12px)',
        webkitFilter: options.filter ?? 'blur(12px)',
    });
}

/**
 * Marks character spans and optional parent container as fully revealed.
 * Removes active CSS filters and transforms to ensure crisp subpixel rendering.
 *
 * @param {HTMLElement[]} chars
 * @param {HTMLElement|null} parentEl
 */
export function finalizeBlurChars(chars, parentEl = null) {
    if (parentEl) {
        parentEl.classList.add('is-revealed');
        parentEl.style.opacity = '1';
        parentEl.style.visibility = 'visible';
    }
    if (chars && chars.length) {
        chars.forEach((c) => {
            c.classList.add('is-revealed');
            c.style.filter = 'none';
            c.style.webkitFilter = 'none';
            c.style.transform = 'none';
            c.style.opacity = '1';
        });
    }
}

/**
 * Animates an array of .split-char elements with the calibrated Character Blur Reveal curve.
 *
 * @param {HTMLElement[]} chars
 * @param {Object} options
 * @returns {gsap.core.Tween|null}
 */
export function animateBlurChars(chars, options = {}) {
    if (!chars || !chars.length) return null;

    const parentEl = chars[0]?.closest?.('[data-title-blur-reveal], [data-blur-reveal], [data-char-blur-reveal], h1, h2, h3, h4, h5, h6, p');
    if (parentEl) {
        parentEl.style.visibility = 'visible';
        parentEl.style.opacity = '1';
    }

    const finalize = () => {
        finalizeBlurChars(chars, parentEl);
        options.onComplete?.();
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finalize();
        return null;
    }

    prepareBlurChars(chars, { y: 16 });

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
 * Creates a reusable ScrollTrigger or viewport-triggered blur reveal for a single element.
 *
 * @param {HTMLElement} element
 * @param {Object} options
 * @returns {Object|null}
 */
export function createTextRevealTrigger(element, options = {}) {
    if (!element) return null;

    const chars = splitTextIntoChars(element);
    if (!chars.length) return null;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finalizeBlurChars(chars, element);
        return null;
    }

    prepareBlurChars(chars, { y: 16 });
    element.style.opacity = '1';
    element.style.visibility = 'visible';

    const tl = gsap.timeline({ paused: true });
    const staggerAmount = Math.min(chars.length * 0.035, 1.1);

    tl.to(chars, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        webkitFilter: 'blur(0px)',
        duration: options.duration ?? 0.75,
        ease: options.ease ?? 'power2.out',
        stagger: { amount: staggerAmount, from: 'start' },
        onComplete: () => finalizeBlurChars(chars, element),
    });

    const triggerEl = options.trigger || (element.closest('#main-footer') ? element.closest('#main-footer') : element);
    const startPoint = options.start || (element.closest('#main-footer') ? 'top 90%' : 'top 85%');

    const trigger = ScrollTrigger.create({
        trigger: triggerEl,
        start: startPoint,
        onEnter: () => tl.play(),
        onLeaveBack: () => {
            chars.forEach((c) => c.classList.remove('is-revealed'));
            element.classList.remove('is-revealed');
            tl.reverse();
        },
        onEnterBack: () => tl.play(),
    });

    const rect = triggerEl.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        tl.play();
    }

    return { timeline: tl, trigger, chars };
}

/**
 * Initializes Kinetic Character Blur Reveal on marked elements across the incoming container.
 * Scoped and reversible within a gsap.context().
 *
 * @param {HTMLElement} container
 */
export function initTextReveal(container = document) {
    cleanupTextReveal();

    textRevealCtx = gsap.context(() => {
        // 1. Elementos explícitos con títulos editoriales o targets de desenfoque de caracteres
        const explicitTargets = container.querySelectorAll(
            '[data-title-blur-reveal], [data-char-blur-reveal], [data-blur-reveal], h2.hero-statement, h2.services-main-title'
        );

        explicitTargets.forEach((target) => {
            if (target.closest('[data-hero-curtain]') || target.closest('[data-selected-cases]')) return;
            createTextRevealTrigger(target);
        });

        // 2. Elementos marcados con [data-reveal] contextual
        const revealElements = container.querySelectorAll('[data-reveal]');
        const textTagNames = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN'];

        revealElements.forEach((el) => {
            if (el.closest('[data-hero-curtain]') || el.closest('[data-selected-cases]') || el.dataset.textSplit === 'true') return;

            const isText = textTagNames.includes(el.tagName) && el.children.length === 0;

            if (isText && el.textContent.trim().length > 0) {
                const chars = splitTextIntoChars(el);
                if (chars.length) {
                    const elRect = el.getBoundingClientRect();
                    if (elRect.top < window.innerHeight * 0.85 && elRect.bottom > 0) {
                        animateBlurChars(chars, { delay: 0.05 });
                    } else {
                        ScrollTrigger.create({
                            trigger: el,
                            start: 'top 85%',
                            once: true,
                            onEnter: () => {
                                animateBlurChars(chars, { delay: 0.05 });
                            },
                        });
                    }
                    return;
                }
            }

            // Reveal estándar fade+y para bloques/contenedores genéricos
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
 * Reverts the text reveal GSAP context, terminating tweens and ScrollTriggers cleanly.
 */
export function cleanupTextReveal() {
    if (textRevealCtx) {
        textRevealCtx.revert();
        textRevealCtx = null;
    }
}
