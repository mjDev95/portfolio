import gsap from 'gsap';
import { ScrollTrigger, getLenis, resizeScroll } from '../lib/smooth-scroll';

let blogCtx = null;
let blogObserver = null;

export function cleanupBlogAnimations() {
    if (blogCtx) {
        blogCtx.revert();
        blogCtx = null;
    }
    if (blogObserver) {
        blogObserver.disconnect();
        blogObserver = null;
    }
    const progressBar = document.getElementById('reading-progress-bar');
    if (progressBar) {
        progressBar.style.transform = 'scaleX(0)';
    }
}

/**
 * Initializes single blog article features:
 * 1. Automatic Table of Contents generator from <h2> and <h3> tags
 * 2. ScrollSpy synchronized with Lenis and ScrollTrigger
 * 3. 2px fixed reading progress bar linked to article scroll
 * 4. Clipboard copy button with tactile micro-animation
 *
 * @param {HTMLElement} container - Incoming Barba container
 */
export function initBlogSingle(container) {
    const prose = container.querySelector('#article-prose-content') || container.querySelector('.prose-editorial');
    if (!prose) return;

    cleanupBlogAnimations();

    blogCtx = gsap.context(() => {
        // ── 1. Generador de Table of Contents (TOC) & ScrollSpy ──
        const tocList = container.querySelector('#toc-list');
        const headings = Array.from(prose.querySelectorAll('h2, h3'));

        if (tocList) {
            tocList.innerHTML = '';

            if (headings.length > 0) {
                const usedIds = new Set();

                const setActiveLink = (targetId) => {
                    tocList.querySelectorAll('.toc-link').forEach((link) => {
                        const isMatch = link.getAttribute('href') === `#${targetId}`;
                        link.classList.toggle('is-active', isMatch);
                    });
                };

                headings.forEach((heading, index) => {
                    let id = heading.id;
                    if (!id) {
                        const rawText = heading.textContent || `seccion-${index + 1}`;
                        id = rawText
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)+/g, '') || `heading-${index + 1}`;

                        if (usedIds.has(id)) {
                            id = `${id}-${index + 1}`;
                        }
                        heading.id = id;
                    }
                    usedIds.add(id);

                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `#${id}`;
                    link.textContent = heading.textContent;
                    link.className = `toc-link ${heading.tagName === 'H3' ? 'toc-level-3' : 'toc-level-2'}`;

                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const lenis = getLenis();
                        const target = document.getElementById(id);
                        if (!target) return;

                        if (lenis) {
                            lenis.scrollTo(target, { offset: -90, duration: 1.1 });
                        } else {
                            const rect = target.getBoundingClientRect();
                            window.scrollTo({
                                top: window.scrollY + rect.top - 90,
                                behavior: 'smooth',
                            });
                        }
                        setActiveLink(id);
                    });

                    li.appendChild(link);
                    tocList.appendChild(li);

                    // ScrollSpy con ScrollTrigger
                    ScrollTrigger.create({
                        trigger: heading,
                        start: 'top 30%',
                        end: 'bottom 30%',
                        onEnter: () => setActiveLink(id),
                        onEnterBack: () => setActiveLink(id),
                    });
                });
            } else {
                const emptyItem = document.createElement('li');
                emptyItem.className = 'text-muted font-mono text-fluid-xs';
                emptyItem.textContent = 'Sin subtítulos detectados.';
                tocList.appendChild(emptyItem);
            }
        }

        // ── 2. Reading Progress Bar (Gradual & GPU-Accelerated) ──
        const progressBar = document.getElementById('reading-progress-bar') || container.querySelector('#reading-progress-bar');
        const article = container.querySelector('article') || prose;
        if (progressBar && article) {
            ScrollTrigger.create({
                trigger: article,
                start: 'top top',
                end: 'bottom bottom',
                onUpdate: (self) => {
                    const progress = Math.min(Math.max(self.progress, 0), 1);
                    progressBar.style.transform = `scaleX(${progress})`;
                },
            });
        }
    }, container);
}

/**
 * Initializes blog archive features:
 * 1. Horizontal drag-to-scroll on category pill rail
 * 2. Infinite scroll (5 initial + 10 async on scroll)
 *
 * @param {HTMLElement} container - Incoming Barba container
 */
