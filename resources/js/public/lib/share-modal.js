import gsap from 'gsap';
import { stopScroll, startScroll } from './smooth-scroll';

let isInitialized = false;
let isAnimating = false;
let isOpen = false;
let activeTriggerBtn = null;

let currentShareData = {
    title: '',
    url: '',
    type: 'Contenido',
};

function lockScroll() {
    stopScroll();
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lenis-stopped');
}

function unlockScroll() {
    startScroll();
    document.body.style.overflow = '';
    document.documentElement.classList.remove('lenis-stopped');
}

/**
 * Cierra el modal global de compartir con físicas ultra rápidas y restaura el scroll.
 *
 * @param {Function} [onFinished] - Callback ejecutado tras finalizar la animación
 */
export function closeShareModal(onFinished) {
    const backdrop = document.getElementById('global-share-modal');
    const card = document.getElementById('modal-card');
    const content = document.getElementById('modal-content-wrap');

    // Desbloquear scroll inmediatamente como salvaguarda
    unlockScroll();

    if (!backdrop || !card) return;
    if (!isOpen || isAnimating) {
        gsap.killTweensOf([backdrop, card, content?.children]);
        gsap.set(backdrop, { autoAlpha: 0 });
        gsap.set(card, { clearProps: 'all' });
        if (content?.children) {
            gsap.set(content.children, { clearProps: 'all' });
        }
        isOpen = false;
        isAnimating = false;
        if (activeTriggerBtn) {
            activeTriggerBtn.setAttribute('aria-expanded', 'false');
            activeTriggerBtn = null;
        }
        if (typeof onFinished === 'function') onFinished();
        return;
    }

    isAnimating = true;

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(backdrop, { autoAlpha: 0 });
            gsap.set(card, { clearProps: 'all' });
            if (content?.children) {
                gsap.set(content.children, { clearProps: 'all' });
            }
            backdrop.setAttribute('aria-hidden', 'true');
            isOpen = false;
            isAnimating = false;

            if (activeTriggerBtn) {
                activeTriggerBtn.setAttribute('aria-expanded', 'false');
                activeTriggerBtn = null;
            }

            if (typeof onFinished === 'function') {
                onFinished();
            }
        },
    });

    // Salida sumamente rápida y ágil (~0.16s total)
    if (content?.children && content.children.length > 0) {
        tl.to(content.children, {
            opacity: 0,
            y: 4,
            duration: 0.08,
            ease: 'power2.in',
        });
    }

    tl.to(
        card,
        {
            scale: 0.94,
            y: 10,
            opacity: 0,
            filter: 'blur(4px)',
            duration: 0.15,
            ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
        '-=0.04'
    ).to(
        backdrop,
        {
            opacity: 0,
            duration: 0.12,
            ease: 'power2.inOut',
        },
        '-=0.10'
    );
}

/**
 * Abre el modal global de compartir con animación elástica rápida (~0.28s) y bloquea el scroll.
 *
 * @param {Object} options
 * @param {string} options.title - Título del contenido
 * @param {string} options.url - URL canónica a compartir
 * @param {string} options.type - Tipo de contenido (e.g. 'Ensayo', 'Proyecto', 'Publicación')
 * @param {HTMLElement|null} options.triggerEl - Botón disparador para accesibilidad aria-expanded
 */
