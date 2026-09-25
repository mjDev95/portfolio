import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Check, AlertTriangle, X, ExternalLink } from 'lucide-react';

/**
 * Apple Dynamic Island-style Gooey Notification Toast.
 * Utiliza deformación orgánica (Squash & Stretch) con física Spring de alta fidelidad
 * y soporte para acciones directas (como "Ver publicación").
 */
export default function GlobalBanner({ feedback, onClose }) {
    const isSuccess = feedback?.type === 'success';

    // Auto-cierre de notificación de éxito tras 4 segundos
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, onClose, feedback]);

    return (
        <>
            {/* Filtro SVG Gooey dedicado para la física de fluidos tipo Dynamic Island */}
            <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                    <filter id="dynamic-island-goo" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
                            result="goo"
                        />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            <AnimatePresence>
                {feedback && (
                    <div className="fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[92vw] sm:max-w-lg">
                        {/* Contenedor Animado con Física Apple Dynamic Island (Squash & Stretch Drop) */}
                        <motion.div
                            initial={{ opacity: 0, y: -42, scaleX: 0.55, scaleY: 1.45 }}
                            animate={{ opacity: 1, y: 0, scaleX: 1, scaleY: 1 }}
                            exit={{ opacity: 0, y: -32, scaleX: 0.65, scaleY: 1.3 }}
                            transition={{
                                type: 'spring',
                                damping: 22,
                                stiffness: 420,
                                mass: 0.75,
                            }}
                            className="relative flex items-center gap-3.5 rounded-full bg-[#0d1117]/95 dark:bg-black/95 px-4.5 py-2.5 sm:px-5 sm:py-3 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl border border-white/15 dark:border-white/20 ring-1 ring-black/40"
                        >
                            {/* Gota Líquida de Estado (Ícono con Halo Glow dinámico) */}
                            <motion.div
                                initial={{ scale: 0.4, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 20,
                                    delay: 0.05,
                                }}
                                className={`relative flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full ${
                                    isSuccess
                                        ? 'bg-emerald-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.55)]'
                                        : 'bg-rose-500 text-white shadow-[0_0_18px_rgba(244,63,94,0.55)]'
                                }`}
                            >
                                {isSuccess ? (
                                    <Check className="h-4 w-4 stroke-[2.8]" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 stroke-[2.8]" />
                                )}
                            </motion.div>

                            {/* Contenido Textual */}
                            <div className="flex flex-col min-w-0 pr-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-heading text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                                        {feedback.title}
                                    </span>
                                    <span
                                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                                            isSuccess ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                                        }`}
                                    />
                                </div>
                                {feedback.message && (
                                    <p className="text-[11px] sm:text-xs text-slate-300 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs font-normal">
                                        {feedback.message}
                                    </p>
                                )}
                            </div>

                            {/* Botón de Acción Directa: "Ver publicación" (si está disponible) */}
                            {feedback.public_url && (
                                <motion.a
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    href={feedback.public_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-white/25 hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
                                    title="Abrir publicación en pestaña nueva"
                                >
                                    <span>Ver publicación</span>
                                    <ExternalLink className="h-3 w-3" />
                                </motion.a>
                            )}

                            {/* Botón de Cierre Sutil */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white shrink-0 ml-0.5"
                                title="Cerrar notificación"
                                aria-label="Cerrar notificación"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
