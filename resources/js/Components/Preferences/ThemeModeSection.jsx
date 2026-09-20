import { Sliders, Sun, Moon, Check } from 'lucide-react';

export default function ThemeModeSection({ theme, onThemeChange }) {
    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-7">
            <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-brand-primary" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Tema del Panel de Administración
                </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Selecciona la apariencia visual que prefieres para tu área de trabajo en el panel administrativo.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Modo Claro Selector */}
                <button
                    type="button"
                    onClick={() => onThemeChange('light')}
                    className={`flex flex-col items-start rounded-2xl p-5 text-start transition ${
                        theme === 'light'
                            ? 'border-2 border-amber-500/50 bg-amber-500/10 text-amber-900 ring-1 ring-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200'
                            : 'border border-slate-200/80 bg-[#f8f9fb] text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white'
                    }`}
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                                <Sun className="h-5 w-5" />
                            </div>
                            <span className="text-base font-bold text-slate-900 dark:text-white">
                                Modo Claro
                            </span>
                        </div>
                        {theme === 'light' && (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                                <Check className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Lienzo grisáceo tenue con tarjetas de contraste nítido y tipografía oscura para entornos diurnos.
                    </p>
                </button>

                {/* Modo Oscuro Selector */}
                <button
                    type="button"
                    onClick={() => onThemeChange('dark')}
                    className={`flex flex-col items-start rounded-2xl p-5 text-start transition ${
                        theme === 'dark'
                            ? 'border-2 border-brand-primary/60 bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30 dark:bg-brand-primary/20 dark:text-brand-primary'
                            : 'border border-slate-200/80 bg-[#f8f9fb] text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white'
                    }`}
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary">
                                <Moon className="h-5 w-5" />
                            </div>
                            <span className="text-base font-bold text-slate-900 dark:text-white">
                                Modo Oscuro
                            </span>
                        </div>
                        {theme === 'dark' && (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm">
                                <Check className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Superficies carbón profundo estilo Messenger 2.2.0 que reducen el cansancio visual en sesiones prolongadas.
                    </p>
                </button>
            </div>
        </div>
    );
}