export function openShareModal({ title, url, type, triggerEl = null } = {}) {
    const backdrop = document.getElementById('global-share-modal');
    const card = document.getElementById('modal-card');
    const content = document.getElementById('modal-content-wrap');

    if (!backdrop || !card) return;
    if (isOpen || isAnimating) return;

    isAnimating = true;

    // Bloquear scroll inmediatamente al abrir
    lockScroll();

    const resolvedTitle = title || document.title;
    const resolvedUrl = url || window.location.href;
    const resolvedType = type || 'Contenido';

    currentShareData = {
        title: resolvedTitle,
        url: resolvedUrl,
        type: resolvedType,
    };

    // Actualizar elementos textuales del modal
    const titleEl = document.getElementById('share-modal-title');
    const itemTitleEl = document.getElementById('share-modal-item-title');
    const urlInput = document.getElementById('share-modal-url-input');

    if (titleEl) {
        titleEl.textContent = `Compartir`;
    }
    if (itemTitleEl) {
        itemTitleEl.textContent = resolvedTitle;
    }
    if (urlInput) {
        urlInput.value = resolvedUrl;
    }

    // Actualizar enlaces de redes sociales
    const encodedTitle = encodeURIComponent(resolvedTitle);
    const encodedUrl = encodeURIComponent(resolvedUrl);

    const xLink = document.getElementById('share-channel-x');
    if (xLink) {
        xLink.href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    }

    const linkedinLink = document.getElementById('share-channel-linkedin');
    if (linkedinLink) {
        linkedinLink.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }

    const whatsappLink = document.getElementById('share-channel-whatsapp');
    if (whatsappLink) {
        whatsappLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(resolvedTitle + ' — ' + resolvedUrl)}`;
    }

    // Configurar botón nativo / email fallback
    const nativeBtn = document.getElementById('btn-native-share');
    const nativeLabel = document.getElementById('native-share-text');

    if (nativeBtn && nativeLabel) {
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            nativeLabel.textContent = 'Nativo';
        } else {
            nativeLabel.textContent = 'Email';
        }
    }

    // Guardar botón activo para aria-expanded
    if (triggerEl) {
        activeTriggerBtn = triggerEl;
        activeTriggerBtn.setAttribute('aria-expanded', 'true');
    }

    // Estado inicial invisible optimizado para entrada instantánea
    backdrop.setAttribute('aria-hidden', 'false');
    gsap.set(backdrop, { autoAlpha: 1 });
    gsap.set(card, {
        scale: 0.94,
        y: 18,
        opacity: 0,
        filter: 'blur(6px)',
    });

    const tl = gsap.timeline({
        onComplete: () => {
            isOpen = true;
            isAnimating = false;
        },
    });

    // 1. Entrada suave y veloz del backdrop
    tl.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: 0.16, ease: 'power2.out' }
    )
    // 2. Despegue elástico ultra rápido
    .to(
        card,
        {
            scale: 1,
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.28,
            ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
        '-=0.10'
    );

    // 3. Revelado rápido y escalonado del contenido interno
    if (content?.children && content.children.length > 0) {
        tl.fromTo(
            content.children,
            { opacity: 0, y: 8 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.018,
                duration: 0.2,
                ease: 'power2.out',
            },
            '-=0.18'
        );
    }
}

/**
 * Inicializa el controlador global del modal de compartir mediante delegación de eventos.
 * Al estar anclado en `document`, persiste y funciona transparentemente a través de
 * todas las transiciones de página de Barba.js v2 sin necesidad de re-binding.
 */
export function initShareModal() {
    if (isInitialized) return;
    isInitialized = true;

    // Delegación de clics en el documento
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-share-modal-open]');
        if (trigger) {
            e.preventDefault();
            const title = trigger.dataset.shareTitle || '';
            const url = trigger.dataset.shareUrl || '';
            const type = trigger.dataset.shareType || 'Contenido';
            openShareModal({ title, url, type, triggerEl: trigger });
            return;
        }

        // Cierre por botón cerrar
        if (e.target.closest('#btn-close-share-modal')) {
            e.preventDefault();
            closeShareModal();
            return;
        }

        // Cierre por clic en el fondo desenfocado (backdrop)
        const backdrop = document.getElementById('global-share-modal');
        if (backdrop && e.target === backdrop) {
            closeShareModal();
        }
    });

    // Cierre con la tecla Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeShareModal();
        }
    });

    // Acción de Copiar con feedback visual ágil y auto-cierre
    document.addEventListener('click', async (e) => {
        const copyBtn = e.target.closest('#btn-copy-modal-url');
        if (!copyBtn) return;

        const copyLabel = document.getElementById('copy-btn-label');
        const urlInput = document.getElementById('share-modal-url-input');
        const targetUrl = urlInput ? urlInput.value : currentShareData.url || window.location.href;

        const handleSuccess = () => {
            copyBtn.classList.add('copied-success');
            if (copyLabel) copyLabel.textContent = 'Copiado ✓';

            // Pausa breve de 220ms para confirmación visual y auto-cierre rápido
            setTimeout(() => {
                closeShareModal(() => {
                    copyBtn.classList.remove('copied-success');
                    if (copyLabel) copyLabel.textContent = 'Copiar';
                });
            }, 220);
        };

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(targetUrl);
                handleSuccess();
            } else if (urlInput) {
                urlInput.select();
                document.execCommand('copy');
                handleSuccess();
            }
        } catch {
            if (urlInput) {
                urlInput.select();
                document.execCommand('copy');
                handleSuccess();
            }
        }
    });

    // Botón de Web Share API nativo / Email fallback
    document.addEventListener('click', async (e) => {
        const nativeBtn = e.target.closest('#btn-native-share');
        if (!nativeBtn) return;

        const targetUrl = currentShareData.url || window.location.href;
        const targetTitle = currentShareData.title || document.title;

        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                await navigator.share({
                    title: targetTitle,
                    url: targetUrl,
                });
                closeShareModal();
            } catch {
                // Diálogo cancelado por el usuario
            }
        } else {
            // Fallback a Email
            window.location.href = `mailto:?subject=${encodeURIComponent(targetTitle)}&body=${encodeURIComponent(targetUrl)}`;
        }
    });
}
