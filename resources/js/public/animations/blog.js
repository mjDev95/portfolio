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
        progressBar.style.width = '0%';
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

        // ── 2. Reading Progress Bar ──
        const progressBar = document.getElementById('reading-progress-bar') || container.querySelector('#reading-progress-bar');
        if (progressBar) {
            ScrollTrigger.create({
                trigger: prose,
                start: 'top 120px',
                end: 'bottom bottom',
                onUpdate: (self) => {
                    const pct = Math.min(Math.max(self.progress * 100, 0), 100);
                    progressBar.style.width = `${pct}%`;
                },
            });
        }

        // ── 3. Botón de Copiado de Enlace con Micro-Feedback ──
        const copyBtn = container.querySelector('#btn-copy-article-url');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    copyBtn.classList.add('is-copied');
                    gsap.fromTo(copyBtn, { scale: 0.95 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
                    setTimeout(() => {
                        copyBtn.classList.remove('is-copied');
                    }, 2000);
                } catch (e) {
                    copyBtn.classList.add('is-copied');
                    setTimeout(() => copyBtn.classList.remove('is-copied'), 2000);
                }
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

                // Animar suavemente las nuevas tarjetas agregadas
                gsap.fromTo(
                    newCards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.55,
                        stagger: 0.06,
                        ease: 'power2.out',
                        clearProps: 'transform',
                    }
                );

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
