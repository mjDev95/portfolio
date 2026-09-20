import { Sparkles } from 'lucide-react';

export default function LiveUiPreview({
    colors,
    previewBackground,
    onPreviewBackgroundChange,
}) {
    return (
        <div
            className={`mt-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 transition-colors duration-200 ${
                previewBackground === 'light'
                    ? 'bg-slate-50 text-slate-900'
                    : previewBackground === 'dark'
                    ? 'bg-[#12161f] text-white'
                    : 'bg-slate-50 text-slate-900 dark:bg-[#12161f] dark:text-white'
            }`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-primary" />
                    <span
                        className={`text-sm font-bold ${
                            previewBackground === 'light'
                                ? 'text-slate-900'
                                : previewBackground === 'dark'
                                ? 'text-white'
                                : 'text-slate-900 dark:text-white'
                        }`}
                    >
                        Previsualización en Vivo de Componentes
                    </span>
                </div>

                {/* Selector de fondo del preview (Automático / Claro / Oscuro) */}
                <div className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-xs dark:border-slate-800 dark:bg-[#161b24]">
                    <button
                        type="button"
                        onClick={() => onPreviewBackgroundChange('auto')}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            previewBackground === 'auto'
                                ? 'bg-brand-primary text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        Tema actual
                    </button>
                    <button
                        type="button"
                        onClick={() => onPreviewBackgroundChange('light')}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            previewBackground === 'light'
                                ? 'bg-brand-primary text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        Fondo Claro
                    </button>
                    <button
                        type="button"
                        onClick={() => onPreviewBackgroundChange('dark')}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            previewBackground === 'dark'
                                ? 'bg-brand-primary text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        Fondo Oscuro
                    </button>
                </div>
            </div>

            <p
                className={`mt-1.5 text-sm ${
                    previewBackground === 'light'
                        ? 'text-slate-500'
                        : previewBackground === 'dark'
                        ? 'text-slate-400'
                        : 'text-slate-500 dark:text-slate-400'
                }`}
            >
                Así lucirán los botones, insignias y enlaces interactivos en tu sitio web:
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3.5">
                {/* Botón Primario */}
                <button
                    type="button"
                    className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                >
                    Botón Principal (CTA)
                </button>

                {/* Botón Secundario */}
                <button
                    type="button"
                    className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:opacity-90"
                    style={{ backgroundColor: colors.secondary }}
                >
                    Botón Secundario
                </button>

                {/* Botón Tonal / Ghost */}
                <button
                    type="button"
                    className="rounded-full px-5 py-2 text-sm font-semibold transition hover:opacity-80 ring-1 ring-inset"
                    style={{
                        backgroundColor: `${colors.primary}12`,
                        color: colors.primary,
                        boxShadow: `0 0 0 1px ${colors.primary}33 inset`,
                    }}
                >
                    Botón Outline / Tonal
                </button>

                {/* Badge Primario */}
                <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: colors.primary }}
                >
                    Badge Principal
                </span>

                {/* Badge Secundario */}
                <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: colors.secondary }}
                >
                    Badge Secundario
                </span>

                {/* Chip / Tag Tonal */}
                <span
                    className="inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium"
                    style={{
                        backgroundColor: `${colors.primary}1A`,
                        color: colors.primary,
                    }}
                >
                    Etiqueta Tonal
                </span>

                {/* Enlace destacado */}
                <span
                    className="text-sm font-semibold underline decoration-2 underline-offset-4"
                    style={{ color: colors.primary }}
                >
                    Enlace Destacado
                </span>
            </div>
        </div>
    );
}

