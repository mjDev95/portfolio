/**
 * Helper de Tema y Paleta Dinámica Exclusiva por Usuario (Super Admin vs Cliente)
 * Convierte colores HEX a RGB y deriva matices para variables CSS de Tailwind.
 */

export function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return null;
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
        clean = clean.split('').map((c) => c + c).join('');
    }
    if (clean.length !== 6) return null;

    const num = parseInt(clean, 16);
    if (isNaN(num)) return null;

    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

export function hexToRgbString(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

export function shadeColor(color, percent) {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;

    const R = Math.round((t - rgb.r) * p) + rgb.r;
    const G = Math.round((t - rgb.g) * p) + rgb.g;
    const B = Math.round((t - rgb.b) * p) + rgb.b;

    const toHex = (n) => {
        const h = Math.max(0, Math.min(255, n)).toString(16);
        return h.length === 1 ? '0' + h : h;
    };

    return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}

/**
 * Inyecta las variables CSS de paleta en document.documentElement.
 */
function injectPaletteCssVariables(colors = {}) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    const primary = colors.primary;
    const primaryRgb = hexToRgbString(primary);
    const primaryHover = shadeColor(primary, -12);
    const primaryDark = shadeColor(primary, -25);
    const primarySubtle = shadeColor(primary, 88);

    const secondary = colors.secondary;
    const secondaryRgb = hexToRgbString(secondary);
    const secondaryHover = shadeColor(secondary, -12);
    const secondarySubtle = shadeColor(secondary, 88);

    const tertiary = colors.tertiary;
    const tertiaryRgb = hexToRgbString(tertiary);
    const tertiaryHover = shadeColor(tertiary, -12);
    const tertiarySubtle = shadeColor(tertiary, 88);

    const accent = colors.accent;
    const accentRgb = hexToRgbString(accent);
    const accentHover = shadeColor(accent, -12);
    const accentSubtle = shadeColor(accent, 88);

    root.style.setProperty('--brand-primary', primary);
    root.style.setProperty('--brand-primary-rgb', primaryRgb);
    root.style.setProperty('--brand-primary-hover', primaryHover);
    root.style.setProperty('--brand-primary-dark', primaryDark);
    root.style.setProperty('--brand-primary-subtle', primarySubtle);

    root.style.setProperty('--brand-secondary', secondary);
    root.style.setProperty('--brand-secondary-rgb', secondaryRgb);
    root.style.setProperty('--brand-secondary-hover', secondaryHover);
    root.style.setProperty('--brand-secondary-subtle', secondarySubtle);

    root.style.setProperty('--brand-tertiary', tertiary);
    root.style.setProperty('--brand-tertiary-rgb', tertiaryRgb);
    root.style.setProperty('--brand-tertiary-hover', tertiaryHover);
    root.style.setProperty('--brand-tertiary-subtle', tertiarySubtle);

    root.style.setProperty('--brand-accent', accent);
    root.style.setProperty('--brand-accent-rgb', accentRgb);
    root.style.setProperty('--brand-accent-hover', accentHover);
    root.style.setProperty('--brand-accent-subtle', accentSubtle);
}

/**
 * Aplica la paleta personalizada del Super Admin al elemento <html>
 */
export function applySuperAdminPalette(colors = {}, userId = null) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.add('is-super-admin');

    const primary = colors.primary || '#CB2128';
    const secondary = colors.secondary || '#DFB136';
    const tertiary = colors.tertiary || '#1D4ED8';
    const accent = colors.accent || '#F59E0B';

    injectPaletteCssVariables({ primary, secondary, tertiary, accent });

    try {
        if (userId) {
            localStorage.setItem(`user_palette_${userId}_primary`, primary);
            localStorage.setItem(`user_palette_${userId}_secondary`, secondary);
            localStorage.setItem(`user_palette_${userId}_tertiary`, tertiary);
            localStorage.setItem(`user_palette_${userId}_accent`, accent);
        }
        localStorage.setItem('admin_palette_primary', primary);
        localStorage.setItem('admin_palette_secondary', secondary);
        localStorage.setItem('admin_palette_tertiary', tertiary);
        localStorage.setItem('admin_palette_accent', accent);
    } catch (e) {}
}

/**
 * Aplica la paleta exclusiva de Cliente / Usuario Estándar.
 * Garantiza que NUNCA se vean los hovers o tonos de Super Admin.
 */
export function applyClientPalette(colors = {}, userId = null) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('is-super-admin');

    // Colores exclusivos de cliente (o los que tenga asignados)
    const primary = colors.primary || '#2787F5';
    const secondary = colors.secondary || '#6c757d';
    const tertiary = colors.tertiary || '#00B4D8';
    const accent = colors.accent || '#DFB136';

    injectPaletteCssVariables({ primary, secondary, tertiary, accent });

    try {
        if (userId) {
            localStorage.setItem(`user_palette_${userId}_primary`, primary);
            localStorage.setItem(`user_palette_${userId}_secondary`, secondary);
            localStorage.setItem(`user_palette_${userId}_tertiary`, tertiary);
            localStorage.setItem(`user_palette_${userId}_accent`, accent);
        }
        // Limpiar las claves globales de admin para evitar contaminación cruzada
        localStorage.removeItem('admin_palette_primary');
        localStorage.removeItem('admin_palette_secondary');
        localStorage.removeItem('admin_palette_tertiary');
        localStorage.removeItem('admin_palette_accent');
    } catch (e) {}
}

/**
 * Restablece los estilos para un usuario cliente a los valores de fábrica.
 */
export function resetClientPalette(userId = null) {
    applyClientPalette({
        primary: '#2787F5',
        secondary: '#6c757d',
        tertiary: '#00B4D8',
        accent: '#DFB136',
    }, userId);
}
