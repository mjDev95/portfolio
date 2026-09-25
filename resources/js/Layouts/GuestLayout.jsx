import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function GuestLayout({
    children,
    maxWidth = 'sm:max-w-md',
    className = '',
    layoutId = null,
}) {
    const [isDark, setIsDark] = useState(() =>
        typeof window !== 'undefined'
            ? document.documentElement.classList.contains('dark') || localStorage.getItem('admin_theme') === 'dark'
            : true
    );

    useEffect(() => {
        const storedTheme = localStorage.getItem('admin_theme');
        const activeDark =
            storedTheme === 'dark' ||
            (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
            document.documentElement.classList.contains('dark');
        setIsDark(activeDark);
        document.documentElement.classList.toggle('dark', activeDark);
    }, []);

    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('admin_theme', nextDark ? 'dark' : 'light');
        window.dispatchEvent(
            new CustomEvent('admin-theme-changed', { detail: nextDark ? 'dark' : 'light' })
        );
    };

    const containerClasses = `relative z-10 w-full overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-8 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] dark:shadow-none transition-colors duration-300 ${maxWidth} ${className}`;

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f0f2f6] px-4 py-12 transition-colors duration-300 dark:bg-[#0a0d14]">
            {/* ── Fondo Atmosférico Bento (Luz ambiental difusa + Grid de puntos sutil) ── */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
            <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl filter" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-primary/5 blur-3xl filter" />

            {/* ── Barra Superior Flotante Bento ── */}
            <header className="absolute top-6 inset-x-0 mx-auto flex max-w-4xl items-center justify-between px-6 z-20">
                <a
                    href="/"
                    target="_self"
                    className="group inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-brand-primary/40 hover:text-brand-primary dark:border-slate-800/80 dark:bg-[#161b24]/80 dark:text-slate-300 dark:hover:text-white"
                >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                    <span>Sitio Web</span>
                </a>

                <button
                    type="button"
                    onClick={toggleTheme}
                    title={isDark ? 'Cambiar a modo Claro' : 'Cambiar a modo Oscuro'}
                    aria-label="Alternar Tema"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-brand-primary/40 hover:text-brand-primary dark:border-slate-800/80 dark:bg-[#161b24]/80 dark:text-slate-300 dark:hover:text-white"
                >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
            </header>

            {/* ── Contenedor Único de Tarjeta Bento ── */}
            {layoutId ? (
                <motion.div
                    layoutId={layoutId}
                    animate={{ borderRadius: 28 }}
                    transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 28,
                        mass: 0.9,
                    }}
                    className={containerClasses}
                >
                    {children}
                </motion.div>
            ) : (
                <div className={containerClasses}>
                    {children}
                </div>
            )}
        </div>
    );
}
