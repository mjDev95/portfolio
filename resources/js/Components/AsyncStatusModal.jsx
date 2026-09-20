import Modal from '@/Components/Modal';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function AsyncStatusModal({
    isOpen = false,
    status = 'saving', // 'saving' | 'success' | 'error'
    title = '',
    message = '',
    onClose = () => {},
    autoCloseDelay = 2200,
}) {
    useEffect(() => {
        if (isOpen && status === 'success' && autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, status, autoCloseDelay, onClose]);

    if (!isOpen) return null;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md" closeable={status !== 'saving'}>
            <div className="p-6 text-center">
                {status === 'saving' && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-3">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-brand-primary animate-pulse" />
                            <span className="h-2.5 w-2.5 rounded-full bg-brand-primary animate-pulse [animation-delay:200ms]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-brand-primary animate-pulse [animation-delay:400ms]" />
                        </div>
                        <div>
                            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                {title || 'Guardando cambios...'}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {message || 'Actualizando información en segundo plano de forma asíncrona.'}
                            </p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center space-y-3 py-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="h-7 w-7 stroke-[2.2]" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                            {title || '¡Actualizado con éxito!'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {message || 'Los cambios se han persistido correctamente sin recargar la pantalla.'}
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center space-y-3 py-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                            <AlertCircle className="h-7 w-7 stroke-[2.2]" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                            {title || 'Error al guardar'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {message || 'Ocurrió un error al procesar la actualización. Revisa los campos requeridos.'}
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 inline-flex rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-300 dark:hover:bg-[#1c222e]"
                        >
                            Entendido
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}

