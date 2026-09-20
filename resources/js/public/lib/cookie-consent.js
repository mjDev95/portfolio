/**
 * Cookie Consent Manager for the Public Portfolio.
 * Lightweight, privacy-compliant, zero-border aesthetic.
 */

const COOKIE_NAME = 'portfolio_cookie_consent';
const STORAGE_KEY = 'portfolio_cookie_consent';

export function getCookieConsent() {
    if (typeof window === 'undefined') return null;

    try {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
            return JSON.parse(local);
        }
    } catch {
        // Fallback to cookie
    }

    const matches = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)'));
    if (matches && matches[1]) {
        try {
            return JSON.parse(decodeURIComponent(matches[1]));
        } catch {
            return null;
        }
    }

    return null;
}

export function saveCookieConsent(analyticsAccepted = true) {
    const consent = {
        essential: true,
        analytics: Boolean(analyticsAccepted),
        timestamp: new Date().toISOString(),
    };

    const value = encodeURIComponent(JSON.stringify(consent));
    const maxAge = 365 * 24 * 60 * 60; // 1 year

    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
        // Ignore storage quotas
    }

    hideCookieBanner();

    window.dispatchEvent(new CustomEvent('portfolio:cookie-consent-updated', { detail: consent }));

    return consent;
}

export function hasAnalyticsConsent() {
    const consent = getCookieConsent();
    return consent ? Boolean(consent.analytics) : false;
}

export function showCookieBanner() {
    const banner = document.getElementById('public-cookie-banner');
    if (!banner) return;
    banner.style.display = 'block';
    requestAnimationFrame(() => {
        banner.classList.add('is-visible');
    });
}

export function hideCookieBanner() {
    const banner = document.getElementById('public-cookie-banner');
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(() => {
        banner.style.display = 'none';
    }, 300);
}

export function openCookieSettings() {
    const banner = document.getElementById('public-cookie-banner');
    if (!banner) return;
    showCookieBanner();
}

export function initCookieConsent() {
    if (typeof window === 'undefined') return;

    // Attach to global window for footer link triggers
    window.openCookieSettings = openCookieSettings;

    const banner = document.getElementById('public-cookie-banner');
    if (!banner) return;

    const acceptBtn = document.getElementById('cookie-accept-all');
    const necessaryBtn = document.getElementById('cookie-accept-necessary');
    const closeBtn = document.getElementById('cookie-close-banner');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            saveCookieConsent(true);
        });
    }

    if (necessaryBtn) {
        necessaryBtn.addEventListener('click', () => {
            saveCookieConsent(false);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            // Closing without explicit choice defaults to only necessary
            saveCookieConsent(false);
        });
    }

    // Check if consent has already been given
    const existing = getCookieConsent();
    if (!existing) {
        // Small delay to prevent layout thrashing during initial GSAP entrance
        setTimeout(() => {
            showCookieBanner();
        }, 1200);
    }
}

