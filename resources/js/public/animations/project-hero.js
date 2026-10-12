import gsap from 'gsap';
import { ScrollTrigger } from '../lib/smooth-scroll';

let projectHeroCtx = null;

/**
 * Destruye de forma estricta y limpia el contexto de GSAP y ScrollTriggers del Hero de Proyecto.
 * Debe invocarse durante Barba `beforeLeave` para garantizar que la transición entrante
 * tenga cero interferencia geométrica o tweens residuales.
 */
export function cleanupProjectHero() {
    if (projectHeroCtx) {
        projectHeroCtx.revert();
        projectHeroCtx = null;
    }
}

/**
 * Inicializa el efecto cinemático de Imagen Destacada estilo Mivon:
 * - Parallax vertical continuo a contratiempo (yPercent: -8 a 8).
 * - Reducción sutil de escala (1.08 a 1.0).
 * - Interpolación orgánica (scrub: 1.2) sincronizada con el ticker de Lenis.
 * - Blindaje total para GSAP Flip: el tween se monta EXCLUSIVAMENTE sobre el <img> interior,
 *   dejando intacta la geometría del contenedor externo .hero-media-wrapper.
 *
 * @param {HTMLElement} container - Contenedor Barba entrante o elemento raíz
 */
export function initProjectHero(container = document) {
    cleanupProjectHero();

    // Blindaje estricto: EXCLUSIVAMENTE para casos de estudio de proyectos
    // Nunca debe ejecutarse en blog ni en ningún otro CPT
    const heroWrapper = container.querySelector('[data-project-hero-effect]');
    if (!heroWrapper) return;

    const heroImg = heroWrapper.querySelector('img.hero-parallax-media') || heroWrapper.querySelector('img');
    if (!heroImg) return;

    projectHeroCtx = gsap.context(() => {
        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isReduced) {
            gsap.set(heroImg, { clearProps: 'transform' });
            return;
        }

        // Parallax idéntico a Mivon con transform: translate(0px, -Ypx) y data-speed:
        // En scrollY = 0 (inicio exacto de la página), la imagen está estrictamente en y: 0 (cero salto).
        // En cuanto el usuario mueve el scroll hacia abajo (desde el píxel 1),
        // se traslada progresivamente en contratiempo hacia arriba (hasta -220px) con scrub suave sincronizado a Lenis.
        gsap.fromTo(
            heroImg,
            {
                y: 0,
            },
            {
                y: -220,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.documentElement,
                    start: 'top top',
                    end: () => `+=${window.innerHeight * 1.5}`,
                    scrub: 1.2,
                    invalidateOnRefresh: true,
                },
            }
        );
    }, heroWrapper);
}

