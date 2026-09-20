import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function GlobalBanner({ feedback, onClose }) {
    const isSuccess = feedback?.type === 'success';

    // Auto-cierre de notificación de éxito tras 3.5 segundos
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, onClose]);

    return (
        <AnimatePresence>
            {feedback && (
                <motion.div
                    initial={{ opacity: 0, y: -24, scale: 0.92, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                    exit={{ opacity: 0, y: -16, scale: 0.94, x: '-50%' }}
                    transition={{ type: 'spring', damping: 24, stiffness: 380 }}
                    style={{ left: '50%' }}
                    className="fixed top-6 z-50 flex items-center gap-3.5 rounded-full bg-white/95 px-5 py-3 shadow-2xl backdrop-blur-xl border border-[#e3ebf6] dark:bg-[#1e2126]/95 dark:border-[#282d35] dark:shadow-black/60 pointer-events-auto max-w-lg"
                >
                    {/* Ícono de estado en píldora circular */}
                    <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isSuccess
                                ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                        }`}
                    >
                        {isSuccess ? (
                            <CheckCircle2 className="h-4.5 w-4.5" />
                        ) : (
                            <AlertCircle className="h-4.5 w-4.5" />
                        )}
                    </div>

                    {/* Texto informativo */}
                    <div className="flex flex-col min-w-0 pr-1">
                        <div className="flex items-center gap-2">
                            <span className="font-heading text-xs font-bold tracking-tight text-[#293951] dark:text-[#ffffff] truncate">
                                {feedback.title}
                            </span>
                            <span
                                className={`inline-block h-1.5 w-1.5 rounded-full ${
                                    isSuccess ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                                }`}
                            />
                        </div>
                        {feedback.message && (
                            <p className="text-[11px] text-[#95aac9] dark:text-[#a7a6a8] truncate max-w-xs">
                                {feedback.message}
                            </p>
                        )}
                    </div>

                    {/* Botón discreto de cierre */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 text-[#95aac9] transition-colors hover:bg-[#ebf1f7] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:bg-[#282d35] dark:hover:text-[#ffffff]"
                        title="Cerrar notificación"
                        aria-label="Cerrar notificación"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
