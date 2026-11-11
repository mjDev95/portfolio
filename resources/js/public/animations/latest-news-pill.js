import gsap from 'gsap';
import { getLenis } from '../lib/smooth-scroll';
import { splitTextIntoChars } from './shared/text-reveal';

let pillCtx = null;
let removeLenisListener = null;
let scrollIdleTimer = null;

export function cleanupLatestNewsPill() {
    if (scrollIdleTimer) {
        clearTimeout(scrollIdleTimer);
        scrollIdleTimer = null;
    }

    if (typeof removeLenisListener === 'function') {
        removeLenisListener();
        removeLenisListener = null;
    }

    if (pillCtx) {
        pillCtx.revert();
        pillCtx = null;
    }
}

export function initLatestNewsPill(container = document) {
    cleanupLatestNewsPill();

    const pill = container.querySelector('[data-latest-news-pill]');
    if (!pill) return;

    const slug = pill.getAttribute('data-news-slug') || 'latest';
    const storageKey = 'portfolio_news_clicked_' + slug;
    let hasUserClicked = false;
    try {
        hasUserClicked = localStorage.getItem(storageKey) === '1' || sessionStorage.getItem(storageKey) === '1';
    } catch (_) {}

    const markUserClicked = () => {
        hasUserClicked = true;
        try {
            localStorage.setItem(storageKey, '1');
            sessionStorage.setItem(storageKey, '1');
        } catch (_) {}
    };

    const gooStage = pill.querySelector('[data-goo-stage]');
    const gooBase = pill.querySelector('[data-goo-base]');
    const gooBridge = pill.querySelector('[data-goo-bridge]');
    const gooCard = pill.querySelector('[data-goo-card]');
    const cardEl = pill.querySelector('[data-news-card]');
    const cardContent = pill.querySelector('.latest-news-card-content');
    const cardTitle = pill.querySelector('.latest-news-card-title');
    const panelEl = pill.querySelector('[data-news-panel]');
    const baseAnchor = pill.querySelector('[data-news-base-anchor]');
    const fabTrigger = pill.querySelector('[data-news-fab-trigger]');
    const dismissBtn = pill.querySelector('[data-news-pill-dismiss]');

    // Letras individuales del título divididas en .split-char para animación de juntar letras (kinetic blur reveal)
    const titleChars = cardTitle ? splitTextIntoChars(cardTitle) : [];

    // Píxeles del SVG <mask id="liquid-media-mask"> (8x4 celdas cuadradas -> círculos -> encimados)
    const mediaPixels = Array.from(pill.querySelectorAll('[data-media-pixel]'));
    const mediaImage = pill.querySelector('[data-media-image]');

    const hasHeroCurtain = Boolean(container.querySelector('[data-hero-curtain]'));
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isContainerVisible = false;
    let isPanelOpen = false;
    let hasAutoOpened = false;

    pillCtx = gsap.context(() => {
        // Estado inicial: oculto fuera de pantalla hacia abajo (translateY)
        gsap.set(pill, { autoAlpha: 0, yPercent: 160 });
        gsap.set(gooStage, { opacity: 0 });
        gsap.set(gooBase, { scaleX: 1, scaleY: 1, y: 0, opacity: 1 });
        gsap.set(gooBridge, { scaleX: 0.5, scaleY: 0.2, y: 12, opacity: 1 });
        gsap.set(gooCard, { scaleX: 0.22, scaleY: 0.16, y: 58, opacity: 1 });
        gsap.set(baseAnchor, { scaleX: 1, scaleY: 1 });
        gsap.set(fabTrigger, { scale: 1, x: 0, rotation: 0, autoAlpha: 1, pointerEvents: 'auto' });
        gsap.set(dismissBtn, { scale: 0.4, rotation: -90, autoAlpha: 0 });
        gsap.set(cardEl, { scaleX: 0.22, scaleY: 0.16, y: 58, autoAlpha: 0 });

        if (cardContent) {
            gsap.set(cardContent, { autoAlpha: 1 });
        }

        // Estado inicial de las letras del título: separadas (tracking amplio + margin), desenfocadas y desplazadas
        if (titleChars.length > 0) {
            if (isReduced) {
                gsap.set(cardTitle, { letterSpacing: '-0.015em', autoAlpha: 1 });
                gsap.set(titleChars, { opacity: 1, y: 0, marginRight: '0em', filter: 'none', webkitFilter: 'none' });
            } else {
                gsap.set(cardTitle, { letterSpacing: '0.08em', autoAlpha: 1 });
                gsap.set(titleChars, {
                    opacity: 0,
                    y: 8,
                    marginRight: '0.04em',
                    filter: 'blur(6px)',
                    webkitFilter: 'blur(6px)',
                });
            }
        } else if (cardTitle) {
            gsap.set(cardTitle, { autoAlpha: 0, y: 6 });
        }

        // Estado inicial de los píxeles de la máscara de imagen (opacidad 0 = se ve el color bg-surface del flotante)
        if (mediaPixels.length > 0) {
            gsap.set(mediaPixels, { opacity: 0 });
        }
        if (mediaImage) {
            gsap.set(mediaImage, { scale: 1.08, transformOrigin: '50% 50%' });
        }

        // Animación de vibración periódica para captar la atención en el botón "Noticias"
        const attentionTl = gsap.timeline({
            repeat: -1,
            repeatDelay: 2.8,
            paused: true,
        });

        if (fabTrigger) {
            attentionTl.to(fabTrigger, {
                keyframes: [
                    { x: -3, rotation: -4, scale: 1.05, duration: 0.065, ease: 'sine.inOut' },
                    { x: 3, rotation: 4, scale: 1.06, duration: 0.065, ease: 'sine.inOut' },
                    { x: -2.5, rotation: -3, scale: 1.05, duration: 0.065, ease: 'sine.inOut' },
                    { x: 2.5, rotation: 3, scale: 1.04, duration: 0.065, ease: 'sine.inOut' },
                    { x: -1.5, rotation: -1.5, scale: 1.02, duration: 0.065, ease: 'sine.inOut' },
                    { x: 1.5, rotation: 1.5, scale: 1.01, duration: 0.065, ease: 'sine.inOut' },
                    { x: 0, rotation: 0, scale: 1, duration: 0.22, ease: 'elastic.out(1.2, 0.4)' },
                ],
            }, 0);
        }

        // Timeline Reversible: #liquid-fab-goo + secuencia Píxeles -> Círculos -> Encimados en la imagen
        const gooTl = gsap.timeline({
            paused: true,
            reversed: true,
            defaults: { ease: 'power2.inOut' },
            onStart: () => {
                isPanelOpen = true;
                attentionTl.pause(0);
                if (fabTrigger) {
                    gsap.set(fabTrigger, { x: 0, rotation: 0 });
                    fabTrigger.style.pointerEvents = 'none';
                }
                panelEl?.classList.add('is-open');
                if (dismissBtn) {
                    dismissBtn.classList.add('is-active');
                    dismissBtn.style.pointerEvents = 'auto';
                }
            },
            onReverseComplete: () => {
                isPanelOpen = false;
                panelEl?.classList.remove('is-open');
                if (dismissBtn) {
                    dismissBtn.classList.remove('is-active');
                    dismissBtn.style.pointerEvents = 'none';
                }
                if (fabTrigger) {
                    fabTrigger.style.pointerEvents = 'auto';
                }
                if (isContainerVisible) {
                    attentionTl.restart(true);
                }
            },
        });

        // =========================================================================
        // FASE 1: Silueta líquida (#liquid-fab-goo) + Movimiento físico exterior (0.00s a 0.38s)
        // Durante toda esta fase el contenido interno (título y píxeles) se mantiene en opacity: 0.
        // =========================================================================

        // 1. Activar escenario SVG #liquid-fab-goo durante el desprendimiento y reabsorción
        if (gooStage) {
            gooTl
                .to(gooStage, { opacity: 1, duration: 0.04, ease: 'none' }, 0)
                .to(gooStage, { opacity: 0, duration: 0.14, ease: 'power1.out' }, 0.38);
        }

        // 2. Squash & Stretch en el ancla base e intercambio entre "Noticias" y el círculo con cruz "×"
        if (baseAnchor) {
            gooTl
                .to(baseAnchor, { scaleX: 1.18, scaleY: 0.82, duration: 0.12, ease: 'power2.out' }, 0)
                .to(baseAnchor, { scaleX: 0.92, scaleY: 1.1, duration: 0.12, ease: 'power2.inOut' }, 0.12)
                .to(baseAnchor, { scaleX: 1, scaleY: 1, duration: 0.24, ease: 'elastic.out(1.1, 0.45)' }, 0.24);
        }

        if (fabTrigger) {
            gooTl.to(
                fabTrigger,
                {
                    scale: 0.65,
                    autoAlpha: 0,
                    duration: 0.15,
                    ease: 'power2.in',
                },
                0
            );
        }

        if (dismissBtn) {
            gooTl.to(
                dismissBtn,
                {
                    scale: 1,
                    rotation: 0,
                    autoAlpha: 1,
                    duration: 0.32,
                    ease: 'back.out(1.6)',
                },
                0.12
            );
        }

        // 3. Silueta líquida exterior (#liquid-fab-goo): base + cuello viscoso + silueta de tarjeta
        if (gooBase) {
            gooTl
                .to(gooBase, { scaleX: 1.22, scaleY: 0.8, duration: 0.12, ease: 'power2.out' }, 0)
                .to(gooBase, { scaleX: 0.88, scaleY: 1.18, y: -4, duration: 0.14, ease: 'power2.inOut' }, 0.12)
                .to(gooBase, { scaleX: 1, scaleY: 1, y: 0, duration: 0.24, ease: 'elastic.out(1.1, 0.45)' }, 0.26);
        }

        if (gooBridge) {
            gooTl
                .to(
                    gooBridge,
                    {
                        y: 0,
                        scaleX: 0.92,
                        scaleY: 1.45,
                        duration: 0.16,
                        ease: 'power2.out',
                    },
                    0.02
                )
                .to(
                    gooBridge,
                    {
                        y: -16,
                        scaleX: 0.12,
                        scaleY: 1.75,
                        opacity: 0,
                        duration: 0.18,
                        ease: 'power2.in',
                    },
                    0.18
                );
        }

        if (gooCard) {
            gooTl.to(
                gooCard,
                {
                    scaleX: 1,
                    scaleY: 1,
                    y: 0,
                    duration: 0.36,
                    ease: 'power3.out',
                },
                0.04
            );
        }

        // 4. Emergencia de la tarjeta exterior sincronizada con gooCard
        if (cardEl) {
            gooTl.to(
                cardEl,
                {
                    scaleX: 1,
                    scaleY: 1,
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.36,
                    ease: 'power3.out',
                },
                0.04
            );
        }

        // =========================================================================
        // FASE 2: Montaje y revelado del contenido interior (a partir de 0.38s)
        // La caja y el SVG ya están 100% fijos y asentados arriba.
        // Al cerrar (reverse()), este contenido se desvanece por completo antes de que
        // la caja empiece a bajar hacia el botón (0.38s -> 0.00s).
        // =========================================================================

        if (mediaPixels.length > 0) {
            gooTl.to(
                mediaPixels,
                {
                    opacity: 1,
                    duration: 0.12,
                    ease: 'power1.inOut',
                    stagger: {
                        amount: 0.20,
                        grid: [5, 10],
                        from: 'end',
                    },
                },
                0.38
            );
        }

        if (mediaImage) {
            gooTl.to(
                mediaImage,
                {
                    scale: 1,
                    duration: 0.28,
                    ease: 'power2.out',
                },
                0.38
            );
        }

        if (!isReduced && titleChars.length > 0) {
            // 1. Juntar el espaciado tipográfico general de las letras hacia el valor de diseño (-0.015em)
            gooTl.to(
                cardTitle,
                {
                    letterSpacing: '-0.015em',
                    duration: 0.32,
                    ease: 'power3.out',
                },
                0.40
            );

            // 2. Animar las letras individuales: se juntan (margin-right -> 0), emergen y aclaran con blur reveal en stagger
            gooTl.to(
                titleChars,
                {
                    opacity: 1,
                    y: 0,
                    marginRight: '0em',
                    filter: 'blur(0px)',
                    webkitFilter: 'blur(0px)',
                    duration: 0.22,
                    ease: 'power2.out',
                    stagger: {
                        amount: 0.18,
                        from: 'start',
                    },
                },
                0.40
            );
        } else if (cardContent) {
            gooTl.to(
                cardContent,
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.22,
                    ease: 'power2.out',
                },
                0.42
            );
        }

        // Hover zoom suave sobre la imagen enmascarada en el SVG
        if (cardEl && mediaImage) {
            cardEl.addEventListener('mouseenter', () => {
                if (isPanelOpen) {
                    gsap.to(mediaImage, { scale: 1.06, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
                }
            });
            cardEl.addEventListener('mouseleave', () => {
                if (isPanelOpen) {
                    gsap.to(mediaImage, { scale: 1, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
                }
            });
        }

        const openPanel = () => {
            if (!isPanelOpen) {
                gooTl.timeScale(1).play();
            }
        };

        const closePanel = (recordClick = false) => {
            if (recordClick) {
                markUserClicked();
            }
            if (isPanelOpen || gooTl.progress() > 0) {
                gooTl.timeScale(1.15).reverse();
            }
        };

        const isInSafeZone = (scrollY) => {
            const drawer = document.getElementById('nav-pixel-drawer');
            if (drawer?.classList.contains('is-open')) return false;

            if (hasHeroCurtain && scrollY < 180) return false;

            const footer = document.getElementById('main-footer');
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top < window.innerHeight - 40) return false;
            }

            return true;
        };

        const showWidget = () => {
            if (isContainerVisible) return;
            isContainerVisible = true;
            pill.classList.add('is-visible');
            gsap.to(pill, {
                autoAlpha: 1,
                yPercent: 0,
                duration: 0.46,
                ease: 'power3.out',
                overwrite: 'auto',
                onComplete: () => {
                    // Si el usuario aún NO ha hecho clic, desplegar la tarjeta automáticamente;
                    // si ya hizo clic antes, mantener únicamente el botón "Noticias" con vibración
                    if (!hasUserClicked && !hasAutoOpened) {
                        hasAutoOpened = true;
                        openPanel();
                    } else if (!isPanelOpen) {
                        attentionTl.restart(true);
                    }
                },
            });
        };

        const hideWidgetOffscreen = () => {
            if (!isContainerVisible) return;
            isContainerVisible = false;
            attentionTl.pause(0);
            pill.classList.remove('is-visible');
            gsap.to(pill, {
                autoAlpha: 0,
                yPercent: 160,
                duration: 0.3,
                ease: 'power2.in',
                overwrite: 'auto',
            });
        };

        const lenis = getLenis();
        let lastScrollY = lenis ? lenis.scroll : window.scrollY || 0;

        if (isInSafeZone(lastScrollY)) {
            showWidget();
        }

        if (lenis) {
            const onScroll = ({ scroll, direction }) => {
                const delta = Math.abs(scroll - lastScrollY);
                lastScrollY = scroll;

                if (!isInSafeZone(scroll)) {
                    if (scrollIdleTimer) {
                        clearTimeout(scrollIdleTimer);
                        scrollIdleTimer = null;
                    }
                    hideWidgetOffscreen();
                    return;
                }

                const isMobile = window.innerWidth < 768;

                // En móvil (o al hacer scroll hacia más contenido): ocultar con translateY fuera de pantalla
                // y volver a mostrar tras detener el scroll unos segundos
                if ((isMobile && delta > 2) || (direction === 1 && delta > 6)) {
                    hideWidgetOffscreen();

                    if (scrollIdleTimer) {
                        clearTimeout(scrollIdleTimer);
                    }
                    scrollIdleTimer = setTimeout(() => {
                        const currentY = lenis ? lenis.scroll : window.scrollY || 0;
                        if (isInSafeZone(currentY)) {
                            showWidget();
                        }
                    }, 1600);
                    return;
                }

                if (!isContainerVisible && !scrollIdleTimer) {
                    showWidget();
                }
            };

            lenis.on('scroll', onScroll);
            removeLenisListener = () => lenis.off('scroll', onScroll);
        }

        // Clic en el botón "Noticias": despliega la tarjeta vertical con #liquid-fab-goo
        fabTrigger?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPanel();
        });

        // Clic en el botón circular con cruz (×): guarda estado de clic y ejecuta reverse
        dismissBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closePanel(true);
        });

        // Clic en la tarjeta para leer la nota: guarda estado para que en futuras visitas solo muestre "Noticias"
        cardEl?.addEventListener('click', () => {
            markUserClicked();
        });
    }, pill);
}
