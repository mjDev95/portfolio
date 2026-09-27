import gsap from 'gsap';

/**
 * Resuelve una entrada flexible de elementos en un array plano de HTMLElements.
 * Acepta selector CSS string, HTMLElement individual, NodeList o Array.
 *
 * @param {string|Element|NodeList|Element[]} targets
 * @returns {Element[]}
 */
function resolveTargets(targets) {
    if (!targets) {
        return [];
    }

    if (typeof targets === 'string') {
        try {
            return Array.from(document.querySelectorAll(targets));
        } catch {
            return [];
        }
    }

    if (targets instanceof Element) {
        return [targets];
    }

    if (targets instanceof NodeList || Array.isArray(targets)) {
        return Array.from(targets).filter((el) => el instanceof Element);
    }

    return [];
}

/**
 * Inicializa la animación orgánica y realista de la mano saludando ("waving hand")
 * mediante GSAP 3 con física de oscilación amortiguada decreciente.
 *
 * @param {string|Element|NodeList|Element[]} targets Selector CSS o elementos a animar
 * @param {Object} [options={}] Opciones de configuración
 * @param {number} [options.repeatDelay=1.4] Tiempo de pausa entre ciclos de saludo en segundos
 * @param {boolean} [options.paused=false] Si la animación debe iniciar en pausa
 * @param {number} [options.maxRotation=16] Ángulo máximo de rotación base en grados
 * @param {number} [options.intensity=1] Multiplicador de escala/fuerza de rotación
 * @param {string} [options.transformOrigin="48% 90%"] Punto de pivote en la base de la muñeca
 * @param {number|Function} [options.delay=0] Retardo inicial antes de comenzar
 * @param {number} [options.repeat=-1] Número de repeticiones (-1 para infinito)
 * @returns {gsap.core.Timeline|gsap.core.Timeline[]|null} Timeline o colección de timelines creados
 */
export function initWavingHand(targets, options = {}) {
    const elements = resolveTargets(targets);

    if (!elements.length) {
        return null;
    }

    const {
        repeatDelay = 1.4,
        paused = false,
        maxRotation = 16,
        intensity = 1,
        transformOrigin = '42% 92%',
        delay = 0,
        repeat = -1,
    } = options;

    const baseAngle = maxRotation * intensity;
    const isSingleInput = targets instanceof Element || (typeof targets === 'string' && elements.length === 1);

    const timelines = elements.map((el, index) => {
        // Fijar el punto de pivote en la base de la muñeca
        gsap.set(el, {
            transformOrigin,
            force3D: true,
        });

        const tl = gsap.timeline({
            repeat,
            repeatDelay,
            paused,
            delay: typeof delay === 'function' ? delay(index, el) : delay,
        });

        // 1. Inicio: Impulso de anticipación hacia un lateral
        tl.to(el, {
            rotation: baseAngle,
            duration: 0.28,
            ease: 'power2.out',
        })
        // 2. Oscilación: Vaivenes amortiguados decrecientes con física sinusoidal orgánica
        .to(el, {
            rotation: -baseAngle * 0.85,
            duration: 0.26,
            ease: 'sine.inOut',
        })
        .to(el, {
            rotation: baseAngle * 0.65,
            duration: 0.24,
            ease: 'sine.inOut',
        })
        .to(el, {
            rotation: -baseAngle * 0.38,
            duration: 0.20,
            ease: 'sine.inOut',
        })
        .to(el, {
            rotation: baseAngle * 0.16,
            duration: 0.16,
            ease: 'sine.inOut',
        })
        // 3. Cierre: Retorno elástico natural a la posición neutra
        .to(el, {
            rotation: 0,
            duration: 0.35,
            ease: 'power3.out',
        });

        return tl;
    });

    if (isSingleInput) {
        return timelines[0];
    }

    // Decoramos el array de timelines con helpers unificados para control de ciclo de vida
    timelines.kill = () => timelines.forEach((tl) => tl.kill());
    timelines.pause = () => timelines.forEach((tl) => tl.pause());
    timelines.play = () => timelines.forEach((tl) => tl.play());
    timelines.resume = () => timelines.forEach((tl) => tl.resume());

    return timelines;
}

// Exponer en el ámbito global si se ejecuta en navegador
if (typeof window !== 'undefined') {
    window.initWavingHand = initWavingHand;
}

