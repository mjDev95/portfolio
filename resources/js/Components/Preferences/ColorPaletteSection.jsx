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

export const DEFAULT_CLIENT_COLORS = {
    primary: '#2787F5',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
};

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
    isSuperAdmin = true,
}) {
    const palettesToDisplay = availablePalettes && availablePalettes.length > 0
        ? availablePalettes
        : PRESET_PALETTES;

    const defaultPrimary = isSuperAdmin ? DEFAULT_COLORS.primary : DEFAULT_CLIENT_COLORS.primary;
    const defaultSecondary = isSuperAdmin ? DEFAULT_COLORS.secondary : DEFAULT_CLIENT_COLORS.secondary;

    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                    <Palette className="h-5 w-5 text-brand-primary" />
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            {isSuperAdmin ? 'Paleta de Colores del Portafolio' : 'Colores de Interfaz de tu Cuenta'}
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            {isSuperAdmin
                                ? 'Personaliza o selecciona los colores distintivos de tu marca para botones, enlaces y elementos interactivos.'
                                : 'Personaliza tu color primario y secundario para botones, enlaces y elementos interactivos de tu panel.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    {isSuperAdmin && (
                        <Link
                            href={route('admin.brand.index')}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-300 dark:hover:bg-[#1c222e]"
                            title="Ir al catálogo maestro y gestor CRUD de paletas"
                        >
                            <span>Sección de Identidad</span>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={onResetDefaults}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-300 dark:hover:bg-[#1c222e]"
                        title="Restablecer colores predeterminados"
                    >
                        <RotateCcw className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span>Restablecer</span>
                    </button>
                </div>
            </div>

            {/* Selector de Paletas Registradas en la Base de Datos (EXCLUSIVO SUPER ADMIN) */}
            {isSuperAdmin && (
                <div className="mt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                Paletas Registradas en Base de Datos:
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
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
                                            : 'border border-slate-100 bg-[#f8f9fb] hover:border-slate-200 hover:bg-white dark:border-slate-800 dark:bg-[#12161f] dark:hover:border-slate-700 dark:hover:bg-[#161b24]'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className="font-heading text-xs font-bold text-slate-900 dark:text-white truncate">
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
            )}

            {/* 2 Colores Principales: Primary & Secondary */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Color Primario */}
                <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-[#12161f]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-full shadow-sm"
                                style={{ backgroundColor: colors.primary }}
                            />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                Color Primario
                            </span>
                        </div>
                        <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                            Principal
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {isSuperAdmin
                            ? 'Color distintivo para tus botones principales de llamado a la acción (CTA), enlaces activos y elementos destacados.'
                            : 'Color principal para tus botones de acción, enlaces activos e indicadores de tu cuenta.'}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                        <input
                            type="color"
                            value={isValidHex(colors.primary) ? colors.primary : defaultPrimary}
                            onChange={(e) => onColorChange('primary', e.target.value)}
                            className="h-11 w-14 cursor-pointer rounded-xl border-0 bg-transparent p-0.5"
                            title="Seleccionar color primario"
                        />
                        <input
                            type="text"
                            value={colors.primary}
                            onChange={(e) => onColorChange('primary', e.target.value)}
                            placeholder={defaultPrimary}
                            maxLength={7}
                            className="w-36 rounded-2xl border border-slate-200/80 bg-white py-2 px-3 font-mono text-sm uppercase text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#161b24] dark:text-white"
                        />
                    </div>
                </div>

                {/* Color Secundario */}
                <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-[#12161f]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-full shadow-sm"
                                style={{ backgroundColor: colors.secondary }}
                            />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                Color Secundario
                            </span>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Secundario
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {isSuperAdmin
                            ? 'Color de acompañamiento para botones secundarios, filtros de categorías, etiquetas y detalles visuales de apoyo.'
                            : 'Color de acompañamiento para botones secundarios, etiquetas y elementos secundarios de tu panel.'}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                        <input
                            type="color"
                            value={isValidHex(colors.secondary) ? colors.secondary : defaultSecondary}
                            onChange={(e) => onColorChange('secondary', e.target.value)}
                            className="h-11 w-14 cursor-pointer rounded-xl border-0 bg-transparent p-0.5"
                            title="Seleccionar color secundario"
                        />
                        <input
                            type="text"
                            value={colors.secondary}
                            onChange={(e) => onColorChange('secondary', e.target.value)}
                            placeholder={defaultSecondary}
                            maxLength={7}
                            className="w-36 rounded-2xl border border-slate-200/80 bg-white py-2 px-3 font-mono text-sm uppercase text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#161b24] dark:text-white"
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
            <div className="mt-5 rounded-[28px] border border-slate-100 bg-slate-50/50 overflow-hidden dark:border-slate-800 dark:bg-[#12161f]">
                <button
                    type="button"
                    onClick={onToggleShowStatusColors}
                    className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100/60 dark:text-white dark:hover:bg-[#161b24]"
                >
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-brand-primary" />
                        <span>Colores de Estado Adicionales (Opcional)</span>
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-500 shadow-xs dark:bg-[#161b24] dark:text-slate-400">
                            Opcional
                        </span>
                    </span>
                    {showStatusColors ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    )}
                </button>

                {showStatusColors && (
                    <div className="p-5 pt-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
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
                                    className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#161b24]"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
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
                                            className="w-24 rounded-xl border border-slate-200/80 bg-white py-1 px-2.5 font-mono text-xs uppercase text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
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

