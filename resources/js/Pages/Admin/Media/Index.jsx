import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteScroll } from '@/utils/useInfiniteScroll';
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import {
    Images,
    Plus,
    Search,
    X,
    Trash2,
    Copy,
    Check,
    UploadCloud,
    ExternalLink,
    Loader2,
    CheckCircle2,
    AlertCircle,
    HardDrive,
    Sparkles,
} from 'lucide-react';

export default function Index({ media = {}, filters = {}, stats = {} }) {
    const {
        items: mediaList,
        setItems: setMediaList,
        loading: loadingMore,
        hasMore,
        total: totalItems,
        sentinelRef,
    } = useInfiniteScroll(media);

    const [selectedItem, setSelectedItem] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [collectionFilter, setCollectionFilter] = useState(filters.collection || 'all');
    const [isSearching, setIsSearching] = useState(false);

    // Estado para Drag & Drop externo y subidas asíncronas
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);
    const [uploads, setUploads] = useState([]);
    const fileInputRef = useRef(null);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Estado para selección múltiple y eliminación masiva
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const stripExtension = (name) => {
        if (!name) return '';
        return name.replace(/\.[^/.]+$/, '');
    };

    // Estado para edición asíncrona de metadatos (WordPress style)
    const [metaTitle, setMetaTitle] = useState('');
    const [metaAlt, setMetaAlt] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const saveTimeoutRef = useRef(null);

    // Sincronizar metadatos cuando se selecciona un archivo
    useEffect(() => {
        if (selectedItem) {
            setMetaTitle(selectedItem.title || '');
            setMetaAlt(selectedItem.alt || '');
            setMetaDescription(selectedItem.description || '');
            setSaveStatus('idle');
        }
    }, [selectedItem?.id]);

    const saveMetadata = async (newTitle, newAlt, newDesc) => {
        if (!selectedItem) return;
        setSaveStatus('saving');
        const token = document.querySelector('meta[name="csrf-token"]')?.content;

        try {
            const res = await fetch(route('admin.media.update', selectedItem.id), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    title: newTitle,
                    alt: newAlt,
                    description: newDesc,
                }),
            });

            if (res.ok) {
                setSaveStatus('saved');
                setSelectedItem((prev) =>
                    prev ? { ...prev, title: newTitle, alt: newAlt, description: newDesc } : null
                );
                setMediaList((prev) =>
                    prev.map((m) =>
                        m.id === selectedItem.id
                            ? { ...m, title: newTitle, alt: newAlt, description: newDesc }
                            : m
                    )
                );
                setTimeout(() => {
                    setSaveStatus((curr) => (curr === 'saved' ? 'idle' : curr));
                }, 2000);
            } else {
                setSaveStatus('error');
            }
        } catch {
            setSaveStatus('error');
        }
    };

    const handleFieldChange = (field, val) => {
        let t = metaTitle;
        let a = metaAlt;
        let d = metaDescription;

        if (field === 'title') {
            setMetaTitle(val);
            t = val;
        } else if (field === 'alt') {
            setMetaAlt(val);
            a = val;
        } else if (field === 'description') {
            setMetaDescription(val);
            d = val;
        }

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveMetadata(t, a, d);
        }, 600);
    };

    const handleFieldBlur = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveMetadata(metaTitle, metaAlt, metaDescription);
        }
    };

    // Búsqueda y filtrado con Inertia router.get
    const executeFilter = (newSearch, newCollection) => {
        setIsSearching(true);
        router.get(
            route('admin.media.index'),
            {
                search: newSearch,
                collection: newCollection !== 'all' ? newCollection : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['media', 'filters', 'stats'],
                onFinish: () => setIsSearching(false),
            }
        );
    };

    // Subida asíncrona de archivos individuales
    const uploadSingleFile = async (file) => {
        const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        setUploads((prev) => [
            { id: uploadId, name: file.name, status: 'uploading' },
            ...prev,
        ]);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('collection', 'library');

        const token = document.querySelector('meta[name="csrf-token"]')?.content;

        try {
            const res = await fetch(route('admin.media.store'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token,
                    Accept: 'application/json',
                },
                body: formData,
            });

            if (res.ok) {
                const newMedia = await res.json();
                setMediaList((prev) => [newMedia, ...prev]);
                setSelectedItem(newMedia);
                setIsDetailModalOpen(true);
                setUploads((prev) =>
                    prev.map((u) =>
                        u.id === uploadId ? { ...u, status: 'done' } : u
                    )
                );

                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'success',
                            title: 'Imagen subida',
                            message: `"${file.name}" se comprimió y guardó en la biblioteca.`,
                        },
                    })
                );
            } else {
                setUploads((prev) =>
                    prev.map((u) =>
                        u.id === uploadId
                            ? { ...u, status: 'error', error: 'Error al subir.' }
                            : u
                    )
                );
            }
        } catch {
            setUploads((prev) =>
                prev.map((u) =>
                    u.id === uploadId
                        ? { ...u, status: 'error', error: 'Error de conexión.' }
                        : u
                )
            );
        }
    };

    const processFiles = (files) => {
        if (!files || files.length === 0) return;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

        Array.from(files).forEach((file) => {
            if (validTypes.includes(file.type)) {
                uploadSingleFile(file);
            } else {
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'error',
                            title: 'Formato no compatible',
                            message: `"${file.name}" debe ser JPEG, PNG o WebP.`,
                        },
                    })
                );
            }
        });
    };

    // Drag & Drop global sobre la página
    const handleDragEnter = (e) => {
        if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault();
            dragCounter.current += 1;
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault();
            dragCounter.current -= 1;
            if (dragCounter.current <= 0) {
                setIsDragging(false);
                dragCounter.current = 0;
            }
        }
    };

    const handleDrop = (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            setIsDragging(false);
            dragCounter.current = 0;
            processFiles(e.dataTransfer.files);
        }
    };

    // Eliminar archivo
    const handleDelete = async () => {
        if (!selectedItem) return;
        if (!confirm(`¿Eliminar definitivamente "${selectedItem.file_name}" de la biblioteca?`)) {
            return;
        }

        setIsDeleting(true);
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        try {
            const res = await fetch(route('admin.media.destroy', selectedItem.id), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': token,
                    Accept: 'application/json',
                },
            });

            if (res.ok) {
                setMediaList((prev) => prev.filter((m) => m.id !== selectedItem.id));
                setIsDetailModalOpen(false);
                setSelectedItem(null);
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'success',
                            title: 'Medio eliminado',
                            message: 'Archivo y miniatura eliminados correctamente.',
                        },
                    })
                );
            } else {
                alert('No se pudo eliminar el archivo.');
            }
        } catch {
            alert('Error de conexión.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Métodos para Selección Múltiple y Bulk Delete
    const toggleSelectItem = (id, e) => {
        e?.stopPropagation();
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === mediaList.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(mediaList.map((m) => m.id)));
        }
    };

    const handleClearSelection = () => {
        setSelectedIds(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        const count = selectedIds.size;
        if (!confirm(`¿Eliminar definitivamente ${count} ${count === 1 ? 'imagen' : 'imágenes'} de la biblioteca y de disco? Esta acción no se puede deshacer.`)) {
            return;
        }

        setIsBulkDeleting(true);
        const token = document.querySelector('meta[name="csrf-token"]')?.content;

        try {
            const res = await fetch(route('admin.media.bulk-destroy'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    ids: Array.from(selectedIds),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setMediaList((prev) => prev.filter((m) => !selectedIds.has(m.id)));
                if (selectedItem && selectedIds.has(selectedItem.id)) {
                    setIsDetailModalOpen(false);
                    setSelectedItem(null);
                }
                setSelectedIds(new Set());
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'success',
                            title: 'Eliminación masiva completada',
                            message: `Se eliminaron ${data.deletedCount ?? count} imágenes exitosamente.`,
                        },
                    })
                );
            } else {
                alert('No se pudieron eliminar los archivos seleccionados.');
            }
        } catch {
            alert('Error de conexión.');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleCopyUrl = () => {
        if (!selectedItem?.url) return;
        navigator.clipboard.writeText(selectedItem.url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const collections = [
        { key: 'all', label: 'Todos' },
        { key: 'library', label: 'Biblioteca' },
        { key: 'thumbnail', label: 'Miniaturas' },
        { key: 'hero', label: 'Cabeceras' },
        { key: 'gallery', label: 'Galerías' },
    ];

    const openItemDetails = (item) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    return (
        <>
            <Head title="Biblioteca de Medios" />

            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative w-full min-h-[calc(100vh-5rem)]"
            >
                {/* Overlay visual Drag & Drop al arrastrar archivos */}
                {isDragging && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-primary/90 backdrop-blur-md text-white p-6 transition-all animate-in fade-in duration-200">
                        <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mb-4 ring-8 ring-white/20 animate-bounce">
                            <UploadCloud className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold font-heading">
                            Suelta tus imágenes aquí
                        </h2>
                        <p className="text-sm text-white/80 mt-2 max-w-md text-center">
                            Se comprimirán en WebP Lossless y se generarán miniaturas automáticas.
                        </p>
                    </div>
                )}

                <div className="w-full space-y-6">
                    {/* Header de la Sección */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold font-heading tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                                <span>Biblioteca de Medios</span>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#161b24] border border-slate-200/80 dark:border-slate-800 px-3 py-1 rounded-full shadow-xs">
                                    {totalItems || stats.total || 0} archivos
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Gestiona tus imágenes con compresión WebP y miniaturas ultraligeras.
                            </p>
                        </div>

                        {/* Botón de Subida */}
                        <div className="flex items-center gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                multiple
                                onChange={(e) => {
                                    processFiles(e.target.files);
                                    e.target.value = '';
                                }}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                Subir nueva imagen
                            </button>
                        </div>
                    </div>

                    {/* Barra de Filtros y Búsqueda */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-[28px] border border-slate-100/90 bg-white p-3.5 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                        {/* Píldoras de Colección */}
                        <div className="flex items-center gap-1.5 overflow-x-auto p-1">
                            {collections.map((col) => {
                                const isActive = collectionFilter === col.key;
                                return (
                                    <button
                                        key={col.key}
                                        type="button"
                                        onClick={() => {
                                            setCollectionFilter(col.key);
                                            executeFilter(search, col.key);
                                        }}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                                            isActive
                                                ? 'bg-brand-primary text-white shadow-sm'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-[#12161f] dark:text-slate-400 dark:hover:bg-[#1c222e] dark:hover:text-white'
                                        }`}
                                    >
                                        {col.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Buscador */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        executeFilter(search, collectionFilter);
                                    }
                                }}
                                placeholder="Buscar por nombre o caption..."
                                className="w-full rounded-full border border-slate-200/80 bg-slate-50/80 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white dark:placeholder-slate-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        executeFilter('', collectionFilter);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cola de subidas asíncronas en vivo */}
                    {uploads.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-[28px] border border-slate-100/90 bg-white dark:border-slate-800/80 dark:bg-[#161b24] shadow-sm">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white mr-1">
                                Subidas recientes:
                            </span>
                            {uploads.map((u) => (
                                <div
                                    key={u.id}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                        u.status === 'uploading'
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                             : u.status === 'done'
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                    }`}
                                >
                                    {u.status === 'uploading' && (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    )}
                                    {u.status === 'done' && (
                                        <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    {u.status === 'error' && (
                                        <AlertCircle className="h-3 w-3" />
                                    )}
                                    <span className="truncate max-w-[150px]">{u.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Cuadrícula de Medios de Ancho Completo (Sin columna lateral fija) */}
                    <div className="w-full rounded-[28px] border border-slate-100/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                        {isSearching ? (
                            <div className="flex h-64 items-center justify-center">
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                                    Filtrando medios...
                                </div>
                            </div>
                        ) : mediaList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-[#12161f] flex items-center justify-center text-slate-400 mb-3">
                                    <UploadCloud className="h-8 w-8 text-brand-primary" />
                                </div>
                                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                                    Sin imágenes en la biblioteca
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                                    Arrastra imágenes directamente desde tu computadora o haz clic en subir nueva imagen.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-brand-primary transition hover:bg-slate-200 dark:bg-[#12161f] dark:text-brand-primary dark:hover:bg-[#1c222e]"
                                >
                                    <Plus className="h-4 w-4" />
                                    Seleccionar archivo
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                {mediaList.map((item) => {
                                    const isSelectedForBulk = selectedIds.has(item.id);
                                    const isSelectedModal = selectedItem?.id === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                if (selectedIds.size > 0) {
                                                    toggleSelectItem(item.id);
                                                } else {
                                                    openItemDetails(item);
                                                }
                                            }}
                                            className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 bg-slate-100 dark:bg-[#12161f] border border-slate-200/60 dark:border-slate-800/60 select-none ${
                                                isSelectedForBulk
                                                    ? 'shadow-lg ring-4 ring-brand-primary scale-[0.98] border-transparent'
                                                    : isSelectedModal
                                                    ? 'shadow-md ring-2 ring-brand-primary border-transparent'
                                                    : 'hover:shadow-md hover:scale-[1.02] hover:border-brand-primary/40'
                                            }`}
                                        >
                                            <img
                                                src={item.thumbnail_url || item.url}
                                                alt={item.alt || item.file_name}
                                                loading="lazy"
                                                decoding="async"
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {/* Checkbox de Selección Múltiple */}
                                            <button
                                                type="button"
                                                onClick={(e) => toggleSelectItem(item.id, e)}
                                                className={`absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-lg transition-all ${
                                                    isSelectedForBulk
                                                        ? 'bg-brand-primary text-white shadow-md'
                                                        : selectedIds.size > 0
                                                        ? 'bg-black/40 text-transparent hover:bg-black/60 hover:text-white backdrop-blur-sm'
                                                        : 'bg-black/40 text-transparent hover:bg-black/60 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100'
                                                }`}
                                                title={isSelectedForBulk ? 'Deseleccionar' : 'Seleccionar'}
                                            >
                                                <Check className={`h-3.5 w-3.5 text-white ${isSelectedForBulk ? 'opacity-100 stroke-[3]' : 'opacity-0 group-hover:opacity-100'}`} />
                                            </button>

                                            {/* Franja Inferior: Nombre visible permanente y peso con micro-interacción deslizándose hacia arriba al hover */}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2.5 pb-2.5 pt-6 flex flex-col justify-end pointer-events-none">
                                                <p className="text-[11px] font-semibold text-white truncate drop-shadow-sm leading-tight" title={stripExtension(item.title || item.file_name)}>
                                                    {stripExtension(item.title || item.file_name)}
                                                </p>
                                                <div className="overflow-hidden max-h-0 opacity-0 translate-y-2 group-hover:max-h-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                                                    <span className="text-[9px] text-white/80 font-medium block pt-1">
                                                        {formatBytes(item.file_size)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Centinela y Feedback de Scroll Infinito */}
                        <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center gap-2">
                            {loadingMore && (
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 border border-slate-200/80 dark:border-slate-800 dark:bg-[#12161f] px-4 py-2 rounded-full shadow-xs">
                                    <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                                    <span>Cargando más archivos...</span>
                                </div>
                            )}
                            {!hasMore && mediaList.length > 0 && (totalItems || stats.total) > 24 && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Has llegado al final de la biblioteca ({totalItems || stats.total} archivos)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BARRA FLOTANTE PARA SELECCIÓN MÚLTIPLE (PORTAL AL BODY CON FRAMER MOTION) ── */}
            {isMounted && createPortal(
                <AnimatePresence>
                    {selectedIds.size > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.94, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                            exit={{ opacity: 0, y: 30, scale: 0.94, x: '-50%' }}
                            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                            className="fixed bottom-6 left-1/2 z-[100] flex items-center gap-3.5 rounded-full border border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:border-slate-700/80 dark:bg-[#161b24]/95 dark:text-white dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl px-4 py-2.5 transition-colors duration-200"
                        >
                            <div className="flex items-center gap-2.5 pr-2.5 border-r border-slate-200 dark:border-slate-700">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white shadow-sm">
                                    {selectedIds.size}
                                </span>
                                <span className="text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                    {selectedIds.size === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition px-3 py-1.5 rounded-full whitespace-nowrap"
                            >
                                {selectedIds.size === mediaList.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                            </button>

                            <button
                                type="button"
                                onClick={handleClearSelection}
                                className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition px-3 py-1.5 rounded-full whitespace-nowrap"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-red-700 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                            >
                                {isBulkDeleting ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                                <span>Eliminar seleccionadas</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* ── MODAL A 2 COLUMNAS PARA DETALLES DE IMAGEN ─────────────────────── */}
            <Transition show={isDetailModalOpen} leave="duration-200">
                <Dialog
                    as="div"
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
                    onClose={() => setIsDetailModalOpen(false)}
                >
                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" />
                    </TransitionChild>

                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="relative flex flex-col w-full max-w-5xl h-[85vh] max-h-[800px] rounded-[28px] border border-slate-100/90 bg-white dark:border-slate-800/80 dark:bg-[#161b24] shadow-2xl overflow-hidden">
                            {/* Header del Modal */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#f8f9fb] dark:border-slate-800 dark:bg-[#12161f]">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                        <Images className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                                            Detalles de la Imagen
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Previsualización en resolución completa y metadatos SEO.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Contenido a 2 Columnas */}
                            {selectedItem && (
                                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                                    {/* COLUMNA IZQUIERDA: Imagen Original en Alta Resolución */}
                                    <div className="flex-1 bg-slate-50 dark:bg-[#0e121a] p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img
                                                src={selectedItem.url}
                                                alt={selectedItem.alt || selectedItem.file_name}
                                                title={selectedItem.title || selectedItem.file_name}
                                                decoding="async"
                                                className="max-h-full max-w-full object-contain rounded-2xl shadow-sm"
                                            />
                                            <a
                                                href={selectedItem.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/80 backdrop-blur"
                                                title="Ver en pestaña completa"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                <span>Abrir original</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/* COLUMNA DERECHA: Metadatos y Campos Editables */}
                                    <div className="w-full lg:w-96 bg-white dark:bg-[#161b24] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto space-y-5">
                                        <div className="space-y-4">
                                            {/* Barra de estado de guardado */}
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Metadatos
                                                </h4>
                                                <div className="flex items-center gap-1.5 h-4">
                                                    {saveStatus === 'saving' && (
                                                        <span className="flex items-center gap-1 text-[11px] text-brand-primary font-medium animate-pulse">
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            <span>Guardando...</span>
                                                        </span>
                                                    )}
                                                    {saveStatus === 'saved' && (
                                                        <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                                                            <Check className="h-3.5 w-3.5" />
                                                            <span>Guardado</span>
                                                        </span>
                                                    )}
                                                    {saveStatus === 'error' && (
                                                        <span className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
                                                            <X className="h-3.5 w-3.5" />
                                                            <span>Error</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Datos Técnicos */}
                                            <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] dark:border-slate-800 dark:bg-[#12161f] p-4 space-y-2.5 text-xs">
                                                <div>
                                                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                                                        Nombre de archivo:
                                                    </span>
                                                    <span className="font-semibold text-slate-900 dark:text-white break-all">
                                                        {selectedItem.file_name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                                                            Peso original:
                                                        </span>
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {formatBytes(selectedItem.file_size)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                                                            Formato:
                                                        </span>
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {selectedItem.mime_type}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                                                            Colección:
                                                        </span>
                                                        <span className="font-medium text-slate-900 dark:text-white capitalize">
                                                            {selectedItem.collection}
                                                        </span>
                                                    </div>
                                                    {selectedItem.created_at && (
                                                        <div>
                                                            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                                                                Fecha:
                                                            </span>
                                                            <span className="text-slate-900 dark:text-white">
                                                                {new Date(selectedItem.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Campos Editables */}
                                            <div className="space-y-3 pt-1">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        Título
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={metaTitle}
                                                        onChange={(e) => handleFieldChange('title', e.target.value)}
                                                        onBlur={handleFieldBlur}
                                                        placeholder="Título de la imagen..."
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f] dark:text-white dark:placeholder-slate-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        Texto alternativo (Alt)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={metaAlt}
                                                        onChange={(e) => handleFieldChange('alt', e.target.value)}
                                                        onBlur={handleFieldBlur}
                                                        placeholder="Describe el contenido de la imagen..."
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f] dark:text-white dark:placeholder-slate-500"
                                                    />
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                        Utilizado en la etiqueta &lt;img alt="..."&gt; para SEO y accesibilidad.
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        Descripción
                                                    </label>
                                                    <textarea
                                                        rows={2}
                                                        value={metaDescription}
                                                        onChange={(e) => handleFieldChange('description', e.target.value)}
                                                        onBlur={handleFieldBlur}
                                                        placeholder="Descripción detallada o notas..."
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none dark:border-slate-700 dark:bg-[#12161f] dark:text-white dark:placeholder-slate-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acciones del Modal */}
                                        <div className="space-y-2 pt-3">
                                            <button
                                                type="button"
                                                onClick={handleCopyUrl}
                                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#12161f] dark:text-slate-200 dark:hover:bg-[#1c222e] transition"
                                            >
                                                {copiedUrl ? (
                                                    <>
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                        <span>¡URL copiada!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 text-slate-400" />
                                                        <span>Copiar enlace público</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200/60 bg-red-50/60 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition disabled:opacity-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>Eliminar permanentemente</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
