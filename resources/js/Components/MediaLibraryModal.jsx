import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import {
    Images,
    UploadCloud,
    X,
    Search,
    Trash2,
    Copy,
    Check,
    Image as ImageIcon,
    ExternalLink,
    Loader2,
    Plus,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidDropzone from '@/Components/LiquidDropzone';

export default function MediaLibraryModal({
    show = false,
    onClose = () => {},
    onSelect = null, // (mediaItem) => void. If provided, works in picker mode.
    title = 'Biblioteca de Medios',
    contentId = null,
    collection = 'library',
}) {
    const isPicker = typeof onSelect === 'function';

    const [mediaItems, setMediaItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Estado para Drag & Drop y subidas asíncronas
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);
    const [uploads, setUploads] = useState([]); // [{ id, name, status: 'uploading'|'done'|'error', error?: string }]
    const fileInputRef = useRef(null);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDropzone, setShowDropzone] = useState(false);

    // Estado para edición asíncrona de metadatos (WordPress style)
    const [metaTitle, setMetaTitle] = useState('');
    const [metaAlt, setMetaAlt] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const saveTimeoutRef = useRef(null);

    // Sincronizar metadatos del elemento seleccionado
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
                const updated = await res.json();
                setSaveStatus('saved');
                setSelectedItem((prev) =>
                    prev ? { ...prev, title: newTitle, alt: newAlt, description: newDesc } : null
                );
                setMediaItems((prev) =>
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

    // Cargar medios al abrir el modal o cambiar búsqueda
    const fetchMedia = useCallback(
        async (pageToLoad = 1, searchQuery = '', append = false) => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    page: pageToLoad.toString(),
                    search: searchQuery,
                    per_page: '24',
                });
                const res = await fetch(`${route('admin.media.index')}?${params.toString()}`, {
                    headers: {
                        Accept: 'application/json',
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (append) {
                        setMediaItems((prev) => [...prev, ...data.data]);
                    } else {
                        setMediaItems(data.data || []);
                        if (data.data?.length > 0 && !selectedItem) {
                            setSelectedItem(data.data[0]);
                        }
                    }
                    setPage(data.current_page || 1);
                    setHasMore((data.current_page || 1) < (data.last_page || 1));
                    setTotalCount(data.total || 0);
                }
            } catch (err) {
                console.error('Error cargando medios:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [selectedItem]
    );

    useEffect(() => {
        if (show) {
            fetchMedia(1, search, false);
        } else {
            setSelectedItem(null);
            setUploads([]);
            setIsDragging(false);
            dragCounter.current = 0;
        }
    }, [show]);

    // Manejador de búsqueda con debounce
    useEffect(() => {
        if (!show) return;
        const timer = setTimeout(() => {
            fetchMedia(1, search, false);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, show]);

    // Subida asíncrona de archivos individuales
    const uploadSingleFile = async (file) => {
        const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        setUploads((prev) => [
            { id: uploadId, name: file.name, status: 'uploading' },
            ...prev,
        ]);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('collection', collection || 'library');
        if (contentId) {
            formData.append('content_id', contentId);
            formData.append('mediable_id', contentId);
            formData.append('mediable_type', 'App\\Models\\Content');
        }

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
                setMediaItems((prev) => [newMedia, ...prev]);
                setSelectedItem(newMedia);
                setTotalCount((prev) => prev + 1);
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
                            message: `"${file.name}" se ha añadido a la biblioteca.`,
                        },
                    })
                );
            } else {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.message || 'Error al procesar la imagen.';
                setUploads((prev) =>
                    prev.map((u) =>
                        u.id === uploadId
                            ? { ...u, status: 'error', error: errMsg }
                            : u
                    )
                );
            }
        } catch (err) {
            setUploads((prev) =>
                prev.map((u) =>
                    u.id === uploadId
                        ? { ...u, status: 'error', error: 'Error de conexión.' }
                        : u
                )
            );
        }
    };

    // Procesar lista de archivos
    const processFiles = (fileList) => {
        if (!fileList || fileList.length === 0) return;
        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/jpg',
            'image/heif',
            'image/heic',
            'image/heif-sequence',
            'image/heic-sequence',
        ];
        const validExts = ['jpg', 'jpeg', 'png', 'webp', 'heif', 'heic'];

        Array.from(fileList).forEach((file) => {
            const ext = file.name?.split('.').pop()?.toLowerCase() || '';
            const isValid = validTypes.includes(file.type) || validExts.includes(ext);

            if (isValid) {
                uploadSingleFile(file);
            } else {
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'error',
                            title: 'Formato no soportado',
                            message: `"${file.name}" debe ser JPEG, PNG, WebP o HEIF/HEIC.`,
                        },
                    })
                );
            }
        });
    };

    // Eventos Drag & Drop de archivos
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            setIsDragging(false);
            dragCounter.current = 0;
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    // Eliminar medio seleccionado
    const handleDeleteMedia = async () => {
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
                setMediaItems((prev) => prev.filter((m) => m.id !== selectedItem.id));
                setSelectedItem(null);
                setTotalCount((prev) => Math.max(0, prev - 1));
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'success',
                            title: 'Medio eliminado',
                            message: 'El archivo ha sido borrado del sistema.',
                        },
                    })
                );
            } else {
                alert('No se pudo eliminar el archivo.');
            }
        } catch {
            alert('Error de conexión al eliminar archivo.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Copiar URL al portapapeles
    const handleCopyUrl = () => {
        if (!selectedItem?.url) return;
        navigator.clipboard.writeText(selectedItem.url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    // Seleccionar para insertar en post/formulario
    const handleConfirmSelection = () => {
        if (!selectedItem || !onSelect) return;
        onSelect(selectedItem);
        onClose();
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="media-library-modal"
                className="fixed inset-0 z-50 flex transform items-center justify-center p-2 sm:p-6 transition-all"
                onClose={onClose}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="relative flex flex-col h-[90vh] max-h-[850px] w-full max-w-6xl rounded-[28px] border border-slate-100/90 bg-white dark:border-slate-800/80 dark:bg-[#161b24] shadow-2xl overflow-hidden"
                    >
                        {/* Overlay visual Drag & Drop al arrastrar archivos */}
                        {isDragging && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-brand-primary/90 backdrop-blur-md text-white p-6 transition-all animate-in fade-in duration-200">
                                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mb-4 ring-4 ring-white/30 animate-bounce">
                                    <UploadCloud className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold font-heading">
                                    Suelta tus imágenes aquí
                                </h3>
                                <p className="text-sm text-white/80 mt-1 max-w-md text-center">
                                    Se cargarán de forma asíncrona inmediatamente a la biblioteca
                                </p>
                            </div>
                        )}

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#f8f9fb] dark:border-slate-800 dark:bg-[#12161f]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                    <Images className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                                        {title}
                                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                                            {totalCount} archivos
                                        </span>
                                    </h2>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        Arrastra imágenes directamente o selecciona archivos de tu equipo
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Botón Subir Archivo */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,image/jpg,image/heif,image/heic,.heif,.heic"
                                    className="hidden"
                                    onChange={(e) => {
                                        processFiles(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowDropzone((prev) => !prev)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-primary-hover active:scale-95"
                                >
                                    <Plus className={`h-4 w-4 transition-transform duration-200 ${showDropzone ? 'rotate-45' : ''}`} />
                                    <span>{showDropzone ? 'Cerrar zona' : 'Subir nueva imagen'}</span>
                                </button>

                                {/* Cerrar */}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Subheader / Buscador y Cola de Subidas */}
                        <div className="px-6 py-3 border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-[#161b24] flex flex-wrap items-center justify-between gap-3">
                            {/* Buscador */}
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por nombre o descripción..."
                                    className="w-full rounded-full border border-slate-200/80 bg-slate-50/50 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white dark:placeholder:text-slate-500"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Cola de subida en tiempo real */}
                            {uploads.length > 0 && (
                                <div className="flex items-center gap-2 overflow-x-auto max-w-md py-1">
                                    {uploads.slice(0, 3).map((u) => (
                                        <div
                                            key={u.id}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
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
                                            <span className="truncate max-w-[120px]">
                                                {u.name}
                                            </span>
                                        </div>
                                    ))}
                                    {uploads.length > 3 && (
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                            +{uploads.length - 3} más
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Zona de Carga Líquida con Tensión Superficial */}
                        <AnimatePresence>
                            {showDropzone && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.96 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                    className="overflow-hidden p-4 bg-slate-50/50 dark:bg-[#12161f]/50 border-b border-slate-100 dark:border-slate-800"
                                >
                                    <LiquidDropzone
                                        compact
                                        onFilesDrop={(files) => {
                                            processFiles(files);
                                            setShowDropzone(false);
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Modal Body: Grid a la izquierda + Panel de detalles a la derecha */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Grid de Medios */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {isLoading && mediaItems.length === 0 ? (
                                    <div className="flex h-64 items-center justify-center">
                                        <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                                            <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                                            Cargando biblioteca...
                                        </div>
                                    </div>
                                ) : mediaItems.length === 0 ? (
                                    <div className="py-6 px-4">
                                        <LiquidDropzone
                                            compact
                                            onFilesDrop={processFiles}
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                                        {mediaItems.map((media) => {
                                            const isSelected = selectedItem?.id === media.id;
                                            return (
                                                <div
                                                    key={media.id}
                                                    onClick={() => setSelectedItem(media)}
                                                    className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 bg-slate-100 dark:bg-[#12161f] shadow-xs ${
                                                        isSelected
                                                            ? 'ring-3 ring-brand-primary shadow-lg scale-[1.02]'
                                                            : 'hover:shadow-md hover:ring-2 hover:ring-brand-primary/30'
                                                    }`}
                                                >
                                                    <img
                                                        src={media.thumbnail_url || media.url}
                                                        alt={media.file_name}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />

                                                    {/* Badge de colección */}
                                                    <span className="absolute top-1.5 left-1.5 rounded-full bg-slate-950/70 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
                                                        {media.collection}
                                                    </span>

                                                    {/* Badge seleccionado */}
                                                    {isSelected && (
                                                        <div className="absolute top-1.5 right-1.5 rounded-full bg-brand-primary p-1 text-white shadow">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                    )}

                                                    {/* Overlay info al pie */}
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <p className="text-[11px] font-medium text-white truncate">
                                                            {media.file_name}
                                                        </p>
                                                        <p className="text-[9px] text-white/70">
                                                            {formatBytes(media.file_size)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Paginación / Cargar más */}
                                {hasMore && (
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => fetchMedia(page + 1, search, true)}
                                            className="rounded-full border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#161b24] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 dark:hover:bg-[#1c222e] transition disabled:opacity-50"
                                        >
                                            {isLoading ? 'Cargando más...' : 'Cargar más imágenes'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Panel Lateral de Detalles */}
                            <div className="w-80 border-l border-slate-100 bg-[#f8f9fb] dark:border-slate-800 dark:bg-[#12161f] flex flex-col justify-between overflow-y-auto p-5">
                                {selectedItem ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Detalles y Metadatos
                                            </h3>
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

                                        {/* Preview grande */}
                                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 relative group border border-slate-200/60 dark:border-slate-800">
                                            <img
                                                src={selectedItem.url}
                                                alt={selectedItem.alt || selectedItem.file_name}
                                                title={selectedItem.title || selectedItem.file_name}
                                                className="h-full w-full object-contain"
                                            />
                                            <a
                                                href={selectedItem.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/80"
                                                title="Ver en tamaño completo"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </div>

                                        {/* Metadatos técnicos */}
                                        <div className="space-y-2 text-xs">
                                            <div>
                                                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                                                    Nombre:
                                                </span>
                                                <span className="font-semibold text-slate-900 dark:text-white break-all">
                                                    {selectedItem.file_name}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                                                        Peso:
                                                    </span>
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">
                                                        {formatBytes(selectedItem.file_size)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                                                        Tipo:
                                                    </span>
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">
                                                        {selectedItem.mime_type}
                                                    </span>
                                                </div>
                                            </div>

                                            {selectedItem.created_at && (
                                                <div>
                                                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                                                        Fecha:
                                                    </span>
                                                    <span className="text-slate-800 dark:text-slate-200">
                                                        {new Date(selectedItem.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Campos Editables de Metadatos SEO / Accesibilidad */}
                                        <div className="space-y-3 pt-2">
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
                                                    className="w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#161b24] dark:text-white dark:placeholder:text-slate-500"
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
                                                    className="w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#161b24] dark:text-white dark:placeholder:text-slate-500"
                                                />
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                    Utilizado en la etiqueta &lt;img alt="..."&gt; para accesibilidad y SEO.
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
                                                    className="w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none dark:border-slate-800 dark:bg-[#161b24] dark:text-white dark:placeholder:text-slate-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Acciones del medio */}
                                        <div className="space-y-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleCopyUrl}
                                                className="w-full flex items-center justify-center gap-1.5 rounded-full border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#161b24] py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-[#1c222e]"
                                            >
                                                {copiedUrl ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span>¡URL copiada!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>Copiar enlace público</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleDeleteMedia}
                                                disabled={isDeleting}
                                                className="w-full flex items-center justify-center gap-1.5 rounded-full border border-red-200/60 bg-red-50/50 dark:border-red-500/20 dark:bg-red-500/10 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-100/80 dark:hover:bg-red-500/20 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span>Eliminar de la biblioteca</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-500 py-8">
                                        <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
                                        <p className="text-xs">
                                            Selecciona una imagen para ver sus detalles o insertarla
                                        </p>
                                    </div>
                                )}

                                {/* Botón de inserción en Picker Mode */}
                                {isPicker && (
                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            disabled={!selectedItem}
                                            onClick={handleConfirmSelection}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-primary-hover active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            <Check className="h-4 w-4" />
                                            Insertar selección
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

