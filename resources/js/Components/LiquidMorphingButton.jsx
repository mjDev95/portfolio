import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Loader2 } from 'lucide-react';

/**
 * LiquidMorphingButton
 * Botón de guardado con morphing líquido y estado de éxito.
 * Transiciona con física de resorte fluido entre Reposo -> Píldora de Carga -> Esfera Esmeralda con Onda Líquida.
 */
export default function LiquidMorphingButton({
    processing = false,
    isSuccess = false,
    label = 'Guardar Cambios',
    successLabel = '¡Guardado!',
    loadingLabel = 'Guardando...',
    icon: Icon = Save,
    disabled = false,
    type = 'submit',
    onClick = null,
    className = '',
}) {
    // Escuchar el final del procesamiento para activar la onda de éxito si isSuccess no viene por prop
    const [localSuccess, setLocalSuccess] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            setLocalSuccess(true);
            const timer = setTimeout(() => setLocalSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const activeState = localSuccess ? 'success' : processing ? 'loading' : 'idle';

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            {/* ── ONDA EXPANSIVA LÍQUIDA DE ÉXITO (SHOCKWAVE RIPPLE) ── */}
            <AnimatePresence>
                {activeState === 'success' && (
                    <>
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0.9, borderColor: '#10b981' }}
                            animate={{ scale: 1.8, opacity: 0, borderColor: 'rgba(16, 185, 129, 0)' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                            className="pointer-events-none absolute inset-0 rounded-full border-4"
                        />
                        <motion.span
                            initial={{ scale: 0.9, opacity: 0.7 }}
                            animate={{ scale: 1.45, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
                            className="pointer-events-none absolute inset-0 rounded-full bg-emerald-500/25 blur-sm"
                        />
                    </>
                )}
            </AnimatePresence>

            <motion.button
                layout
                type={type}
                onClick={onClick}
                disabled={disabled || processing}
                whileHover={activeState === 'idle' ? { scale: 1.02 } : {}}
                whileTap={activeState === 'idle' ? { scale: 0.97 } : {}}
                transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 26,
                    mass: 0.8,
                }}
                className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold text-white shadow-md transition-all select-none ${
                    activeState === 'success'
                        ? 'bg-emerald-500 px-5 py-2.5 shadow-[0_6px_25px_rgba(16,185,129,0.45)]'
                        : activeState === 'loading'
                        ? 'bg-brand-primary px-5 py-2.5 shadow-[0_4px_16px_rgba(var(--brand-primary-rgb,59,130,246),0.4)]'
                        : 'bg-brand-primary hover:bg-brand-primary-hover px-6 py-2.5 shadow-[0_4px_16px_rgba(var(--brand-primary-rgb,59,130,246),0.3)]'
                } ${disabled && activeState === 'idle' ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            >
                {/* Reflejo de brillo líquido en reposo */}
                {activeState === 'idle' && (
                    <span className="pointer-events-none absolute inset-x-4 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                )}

                <AnimatePresence mode="wait">
                    {activeState === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.7, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.7, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span className="text-xs font-bold tracking-wide">{loadingLabel}</span>
                        </motion.div>
                    )}

                    {activeState === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.6, y: 5 }}
                            animate={{ opacity: 1, scale: [0.6, 1.25, 1], y: 0 }}
                            exit={{ opacity: 0, scale: 0.6, y: -5 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                            className="flex items-center gap-1.5"
                        >
                            <Check className="h-4 w-4 stroke-[3] text-white" />
                            <span className="text-xs font-bold tracking-wide">{successLabel}</span>
                        </motion.div>
                    )}

                    {activeState === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            {Icon && <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />}
                            <span className="text-xs font-bold tracking-wide">{label}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}

