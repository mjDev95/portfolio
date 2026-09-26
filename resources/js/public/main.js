import { initSmoothScroll, ScrollTrigger } from './lib/smooth-scroll';
import { initMagneticCursor } from './lib/magnetic-cursor';
import { initBarba } from './lib/transitions';
import { initPageAnimations } from './animations/init-page';
import { initContactForm } from './lib/contact-form';
import { sendAnalyticsPing } from './lib/tracker';
import { initCookieConsent } from './lib/cookie-consent';
import { initThemeToggle } from './lib/theme-toggle';
import { initDynamicIsland } from './animations/dynamic-island';

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initCookieConsent();

    // Initial visit tracking ping (cookieless / non-blocking)
    sendAnalyticsPing(window.location.pathname);

    window.addEventListener('portfolio:cookie-consent-updated', (e) => {
        if (e.detail && e.detail.analytics) {
            sendAnalyticsPing(window.location.pathname);
        }
    });

    initSmoothScroll();

    const { refreshMagneticTargets } = initMagneticCursor();

    const container = document.querySelector('[data-barba="container"]');
    if (container) {
        initPageAnimations(container);
        initContactForm(container);
        ScrollTrigger.refresh();
    }

    // Inicializar Dynamic Island DESPUÉS de que el pin spacer del hero curtain (1600px) esté calculado
    initDynamicIsland();

    initBarba({
        onAfterEnter: () => {
            initThemeToggle();
            refreshMagneticTargets();

            const nextContainer = document.querySelector('[data-barba="container"]');
            if (nextContainer) {
                initContactForm(nextContainer);
            }
            initDynamicIsland();
        },
    });
});

