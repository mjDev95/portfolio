import { Palette, RotateCcw, ChevronDown, ChevronUp, ShieldCheck, Check, Sparkles, ExternalLink } from 'lucide-react';
import LiveUiPreview from '@/Components/Preferences/LiveUiPreview';
import { Link } from '@inertiajs/react';

export const DEFAULT_COLORS = {
    primary: '#CB2128',
    secondary: '#DFB136',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
};

export const PRESET_PALETTES = [
    {
        id: null,
        name: 'Cardinal & Aurum Carbon',
        primary_color: '#CB2128',
        secondary_color: '#DFB136',
        accent_color: '#DFB136',
    },
    {
        id: null,
        name: 'Carmine Nexus',
        primary_color: '#CC282F',
        secondary_color: '#1D4ED8',
        accent_color: '#D4AF37',
    },
    {
        id: null,
        name: 'Cobalt to Scarlet',
        primary_color: '#2563EB',
        secondary_color: '#7C3AED',
        accent_color: '#E61E32',
    },
    {
        id: null,
        name: 'Acid Chartreuse & Periwinkle',
        primary_color: '#DFE94B',
        secondary_color: '#836CEC',
        accent_color: '#38B2AC',
    },
    {
        id: null,
        name: 'Sunglow & Ultramarine',
        primary_color: '#FFCA3A',
        secondary_color: '#2563EB',
        accent_color: '#00E5A3',
    },
    {
        id: null,
        name: 'Escala de Neutros, Fondos y Superficies UI',
        primary_color: '#161616',
        secondary_color: '#F8FAFC',
        accent_color: '#181614',
    },
];

const isValidHex = (hex) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

