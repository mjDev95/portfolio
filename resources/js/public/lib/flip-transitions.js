import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { startScroll, resizeScroll, stopScroll } from './smooth-scroll';

gsap.registerPlugin(Flip);

const LIST_NAMESPACES = ['projects-index', 'blog-index', 'content-index', 'home', 'default'];
const DETAIL_NAMESPACES = ['project-show', 'blog-show', 'content-show'];

// Snapshot handed off from a transition's `leave()` to its `enter()`.
let flipState = null;
let activeFlipId = null;

/**
 * Resolves the shared flip element (image or media container) and its identifier
 * from the clicked trigger or the outgoing container.
 */
function findOriginFlipElement(trigger, currentContainer) {
    if (trigger) {
        const card = trigger.closest?.('[data-flip-card]');
        if (card) {
            const imageEl = card.querySelector('[data-flip-element="image"]');
            const mediaWrap = card.querySelector('[data-flip-id]');
            const el = imageEl || mediaWrap || card;
            const id = card.getAttribute('data-flip-id') || mediaWrap?.getAttribute('data-flip-id');
            return { el, id, card };
        }
    }

    const fallbackEl = currentContainer?.querySelector?.('[data-flip-element="image"]') ||
                       currentContainer?.querySelector?.('[data-flip-id]');

    return {
        el: fallbackEl ?? null,
        id: fallbackEl?.closest?.('[data-flip-id]')?.getAttribute('data-flip-id') ??
            fallbackEl?.getAttribute('data-flip-id') ?? null,
        card: fallbackEl?.closest?.('[data-flip-card]') ?? null,
    };
}

/**
 * Collects detail content blocks (breadcrumbs, header, prose, specs, gallery)
 * excluding the hero shared element to choreograph their staggered entrance.
 */
function getDetailContentElements(container, targetHero) {
    if (!container) return [];

    const article = container.querySelector('article') || container;
    const directChildren = Array.from(article.children).filter(
        (el) => el !== targetHero && !targetHero?.contains(el) && !el.contains(targetHero)
    );

    if (directChildren.length > 0) {
        return directChildren;
    }

    const elements = container.querySelectorAll(
        '.mb-lg, header, .row.g-5, [data-flip-text], .prose, .data-chip'
    );

    return Array.from(elements).filter((el) => el !== targetHero && !targetHero?.contains(el));
}

/**
 * Real Shared Element Transitions between list and detail pages:
 *  - leave(): captures geometry snapshot (Flip.getState), freezes scroll,
 *             and holds active card frozen in place while fading out the rest of the list (0.18s pause).
 *  - enter(): new container mounts at top (window.scrollTo(0,0)), hides text (opacity: 0),
 *             applies Flip.from() (1.15s, expo.out, scale: true, absolute: true),
 *             and reveals detail text only after 60% of flight has elapsed.
 */
