import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
    const { auth } = usePage().props;
    const dbTheme = auth?.user?.preference?.theme;

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
        return 'light';
    });

    const updateTheme = async (newTheme) => {
        setTheme(newTheme);
        const root = document.documentElement;
        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('admin_theme', newTheme);

        // Persist in DB if user is logged in
        if (auth?.user) {
            try {
                const token = document.querySelector('meta[name="csrf-token"]')?.content;
                await fetch(route('admin.preferences.update'), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token,
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ theme: newTheme }),
                });
            } catch (err) {
                // Silently continue if network fails
            }
        }
    };

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return (
        <div
            className={`grid grid-cols-2 rounded-xl bg-[#ebf1f7] p-1 text-xs font-semibold text-[#95aac9] backdrop-blur dark:bg-[#16191c] dark:text-[#a7a6a8] ${className}`}
            role="group"
            aria-label="Selector de tema"
        >
            <button
                type="button"
                onClick={() => updateTheme('light')}
                title="Modo Claro"
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-150 ${
                    theme === 'light'
                        ? 'bg-white text-[#293951] shadow-sm dark:bg-[#1e2126] dark:text-white'
                        : 'hover:text-[#293951] dark:hover:text-white'
                }`}
            >
                <Sun className="h-3.5 w-3.5" />
                <span>Claro</span>
            </button>
            <button
                type="button"
                onClick={() => updateTheme('dark')}
                title="Modo Oscuro"
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-150 ${
                    theme === 'dark'
                        ? 'bg-white text-[#293951] shadow-sm dark:bg-[#1e2126] dark:text-white'
                        : 'hover:text-[#293951] dark:hover:text-white'
                }`}
            >
                <Moon className="h-3.5 w-3.5" />
                <span>Oscuro</span>
            </button>
        </div>
    );
}