export default function ColorPaletteSection({
    colors,
    onColorChange,
    onApplyPreset,
    onResetDefaults,
    showStatusColors,
    onToggleShowStatusColors,
    previewBackground,
    onPreviewBackgroundChange,
    availablePalettes = [],
    selectedPaletteId = null,
    onSelectPalette = () => {},
}) {
    const palettesToDisplay = availablePalettes && availablePalettes.length > 0
        ? availablePalettes
        : PRESET_PALETTES;

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126] dark:shadow-none sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                    <Palette className="h-5 w-5 text-brand-primary" />
                    <div>
                        <h2 className="text-base font-bold text-[#293951] dark:text-[#ffffff]">
                            Paleta de Colores del Portafolio
                        </h2>
                        <p className="mt-0.5 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                            Personaliza o selecciona los colores distintivos de tu marca para botones, enlaces y elementos interactivos.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <Link
                        href={route('admin.brand.index')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#293951] shadow-xs transition hover:bg-gray-50 dark:border-gray-700/60 dark:bg-[#16191c] dark:text-[#ffffff] dark:hover:bg-[#20252b]"
                        title="Ir al catálogo maestro y gestor CRUD de paletas"
                    >
                        <span>Sección de Identidad</span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#95aac9] dark:text-[#a7a6a8]" />
                    </Link>

                    <button
                        type="button"
                        onClick={onResetDefaults}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#ebf1f7] px-3.5 py-2 text-xs font-semibold text-[#293951] shadow-xs transition hover:bg-[#dfe7ef] dark:bg-[#16191c] dark:text-[#ffffff] dark:hover:bg-[#20252b]"
                        title="Restablecer colores predeterminados"
                    >
                        <RotateCcw className="h-3.5 w-3.5 text-[#95aac9] dark:text-[#a7a6a8]" />
                        <span>Restablecer</span>
                    </button>
                </div>
            </div>

            {/* Selector de Paletas Registradas en la Base de Datos */}
            <div className="mt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm font-semibold text-[#293951] dark:text-[#ffffff]">
                            Paletas Registradas en Base de Datos:
                        </label>
                        <p className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                            Haz clic en una paleta para aplicarla instantáneamente a tu cuenta de Super Admin.
                        </p>
                    </div>
                </div>

                <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {palettesToDisplay.map((palette) => {
                        const palPrimary = palette.primary_color || palette.primary;
                        const palSecondary = palette.secondary_color || palette.secondary;
                        const isSelected =
                            (selectedPaletteId && palette.id && selectedPaletteId === palette.id) ||
                            (!selectedPaletteId &&
                                colors.primary?.toUpperCase() === palPrimary?.toUpperCase() &&
                                colors.secondary?.toUpperCase() === palSecondary?.toUpperCase());

                        return (
                            <button
                                key={palette.id || palette.name}
                                type="button"
                                onClick={() => onSelectPalette(palette)}
                                className={`group relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all ${
                                    isSelected
                                        ? 'bg-brand-primary/5 ring-2 ring-brand-primary shadow-sm dark:bg-brand-primary/10'
                                        : 'border border-gray-100 bg-[#fbfcfd] hover:border-gray-200 hover:bg-white dark:border-gray-800/80 dark:bg-[#16191c] dark:hover:border-gray-700 dark:hover:bg-[#1a1e23]'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className="font-heading text-xs font-bold text-[#293951] dark:text-white truncate">
                                                {palette.name}
                                            </span>
                                            {palette.is_master && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-brand-primary">
                                                    <Sparkles className="h-2 w-2" /> Maestra
                                                </span>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                                <Check className="h-2.5 w-2.5" /> Activa
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Barra de Swatches */}
                                <div className="mt-3.5 flex h-4 w-full overflow-hidden rounded-lg shadow-xs">
                                    <div
                                        className="flex-1"
                                        style={{ backgroundColor: palPrimary }}
                                        title={`Primario: ${palPrimary}`}
                                    />
                                    <div
                                        className="flex-1"
                                        style={{ backgroundColor: palSecondary }}
                                        title={`Secundario: ${palSecondary}`}
                                    />
                                    {palette.tertiary_color && (
                                        <div
                                            className="flex-1"
                                            style={{ backgroundColor: palette.tertiary_color }}
                                            title={`Terciario: ${palette.tertiary_color}`}
                                        />
                                    )}
                                    {palette.accent_color && (
                                        <div
                                            className="flex-1"
                                            style={{ backgroundColor: palette.accent_color }}
                                            title={`Acento: ${palette.accent_color}`}
                                        />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2 Colores Principales: Primary & Secondary */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Color Primario */}
                <div className="rounded-2xl bg-[#ebf1f7] p-5 dark:bg-[#16191c]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-full shadow-sm"
                                style={{ backgroundColor: colors.primary }}
                            />
                            <span className="text-sm font-bold text-[#293951] dark:text-[#ffffff]">
                                Color Primario
                            </span>
                        </div>
                        <span className="rounded-lg bg-white px-2.5 py-0.5 text-xs font-semibold text-brand-primary shadow-sm dark:bg-[#1e2126]">
                            Principal
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                        Color distintivo para tus botones principales de llamado a la acción (CTA), enlaces activos y elementos destacados.
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                        <input
                            type="color"
                            value={isValidHex(colors.primary) ? colors.primary : '#CB2128'}
                            onChange={(e) => onColorChange('primary', e.target.value)}
                            className="h-11 w-14 cursor-pointer rounded-xl border-0 bg-transparent p-0.5"
                            title="Seleccionar color primario"
                        />
                        <input
                            type="text"
                            value={colors.primary}
                            onChange={(e) => onColorChange('primary', e.target.value)}
                            placeholder="#CB2128"
                            maxLength={7}
                            className="w-36 rounded-xl border-0 bg-white py-2 font-mono text-sm uppercase text-[#293951] shadow-sm focus:ring-2 focus:ring-brand-primary dark:bg-[#1e2126] dark:text-[#ffffff]"
                        />
                    </div>
                </div>

                {/* Color Secundario */}
                <div className="rounded-2xl bg-[#ebf1f7] p-5 dark:bg-[#16191c]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-full shadow-sm"
                                style={{ backgroundColor: colors.secondary }}
                            />
                            <span className="text-sm font-bold text-[#293951] dark:text-[#ffffff]">
                                Color Secundario
                            </span>
                        </div>
                        <span className="rounded-lg bg-white px-2.5 py-0.5 text-xs font-semibold text-[#95aac9] shadow-sm dark:bg-[#1e2126] dark:text-[#a7a6a8]">
                            Secundario
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                        Color de acompañamiento para botones secundarios, filtros de categorías, etiquetas y detalles visuales de apoyo.
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                        <input
                            type="color"
                            value={isValidHex(colors.secondary) ? colors.secondary : '#DFB136'}
                            onChange={(e) => onColorChange('secondary', e.target.value)}
                            className="h-11 w-14 cursor-pointer rounded-xl border-0 bg-transparent p-0.5"
                            title="Seleccionar color secundario"
                        />
                        <input
                            type="text"
                            value={colors.secondary}
                            onChange={(e) => onColorChange('secondary', e.target.value)}
                            placeholder="#DFB136"
                            maxLength={7}
                            className="w-36 rounded-xl border-0 bg-white py-2 font-mono text-sm uppercase text-[#293951] shadow-sm focus:ring-2 focus:ring-brand-primary dark:bg-[#1e2126] dark:text-[#ffffff]"
                        />
                    </div>
                </div>
            </div>

            {/* Previsualización en Vivo de Componentes Públicos */}
            <LiveUiPreview
                colors={colors}
                previewBackground={previewBackground}
                onPreviewBackgroundChange={onPreviewBackgroundChange}
            />

            {/* Colores de Estado Opcionales */}
            <div className="mt-5 rounded-2xl bg-[#ebf1f7] dark:bg-[#16191c]">
                <button
                    type="button"
                    onClick={onToggleShowStatusColors}
                    className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-[#293951] transition hover:bg-[#dfe7ef] dark:text-[#ffffff] dark:hover:bg-[#20252b]"
                >
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-brand-primary" />
                        <span>Colores de Estado Adicionales (Opcional)</span>
                        <span className="rounded-md bg-white px-2 py-0.5 text-sm font-normal text-[#95aac9] shadow-sm dark:bg-[#1e2126] dark:text-[#a7a6a8]">
                            Opcional
                        </span>
                    </span>
                    {showStatusColors ? (
                        <ChevronUp className="h-4 w-4 text-[#95aac9] dark:text-[#a7a6a8]" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-[#95aac9] dark:text-[#a7a6a8]" />
                    )}
                </button>

                {showStatusColors && (
                    <div className="p-5 pt-2">
                        <p className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                            Colores para mensajes de confirmación exitosa, alertas de error, advertencias e información contextual. Su edición es opcional.
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { key: 'success', name: 'Éxito' },
                                { key: 'danger', name: 'Peligro / Error' },
                                { key: 'warning', name: 'Alerta / Aviso' },
                                { key: 'info', name: 'Información' },
                            ].map((status) => (
                                <div
                                    key={status.key}
                                    className="rounded-xl bg-white p-3 shadow-sm dark:bg-[#1e2126]"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-[#293951] dark:text-[#ffffff]">
                                            {status.name}
                                        </span>
                                    </div>
                                    <div className="mt-2.5 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={
                                                isValidHex(colors[status.key])
                                                    ? colors[status.key]
                                                    : DEFAULT_COLORS[status.key]
                                            }
                                            onChange={(e) =>
                                                onColorChange(status.key, e.target.value)
                                            }
                                            className="h-9 w-11 cursor-pointer rounded-lg border-0 bg-transparent p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={colors[status.key] || DEFAULT_COLORS[status.key]}
                                            onChange={(e) =>
                                                onColorChange(status.key, e.target.value)
                                            }
                                            maxLength={7}
                                            className="w-24 rounded-lg border-0 bg-[#ebf1f7] py-1 font-mono text-sm uppercase text-[#293951] shadow-sm dark:bg-[#16191c] dark:text-[#ffffff]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

