import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useState, useEffect } from 'react';
import { Palette, X, AlertCircle, Check } from 'lucide-react';
import { hexToRgbString } from '@/Support/brandTheme';

const isValidHex = (hex) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

const isLightColor = (hex) => {
    if (!hex || typeof hex !== 'string') return false;
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
    if (clean.length !== 6) return false;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 >= 150;
};

export default function ColorPaletteModal({
    isOpen,
    onClose,
    palette = null,
    onSuccess,
}) {
    const isEditing = Boolean(palette?.id);

    const [formData, setFormData] = useState({
        name: '',
        primary_color: '#CB2128',
        secondary_color: '#DFB136',
        tertiary_color: '#00B4D8',
        accent_color: '#D4AF37',
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (palette) {
            const colorsArray = Array.isArray(palette.colors) ? palette.colors : [];
            const primary = palette.primary_color || colorsArray[0]?.hex || '#CB2128';
            const secondary = palette.secondary_color || colorsArray[1]?.hex || '#DFB136';
            const tertiary = palette.tertiary_color || colorsArray[2]?.hex || '#00B4D8';
            const accent = palette.accent_color || colorsArray[3]?.hex || '#D4AF37';

            setFormData({
                name: palette.name || '',
                primary_color: primary,
                secondary_color: secondary,
                tertiary_color: tertiary,
                accent_color: accent,
            });
        } else {
            setFormData({
                name: '',
                primary_color: '#CB2128',
                secondary_color: '#DFB136',
                tertiary_color: '#00B4D8',
                accent_color: '#D4AF37',
            });
        }
        setErrors({});
    }, [palette, isOpen]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const url = isEditing
            ? route('admin.brand.palettes.update', palette.id)
            : route('admin.brand.palettes.store');

        const method = isEditing ? 'PUT' : 'POST';

        const existingColors = Array.isArray(palette?.colors) ? palette.colors : [];
        const payload = {
            name: formData.name,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            tertiary_color: formData.tertiary_color?.trim() || null,
            accent_color: formData.accent_color?.trim() || null,
            colors: [
                {
                    label: 'Color Primario',
                    title: existingColors[0]?.title || `${formData.name} Primary`,
                    hex: formData.primary_color,
                    rgb: hexToRgbString(formData.primary_color) || '',
                    role: existingColors[0]?.role || 'CTA principal, interacción y conversión',
                    darkContent: isLightColor(formData.primary_color),
                },
                {
                    label: 'Color Secundario',
                    title: existingColors[1]?.title || `${formData.name} Secondary`,
                    hex: formData.secondary_color,
                    rgb: hexToRgbString(formData.secondary_color) || '',
                    role: existingColors[1]?.role || 'Prestigio, jerarquía y acentos secundarios',
                    darkContent: isLightColor(formData.secondary_color),
                },
                ...(formData.tertiary_color?.trim() ? [{
                    label: 'Color Terciario',
                    title: existingColors[2]?.title || `${formData.name} Tertiary`,
                    hex: formData.tertiary_color.trim(),
                    rgb: hexToRgbString(formData.tertiary_color.trim()) || '',
                    role: existingColors[2]?.role || 'Arquitectura, tags y microinteracciones',
                    darkContent: isLightColor(formData.tertiary_color.trim()),
                }] : []),
                ...(formData.accent_color?.trim() ? [{
                    label: 'Color de Acento',
                    title: existingColors[3]?.title || `${formData.name} Accent`,
                    hex: formData.accent_color.trim(),
                    rgb: hexToRgbString(formData.accent_color.trim()) || '',
                    role: existingColors[3]?.role || 'Destacados, badges especiales e hitos',
                    darkContent: isLightColor(formData.accent_color.trim()),
                }] : []),
            ],
            dark_neutral: null,
            light_neutral: null,
            is_master: false,
        };

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else if (data.message || data.error) {
                    setErrors({ general: data.error || data.message });
                }
                setSubmitting(false);
                return;
            }

            if (onSuccess) {
                onSuccess(data.palette || data);
            }
            onClose();
        } catch (err) {
            console.error('Error al procesar la paleta:', err);
            setErrors({ general: 'Error de red o conexión al procesar la solicitud.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="xl">
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 sm:p-7">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
                                <Palette className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                    {isEditing ? 'Editar Paleta de Color' : 'Nueva Paleta de Color'}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {isEditing
                                        ? 'Modifica el nombre y la combinación de 4 colores.'
                                        : 'Registra una combinación cromática de 4 colores para el sistema.'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {errors.general && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{errors.general}</span>
                        </div>
                    )}

                    {/* Previsualización en Tiempo Real de los 4 Colores */}
                    <div className="mt-5 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 dark:border-slate-800 dark:bg-[#12161f]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                Muestra en tiempo real:
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                {formData.name || 'Sin título'}
                            </span>
                        </div>

                        <div className="mt-3 flex h-10 w-full overflow-hidden rounded-xl shadow-xs ring-1 ring-black/5">
                            <div
                                className="flex-1 transition-all"
                                style={{ backgroundColor: formData.primary_color }}
                                title={`1. Primario: ${formData.primary_color}`}
                            />
                            <div
                                className="flex-1 transition-all"
                                style={{ backgroundColor: formData.secondary_color }}
                                title={`2. Secundario: ${formData.secondary_color}`}
                            />
                            {formData.tertiary_color && (
                                <div
                                    className="flex-1 transition-all"
                                    style={{ backgroundColor: formData.tertiary_color }}
                                    title={`3. Terciario: ${formData.tertiary_color}`}
                                />
                            )}
                            {formData.accent_color && (
                                <div
                                    className="flex-1 transition-all"
                                    style={{ backgroundColor: formData.accent_color }}
                                    title={`4. Acento: ${formData.accent_color}`}
                                />
                            )}
                        </div>
                    </div>

                    {/* Campos del Formulario */}
                    <div className="mt-5 space-y-4">
                        {/* Nombre de la Paleta */}
                        <div>
                            <InputLabel htmlFor="palette_name" value="Nombre de la Paleta *" />
                            <TextInput
                                id="palette_name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Ej: Cardinal & Aurum Carbon"
                                className="mt-1 block w-full text-sm"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        {/* Configuración de los 4 Colores */}
                        <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 dark:border-slate-800 dark:bg-[#12161f]">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                    Los 4 Colores de la Paleta (HEX)
                                </h4>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500">Exactamente 4 colores</span>
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {/* 1. Primario */}
                                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#161b24]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            1. Primario *
                                        </span>
                                        <span className="rounded-md bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">
                                            CTA / Botones
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={isValidHex(formData.primary_color) ? formData.primary_color : '#CB2128'}
                                            onChange={(e) => handleChange('primary_color', e.target.value)}
                                            className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primary_color}
                                            onChange={(e) => handleChange('primary_color', e.target.value)}
                                            placeholder="#CB2128"
                                            maxLength={7}
                                            className="w-full rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-mono text-xs uppercase text-slate-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f] dark:text-white"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.primary_color} className="mt-1" />
                                </div>

                                {/* 2. Secundario */}
                                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#161b24]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            2. Secundario *
                                        </span>
                                        <span className="rounded-md bg-brand-secondary/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-secondary">
                                            Estructura / Jerarquía
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={isValidHex(formData.secondary_color) ? formData.secondary_color : '#DFB136'}
                                            onChange={(e) => handleChange('secondary_color', e.target.value)}
                                            className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={formData.secondary_color}
                                            onChange={(e) => handleChange('secondary_color', e.target.value)}
                                            placeholder="#DFB136"
                                            maxLength={7}
                                            className="w-full rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-mono text-xs uppercase text-slate-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f] dark:text-white"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.secondary_color} className="mt-1" />
                                </div>

                                {/* 3. Terciario */}
                                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#161b24]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                            3. Terciario
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Interacción / Soporte</span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={isValidHex(formData.tertiary_color) ? formData.tertiary_color : '#00B4D8'}
                                            onChange={(e) => handleChange('tertiary_color', e.target.value)}
                                            className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={formData.tertiary_color}
                                            onChange={(e) => handleChange('tertiary_color', e.target.value)}
                                            placeholder="Opcional (#HEX)"
                                            maxLength={7}
                                            className="w-full rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-mono text-xs uppercase text-slate-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f] dark:text-white"
                                        />
                                    </div>
                                    <InputError message={errors.tertiary_color} className="mt-1" />
                                </div>

                                {/* 4. Acento */}
                                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#161b24]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                            4. Acento
                                        </span>
                                        <span className="rounded-md bg-brand-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-accent">
                                            Detalles / Badges
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={isValidHex(formData.accent_color) ? formData.accent_color : '#D4AF37'}
                                            onChange={(e) => handleChange('accent_color', e.target.value)}
                                            className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={formData.accent_color}
                                            onChange={(e) => handleChange('accent_color', e.target.value)}
                                            placeholder="Opcional (#HEX)"
                                            maxLength={7}
                                            className="w-full rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-mono text-xs uppercase text-slate-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f] dark:text-white"
                                        />
                                    </div>
                                    <InputError message={errors.accent_color} className="mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                        <SecondaryButton onClick={onClose} disabled={submitting}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={submitting} className="gap-2">
                            <Check className="h-4 w-4" />
                            <span>{submitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Paleta'}</span>
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