export function createFlipTransitions() {
    return [
        {
            name: 'flip-to-detail',
            from: { namespace: LIST_NAMESPACES },
            to: { namespace: DETAIL_NAMESPACES },
            leave(data) {
                // 1. Congelar el scroll de Lenis al instante
                stopScroll();

                // 2. Guardar el estado geométrico de la tarjeta seleccionada sin mover la imagen
                const { el, id, card } = findOriginFlipElement(data.trigger, data.current.container);
                activeFlipId = id;

                if (el) {
                    try {
                        flipState = Flip.getState(el, { props: 'borderRadius,objectFit' });
                    } catch (e) {
                        console.warn('[Flip] Error capturando estado del origen:', e);
                        flipState = null;
                        activeFlipId = null;
                    }
                } else {
                    flipState = null;
                    activeFlipId = null;
                }

                // 3. Pausa de captura deliberada:
                // Desvanecer el resto del listado manteniendo la tarjeta congelada en su lugar exacto
                // para que el ojo del usuario enfoque la pieza antes del despegue (micropausa 0.18s).
                const tl = gsap.timeline();

                if (card) {
                    const otherCards = Array.from(data.current.container.querySelectorAll('[data-flip-card]')).filter(
                        (c) => c !== card && !card.contains(c)
                    );
                    const surroundingElements = Array.from(
                        data.current.container.querySelectorAll(
                            'h1, h2, h3, p, .mb-xl, .services-header-row, header, footer, .d-flex.justify-content-center, .editorial-cta-wrap, [data-reveal]'
                        )
                    ).filter((node) => !card.contains(node) && node !== card);

                    tl.to([otherCards, surroundingElements], {
                        opacity: 0,
                        duration: 0.2,
                        ease: 'power2.in',
                    });

                    // Micropausa deliberada para enfocar la pieza
                    tl.to({}, { duration: 0.18 });
                } else {
                    tl.to(data.current.container, {
                        opacity: 0,
                        duration: 0.2,
                        ease: 'power2.in',
                    });
                    tl.to({}, { duration: 0.15 });
                }

                return tl;
            },
            enter(data) {
                // 1. El nuevo contenedor entra de inmediato arriba
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;

                const stateToUse = flipState;
                const flipId = activeFlipId;
                flipState = null;
                activeFlipId = null;

                // Buscar la imagen hero del detalle
                const heroWrap = flipId
                    ? data.next.container.querySelector(`[data-flip-id="${flipId}"]`)
                    : data.next.container.querySelector('[data-flip-id]');

                const target = heroWrap?.querySelector('[data-flip-element="image"]') ||
                               heroWrap ||
                               data.next.container.querySelector('[data-flip-element="image"]');

                // Fallback limpio si no existe elemento compartido
                if (!stateToUse || !target) {
                    startScroll();
                    resizeScroll();
                    return gsap.fromTo(
                        data.next.container,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
                    );
                }

                // 2. Ocultar todo el contenido textual/bloques del detalle (opacity: 0, y: 30)
                const detailElements = getDetailContentElements(data.next.container, heroWrap || target);
                gsap.set(detailElements, { opacity: 0, y: 30 });

                try {
                    // 3. Aplica Flip.from(state) sobre la imagen hero con duración 1.15s, curva expo.out y scale: true
                    const flipTween = Flip.from(stateToUse, {
                        targets: target,
                        duration: 1.15,
                        ease: 'expo.out',
                        absolute: true,
                        scale: true,
                        props: 'borderRadius',
                        onComplete: () => {
                            startScroll();
                            resizeScroll();
                        },
                    });

                    const tl = gsap.timeline();
                    tl.add(flipTween, 0);

                    // 4. Retardo en el texto del detalle:
                    // Aparece solo cuando la imagen ya lleve el 60% de su recorrido completado (1.15 * 0.6 = ~0.69s)
                    tl.to(
                        detailElements,
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.06,
                            ease: 'power2.out',
                            clearProps: 'opacity,y',
                        },
                        0.69
                    );

                    return tl;
                } catch (e) {
                    console.warn('[Flip] Error ejecutando Flip.from:', e);
                    startScroll();
                    resizeScroll();
                    return gsap.fromTo(
                        data.next.container,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.35, clearProps: 'all' }
                    );
                }
            },
        },
        {
            name: 'flip-to-list',
            from: { namespace: DETAIL_NAMESPACES },
            to: { namespace: LIST_NAMESPACES },
            leave(data) {
                stopScroll();

                const { el, id } = findOriginFlipElement(data.trigger, data.current.container);
                activeFlipId = id;

                if (el) {
                    try {
                        flipState = Flip.getState(el, { props: 'borderRadius,objectFit' });
                    } catch (e) {
                        console.warn('[Flip] Error capturando estado del detalle:', e);
                        flipState = null;
                        activeFlipId = null;
                    }
                } else {
                    flipState = null;
                    activeFlipId = null;
                }

                const heroWrap = el?.closest?.('[data-flip-id]') || el;
                const detailElements = getDetailContentElements(data.current.container, heroWrap);
                const tl = gsap.timeline();

                if (detailElements.length > 0) {
                    tl.to(detailElements, {
                        opacity: 0,
                        duration: 0.2,
                        ease: 'power2.in',
                    });
                    tl.to({}, { duration: 0.18 });
                } else {
                    tl.to(data.current.container, {
                        opacity: 0,
                        duration: 0.2,
                        ease: 'power2.in',
                    });
                    tl.to({}, { duration: 0.15 });
                }

                return tl;
            },
            enter(data) {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;

                const stateToUse = flipState;
                const flipId = activeFlipId;
                flipState = null;
                activeFlipId = null;

                const cardWrap = flipId
                    ? data.next.container.querySelector(`[data-flip-id="${flipId}"]`)
                    : null;

                const target = cardWrap?.querySelector('[data-flip-element="image"]') ||
                               cardWrap ||
                               (flipId ? data.next.container.querySelector(`[data-flip-id="${flipId}"]`) : null);

                if (!stateToUse || !target) {
                    startScroll();
                    resizeScroll();
                    return gsap.fromTo(
                        data.next.container,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
                    );
                }

                const otherCards = Array.from(data.next.container.querySelectorAll('[data-flip-card]')).filter(
                    (c) => c !== cardWrap && !cardWrap?.contains(c)
                );
                gsap.set(otherCards, { opacity: 0, y: 15 });

                try {
                    const flipTween = Flip.from(stateToUse, {
                        targets: target,
                        duration: 1.15,
                        ease: 'expo.out',
                        absolute: true,
                        scale: true,
                        props: 'borderRadius',
                        onComplete: () => {
                            startScroll();
                            resizeScroll();
                        },
                    });

                    const tl = gsap.timeline();
                    tl.add(flipTween, 0);

                    tl.to(
                        otherCards,
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.5,
                            stagger: 0.04,
                            ease: 'power2.out',
                            clearProps: 'opacity,y',
                        },
                        0.69
                    );

                    return tl;
                } catch (e) {
                    console.warn('[Flip] Error ejecutando Flip.from inverso:', e);
                    startScroll();
                    resizeScroll();
                    return gsap.fromTo(
                        data.next.container,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.35, clearProps: 'all' }
                    );
                }
            },
        },
    ];
}