export function initBlogArchive(container) {
    const sentinel = container.querySelector('#blog-scroll-sentinel');
    const postsGrid = container.querySelector('#blog-posts-grid');
    const loader = container.querySelector('#blog-scroll-loader');
    const endNotice = container.querySelector('#blog-scroll-end');
    const rail = container.querySelector('.blog-pill-rail');

    // Infinite scroll diferido (5 iniciales + 10 por scroll)
    if (!sentinel || !postsGrid) return;

    if (blogObserver) {
        blogObserver.disconnect();
        blogObserver = null;
    }

    let isLoading = false;

    const loadMorePosts = async () => {
        if (isLoading) return;
        const hasMore = sentinel.dataset.hasMore === 'true';
        const nextPage = sentinel.dataset.nextPage;
        const endpoint = sentinel.dataset.endpoint || window.location.pathname;
        const category = sentinel.dataset.category || '';

        if (!hasMore || !nextPage) {
            if (endNotice) endNotice.classList.remove('d-none');
            return;
        }

        isLoading = true;
        if (loader) loader.classList.remove('d-none');

        try {
            const url = new URL(endpoint, window.location.origin);
            url.searchParams.set('page', nextPage);
            if (category && !endpoint.includes('/categoria/')) {
                url.searchParams.set('categoria', category);
            }

            const res = await fetch(url.toString(), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();

            if (data.html && data.html.trim().length > 0) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data.html;
                const newCards = Array.from(tempDiv.children);

                newCards.forEach((card) => {
                    postsGrid.appendChild(card);
                });

                // Animar suavemente las nuevas tarjetas agregadas con subida y blur escalonado
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    gsap.set(newCards, { opacity: 1, y: 0, filter: 'none', webkitFilter: 'none' });
                } else {
                    gsap.fromTo(
                        newCards,
                        { opacity: 0, y: 45, filter: 'blur(12px)', webkitFilter: 'blur(12px)' },
                        {
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            webkitFilter: 'blur(0px)',
                            duration: 0.85,
                            stagger: 0.18,
                            ease: 'power3.out',
                            clearProps: 'transform,filter,webkitFilter',
                        }
                    );
                }

                // Recalcular límites de scroll y refrescar ScrollTrigger
                resizeScroll();
                ScrollTrigger.refresh();
            }

            sentinel.dataset.hasMore = data.has_more ? 'true' : 'false';
            sentinel.dataset.nextPage = data.next_page ? String(data.next_page) : '';

            if (!data.has_more) {
                if (blogObserver) {
                    blogObserver.disconnect();
                    blogObserver = null;
                }
                if (endNotice) endNotice.classList.remove('d-none');
            }
        } catch (err) {
            console.warn('[Blog Infinite Scroll] Error cargando más artículos:', err);
        } finally {
            isLoading = false;
            if (loader) loader.classList.add('d-none');
        }
    };

    if (window.IntersectionObserver) {
        blogObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadMorePosts();
                    }
                });
            },
            {
                root: null,
                rootMargin: '250px',
                threshold: 0.01,
            }
        );

        blogObserver.observe(sentinel);
    }
}

/**
 * Staggered upward reveal with blur for blog showcase cards.
 * Used for both the Archive grid and Single "Otros artículos" section.
 *
 * @param {HTMLElement} container - Scoped Barba container
 */
export function initCardReveals(container) {
    const cardElements = Array.from(container.querySelectorAll('[data-card-reveal]'));
    if (!cardElements.length) return;

    // Group cards by their immediate parent grid/row container
    const parentGroups = new Map();
    cardElements.forEach((card) => {
        const parent = card.parentElement;
        if (!parent) return;
        if (!parentGroups.has(parent)) {
            parentGroups.set(parent, []);
        }
        parentGroups.get(parent).push(card);
    });

    parentGroups.forEach((cards, parent) => {
        if (!cards.length) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.set(cards, { opacity: 1, y: 0, filter: 'none', webkitFilter: 'none' });
            return;
        }

        // Set initial state: shifted down and blurred
        gsap.set(cards, {
            opacity: 0,
            y: 45,
            filter: 'blur(12px)',
            webkitFilter: 'blur(12px)',
        });

        ScrollTrigger.create({
            trigger: parent,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(cards, {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    webkitFilter: 'blur(0px)',
                    duration: 0.85,
                    ease: 'power3.out',
                    stagger: 0.18, // Ligero retraso entre tarjetas
                    clearProps: 'transform,filter,webkitFilter',
                });
            },
        });
    });
}
