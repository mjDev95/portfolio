/**
 * Theme Toggle Handler (Wabi-Sabi Warm Paper vs. Refined Dark Mode)
 * Persists user preference in localStorage and toggles 'dark' / 'light' class on <html>.
 */
export function initThemeToggle() {
    const toggleButtons = document.querySelectorAll('#theme-toggle, #mobile-island-theme-toggle, [data-theme-toggle]');
    if (!toggleButtons.length) return;

    toggleButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
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
    });
}
