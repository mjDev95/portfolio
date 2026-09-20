import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { BRAND_PALETTES } from './data/brandData';
import PaletteSection from './Components/PaletteSection';
import TypographySection from './Components/TypographySection';
import TokensCodeSection from './Components/TokensCodeSection';
import ColorPaletteModal from './Components/ColorPaletteModal';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Palette, Type, Code2, Search, Sparkles, CheckCircle2, Plus, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { applySuperAdminPalette } from '@/Support/brandTheme';

export default function Index({ palettes = [], activePaletteId = null }) {
    const [activeTab, setActiveTab] = useState('palettes');
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState(null);

    // Modal state for creating / editing palettes
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPalette, setEditingPalette] = useState(null);

    // Modal state for deleting palettes
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [paletteToDelete, setPaletteToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Palettes and active ID
    const [paletteList, setPaletteList] = useState(
        palettes && palettes.length > 0 ? palettes : BRAND_PALETTES
    );
    const [currentActiveId, setCurrentActiveId] = useState(activePaletteId);

    useEffect(() => {
        if (palettes) {
            setPaletteList(palettes);
        }
    }, [palettes]);

    useEffect(() => {
        setCurrentActiveId(activePaletteId);
    }, [activePaletteId]);

    const showToast = (title, message) => {
        setToastMessage({ title, message });
        setTimeout(() => {
            setToastMessage(null);
        }, 2800);
    };

    const handleCreateClick = () => {
        setEditingPalette(null);
        setModalOpen(true);
    };

    const handleEditClick = (palette) => {
        setEditingPalette(palette);
        setModalOpen(true);
    };

    const handleDeleteClick = (palette) => {
        setPaletteToDelete(palette);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!paletteToDelete) return;

        setIsDeleting(true);
        router.delete(route('admin.brand.palettes.destroy', paletteToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                const deletedId = paletteToDelete.id;
                const deletedName = paletteToDelete.name;
                setPaletteList((prev) => prev.filter((p) => p.id !== deletedId));
                setDeleteModalOpen(false);
                setPaletteToDelete(null);
                setIsDeleting(false);
                showToast('Paleta eliminada', `La paleta "${deletedName}" ha sido eliminada con éxito.`);
            },
            onError: (errors) => {
                const msg = typeof errors === 'string' ? errors : (Object.values(errors)[0] || 'No se pudo eliminar la paleta.');
                showToast('Error', msg);
                setIsDeleting(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleActivatePalette = async (palette) => {
        const primary = palette.primary_color || palette.colors?.[0]?.hex || '#CB2128';
        const secondary = palette.secondary_color || palette.colors?.[1]?.hex || '#DFB136';
        const tertiary = palette.tertiary_color || palette.colors?.[2]?.hex || '#1D4ED8';
        const accent = palette.accent_color || palette.colors?.[3]?.hex || '#F59E0B';

        // Apply immediately to the DOM
        applySuperAdminPalette({ primary, secondary, tertiary, accent });
        setCurrentActiveId(palette.id);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(route('admin.preferences.update'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify({
                    color_palette_id: palette.id,
                }),
            });

            if (res.ok) {
                showToast('Paleta activada', `La paleta "${palette.name}" ahora está activa en el panel.`);
                router.reload({ only: ['activePaletteId'] });
            } else {
                showToast('Aviso', 'Se aplicó en pantalla pero hubo un inconveniente al persistir en base de datos.');
            }
        } catch (err) {
            console.error('Error al activar paleta en preferencias:', err);
            showToast('Aviso', 'Se aplicó localmente. Verifica la conexión con el servidor.');
        }
    };

    const handleModalSuccess = (savedPalette) => {
        setPaletteList((prev) => {
            const exists = prev.some((p) => p.id === savedPalette.id);
            if (exists) {
                return prev.map((p) => (p.id === savedPalette.id ? savedPalette : p));
            }
            return [...prev, savedPalette];
        });
        router.reload({ only: ['palettes'] });
        showToast(
            editingPalette ? '¡Actualizada!' : '¡Creada con éxito!',
            `La paleta "${savedPalette.name}" ha sido guardada en la base de datos.`
        );
    };

    // Filtrado interactivo de paletas por nombre o código hexadecimal
    const filteredPalettes = useMemo(() => {
        if (!searchQuery.trim()) return paletteList;
        const q = searchQuery.toLowerCase().trim();

        return paletteList.filter((palette) => {
            const matchesName = palette.name?.toLowerCase().includes(q);
            const matchesTagline = palette.tagline?.toLowerCase().includes(q);
            const colorsArray = Array.isArray(palette.colors) ? palette.colors : [];
            const matchesColor = colorsArray.some(
                (c) =>
                    c.title?.toLowerCase().includes(q) ||
                    c.hex?.toLowerCase().includes(q) ||
                    c.label?.toLowerCase().includes(q)
            ) ||
            palette.primary_color?.toLowerCase().includes(q) ||
            palette.secondary_color?.toLowerCase().includes(q) ||
            palette.tertiary_color?.toLowerCase().includes(q) ||
            palette.accent_color?.toLowerCase().includes(q);

            return matchesName || matchesTagline || matchesColor;
        });
    }, [searchQuery, paletteList]);

    return (
        <>
            <Head title="Identidad Corporativa & Branding — Admin" />

            {/* Toast flotante de micro-interacción */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-slate-900 px-5 py-2.5 text-white shadow-xl ring-1 ring-white/10 dark:bg-white dark:text-slate-900"
                    >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                        <div className="text-xs font-medium">
                            <span className="font-bold">{toastMessage.title}: </span>
                            {toastMessage.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full space-y-8">
                {/* ── 1. Cabecera Principal ─────────────────────────────────── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent dark:bg-brand-accent/20 dark:text-brand-accent">
                                    <Sparkles className="h-3 w-3" />
                                    Sistema de Diseño & Branding
                                </span>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    v1.0
                                </span>
                            </div>

                            <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                Identidad Corporativa & Catálogo de Color
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Administra las combinaciones cromáticas de 4 colores y visualiza el stack tipográfico oficial.
                            </p>
                        </div>

                        {/* Acciones y Buscador Rápido de Colores */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative w-full sm:w-64">
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por color, HEX..."
                                    className="w-full rounded-full border border-slate-200/80 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#161b24] dark:text-white dark:placeholder-slate-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleCreateClick}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-primary-hover shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Nueva Paleta</span>
                            </button>
                        </div>
                    </div>

                    {/* ── 2. Pestañas de Navegación del Módulo ───────────────────── */}
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800/80">
                        <button
                            type="button"
                            onClick={() => setActiveTab('palettes')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                                activeTab === 'palettes'
                                    ? 'bg-brand-primary text-white shadow-sm'
                                    : 'border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <Palette className="h-4 w-4" />
                            <span>Paletas Cromáticas</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                activeTab === 'palettes' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                                {paletteList.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('typography')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                                activeTab === 'typography'
                                    ? 'bg-brand-primary text-white shadow-sm'
                                    : 'border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <Type className="h-4 w-4" />
                            <span>Tipografía Oficial</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                activeTab === 'typography' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                                2
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('tokens')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                                activeTab === 'tokens'
                                    ? 'bg-brand-primary text-white shadow-sm'
                                    : 'border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <Code2 className="h-4 w-4" />
                            <span>Tokens & Código</span>
                        </button>
                    </div>

                    {/* ── 3. Contenido Dinámico según Pestaña ────────────────────── */}
                    {activeTab === 'palettes' && (
                        <div className="space-y-10">
                            {filteredPalettes.length > 0 ? (
                                filteredPalettes.map((palette) => (
                                    <PaletteSection
                                        key={palette.id}
                                        palette={palette}
                                        isActive={Number(currentActiveId) === Number(palette.id)}
                                        onActivate={handleActivatePalette}
                                        onToast={showToast}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteClick}
                                    />
                                ))
                            ) : (
                                <div className="rounded-[28px] border border-slate-100/90 bg-white p-12 text-center shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                                    <Palette className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                                    <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
                                        No se encontraron paletas
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        No hay coincidencias para &quot;{searchQuery}&quot;. Intenta con otro término o código HEX.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'typography' && <TypographySection />}

                    {activeTab === 'tokens' && <TokensCodeSection onToast={showToast} />}
            </div>

            {/* Modal para Crear y Editar Paleta (4 colores, sin is_master) */}
            <ColorPaletteModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingPalette(null);
                }}
                palette={editingPalette}
                onSuccess={handleModalSuccess}
            />

            {/* Modal Moderno de Confirmación para Eliminar Paleta */}
            <Modal
                show={deleteModalOpen}
                onClose={() => {
                    if (!isDeleting) {
                        setDeleteModalOpen(false);
                        setPaletteToDelete(null);
                    }
                }}
                maxWidth="md"
            >
                <div className="p-6 sm:p-7">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                ¿Eliminar paleta de color?
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Esta acción eliminará permanentemente la paleta del catálogo.
                            </p>
                        </div>
                    </div>

                    {paletteToDelete && (
                        <div className="mt-5 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 dark:border-slate-800 dark:bg-[#12161f]">
                            <span className="block text-xs font-bold text-slate-900 dark:text-white">
                                {paletteToDelete.name}
                            </span>
                            <div className="mt-2.5 flex h-7 w-full overflow-hidden rounded-lg shadow-2xs">
                                <div
                                    className="flex-1"
                                    style={{ backgroundColor: paletteToDelete.primary_color || paletteToDelete.colors?.[0]?.hex || '#CB2128' }}
                                />
                                <div
                                    className="flex-1"
                                    style={{ backgroundColor: paletteToDelete.secondary_color || paletteToDelete.colors?.[1]?.hex || '#DFB136' }}
                                />
                                {(paletteToDelete.tertiary_color || paletteToDelete.colors?.[2]?.hex) && (
                                    <div
                                        className="flex-1"
                                        style={{ backgroundColor: paletteToDelete.tertiary_color || paletteToDelete.colors?.[2]?.hex }}
                                    />
                                )}
                                {(paletteToDelete.accent_color || paletteToDelete.colors?.[3]?.hex) && (
                                    <div
                                        className="flex-1"
                                        style={{ backgroundColor: paletteToDelete.accent_color || paletteToDelete.colors?.[3]?.hex }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <SecondaryButton
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setPaletteToDelete(null);
                            }}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Eliminando...' : 'Eliminar Paleta'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
