import gsap from 'gsap';
import { startScroll, resizeScroll, stopScroll, resetScroll, ScrollTrigger } from './smooth-scroll';
import { syncDesktopIslandState, isDesktopIslandCompacted, markNavigated } from '../animations/dynamic-island';

const DETAIL_NAMESPACES = ['project-show', 'content-show', 'blog-show'];

// Snapshot handed off from transition's `leave()` to `enter()`.
window.__activeFlight = null;
window.__lastClickedFlipCard = null;
window.__lastCapturedFlip = null;

// Global capture-phase click listener: cleans hover/magnetic interference and captures exact viewport geometry immediately on click
if (typeof window !== 'undefined') {
    document.addEventListener(
        'click',
        (e) => {
            const card = e.target.closest?.('[data-flip-card]');
            if (card) {
                window.__lastClickedFlipCard = card;
                markNavigated();

                // Matar tweens residuales de imán sin bloquear el despacho de eventos de Barba
                card.removeAttribute('data-magnetic');
                gsap.killTweensOf(card);

                const wrapper = card.querySelector('[data-flip-element="image"]') ||
                                card.querySelector('.project-media-frame') ||
                                card.querySelector('.card-media-wrapper') ||
                                card.querySelector('.project-showcase-media') ||
                                card;
                const img = wrapper?.querySelector?.('img') || (wrapper instanceof HTMLImageElement ? wrapper : card.querySelector('img'));
                if (img) {
                    img.style.transition = 'none';
                    gsap.killTweensOf(img);
                }

                // Captura síncrona inmediata en el instante físico del click:
                // Guarda las coordenadas exactas en viewport antes de que cualquier hook
                // de ciclo de vida altere el scroll o mute el DOM.
                try {
                    const rect = wrapper ? wrapper.getBoundingClientRect() : null;
                    if (rect && rect.width > 0 && rect.height > 0) {
                        window.__lastCapturedFlip = {
                            card,
                            wrapper,
                            rect: {
                                top: rect.top,
                                left: rect.left,
                                width: rect.width,
                                height: rect.height,
                            },
                            imgSrc: img?.currentSrc || img?.src || '',
                            imgAlt: img?.alt || '',
                            timestamp: Date.now(),
                        };
                    }
                } catch (err) {
                    window.__lastCapturedFlip = null;
                }

                // Desvanecer INMEDIATAMENTE el texto de la tarjeta seleccionada para que solo quede la imagen
                const cardBody = card.querySelector('.project-showcase-body') || 
                                 card.querySelector('.project-meta-row') || 
                                 card.querySelector('.blog-editorial-card-body');
                if (cardBody) {
                    gsap.to(cardBody, {
                        opacity: 0,
                        y: -8,
                        duration: 0.18,
                        ease: 'power2.out',
                    });
                }
            }
        },
        true // capture phase
    );
}

/**
 * Shared Element Transition:
 * - Transforms the card from 4:3 into 16:9 during leave(), flying to the hero header position.
 * - Zero double image: the origin is hidden instantly upon take-off.
 * - Zero border-radius: hard rectangular edges throughout flight and destination.
 * - Pill state is completely preserved without any reset or flicker.
 * - Entering page receives the pre-positioned hero with a seamless 0-shift hand-off.
 */
