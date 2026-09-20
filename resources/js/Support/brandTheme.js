/**
 * Helper de Tema y Paleta Dinámica para el Super Admin
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
 * Aplica la paleta personalizada del Super Admin al elemento <html>
 * Inyecta las variables CSS que Tailwind consume en tiempo real.
 */
export function applySuperAdminPalette(colors = {}) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.add('is-super-admin');

    const primary = colors.primary || '#CB2128';
    const secondary = colors.secondary || '#DFB136';
    const tertiary = colors.tertiary || '#1D4ED8';
    const accent = colors.accent || '#F59E0B';

    const primaryRgb = hexToRgbString(primary) || '203 33 40';
    const primaryHover = shadeColor(primary, -12);
    const primaryDark = shadeColor(primary, -25);
    const primarySubtle = shadeColor(primary, 88);

    const secondaryRgb = hexToRgbString(secondary) || '223 177 54';
    const secondaryHover = shadeColor(secondary, -12);
    const secondarySubtle = shadeColor(secondary, 88);

    const tertiaryRgb = hexToRgbString(tertiary) || '29 78 216';
    const tertiaryHover = shadeColor(tertiary, -12);
    const tertiarySubtle = shadeColor(tertiary, 88);

    const accentRgb = hexToRgbString(accent) || '245 158 11';
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

    try {
        localStorage.setItem('admin_palette_primary', primary);
        localStorage.setItem('admin_palette_secondary', secondary);
        localStorage.setItem('admin_palette_tertiary', tertiary);
        localStorage.setItem('admin_palette_accent', accent);
    } catch (e) {}
}

/**
 * Restablece los estilos para un usuario con rol cliente/estándar
 * Remueve la clase de super admin y cualquier variable en línea.
 */
export function resetClientPalette() {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('is-super-admin');

    root.style.removeProperty('--brand-primary');
    root.style.removeProperty('--brand-primary-rgb');
    root.style.removeProperty('--brand-primary-hover');
    root.style.removeProperty('--brand-primary-dark');
    root.style.removeProperty('--brand-primary-subtle');

    root.style.removeProperty('--brand-secondary');
    root.style.removeProperty('--brand-secondary-rgb');
    root.style.removeProperty('--brand-secondary-hover');
    root.style.removeProperty('--brand-secondary-subtle');

    root.style.removeProperty('--brand-tertiary');
    root.style.removeProperty('--brand-tertiary-rgb');
    root.style.removeProperty('--brand-tertiary-hover');
    root.style.removeProperty('--brand-tertiary-subtle');

    root.style.removeProperty('--brand-accent');
    root.style.removeProperty('--brand-accent-rgb');
    root.style.removeProperty('--brand-accent-hover');
    root.style.removeProperty('--brand-accent-subtle');

    try {
        localStorage.removeItem('admin_palette_primary');
        localStorage.removeItem('admin_palette_secondary');
        localStorage.removeItem('admin_palette_tertiary');
        localStorage.removeItem('admin_palette_accent');
    } catch (e) {}
}

