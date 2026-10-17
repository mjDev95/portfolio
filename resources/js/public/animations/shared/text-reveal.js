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
    element.classList.add('is-revealed');
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

    const isInFooter = Boolean(element.closest('#main-footer, .footer-scroll-wrapper, footer'));
    const triggerEl = options.trigger || (isInFooter ? (element.closest('#main-footer') || element) : element);
    const startPoint = options.start || (isInFooter ? 'top 95%' : 'top 85%');

    const trigger = ScrollTrigger.create({
        trigger: triggerEl,
        start: startPoint,
        once: isInFooter, // En el footer ejecutar once para que nunca quede en opacity: 0 por rebotes de scroll
        onEnter: () => tl.play(),
        onLeaveBack: () => {
            if (!isInFooter) {
                chars.forEach((c) => c.classList.remove('is-revealed'));
                element.classList.remove('is-revealed');
                tl.reverse();
            }
        },
        onEnterBack: () => tl.play(),
    });

    const rect = triggerEl.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        tl.play();
    }

    return { timeline: tl, trigger, chars };
}

/**
 * Orchestrates Option 2: "Horizontal Stagger Ribbon & Depth Defocus" Timeline
 * for Editorial Detail Headers (Projects, Blog, or any CPT single view):
 * - Act 1: Monumental title performs Character Blur Reveal in solitary focus.
 * - Act 2: Breadcrumbs reveal with "Decal Stamp" micro-bounce & focus.
 * - Act 3: Metadata bar columns reveal with "Depth Aperture" lens defocus (staggered blur to crisp).
 * - Act 4: Share/action buttons pop with subtle spring.
 *
 * @param {HTMLElement} headerEl - Parent container or header
 * @param {Object} options
 * @returns {gsap.core.Timeline|null}
 */