export function createFlipTransitions() {
    return [
        {
            name: 'flip-to-detail',
            custom({ current, next, trigger }) {
                const isFromAllowed = ['projects-index', 'blog-index', 'blog-category', 'blog-tag', 'blog-show', 'home', 'content-index'].includes(current.namespace) ||
                                      (current.url?.path && (/^\/(proyectos|blog)(\/(categoria|etiqueta|tag)\/[^/]+)?\/?$/.test(current.url.path) || current.url.path === '/' || current.url.path === ''));
                const isToDetail = DETAIL_NAMESPACES.includes(next.namespace) ||
                                  (next.url?.path && /^\/(proyectos|blog)\/[^/]+/.test(next.url.path));

                const candidate = (trigger instanceof Element ? trigger : null) || window.__lastClickedFlipCard || window.__lastCapturedFlip?.card;
                const hasCard = Boolean(candidate?.closest?.('[data-flip-card]') || window.__lastClickedFlipCard || window.__lastCapturedFlip?.card);

                return Boolean(isFromAllowed && isToDetail && hasCard);
            },
            async leave(data) {
                return new Promise((resolve) => {
                    stopScroll();

                    // 1. Registrar navegación en la memoria de sesión
                    markNavigated();

                    // 2. Identificar tarjeta y wrapper de origen con prioridad en datos precapturados
                    const captured = window.__lastCapturedFlip;
                    const isCapturedValid = captured && (Date.now() - captured.timestamp < 3000);
                    const candidateTrigger = data.trigger instanceof Element ? data.trigger : null;
                    const originCard = (isCapturedValid && captured.card) ||
                                       candidateTrigger?.closest?.('[data-flip-card]') ||
                                       candidateTrigger ||
                                       window.__lastClickedFlipCard ||
                                       data.current.container.querySelector('[data-flip-card]');
                    const originWrapper = (isCapturedValid && captured.wrapper) ||
                                          originCard?.querySelector?.('[data-flip-element="image"]') ||
                                          originCard?.querySelector?.('.project-media-frame') ||
                                          originCard?.querySelector?.('.card-media-wrapper') ||
                                          originCard?.querySelector?.('.project-showcase-media') ||
                                          originCard;
                    const originImage = originWrapper?.querySelector?.('img') || (originWrapper instanceof HTMLImageElement ? originWrapper : null);

                    if (!originCard || !originWrapper) {
                        gsap.to(data.current.container, {
                            opacity: 0,
                            duration: 0.3,
                            onComplete: resolve,
                        });
                        return;
                    }

                    originCard.style.pointerEvents = 'none';
                    document.body.style.pointerEvents = 'none';
                    originCard.removeAttribute('data-magnetic');
                    gsap.killTweensOf([originCard, originWrapper, originImage].filter(Boolean));
                    gsap.set([originCard, originWrapper, originImage].filter(Boolean), { clearProps: 'transform' });

                    // 3. Medir coordenadas iniciales de la tarjeta:
                    // Prioriza la captura síncrona tomada en el momento del click para blindar
                    // contra colapsos de scroll o spacers del Home.
                    const originRect = (isCapturedValid && captured.rect && captured.rect.width > 0)
                        ? captured.rect
                        : originWrapper.getBoundingClientRect();
                    const imgSrc = (isCapturedValid && captured.imgSrc) || originImage?.currentSrc || originImage?.src || '';
                    const imgAlt = (isCapturedValid && captured.imgAlt) || originImage?.alt || '';

                    // 4. Medir coordenadas EXACTAS de destino del Hero en la nueva vista (scroll = 0)
                    let targetTop = null;
                    let targetLeft = null;
                    let targetWidth = null;
                    let targetHeight = null;

                    if (data.next?.html) {
                        try {
                            const parser = new DOMParser();
                            const nextDoc = parser.parseFromString(data.next.html, 'text/html');
                            const nextContainer = nextDoc.querySelector('[data-barba="container"]');
                            if (nextContainer) {
                                const bodyPaddingTop = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
                                Object.assign(nextContainer.style, {
                                    position: 'fixed',
                                    top: `${bodyPaddingTop}px`,
                                    left: '0px',
                                    width: '100%',
                                    visibility: 'hidden',
                                    pointerEvents: 'none',
                                    zIndex: '-9999',
                                });
                                document.body.appendChild(nextContainer);

                                const nextHero = nextContainer.querySelector('.hero-media-wrapper') ||
                                                 nextContainer.querySelector('[data-flip-id]') ||
                                                 nextContainer.querySelector('[data-flip-element="image"]');

                                if (nextHero) {
                                    const rect = nextHero.getBoundingClientRect();
                                    if (rect.width > 0 && rect.height > 0) {
                                        targetTop = rect.top;
                                        targetLeft = rect.left;
                                        targetWidth = rect.width;
                                        targetHeight = rect.height;
                                    }
                                }

                                nextContainer.remove();
                            }
                        } catch (e) {
                            console.warn('[Flip] Error midiendo pre-render del contenedor entrante:', e);
                        }
                    }

                    // Fallback de alta precisión garantizando la geometría exacta de .container-wide (idéntico al detalle del post/proyecto)
                    if (targetTop === null || targetWidth === null) {
                        const dummy = document.createElement('div');
                        dummy.className = 'py-3xl';
                        dummy.style.visibility = 'hidden';
                        dummy.style.position = 'fixed';
                        dummy.style.top = '0';
                        dummy.style.left = '0';
                        dummy.style.right = '0';
                        dummy.style.pointerEvents = 'none';
                        dummy.style.zIndex = '-99999';
                        dummy.innerHTML = `
                            <div class="container mb-lg" style="height: 24px;"></div>
                            <div class="container-wide mb-2xl">
                                <div class="media-wrap hero-media-wrapper" style="aspect-ratio: 16 / 9; width: 100%;"></div>
                            </div>
                        `;
                        document.body.appendChild(dummy);

                        const heroEl = dummy.querySelector('.hero-media-wrapper');
                        if (heroEl) {
                            const rect = heroEl.getBoundingClientRect();
                            const bodyPaddingTop = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
                            targetTop = rect.top + bodyPaddingTop;
                            targetLeft = rect.left;
                            targetWidth = rect.width;
                            targetHeight = rect.height;
                        }
                        dummy.remove();
                    }

                    // 5. Crear el proxy de vuelo fijado en el viewport (Sin border-radius)
                    const proxy = document.createElement('div');
                    proxy.id = 'active-flight-proxy';
                    Object.assign(proxy.style, {
                        position: 'fixed',
                        top: `${originRect.top}px`,
                        left: `${originRect.left}px`,
                        width: `${originRect.width}px`,
                        height: `${originRect.height}px`,
                        borderRadius: '0px',
                        overflow: 'hidden',
                        zIndex: '99999',
                        pointerEvents: 'none',
                        boxSizing: 'border-box',
                        border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                        backgroundColor: 'var(--bg-surface, #14171c)',
                        willChange: 'top, left, width, height',
                    });

                    const proxyImg = document.createElement('img');
                    proxyImg.src = imgSrc;
                    proxyImg.alt = imgAlt;
                    Object.assign(proxyImg.style, {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '0px',
                    });
                    proxy.appendChild(proxyImg);
                    document.body.appendChild(proxy);

                    // Ocultar inmediatamente el wrapper de la tarjeta original para CERO duplicidad
                    originWrapper.style.visibility = 'hidden';

                    // Desvanecer cualquier texto de la tarjeta seleccionada para que SOLO quede la imagen
                    const originCardTexts = originCard.querySelectorAll(
                        '.project-showcase-body, .project-category-subtitle, .project-title-heading, .project-view-link, .project-meta-row'
                    );
                    if (originCardTexts.length > 0) {
                        gsap.to(originCardTexts, { opacity: 0, y: -8, duration: 0.15, ease: 'power2.out' });
                    }

                    // 6. Timeline de salida: el entorno completo de la página vieja y el footer global se desvanecen
                    const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');

                    const tl = gsap.timeline({
                        onComplete: () => {
                            window.__activeFlight = {
                                proxy,
                                targetTop,
                                targetLeft,
                                targetWidth,
                                targetHeight,
                            };
                            data.current.container.style.display = 'none';
                            if (mainFooter) {
                                mainFooter.style.visibility = 'hidden';
                            }
                            resolve();
                        },
                    });

                    // Desvanecer rápidamente la página actual completa (autor, avatar, sidebar, texto) y el footer global (#main-footer)
                    tl.to([data.current.container, mainFooter].filter(Boolean), {
                        opacity: 0,
                        duration: 0.22,
                        ease: 'power2.inOut',
                    }, 0);

                    // Vuelo y transformación física de 4:3 a 16:9 hacia el destino (bordes rectangulares estrictos 0px)
                    tl.to(proxy, {
                        top: targetTop,
                        left: targetLeft,
                        width: targetWidth,
                        height: targetHeight,
                        borderRadius: '0px',
                        duration: 0.85,
                        ease: 'expo.out',
                    }, 0);
                });
            },
            beforeEnter(data) {
                // Resetear scroll a 0 de forma inmediata
                resetScroll();
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;

                // Estado Inicial Preventivo del detalle:
                // 1. Breadcrumbs preparadas arriba con opacidad 0
                const breadcrumbs = data.next.container.querySelector('[data-detail-breadcrumbs], .public-breadcrumbs');
                if (breadcrumbs) {
                    gsap.set(breadcrumbs, { opacity: 0, y: -16 });
                }

                // 2. Encabezado y cuerpo del detalle preparados abajo con opacidad 0
                const header = data.next.container.querySelector('[data-detail-header], header');
                const meta = Array.from(
                    data.next.container.querySelectorAll('[data-detail-body], [data-flip-text], .prose, .toc-sidebar-sticky')
                ).filter((el) => el !== breadcrumbs && !breadcrumbs?.contains(el));
                const detailTargets = [header, ...meta].filter(Boolean);
                if (detailTargets.length > 0) {
                    gsap.set(detailTargets, { opacity: 0, y: 25 });
                }

                // Ocultar preventivamente el hero real
                const targetHero = data.next.container.querySelector('.hero-media-wrapper') ||
                                   data.next.container.querySelector('[data-flip-id]') ||
                                   data.next.container.querySelector('[data-flip-element="image"]');
                if (targetHero) {
                    gsap.set(targetHero, { opacity: 0, visibility: 'hidden' });
                }

                // Al llegar a la nueva vista de detalle, la píldora se fija compactada de forma inmediata
                markNavigated();
                syncDesktopIslandState(true);
            },
            async enter(data) {
                const flight = window.__activeFlight;
                window.__activeFlight = null;
                window.__lastClickedFlipCard = null;
                window.__lastCapturedFlip = null;

                const proxy = flight?.proxy || document.getElementById('active-flight-proxy');

                try {
                    const targetHero = data.next.container.querySelector('.hero-media-wrapper') ||
                                       data.next.container.querySelector('[data-flip-id]') ||
                                       data.next.container.querySelector('[data-flip-element="image"]');

                    const targetImage = targetHero?.querySelector?.('img') || (targetHero instanceof HTMLImageElement ? targetHero : null);

                    // Esperar decodificación de la imagen hero si es necesario con timeout defensivo
                    if (targetImage instanceof HTMLImageElement && !targetImage.complete) {
                        try {
                            await Promise.race([
                                targetImage.decode(),
                                new Promise((resolve) => {
                                    targetImage.onload = resolve;
                                    targetImage.onerror = resolve;
                                    setTimeout(resolve, 400);
                                }),
                            ]);
                        } catch (e) {
                            // Fallback silencioso si no soporta decode o falla la red
                        }
                    }

                    // Mostrar nuevo contenedor en flujo natural
                    data.next.container.style.visibility = 'visible';
                    data.next.container.style.opacity = '1';
                    data.next.container.style.position = 'relative';

                    resetScroll();

                    const breadcrumbs = data.next.container.querySelector('[data-detail-breadcrumbs], .public-breadcrumbs');
                    const header = data.next.container.querySelector('[data-detail-header], header');
                    const meta = Array.from(
                        data.next.container.querySelectorAll('[data-detail-body], [data-flip-text], .prose, .toc-sidebar-sticky')
                    ).filter((el) => el !== targetHero && !targetHero?.contains(el) && el !== breadcrumbs && !breadcrumbs?.contains(el));
                    const detailTargets = [header, ...meta].filter(Boolean);

                    // Animar la entrada de las breadcrumbs con un elegante descenso desde arriba
                    if (breadcrumbs) {
                        gsap.to(breadcrumbs, {
                            opacity: 1,
                            y: 0,
                            duration: 0.65,
                            ease: 'power2.out',
                            delay: 0.05,
                            clearProps: 'all',
                        });
                    }

                    if (proxy && targetHero) {
                        // Medir las coordenadas reales del hero en la nueva vista montada en scroll = 0
                        const realRect = targetHero.getBoundingClientRect();

                        // Micro-alineación suave si hay cualquier diferencia subpixel (bordes rectangulares estrictos 0px)
                        await gsap.to(proxy, {
                            top: realRect.top,
                            left: realRect.left,
                            width: realRect.width,
                            height: realRect.height,
                            borderRadius: '0px',
                            duration: 0.15,
                            ease: 'power2.out',
                        });

                        // Intercambio sin salto asegurando bordes fluidos
                        gsap.set(targetHero, { opacity: 1, visibility: 'visible', clearProps: 'opacity,visibility,borderRadius' });
                        proxy.remove();
                    } else if (targetHero) {
                        gsap.set(targetHero, { opacity: 1, visibility: 'visible', clearProps: 'opacity,visibility,borderRadius' });
                        if (proxy) proxy.remove();
                    } else if (proxy) {
                        proxy.remove();
                    }

                    // Revelar textos del detalle alrededor del hero
                    if (detailTargets.length > 0) {
                        await gsap.to(detailTargets, {
                            opacity: 1,
                            y: 0,
                            stagger: 0.08,
                            duration: 0.6,
                            ease: 'power2.out',
                            clearProps: 'all',
                        });
                    }

                    // Restaurar la presencia del footer global en la nueva página
                    const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');
                    if (mainFooter) {
                        mainFooter.style.visibility = 'visible';
                        gsap.to(mainFooter, {
                            opacity: 1,
                            duration: 0.35,
                            ease: 'power2.out',
                            clearProps: 'opacity,visibility',
                        });
                    }
                } finally {
                    // Salvaguarda defensiva incondicional:
                    // Bajo cualquier contingencia o error de red, el nuevo contenedor
                    // y los elementos interactivos siempre quedan plenamente visibles.
                    if (data.next?.container) {
                        data.next.container.style.visibility = 'visible';
                        data.next.container.style.opacity = '1';
                        data.next.container.style.position = 'relative';
                    }
                    const strayProxy = document.getElementById('active-flight-proxy');
                    if (strayProxy) strayProxy.remove();

                    const mainFooter = document.getElementById('main-footer') || document.querySelector('.footer-scroll-wrapper') || document.querySelector('.site-footer, footer');
                    if (mainFooter) {
                        mainFooter.style.visibility = 'visible';
                        gsap.set(mainFooter, { clearProps: 'opacity,visibility' });
                    }

                    // Confirmar que la píldora se mantenga compacta tras la animación
                    syncDesktopIslandState(true);

                    startScroll();
                    resizeScroll();
                    ScrollTrigger.refresh();
                    document.body.style.pointerEvents = 'all';
                }
            },
        },
    ];
}