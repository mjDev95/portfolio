/**
 * CSRF helper for fetch/Axios-style POST requests fired from the public
 * Blade + Barba.js front-end (e.g. the contact form). Laravel invalidates
 * requests without a fresh X-CSRF-TOKEN with a 419 response, so every
 * mutating request must read the current token from the <meta> tag —
 * never hardcode it, since Barba page swaps can refresh it (see
 * updateCsrfTokenFrom below).
 */
export function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

/**
 * Barba fetches the next page's full HTML before swapping the container.
 * If that response carries a different token (e.g. session was rotated),
 * sync it into the current document's <head> so subsequent POSTs succeed.
 */
export function updateCsrfTokenFrom(html) {
    const match = html.match(/<meta name="csrf-token" content="([^"]+)">/);

    if (match) {
        document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', match[1]);
    }
}

/**
 * Thin fetch wrapper that always injects the current CSRF header.
 */
export async function securePost(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(data),
    });

    return response;
}
