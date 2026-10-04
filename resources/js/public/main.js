import { initSmoothScroll, ScrollTrigger } from './lib/smooth-scroll';
import { initMagneticCursor } from './lib/magnetic-cursor';
import { initBarba } from './lib/transitions';
import { initPageAnimations } from './animations/init-page';
import { initContactForm } from './lib/contact-form';
import { sendAnalyticsPing } from './lib/tracker';
import { initCookieConsent } from './lib/cookie-consent';
import { initThemeToggle } from './lib/theme-toggle';
import { initDynamicIsland } from './animations/dynamic-island';
import { initShareModal } from './lib/share-modal';
import { initFooterReveal } from './animations/footer';

function initCopyEmail() {
    document.addEventListener('click', async (e) => {
        const copyBtn = e.target.closest('[data-copy-email]');
        if (!copyBtn) return;

        const email = copyBtn.getAttribute('data-copy-email') || 'mjgaliciab@gmail.com';
        const label = copyBtn.querySelector('[data-copy-label]') || copyBtn;
        const originalText = label.textContent;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(email);
            } else {
                const input = document.createElement('input');
                input.value = email;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                input.remove();
            }

            label.textContent = '¡Copiado! ✓';
            copyBtn.classList.add('copied-success');
            setTimeout(() => {
                label.textContent = originalText;
                copyBtn.classList.remove('copied-success');
            }, 2000);
        } catch (err) {
            console.warn('[Clipboard] Fallback:', err);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initCookieConsent();
    initShareModal();
    initCopyEmail();

    // Initial visit tracking ping (cookieless / non-blocking)
    sendAnalyticsPing(window.location.pathname);

    window.addEventListener('portfolio:cookie-consent-updated', (e) => {
        if (e.detail && e.detail.analytics) {
            sendAnalyticsPing(window.location.pathname);
        }
    });

    initSmoothScroll();
    window.addEventListener('load', () => ScrollTrigger.refresh());

    const { refreshMagneticTargets } = initMagneticCursor();

    const container = document.querySelector('[data-barba="container"]');
    if (container) {
        initPageAnimations(container);
        initContactForm(container);
        ScrollTrigger.refresh();
    }

    // Inicializar Dynamic Island DESPUÉS de que el pin spacer del hero curtain (1600px) esté calculado
    initDynamicIsland();
    initFooterReveal();

    initBarba({
        onAfterEnter: () => {
            initThemeToggle();
            refreshMagneticTargets();

            const nextContainer = document.querySelector('[data-barba="container"]');
            if (nextContainer) {
                initContactForm(nextContainer);
            }
            initDynamicIsland();
            initFooterReveal();
        },
    });
});

