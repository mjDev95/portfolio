/**
 * Theme Toggle Handler (Wabi-Sabi Warm Paper vs. Refined Dark Mode)
 * Persists user preference in localStorage and toggles 'dark' / 'light' class on <html>.
 */
export function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Remove any previously attached listeners on re-runs
    toggleBtn.replaceWith(toggleBtn.cloneNode(true));
    const newBtn = document.getElementById('theme-toggle');
    if (!newBtn) return;

    newBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        const nextTheme = isDark ? 'light' : 'dark';

        if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('portfolio-theme', nextTheme);
    });
}