export function createEditorialHeaderTimeline(headerEl, options = {}) {
    if (!headerEl) return null;

    const rootScope = headerEl.closest('[data-barba="container"]') || headerEl.parentElement || document;
    const titleEl = headerEl.querySelector('h1[data-title-blur-reveal]') ||
                    rootScope.querySelector('h1[data-title-blur-reveal]');
    const breadcrumbs = rootScope.querySelector('[data-detail-breadcrumbs], .public-breadcrumbs');
    const metaBar = rootScope.querySelector('[data-detail-meta]');

    if (!titleEl) return null;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const titleChars = splitTextIntoChars(titleEl);

    if (isReduced) {
        finalizeBlurChars(titleChars, titleEl);
        if (breadcrumbs) {
            breadcrumbs.classList.add('is-revealed');
            breadcrumbs.style.opacity = '1';
            breadcrumbs.style.visibility = 'visible';
            breadcrumbs.style.transform = 'none';
        }
        if (metaBar) {
            metaBar.classList.add('is-revealed');
            metaBar.style.opacity = '1';
            metaBar.style.visibility = 'visible';
            metaBar.style.transform = 'none';
        }
        options.onComplete?.();
        return null;
    }

    // Preparación defensiva Anti-FOUC
    prepareBlurChars(titleChars, { y: 16 });
    titleEl.style.opacity = '1';
    titleEl.style.visibility = 'visible';

    // Sub-elementos de breadcrumbs
    const crumbItems = breadcrumbs ? Array.from(breadcrumbs.querySelectorAll('.breadcrumb-item')) : [];
    if (crumbItems.length) {
        gsap.set(crumbItems, {
            opacity: 0,
            y: -12,
            scale: 1.05,
            filter: 'blur(8px)',
            webkitFilter: 'blur(8px)',
        });
    } else if (breadcrumbs) {
        gsap.set(breadcrumbs, { opacity: 0, y: -12 });
    }

    // Sub-elementos de metadatos (columnas y botones)
    const metaCols = metaBar ? Array.from(metaBar.querySelectorAll(':scope > div > div, .d-flex.flex-column')) : [];
    const metaButtons = metaBar ? Array.from(metaBar.querySelectorAll('.social-share-tile, x-btn, #btn-open-share-modal')) : [];

    if (metaCols.length) {
        gsap.set(metaCols, {
            opacity: 0,
            y: 18,
            scale: 0.96,
            filter: 'blur(14px)',
            webkitFilter: 'blur(14px)',
        });
    }

    if (metaButtons.length) {
        gsap.set(metaButtons, {
            opacity: 0,
            scale: 0.75,
            rotation: -6,
        });
    }

    if (metaBar && !metaCols.length && !metaButtons.length) {
        gsap.set(metaBar, { opacity: 0, y: 18 });
    }

    // Creación de la línea de tiempo GSAP
    const masterTl = gsap.timeline({
        delay: options.delay ?? 0.1,
        paused: options.paused ?? false,
        onComplete: () => {
            finalizeBlurChars(titleChars, titleEl);
            if (breadcrumbs) {
                breadcrumbs.classList.add('is-revealed');
                breadcrumbs.style.opacity = '1';
                breadcrumbs.style.visibility = 'visible';
                gsap.set(breadcrumbs, { clearProps: 'opacity,visibility,transform' });
                crumbItems.forEach((c) => {
                    c.style.filter = 'none';
                    c.style.webkitFilter = 'none';
                    c.style.transform = 'none';
                    c.style.opacity = '1';
                });
            }
            if (metaBar) {
                metaBar.classList.add('is-revealed');
                metaBar.style.opacity = '1';
                metaBar.style.visibility = 'visible';
                gsap.set(metaBar, { clearProps: 'opacity,visibility,transform' });
                metaCols.forEach((col) => {
                    col.style.filter = 'none';
                    col.style.webkitFilter = 'none';
                    col.style.transform = 'none';
                    col.style.opacity = '1';
                });
                metaButtons.forEach((btn) => {
                    btn.style.transform = 'none';
                    btn.style.opacity = '1';
                });
            }
            options.onComplete?.();
        },
    });

    // Acto 1: Animación de caracteres del título (duración 0.75s)
    const staggerAmount = Math.min(titleChars.length * 0.035, 1.0);
    masterTl.to(titleChars, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        webkitFilter: 'blur(0px)',
        duration: 0.75,
        ease: 'power2.out',
        stagger: { amount: staggerAmount, from: 'start' },
    }, 0);

    // Momento en que el título ya está consolidado (75% del camino)
    const triggerNextAt = Math.max(0.35, staggerAmount * 0.75);

    // Acto 2: Breadcrumbs "Decal Stamp"
    if (crumbItems.length) {
        masterTl.call(() => {
            if (breadcrumbs) {
                breadcrumbs.classList.add('is-revealed');
                breadcrumbs.style.opacity = '1';
                breadcrumbs.style.visibility = 'visible';
            }
        }, null, triggerNextAt);

        masterTl.to(crumbItems, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            webkitFilter: 'blur(0px)',
            duration: 0.5,
            ease: 'back.out(1.5)',
            stagger: 0.06,
        }, triggerNextAt);
    } else if (breadcrumbs) {
        masterTl.call(() => {
            breadcrumbs.classList.add('is-revealed');
            breadcrumbs.style.opacity = '1';
            breadcrumbs.style.visibility = 'visible';
        }, null, triggerNextAt);

        masterTl.to(breadcrumbs, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: 'power2.out',
        }, triggerNextAt);
    }

    // Acto 3: Columnas de Metadatos "Depth Aperture"
    const metaStartAt = triggerNextAt + 0.15;
    if (metaBar) {
        masterTl.call(() => {
            metaBar.classList.add('is-revealed');
            metaBar.style.opacity = '1';
            metaBar.style.visibility = 'visible';
        }, null, metaStartAt);
    }

    if (metaCols.length) {
        masterTl.to(metaCols, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            webkitFilter: 'blur(0px)',
            duration: 0.65,
            ease: 'expo.out',
            stagger: 0.08,
        }, metaStartAt);
    } else if (metaBar) {
        masterTl.to(metaBar, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
        }, metaStartAt);
    }

    // Acto 4: Botones sociales / Enlaces
    if (metaButtons.length) {
        masterTl.to(metaButtons, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.55,
            ease: 'back.out(1.8)',
            stagger: 0.06,
        }, metaStartAt + 0.2);
    }

    return masterTl;
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
        // 0. Si el contenedor contiene un encabezado editorial de detalle ([data-detail-header]),
        // orquestar la línea de tiempo cinematográfica completa
        const detailHeader = container.querySelector('[data-detail-header]');
        const detailTitle = detailHeader?.querySelector?.('h1[data-title-blur-reveal]') ||
                            container.querySelector('h1[data-title-blur-reveal]');

        if (detailHeader && detailTitle) {
            createEditorialHeaderTimeline(detailHeader, { delay: 0.15 });
        }

        // 1. Elementos explícitos con títulos editoriales o targets de desenfoque de caracteres fuera de detail-header
        // Buscamos dentro de container Y también dentro de #main-footer (que vive fuera del container de Barba)
        const footerEl = document.getElementById('main-footer');
        const containerTargets = Array.from(container.querySelectorAll(
            '[data-title-blur-reveal], [data-char-blur-reveal], [data-blur-reveal], h2.hero-statement, h2.services-main-title'
        ));
        const footerTargets = footerEl ? Array.from(footerEl.querySelectorAll(
            '[data-title-blur-reveal], [data-char-blur-reveal], [data-blur-reveal]'
        )) : [];

        const explicitTargets = [...new Set([...containerTargets, ...footerTargets])];

        explicitTargets.forEach((target) => {
            if ((target.closest('[data-hero-curtain]') && !target.closest('[data-editorial-overlay]')) || target.closest('[data-selected-cases]')) return;
            if (target === detailTitle || target.closest('[data-detail-header]')) return;
            createTextRevealTrigger(target);
        });

        // 2. Elementos marcados con [data-reveal] contextual
        const revealElements = container.querySelectorAll('[data-reveal]');
        const textTagNames = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN'];

        revealElements.forEach((el) => {
            if ((el.closest('[data-hero-curtain]') && !el.closest('[data-editorial-overlay]')) || el.closest('[data-selected-cases]') || el.dataset.textSplit === 'true') return;

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
