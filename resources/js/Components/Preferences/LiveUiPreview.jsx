import { Sparkles } from 'lucide-react';

export default function LiveUiPreview({
    colors,
    previewBackground,
    onPreviewBackgroundChange,
}) {
    return (
        <div
            className={`mt-6 rounded-2xl p-5 sm:p-6 transition-colors duration-200 ${
                previewBackground === 'light'
                    ? 'bg-[#f5f7fa] text-[#293951]'
                    : previewBackground === 'dark'
                    ? 'bg-[#121517] text-[#ffffff]'
                    : 'bg-[#ebf1f7] text-[#293951] dark:bg-[#16191c] dark:text-[#ffffff]'
            }`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-primary" />
                    <span
                        className={`text-sm font-bold ${
                            previewBackground === 'light'
                                ? 'text-[#293951]'
                                : previewBackground === 'dark'
                                ? 'text-[#ffffff]'
                                : 'text-[#293951] dark:text-[#ffffff]'
                        }`}
                    >
                        Previsualización en Vivo de Componentes
                    </span>
                </div>

                {/* Selector de fondo del preview (Automático / Claro / Oscuro) */}
                <div className="flex items-center gap-1 rounded-xl bg-white/80 p-1 shadow-sm dark:bg-[#1e2126]">
                    <button
                        type="button"
                        onClick={() => onPreviewBackgroundChange('auto')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                            previewBackground === 'auto'
                                ? 'bg-brand-primary text-white shadow-sm'
                                : 'text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-[#ffffff]'
                        }`}
                    >
                        Tema actual
                    </button>
                    <button
                        type="button"
                        onClick={() => onPreviewBackgroundChange('light')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                            previewBackground === 'light'
                                ? 'bg-brand-primary text-white shadow-sm'
                                : 'text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-[#ffffff]'
                        }`}
                    >
                        Fondo Claro
                    </button>
                    <button
                        type="button"
                        onClick={() => onPreviewBackgroundChange('dark')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                            previewBackground === 'dark'
                                ? 'bg-brand-primary text-white shadow-sm'
                                : 'text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-[#ffffff]'
                        }`}
                    >
                        Fondo Oscuro
                    </button>
                </div>
            </div>

            <p
                className={`mt-1.5 text-sm ${
                    previewBackground === 'light'
                        ? 'text-[#95aac9]'
                        : previewBackground === 'dark'
                        ? 'text-[#a7a6a8]'
                        : 'text-[#95aac9] dark:text-[#a7a6a8]'
                }`}
            >
                Así lucirán los botones, insignias y enlaces interactivos en tu sitio web:
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3.5">
                {/* Botón Primario */}
                <button
                    type="button"
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                >
                    Botón Principal (CTA)
                </button>

                {/* Botón Secundario */}
                <button
                    type="button"
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                    style={{ backgroundColor: colors.secondary }}
                >
                    Botón Secundario
                </button>

                {/* Botón Tonal / Ghost */}
                <button
                    type="button"
                    className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-80 ring-1 ring-inset"
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

