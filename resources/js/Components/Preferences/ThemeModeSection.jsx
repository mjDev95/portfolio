import { Sliders, Sun, Moon, Check } from 'lucide-react';

export default function ThemeModeSection({ theme, onThemeChange }) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126] dark:shadow-none sm:p-7">
            <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-brand-primary" />
                <h2 className="text-base font-bold text-[#293951] dark:text-[#ffffff]">
                    Tema del Panel de Administración
                </h2>
            </div>
            <p className="mt-1 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                Selecciona la apariencia visual que prefieres para tu área de trabajo en el panel administrativo.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Modo Claro Selector */}
                <button
                    type="button"
                    onClick={() => onThemeChange('light')}
                    className={`flex flex-col items-start rounded-2xl p-5 text-start transition ${
                        theme === 'light'
                            ? 'bg-amber-500/10 text-amber-900 ring-2 ring-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200'
                            : 'bg-[#ebf1f7] text-[#95aac9] hover:bg-white hover:text-[#293951] dark:bg-[#16191c] dark:text-[#a7a6a8] dark:hover:bg-[#20252b] dark:hover:text-[#ffffff]'
                    }`}
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                                <Sun className="h-5 w-5" />
                            </div>
                            <span className="text-base font-bold text-[#293951] dark:text-[#ffffff]">
                                Modo Claro
                            </span>
                        </div>
                        {theme === 'light' && (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                                <Check className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>
                    <p className="mt-3 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                        Lienzo grisáceo tenue con tarjetas de contraste nítido y tipografía oscura para entornos diurnos.
                    </p>
                </button>

                {/* Modo Oscuro Selector */}
                <button
                    type="button"
                    onClick={() => onThemeChange('dark')}
                    className={`flex flex-col items-start rounded-2xl p-5 text-start transition ${
                        theme === 'dark'
                            ? 'bg-brand-primary/15 text-brand-primary ring-2 ring-brand-primary/40 dark:bg-brand-primary/20 dark:text-brand-primary'
                            : 'bg-[#ebf1f7] text-[#95aac9] hover:bg-white hover:text-[#293951] dark:bg-[#16191c] dark:text-[#a7a6a8] dark:hover:bg-[#20252b] dark:hover:text-[#ffffff]'
                    }`}
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary">
                                <Moon className="h-5 w-5" />
                            </div>
                            <span className="text-base font-bold text-[#293951] dark:text-[#ffffff]">
                                Modo Oscuro
                            </span>
                        </div>
                        {theme === 'dark' && (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm">
                                <Check className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>
                    <p className="mt-3 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                        Superficies carbón profundo estilo Messenger 2.2.0 que reducen el cansancio visual en sesiones prolongadas.
                    </p>
                </button>
            </div>
        </div>
    );
}

