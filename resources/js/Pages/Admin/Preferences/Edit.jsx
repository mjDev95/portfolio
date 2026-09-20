import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import UserProfileCard from '@/Components/Preferences/UserProfileCard';
import ThemeModeSection from '@/Components/Preferences/ThemeModeSection';
import ColorPaletteSection, { DEFAULT_COLORS } from '@/Components/Preferences/ColorPaletteSection';
import EditorSettingsSection from '@/Components/Preferences/EditorSettingsSection';
import ImageCompressionSection from '@/Components/Preferences/ImageCompressionSection';
import CacheManagementSection from '@/Components/Preferences/CacheManagementSection';
import { applySuperAdminPalette, resetClientPalette } from '@/Support/brandTheme';

export default function Edit({ preference, palettes = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [theme, setTheme] = useState('dark');
    const [tableDensity, setTableDensity] = useState('comfortable');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [editorMode, setEditorMode] = useState('markdown');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [imageCompression, setImageCompression] = useState('lossless');

    // Paleta de 2 Colores de Marca (+ Colores de Estado Opcionales)
    const [selectedPaletteId, setSelectedPaletteId] = useState(preference?.color_palette_id ?? null);
    const [colors, setColors] = useState(DEFAULT_COLORS);
    const [showStatusColors, setShowStatusColors] = useState(false);
    const [previewBackground, setPreviewBackground] = useState('auto');

    const [saving, setSaving] = useState(false);

    // Initialize state from props or localStorage
    useEffect(() => {
        const currentTheme =
            localStorage.getItem('admin_theme') ||
            preference?.theme ||
            user?.theme ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(currentTheme);

        if (preference?.table_density) {
            setTableDensity(preference.table_density);
        }
        if (preference?.items_per_page) {
            setItemsPerPage(Number(preference.items_per_page));
        }
        if (preference?.editor_mode) {
            setEditorMode(preference.editor_mode);
        }
        if (preference?.image_compression) {
            setImageCompression(preference.image_compression);
        }
        if (typeof preference?.email_notifications === 'boolean') {
            setEmailNotifications(preference.email_notifications);
        }
        if (preference?.color_palette_id) {
            setSelectedPaletteId(preference.color_palette_id);
        }

        const customPalette = preference?.color_palette;
        let initialColors = DEFAULT_COLORS;
        if (customPalette?.colors && typeof customPalette.colors === 'object') {
            initialColors = {
                primary: customPalette.colors.primary || DEFAULT_COLORS.primary,
                secondary: customPalette.colors.secondary || DEFAULT_COLORS.secondary,
                accent: customPalette.colors.accent || customPalette.colors.secondary || DEFAULT_COLORS.secondary,
                success: customPalette.colors.success || DEFAULT_COLORS.success,
                danger: customPalette.colors.danger || DEFAULT_COLORS.danger,
                warning: customPalette.colors.warning || DEFAULT_COLORS.warning,
                info: customPalette.colors.info || DEFAULT_COLORS.info,
            };
            setColors(initialColors);
        } else {
            setColors(DEFAULT_COLORS);
        }

        const isSuperAdmin = user?.role === 'admin';
        if (isSuperAdmin) {
            applySuperAdminPalette(initialColors);
        } else {
            resetClientPalette();
        }
    }, [preference, user?.theme, user?.role]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('admin_theme', newTheme);
        window.dispatchEvent(new CustomEvent('admin-theme-changed', { detail: newTheme }));
    };

    const handleColorChange = (key, value) => {
        const nextColors = {
            ...colors,
            [key]: value,
        };
        setColors(nextColors);
        const isSuperAdmin = user?.is_admin || user?.role === 'admin';
        if (isSuperAdmin && (key === 'primary' || key === 'secondary' || key === 'accent')) {
            applySuperAdminPalette(nextColors);
        }
    };

    const handleSelectPalette = (palette) => {
        setSelectedPaletteId(palette.id || null);
        const palPrimary = palette.primary_color || palette.primary || DEFAULT_COLORS.primary;
        const palSecondary = palette.secondary_color || palette.secondary || DEFAULT_COLORS.secondary;
        const palAccent = palette.accent_color || palette.accent || palSecondary;

        const nextColors = {
            ...colors,
            primary: palPrimary,
            secondary: palSecondary,
            accent: palAccent,
        };
        setColors(nextColors);
        const isSuperAdmin = user?.is_admin || user?.role === 'admin';
        if (isSuperAdmin) {
            applySuperAdminPalette(nextColors);
        }
    };

    const handleApplyPreset = (preset) => {
        handleSelectPalette(preset);
    };

    const handleResetDefaults = () => {
        setSelectedPaletteId(null);
        setColors(DEFAULT_COLORS);
        const isSuperAdmin = user?.is_admin || user?.role === 'admin';
        if (isSuperAdmin) {
            applySuperAdminPalette(DEFAULT_COLORS);
        }
    };

    const handleSave = async (e) => {
        e?.preventDefault();
        setSaving(true);

        const isSuperAdmin = user?.is_admin || user?.role === 'admin';
        if (isSuperAdmin) {
            applySuperAdminPalette(colors);
            window.dispatchEvent(new CustomEvent('admin-palette-changed', { detail: colors }));
        }

        // Ensure theme applied to DOM and storage
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('admin_theme', theme);
        window.dispatchEvent(new CustomEvent('admin-theme-changed', { detail: theme }));

        const payload = {
            theme,
            items_per_page: itemsPerPage,
            table_density: tableDensity,
            editor_mode: editorMode,
            image_compression: imageCompression,
            email_notifications: emailNotifications,
            color_palette_id: selectedPaletteId,
            color_palette: {
                id: selectedPaletteId ? String(selectedPaletteId) : 'custom',
                colors: {
                    primary: colors.primary,
                    secondary: colors.secondary,
                    accent: colors.accent || colors.secondary,
                    success: colors.success,
                    danger: colors.danger,
                    warning: colors.warning,
                    info: colors.info,
                },
            },
            settings: {
                table_density: tableDensity,
                items_per_page: itemsPerPage,
                editor_mode: editorMode,
                image_compression: imageCompression,
                email_notifications: emailNotifications,
                color_palette_id: selectedPaletteId,
                color_palette: {
                    id: selectedPaletteId ? String(selectedPaletteId) : 'custom',
                    colors: {
                        primary: colors.primary,
                        secondary: colors.secondary,
                        success: colors.success,
                        danger: colors.danger,
                        warning: colors.warning,
                        info: colors.info,
                    },
                },
            },
        };

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(route('admin.preferences.update'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.reload({
                    only: ['auth', 'preference', 'palettes'],
                    preserveState: true,
                    preserveScroll: true,
                });

                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'success',
                            title: '¡Preferencias actualizadas!',
                            message: 'Tus preferencias se guardaron y aplicaron con éxito.',
                        },
                    })
                );
            } else {
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'error',
                            title: 'Error al guardar',
                            message: 'No se pudieron guardar las preferencias. Inténtalo nuevamente.',
                        },
                    })
                );
            }
        } catch (err) {
            console.error('Error al guardar preferencias:', err);
            window.dispatchEvent(
                new CustomEvent('admin-feedback', {
                    detail: {
                        type: 'error',
                        title: 'Error de conexión',
                        message: 'Hubo un fallo de red al guardar las preferencias.',
                    },
                })
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Preferencias del Administrador — Admin" />

            <div className="w-full space-y-8">
                {/* ── A. Header Principal ───────────────────────────────────── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm">
                                    <Settings className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                        Preferencias del Administrador
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Configuración global de apariencia, colores de marca del sitio público y comportamiento del panel.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <PrimaryButton
                                onClick={handleSave}
                                disabled={saving}
                                className="gap-2 px-5 py-2.5"
                            >
                                <Save className="h-4 w-4" />
                                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* ── B. Tarjeta 1: Perfil de Usuario ───────────────────────── */}
                    <UserProfileCard user={user} />

                    {/* ── C. Tarjeta 2: Apariencia del Panel (Tema) ─────────────── */}
                    <ThemeModeSection theme={theme} onThemeChange={handleThemeChange} />

                    {/* ── D. Tarjeta 3: Paleta de Colores del Portafolio ────────── */}
                    <ColorPaletteSection
                        colors={colors}
                        onColorChange={handleColorChange}
                        onApplyPreset={handleApplyPreset}
                        onResetDefaults={handleResetDefaults}
                        showStatusColors={showStatusColors}
                        onToggleShowStatusColors={() => setShowStatusColors(!showStatusColors)}
                        previewBackground={previewBackground}
                        onPreviewBackgroundChange={setPreviewBackground}
                        availablePalettes={palettes}
                        selectedPaletteId={selectedPaletteId}
                        onSelectPalette={handleSelectPalette}
                    />

                    {/* ── E. Tarjeta 4, 5, 6: Ajustes del Editor y Densidad ──────── */}
                    <EditorSettingsSection
                        tableDensity={tableDensity}
                        onTableDensityChange={setTableDensity}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                        editorMode={editorMode}
                        onEditorModeChange={setEditorMode}
                        emailNotifications={emailNotifications}
                        onEmailNotificationsChange={setEmailNotifications}
                    />

                    {/* ── F. Tarjeta 7: Compresión de Medios ─────────────────────── */}
                    <ImageCompressionSection
                        compression={imageCompression}
                        onCompressionChange={setImageCompression}
                    />

                    {/* ── G. Tarjeta 8: Rendimiento y Mantenimiento de Caché ─────── */}
                    <CacheManagementSection />

                    {/* ── G. Barra de Acciones Inferior ─────────────────────────── */}
                    <div className="sticky bottom-6 z-30 rounded-[28px] border border-slate-100/90 bg-white/95 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-[#161b24]/95">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Asegúrate de guardar los cambios para aplicarlos en tu cuenta.
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link href={route('admin.dashboard')}>
                                    <SecondaryButton disabled={saving}>
                                        Volver al Dashboard
                                    </SecondaryButton>
                                </Link>
                                <PrimaryButton
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="gap-2 px-6 py-2.5"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>{saving ? 'Guardando...' : 'Guardar Preferencias'}</span>
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
            </div>
        </>
    );
}

Edit.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
