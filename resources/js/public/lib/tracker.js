import { getCookieConsent } from './cookie-consent';

/**
 * Lightweight, privacy-friendly, cookieless telemetry client.
 * Dispatches non-blocking visit pings using navigator.sendBeacon() with a fetch() keepalive fallback.
 * Strictly respects visitor cookie consent preferences.
 */
export function sendAnalyticsPing(path = window.location.pathname) {
    if (typeof window === 'undefined') return;

    // Check visitor consent: if explicitly rejected, do not ping
    const consent = getCookieConsent();
    if (consent && consent.analytics === false) {
        return;
    }

    const token = document.querySelector('meta[name="csrf-token"]')?.content || null;

    const payload = JSON.stringify({
        path: path || window.location.pathname || '/',
        referer: document.referrer || null,
        _token: token,
    });

    const endpoint = '/api/track-visit';

    // 1. Prioritize navigator.sendBeacon: non-blocking, runs in background thread without competing with GSAP / Lenis
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        try {
            const blob = new Blob([payload], { type: 'application/json' });
            const queued = navigator.sendBeacon(endpoint, blob);
            if (queued) return;
        } catch {
            // Fall through to fetch on any beacon exception
        }
    }

    // 2. High-resilience fallback: fetch with keepalive flag
    try {
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: payload,
            keepalive: true,
            credentials: 'same-origin',
        }).catch(() => {
            // Silently ignore telemetry network exceptions
        });
    } catch {
        // Silently ignore
    }
}
