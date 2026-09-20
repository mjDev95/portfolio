import { useState, useRef, useEffect } from 'react';
import {
    Images,
    Trash2,
    Loader2,
    GripVertical,
    UploadCloud,
} from 'lucide-react';

export default function GalleryManager({ content, galleryImages = [], onOpenLibrary = () => {} }) {
    const [images, setImages] = useState(galleryImages);
    const [isUploading, setIsUploading] = useState(false);

    // Estado para Drag and Drop de reordenamiento de fotos
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Estado para Drag and Drop de archivos externos desde el equipo
    const [isDroppingExternalFiles, setIsDroppingExternalFiles] = useState(false);
    const externalDragCounter = useRef(0);

    // Sincronizar si cambia la prop
    useEffect(() => {
        setImages(galleryImages);
    }, [galleryImages]);

    // Escuchar adición de imagen desde el modal picker de medios
    useEffect(() => {
        const handleGalleryImageAdded = (e) => {
            if (e.detail) {
                setImages((prev) => [...prev, e.detail]);
            }
        };
        window.addEventListener('gallery-image-added', handleGalleryImageAdded);
        return () => window.removeEventListener('gallery-image-added', handleGalleryImageAdded);
    }, []);

    // Subir archivo arrastrado desde el equipo directamente a la galería
    const uploadSingleImageFile = async (fileToUpload) => {
        if (!content?.id) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('collection', 'gallery');
        formData.append('mediable_id', content.id);
        formData.append('mediable_type', 'App\\Models\\Content');
        formData.append('order', images.length);

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
                const media = await res.json();
                setImages((prev) => [...prev, media]);
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'success',
                            title: 'Galería actualizada',
                            message: `"${fileToUpload.name}" agregada a la galería.`,
                        },
                    })
                );
            } else {
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'error',
                            title: 'Error de subida',
                            message: 'No se pudo subir la imagen. Verifica formato y tamaño.',
                        },
                    })
                );
            }
        } catch {
            window.dispatchEvent(
                new CustomEvent('admin-feedback', {
                    detail: {
                        type: 'error',
                        title: 'Error de red',
                        message: 'Error al intentar subir la imagen a la galería.',
                    },
                })
            );
        } finally {
            setIsUploading(false);
        }
    };

    // Drag & Drop de reordenamiento entre fotos
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...images];
        const [movedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(dropIndex, 0, movedItem);

        setImages(reordered);
        setDraggedIndex(null);
        setDragOverIndex(null);

        // Guardar nuevo orden en base de datos
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        try {
            const res = await fetch(route('admin.media.reorder'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    order: reordered.map((img) => img.id),
                }),
            });

            if (res.ok) {
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'success',
                            title: 'Orden guardado',
                            message: 'Nuevo orden de la galería guardado con éxito.',
                        },
                    })
                );
            }
        } catch (err) {
            console.error('Error al guardar reordenamiento:', err);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Detección de arrastre de archivos desde el explorador del equipo a la galería
    const handleFilesDragEnter = (e) => {
        if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault();
            externalDragCounter.current += 1;
            setIsDroppingExternalFiles(true);
        }
    };

    const handleFilesDragLeave = (e) => {
        if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault();
            externalDragCounter.current -= 1;
            if (externalDragCounter.current <= 0) {
                setIsDroppingExternalFiles(false);
                externalDragCounter.current = 0;
            }
        }
    };

    const handleFilesDrop = (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            setIsDroppingExternalFiles(false);
            externalDragCounter.current = 0;

            const validFiles = Array.from(e.dataTransfer.files).filter((f) =>
                ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type)
            );

            if (validFiles.length === 0) {
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'error',
                            title: 'Formato inválido',
                            message: 'Por favor arrastra archivos JPEG, PNG o WebP.',
                        },
                    })
                );
                return;
            }

            validFiles.forEach((fileItem) => {
                uploadSingleImageFile(fileItem);
            });
        }
    };

    const destroy = async (mediaId) => {
        if (!confirm('¿Eliminar esta imagen de la galería?')) return;

        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        try {
            const res = await fetch(route('admin.media.destroy', mediaId), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': token,
                    Accept: 'application/json',
                },
            });

            if (res.ok) {
                setImages((prev) => prev.filter((img) => img.id !== mediaId));
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'success',
                            title: 'Galería actualizada',
                            message: 'Imagen eliminada de la galería.',
                        },
                    })
                );
            } else {
                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'error',
                            title: 'Error al eliminar',
                            message: 'No se pudo eliminar la imagen de la galería.',
                        },
                    })
                );
            }
        } catch {
            window.dispatchEvent(
                new CustomEvent('admin-feedback', {
                    detail: {
                        type: 'error',
                        title: 'Error de red',
                        message: 'Error de conexión al eliminar la imagen.',
                    },
                })
            );
        }
    };

    return (
        <div
            onDragEnter={handleFilesDragEnter}
            onDragLeave={handleFilesDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFilesDrop}
            className="relative space-y-5"
        >
            {/* Overlay visual Drag and Drop de archivos externos */}
            {isDroppingExternalFiles && (
                <div className="absolute -inset-4 z-40 flex flex-col items-center justify-center rounded-3xl bg-brand-primary/90 p-6 text-white backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 mb-2 ring-4 ring-white/30 animate-bounce">
                        <UploadCloud className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-base font-bold font-heading">
                        Suelta tus imágenes aquí
                    </p>
                    <p className="text-xs text-white/80">
                        Se cargarán inmediatamente a la galería de este post
                    </p>
                </div>
            )}

            {/* Encabezado de la Galería */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        Galería de Medios
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Selecciona imágenes de tu biblioteca o arrastra fotos desde tu ordenador para cargarlas al instante.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={onOpenLibrary}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-primary-hover transition focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    >
                        <Images className="h-3.5 w-3.5" />
                        Añadir desde Biblioteca
                    </button>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 font-mono text-xs font-semibold text-brand-primary dark:bg-[#12161f]">
                        {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
                    </span>
                </div>
            </div>

            {/* Indicador de subida asíncrona */}
            {isUploading && (
                <div className="flex items-center gap-2 rounded-2xl bg-blue-50/80 px-3.5 py-2.5 text-xs font-semibold text-brand-primary dark:bg-blue-950/30">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                    <span>Cargando imagen a la galería...</span>
                </div>
            )}

            {/* Grid de imágenes con Reordenamiento Drag & Drop */}
            {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((image, index) => {
                        const isDraggingCurrent = draggedIndex === index;
                        const isOverCurrent = dragOverIndex === index && draggedIndex !== index;
                        return (
                            <div
                                key={image.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#12161f] cursor-grab active:cursor-grabbing transition-all duration-200 select-none shadow-sm ${
                                    isDraggingCurrent
                                        ? 'opacity-30 scale-95 ring-2 ring-dashed ring-brand-primary'
                                        : isOverCurrent
                                        ? 'scale-105 shadow-xl ring-4 ring-brand-primary/40'
                                        : 'hover:shadow-md hover:ring-2 hover:ring-brand-primary/20'
                                }`}
                            >
                                <img
                                    src={image.url}
                                    alt={image.alt || image.caption || ''}
                                    title={image.title || image.caption || ''}
                                    className="h-32 w-full object-cover pointer-events-none transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Indicador de orden y agarre */}
                                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-black/75 px-1.5 py-0.5 text-[10px] font-mono text-white backdrop-blur">
                                    <GripVertical className="h-3 w-3 text-white/70" />
                                    <span>#{index + 1}</span>
                                </div>

                                {/* Botón para eliminar foto */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        destroy(image.id);
                                    }}
                                    className="absolute right-2 top-2 rounded-lg bg-black/80 p-1.5 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-red-600"
                                    title="Eliminar foto de galería"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                {(image.caption || image.title) && (
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-left backdrop-blur">
                                        <p className="truncate text-[10px] text-white">
                                            {image.caption || image.title}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-8 text-center dark:bg-[#12161f]">
                    <Images className="h-10 w-10 text-slate-400 mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        No hay imágenes en la galería
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-sm">
                        Añade fotos desde tu biblioteca de medios o arrastra imágenes directamente aquí para subirlas.
                    </p>
                    <button
                        type="button"
                        onClick={onOpenLibrary}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-primary-hover transition focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    >
                        <Images className="h-4 w-4" />
                        Añadir desde Biblioteca
                    </button>
                </div>
            )}
        </div>
    );
}

