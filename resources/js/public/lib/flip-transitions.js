import gsap from 'gsap';
import { startScroll, resizeScroll, stopScroll, resetScroll, ScrollTrigger } from './smooth-scroll';
import { syncDesktopIslandState, isDesktopIslandCompacted } from '../animations/dynamic-island';

const DETAIL_NAMESPACES = ['project-show', 'content-show'];

// Snapshot handed off from transition's `leave()` to `enter()`.
window.__activeFlight = null;
window.__lastClickedFlipCard = null;

// Global capture-phase click listener: cleans hover/magnetic interference immediately on click
if (typeof window !== 'undefined') {
    document.addEventListener(
        'click',
        (e) => {
            // Only capture on project archive cards, ignore home
            const card = e.target.closest?.('[data-flip-card]');
            const isHomePage = window.location.pathname === '/' || document.querySelector('[data-barba="container"]')?.getAttribute('data-barba-namespace') === 'home';
            if (card && !isHomePage) {
                window.__lastClickedFlipCard = card;

                // Capturar el estado actual de la píldora antes de cualquier manipulación de vista
                const desktopIsland = document.getElementById('desktop-island');
                if (desktopIsland) {
                    window.__portfolioPillWasCompacted = desktopIsland.classList.contains('is-compacted') || isDesktopIslandCompacted();
                }

                // Desactivar temporalmente pointer-events y matar tweens residuales de imán
                card.style.pointerEvents = 'none';
                card.removeAttribute('data-magnetic');
                gsap.killTweensOf(card);
                const img = card.querySelector('[data-flip-element="image"]') || card.querySelector('img');
                if (img) {
                    img.style.transition = 'none';
                    gsap.killTweensOf(img);
                }

                // Desvanecer INMEDIATAMENTE el texto de la tarjeta seleccionada para que solo quede la imagen
                const cardBody = card.querySelector('.project-showcase-body');
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
 * - Pill state is completely preserved without any reset or flicker.
 * - Entering page receives the pre-positioned hero with a seamless 0-shift hand-off.
 */
export function createFlipTransitions() {
    return [
        {
            name: 'flip-to-detail',
            custom({ current, next, trigger }) {
                // Excluir estrictamente navegación desde Home
                if (current.namespace === 'home' || current.url?.path === '/') {
                    return false;
                }

                const isFromProjects = current.namespace === 'projects-index' ||
                                       (current.url?.path && /^\/proyectos\/?$/.test(current.url.path));
                const isToDetail = DETAIL_NAMESPACES.includes(next.namespace) ||
                                  (next.url?.path && /^\/proyectos\/[^/]+/.test(next.url.path));

                const candidate = (trigger instanceof Element ? trigger : null) || window.__lastClickedFlipCard;
                const hasCard = Boolean(candidate?.closest?.('[data-flip-card]') || window.__lastClickedFlipCard);

                return Boolean(isFromProjects && isToDetail && hasCard);
            },
            async leave(data) {
                return new Promise((resolve) => {
                    stopScroll();

                    // 1. Preservar estado de la píldora exactamente igual
                    const desktopIsland = document.getElementById('desktop-island');
                    if (desktopIsland) {
                        window.__portfolioPillWasCompacted = desktopIsland.classList.contains('is-compacted') || isDesktopIslandCompacted();
                    }

                    // 2. Identificar tarjeta y wrapper de origen
                    const candidateTrigger = data.trigger instanceof Element ? data.trigger : null;
                    const originCard = candidateTrigger?.closest?.('[data-flip-card]') ||
                                       candidateTrigger ||
                                       window.__lastClickedFlipCard ||
                                       data.current.container.querySelector('[data-flip-card]');
                    const originWrapper = originCard?.querySelector?.('[data-flip-element="image"]') ||
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

                    // 3. Medir coordenadas iniciales de la tarjeta (4:3)
                    const originRect = originWrapper.getBoundingClientRect();
                    const originStyle = window.getComputedStyle(originWrapper);
                    const originRadius = originStyle.borderRadius || '24px';
                    const imgSrc = originImage?.currentSrc || originImage?.src || '';
                    const imgAlt = originImage?.alt || '';

                    // 4. Medir coordenadas EXACTAS de destino del Hero en la nueva vista (scroll = 0)
                    let targetTop = null;
                    let targetLeft = null;
                    let targetWidth = null;
                    let targetHeight = null;
                    let targetRadius = 'clamp(22px, 2.5vw, 32px)';

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
                                        targetRadius = window.getComputedStyle(nextHero).borderRadius || targetRadius;
                                    }
                                }

                                nextContainer.remove();
                            }
                        } catch (e) {
                            console.warn('[Flip] Error midiendo pre-render del contenedor entrante:', e);
                        }
                    }

                    // Fallback de alta precisión si la medición directa no estuviera disponible
                    if (targetTop === null || targetWidth === null) {
                        const containerEl = data.current.container.querySelector('.container') || data.current.container;
                        const containerRect = containerEl.getBoundingClientRect();
                        const containerStyle = window.getComputedStyle(containerEl);
                        const padLeft = parseFloat(containerStyle.paddingLeft) || 16;
                        const padRight = parseFloat(containerStyle.paddingRight) || 16;
                        const paddingTop = parseFloat(containerStyle.paddingTop) || 64;
                        const bodyPaddingTop = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;

                        targetWidth = containerRect.width - padLeft - padRight;
                        targetHeight = Math.round(targetWidth * (9 / 16));
                        targetLeft = containerRect.left + padLeft;

                        const breadcrumbsEl = data.current.container.querySelector('[data-detail-breadcrumbs], .public-breadcrumbs, .breadcrumbs, .mb-sm');
                        const breadcrumbsHeight = breadcrumbsEl ? breadcrumbsEl.getBoundingClientRect().height : 36;

                        const dummyMbLg = document.createElement('div');
                        dummyMbLg.className = 'mb-lg';
                        dummyMbLg.style.visibility = 'hidden';
                        dummyMbLg.style.position = 'absolute';
                        document.body.appendChild(dummyMbLg);
                        const mbLgVal = parseFloat(window.getComputedStyle(dummyMbLg).marginBottom) || 56;
                        dummyMbLg.remove();

                        targetTop = bodyPaddingTop + paddingTop + breadcrumbsHeight + mbLgVal;
                    }

                    // 5. Crear el proxy de vuelo fijado en el viewport
                    const proxy = document.createElement('div');
                    proxy.id = 'active-flight-proxy';
                    Object.assign(proxy.style, {
                        position: 'fixed',
                        top: `${originRect.top}px`,
                        left: `${originRect.left}px`,
                        width: `${originRect.width}px`,
                        height: `${originRect.height}px`,
                        borderRadius: originRadius,
                        overflow: 'hidden',
                        zIndex: '99999',
                        pointerEvents: 'none',
                        boxSizing: 'border-box',
                        border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                        backgroundColor: 'var(--bg-surface, #14171c)',
                        willChange: 'top, left, width, height, border-radius',
                    });

                    const proxyImg = document.createElement('img');
                    proxyImg.src = imgSrc;
                    proxyImg.alt = imgAlt;
                    Object.assign(proxyImg.style, {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                    });
                    proxy.appendChild(proxyImg);
                    document.body.appendChild(proxy);

                    // Ocultar inmediatamente el wrapper de la tarjeta original para CERO duplicidad (el proxy toma su lugar)
                    originWrapper.style.visibility = 'hidden';

                    // Desvanecer cualquier texto de la tarjeta seleccionada para que SOLO quede la imagen
                    const originCardTexts = originCard.querySelectorAll(
                        '.project-showcase-body, .project-category-subtitle, .project-title-heading, .project-view-link'
                    );
                    if (originCardTexts.length > 0) {
                        gsap.to(originCardTexts, { opacity: 0, y: -8, duration: 0.15, ease: 'power2.out' });
                    }

                    // 6. Timeline de salida: el entorno del listado se desvanece mientras la tarjeta viaja hacia la cabecera
                    const elementsToFade = Array.from(
                        data.current.container.querySelectorAll(
                            'h1, h2, h3, .breadcrumbs, [data-breadcrumbs], x-breadcrumbs, [data-flip-card], header, .page-header, .services-header-row, .mb-xl, .mb-sm, p, nav, .pagination, footer, [data-reveal]'
                        )
                    ).filter((el) => el !== originCard && !originCard.contains(el) && !el.contains(originCard));

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
                            resolve();
                        },
                    });

                    // Desvanecer el resto de la página vieja
                    tl.to(elementsToFade, {
                        opacity: 0,
                        y: -15,
                        duration: 0.3,
                        ease: 'power2.inOut',
                    }, 0);

                    // Vuelo y transformación física de 4:3 a 16:9 en la cabecera
                    tl.to(proxy, {
                        top: targetTop,
                        left: targetLeft,
                        width: targetWidth,
                        height: targetHeight,
                        borderRadius: targetRadius,
                        duration: 0.9,
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
                    data.next.container.querySelectorAll('[data-detail-body], .row.g-5, [data-flip-text], .prose')
                ).filter((el) => el !== breadcrumbs && !breadcrumbs?.contains(el));
                const detailTargets = [header, ...meta].filter(Boolean);
                if (detailTargets.length > 0) {
                    gsap.set(detailTargets, { opacity: 0, y: 25 });
                }

                // Ocultar preventivamente el hero real hasta hacer el intercambio
                const targetHero = data.next.container.querySelector('.hero-media-wrapper') ||
                                   data.next.container.querySelector('[data-flip-id]') ||
                                   data.next.container.querySelector('[data-flip-element="image"]');
                if (targetHero) {
                    gsap.set(targetHero, { opacity: 0, visibility: 'hidden' });
                }

                // Preservar la píldora exactamente en su estado físico (ancho y opacidades GSAP)
                if (typeof window !== 'undefined' && window.__portfolioPillWasCompacted !== undefined) {
                    syncDesktopIslandState(window.__portfolioPillWasCompacted);
                }
            },
            async enter(data) {
                const flight = window.__activeFlight;
                window.__activeFlight = null;
                window.__lastClickedFlipCard = null;

                const proxy = flight?.proxy || document.getElementById('active-flight-proxy');

                const targetHero = data.next.container.querySelector('.hero-media-wrapper') ||
                                   data.next.container.querySelector('[data-flip-id]') ||
                                   data.next.container.querySelector('[data-flip-element="image"]');

                const targetImage = targetHero?.querySelector?.('img') || (targetHero instanceof HTMLImageElement ? targetHero : null);

                // Esperar decodificación de la imagen hero si es necesario
                if (targetImage instanceof HTMLImageElement && !targetImage.complete) {
                    try {
                        await targetImage.decode();
                    } catch (e) {
                        await new Promise((res) => {
                            targetImage.onload = res;
                            targetImage.onerror = res;
                        });
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
                    data.next.container.querySelectorAll('[data-detail-body], .row.g-5, [data-flip-text], .prose')
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
                        clearProps: 'opacity,y',
                    });
                }

                if (proxy && targetHero) {
                    // Medir las coordenadas reales del hero en la nueva vista montada en scroll = 0
                    const realRect = targetHero.getBoundingClientRect();

                    // Micro-alineación suave si hay cualquier diferencia subpixel
                    await gsap.to(proxy, {
                        top: realRect.top,
                        left: realRect.left,
                        width: realRect.width,
                        height: realRect.height,
                        duration: 0.15,
                        ease: 'power2.out',
                    });

                    // Intercambio sin salto
                    gsap.set(targetHero, { opacity: 1, visibility: 'visible', clearProps: 'opacity,visibility' });
                    proxy.remove();
                } else if (targetHero) {
                    gsap.set(targetHero, { opacity: 1, visibility: 'visible', clearProps: 'opacity,visibility' });
                    if (proxy) proxy.remove();
                }

                // Revelar textos del detalle alrededor del hero
                if (detailTargets.length > 0) {
                    await gsap.to(detailTargets, {
                        opacity: 1,
                        y: 0,
                        stagger: 0.08,
                        duration: 0.6,
                        ease: 'power2.out',
                        clearProps: 'opacity,y',
                    });
                }

                // Confirmar que la píldora mantenga su estado físico exacto tras la animación
                if (typeof window !== 'undefined' && window.__portfolioPillWasCompacted !== undefined) {
                    syncDesktopIslandState(window.__portfolioPillWasCompacted);
                }

                startScroll();
                resizeScroll();
                ScrollTrigger.refresh();
                document.body.style.pointerEvents = 'all';
            },
        },
    ];
}
