import { Images, Trash2, RotateCcw, Image as ImageIcon } from 'lucide-react';

export default function ContentImageField({
    label,
    currentImage = null,
    previewUrl = null,
    fileInfo = null,
    isMarkedForRemoval = false,
    heightClass = 'h-40',
    emptyText = 'Sin imagen asignada',
    onOpenLibrary = () => {},
    onMarkRemove = () => {},
    onUndoRemove = () => {},
}) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-base font-bold text-[#293951] dark:text-[#ffffff]">
                    {label}
                </h3>
                {isMarkedForRemoval ? (
                    <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                        A eliminar
                    </span>
                ) : previewUrl ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        De Biblioteca
                    </span>
                ) : currentImage ? (
                    <span className="rounded-md bg-[#ebf1f7] px-2 py-0.5 text-[10px] font-medium text-[#95aac9] dark:bg-[#16191c] dark:text-[#a7a6a8]">
                        Guardada
                    </span>
                ) : null}
            </div>

            {/* Estado: Marcada para eliminación */}
            {isMarkedForRemoval ? (
                <div className="rounded-xl bg-red-50/80 p-3.5 text-center dark:bg-red-950/30">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Marcada para eliminar al guardar
                    </p>
                    <button
                        type="button"
                        onClick={onUndoRemove}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Deshacer y conservar imagen
                    </button>
                </div>
            ) : previewUrl ? (
                <div className="space-y-3">
                    <div className="group relative overflow-hidden rounded-xl bg-[#f5f7fa] dark:bg-[#121517] shadow-sm">
                        <img
                            src={previewUrl}
                            alt={`Previsualización ${label}`}
                            className={`${heightClass} w-full object-cover transition duration-200`}
                        />
                        <button
                            type="button"
                            onClick={onMarkRemove}
                            className="absolute right-2 top-2 rounded-lg bg-[#16191c]/80 p-1.5 text-white backdrop-blur transition hover:bg-red-600"
                            title="Quitar selección"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-2 left-2 rounded-md bg-brand-primary px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                            Seleccionada de Biblioteca
                        </span>
                    </div>
                    {fileInfo && (
                        <p className="text-[11px] text-[#95aac9] dark:text-[#a7a6a8] truncate">
                            {fileInfo.name} ({fileInfo.size})
                        </p>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onOpenLibrary}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#ebf1f7] px-3 py-1.5 text-xs font-semibold text-[#293951] hover:bg-[#dfe7ef] transition dark:bg-[#16191c] dark:text-[#ffffff] dark:hover:bg-[#20252b]"
                        >
                            <Images className="h-3.5 w-3.5 text-brand-primary" />
                            Cambiar de Biblioteca
                        </button>
                        <button
                            type="button"
                            onClick={onMarkRemove}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400 hover:underline"
                        >
                            <Trash2 className="h-3 w-3" />
                            Quitar imagen
                        </button>
                    </div>
                </div>
            ) : currentImage ? (
                <div className="space-y-3">
                    <div className="group relative overflow-hidden rounded-xl bg-[#f5f7fa] dark:bg-[#121517] shadow-sm">
                        <img
                            src={currentImage.url}
                            alt={currentImage.alt || currentImage.caption || label}
                            title={currentImage.title || currentImage.caption || label}
                            className={`${heightClass} w-full object-cover`}
                        />
                        <span className="absolute bottom-2 left-2 rounded-md bg-[#16191c]/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                            Imagen actual
                        </span>
                        <button
                            type="button"
                            onClick={onMarkRemove}
                            className="absolute right-2 top-2 rounded-lg bg-red-600/90 p-1.5 text-white shadow-sm backdrop-blur transition hover:bg-red-700"
                            title="Eliminar imagen y dejar vacío"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onOpenLibrary}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#ebf1f7] px-3 py-1.5 text-xs font-semibold text-[#293951] hover:bg-[#dfe7ef] transition dark:bg-[#16191c] dark:text-[#ffffff] dark:hover:bg-[#20252b]"
                        >
                            <Images className="h-3.5 w-3.5 text-brand-primary" />
                            Cambiar de Biblioteca
                        </button>
                        <button
                            type="button"
                            onClick={onMarkRemove}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400 hover:underline"
                        >
                            <Trash2 className="h-3 w-3" />
                            Quitar imagen
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl bg-[#ebf1f7]/50 p-6 text-center dark:bg-[#16191c]/50">
                    <ImageIcon className="h-8 w-8 text-[#95aac9] dark:text-[#a7a6a8] mb-2 opacity-60" />
                    <p className="text-xs text-[#95aac9] dark:text-[#a7a6a8] mb-3">
                        {emptyText}
                    </p>
                    <button
                        type="button"
                        onClick={onOpenLibrary}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-primary-hover transition focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    >
                        <Images className="h-3.5 w-3.5" />
                        Elegir de Biblioteca
                    </button>
                </div>
            )}
        </div>
    );
}

