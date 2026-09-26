import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';

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
 * Animates an array of .framer-char elements with the calibrated Velix Blur Reveal motion curve.
 *
 * @param {HTMLElement[]} chars
 * @param {Object} options
 * @returns {gsap.core.Tween|null}
 */
export function animateVelixChars(chars, options = {}) {
    if (!chars || !chars.length) return null;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        chars.forEach((c) => {
            c.classList.add('is-revealed');
            c.style.filter = 'none';
            c.style.webkitFilter = 'none';
            c.style.transform = 'none';
            c.style.opacity = '1';
        });
        options.onComplete?.();
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
        onComplete: () => {
            chars.forEach((c) => {
                c.classList.add('is-revealed');
                c.style.filter = 'none';
                c.style.webkitFilter = 'none';
                c.style.transform = 'none';
                c.style.opacity = '1';
            });
            options.onComplete?.();
        },
    });
}

/**
 * Automatically binds Velix Blur Reveal to any element marked with [data-velix-target] or [data-blur-reveal].
 * Triggers via ScrollTrigger on entry (top 85%), or immediately if already in view.
 * Elements inside [data-hero-curtain] are skipped here because they are handled
 * synchronously in parallel by initHeroCurtain.
 *
 * @param {HTMLElement} container
 */
export function initVelixReveals(container = document) {
    const targets = container.querySelectorAll('[data-velix-target], [data-blur-reveal]');

    targets.forEach((target) => {
        if (target.closest('[data-hero-curtain]')) {
            return;
        }

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
}
