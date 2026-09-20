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
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {label}
                </h3>
                {isMarkedForRemoval ? (
                    <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                        A eliminar
                    </span>
                ) : previewUrl ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        De Biblioteca
                    </span>
                ) : currentImage ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Guardada
                    </span>
                ) : null}
            </div>

            {/* Estado: Marcada para eliminación */}
            {isMarkedForRemoval ? (
                <div className="rounded-2xl bg-red-50/80 p-3.5 text-center dark:bg-red-950/30">
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
                    <div className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#12161f] shadow-xs">
                        <img
                            src={previewUrl}
                            alt={`Previsualización ${label}`}
                            className={`${heightClass} w-full object-cover transition duration-200`}
                        />
                        <button
                            type="button"
                            onClick={onMarkRemove}
                            className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-1.5 text-white backdrop-blur transition hover:bg-red-600"
                            title="Quitar selección"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-2 left-2 rounded-full bg-brand-primary px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                            Seleccionada de Biblioteca
                        </span>
                    </div>
                    {fileInfo && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                            {fileInfo.name} ({fileInfo.size})
                        </p>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onOpenLibrary}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-300 dark:hover:bg-[#1c222e]"
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
                    <div className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#12161f] shadow-xs">
                        <img
                            src={currentImage.url}
                            alt={currentImage.alt || currentImage.caption || label}
                            title={currentImage.title || currentImage.caption || label}
                            className={`${heightClass} w-full object-cover`}
                        />
                        <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/70 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                            Imagen actual
                        </span>
                        <button
                            type="button"
                            onClick={onMarkRemove}
                            className="absolute right-2 top-2 rounded-full bg-red-600/90 p-1.5 text-white shadow-xs backdrop-blur transition hover:bg-red-700"
                            title="Eliminar imagen y dejar vacío"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onOpenLibrary}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-300 dark:hover:bg-[#1c222e]"
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
                <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50/60 p-6 text-center dark:bg-[#12161f]/50 border border-slate-100 dark:border-slate-800">
                    <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2 opacity-60" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        {emptyText}
                    </p>
                    <button
                        type="button"
                        onClick={onOpenLibrary}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover transition focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    >
                        <Images className="h-3.5 w-3.5" />
                        Elegir de Biblioteca
                    </button>
                </div>
            )}
        </div>
    );
}

