import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Sparkles, CheckCircle2, ArrowDown } from 'lucide-react';

/**
 * LiquidDropzone (Zona de Carga con Tensión Superficial y Absorción Líquida)
 * Al arrastrar un archivo, la superficie y el icono central se deprimen suavemente
 * simulando tensión superficial líquida. Al soltar, genera una onda concéntrica
 * que "absorbe" el archivo con retroalimentación visual líquida.
 */
export default function LiquidDropzone({
    onFilesDrop = () => {},
    accept = 'image/jpeg,image/png,image/webp,image/jpg,image/heif,image/heic,.heif,.heic',
    multiple = true,
    compact = false,
    className = '',
}) {
    const [isOver, setIsOver] = useState(false);
    const [isAbsorbing, setIsAbsorbing] = useState(false);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const dragCounter = useRef(0);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            setIsOver(false);
            dragCounter.current = 0;
            setMouseOffset({ x: 0, y: 0 });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Calcular desplazamiento relativo al centro para la tensión superficial
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const relX = (e.clientX - rect.left - centerX) * 0.12;
        const relY = (e.clientY - rect.top - centerY) * 0.12;
        setMouseOffset({ x: relX, y: relY });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
        dragCounter.current = 0;
        setMouseOffset({ x: 0, y: 0 });

        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) {
            triggerAbsorbEffect(files);
        }
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            triggerAbsorbEffect(files);
        }
        e.target.value = '';
    };

    const triggerAbsorbEffect = (files) => {
        setIsAbsorbing(true);
        setTimeout(() => {
            setIsAbsorbing(false);
            onFilesDrop(files);
        }, 450);
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative cursor-pointer overflow-hidden rounded-[26px] transition-all select-none ${
                compact ? 'p-5 sm:p-6' : 'p-8 sm:p-10'
            } ${
                isOver
                    ? 'border-2 border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 shadow-[0_0_30px_rgba(var(--brand-primary-rgb,59,130,246),0.2)]'
                    : 'border-2 border-dashed border-slate-200 hover:border-brand-primary/60 bg-slate-50/70 hover:bg-slate-100/60 dark:border-slate-800 dark:hover:border-brand-primary/50 dark:bg-[#12161f]/70 dark:hover:bg-[#161b24]'
            } ${className}`}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* ── ONDAS CONCÉNTRICAS DE ABSORCIÓN LÍQUIDA (DROP RIPPLE) ── */}
            <AnimatePresence>
                {isAbsorbing && (
                    <>
                        <motion.div
                            initial={{ scale: 0.15, opacity: 0.9, borderColor: 'var(--brand-primary, #3b82f6)' }}
                            animate={{ scale: 3.2, opacity: 0, borderColor: 'rgba(59, 130, 246, 0)' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
                            style={{ width: '120px', height: '120px' }}
                        />
                        <motion.div
                            initial={{ scale: 0.1, opacity: 0.7 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/20 blur-md"
                            style={{ width: '100px', height: '100px' }}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* ── NÚCLEO LÍQUIDO CON TENSIÓN SUPERFICIAL ── */}
            <div className="relative flex flex-col items-center justify-center text-center">
                <motion.div
                    animate={
                        isOver
                            ? {
                                  x: mouseOffset.x,
                                  y: mouseOffset.y + 6,
                                  scaleX: 1.18,
                                  scaleY: 0.82,
                                  rotate: mouseOffset.x * 0.4,
                              }
                            : isAbsorbing
                            ? {
                                  scale: [1, 0.65, 1.25, 1],
                                  rotate: [0, -10, 10, 0],
                              }
                            : {
                                  x: 0,
                                  y: [0, -4, 0],
                                  scaleX: 1,
                                  scaleY: 1,
                                  rotate: 0,
                              }
                    }
                    transition={
                        isOver
                            ? { type: 'spring', stiffness: 450, damping: 22 }
                            : isAbsorbing
                            ? { duration: 0.55, ease: 'easeInOut' }
                            : { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
                    }
                    className="relative flex items-center justify-center mb-3"
                >
                    {/* Gota de fondo con deformación */}
                    <div
                        className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm ${
                            isOver
                                ? 'bg-brand-primary text-white shadow-[0_10px_25px_rgba(var(--brand-primary-rgb,59,130,246),0.4)]'
                                : isAbsorbing
                                ? 'bg-emerald-500 text-white shadow-[0_10px_25px_rgba(16,185,129,0.4)]'
                                : 'bg-white text-brand-primary group-hover:bg-brand-primary group-hover:text-white dark:bg-[#1a202c] dark:group-hover:bg-brand-primary'
                        }`}
                    >
                        {isAbsorbing ? (
                            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 animate-bounce" />
                        ) : isOver ? (
                            <ArrowDown className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse" />
                        ) : (
                            <UploadCloud className="h-8 w-8 sm:h-10 sm:w-10 transition-transform duration-300 group-hover:scale-110" />
                        )}
                    </div>

                    {/* Resplandor de tensión en drag */}
                    {isOver && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.3, opacity: 0.4 }}
                            className="pointer-events-none absolute inset-0 rounded-full bg-brand-primary blur-xl"
                        />
                    )}
                </motion.div>

                {/* Textos descriptivos */}
                <h4 className="font-heading text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>
                        {isAbsorbing
                            ? '¡Absorbiendo imagen!'
                            : isOver
                            ? 'Suelta para absorber el archivo'
                            : 'Arrastra y suelta imágenes aquí'}
                    </span>
                    {!isOver && !isAbsorbing && (
                        <Sparkles className="h-3.5 w-3.5 text-brand-primary opacity-80" />
                    )}
                </h4>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    {isOver ? (
                        <span className="text-brand-primary font-semibold">
                            Tensión superficial activa &middot; Conversión automática a WebP
                        </span>
                    ) : (
                        <span>
                            o haz clic para explorar tus archivos (JPG, PNG, WebP, HEIF/HEIC)
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}

