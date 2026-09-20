import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Sun, Moon } from 'lucide-react';

export default function RoundThemeToggle({ className = '' }) {
    const { auth } = usePage().props;
    const dbTheme = auth?.user?.theme || auth?.user?.preference?.theme;

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const local = localStorage.getItem('admin_theme');
            if (dbTheme && (dbTheme === 'dark' || dbTheme === 'light')) {
                return dbTheme;
            }
            if (local && (local === 'dark' || local === 'light')) {
                return local;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    // Listen for custom events from PreferencesModal or other triggers
    useEffect(() => {
        const handleThemeChanged = (e) => {
            if (e.detail && (e.detail === 'dark' || e.detail === 'light')) {
                setTheme(e.detail);
            }
        };
        window.addEventListener('admin-theme-changed', handleThemeChanged);
        return () => window.removeEventListener('admin-theme-changed', handleThemeChanged);
    }, []);

    const toggleTheme = async () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);

        const root = document.documentElement;
        if (nextTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('admin_theme', nextTheme);
        window.dispatchEvent(new CustomEvent('admin-theme-changed', { detail: nextTheme }));

        if (auth?.user) {
            try {
                const token = document.querySelector('meta[name="csrf-token"]')?.content;
                await fetch(route('admin.preferences.update'), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token || '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ theme: nextTheme }),
                });
            } catch (err) {
                // Silently continue if network fails
            }
        }
    };

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-400 dark:hover:bg-[#1c222e] dark:hover:text-white ${className}`}
        >
            {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
                <Moon className="h-4 w-4 text-slate-500 transition-transform duration-200 hover:-rotate-12 dark:text-slate-400" />
            )}
        </button>
    );
}

