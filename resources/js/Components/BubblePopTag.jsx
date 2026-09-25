import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

/**
 * BubblePopTag (Etiqueta Líquida Elástica Bubble Pop)
 * Nace como una burbuja con física spring elástica (scale pop), tiene
 * micro-deformación gelatinosa en hover/tap, y al eliminarse o deseleccionarse
 * estalla visualmente con feedback fluido.
 */
export default function BubblePopTag({
    label = '',
    selected = false,
    onToggle = null,
    onRemove = null,
    prefix = '#',
    badge = null,
    className = '',
}) {
    const [isBursting, setIsBursting] = useState(false);

    const handleClick = (e) => {
        if (onToggle) {
            onToggle(e);
        }
    };

    const handleRemoveClick = (e) => {
        e.stopPropagation();
        setIsBursting(true);
        setTimeout(() => {
            if (onRemove) onRemove();
        }, 180);
    };

    return (
        <motion.div
            layout
            initial={{ scale: 0, opacity: 0, y: 8 }}
            animate={
                isBursting
                    ? { scale: [1, 1.35, 0], opacity: [1, 0.8, 0], filter: 'blur(3px)' }
                    : { scale: 1, opacity: 1, y: 0 }
            }
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.18 } }}
            whileHover={{ scale: 1.08, rotate: [-1, 1, 0] }}
            whileTap={{ scale: 0.92 }}
            transition={{
                type: 'spring',
                stiffness: 520,
                damping: 18,
                mass: 0.75,
            }}
            onClick={handleClick}
            className={`group relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold select-none cursor-pointer transition-shadow shadow-xs ${
                selected
                    ? 'bg-brand-primary text-white shadow-[0_4px_14px_rgba(var(--brand-primary-rgb,59,130,246),0.4)]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 dark:bg-[#1a202c] dark:text-slate-200 dark:hover:bg-[#232c3d]'
            } ${className}`}
        >
            {/* Brillo superior tipo burbuja de cristal */}
            <span className="pointer-events-none absolute inset-x-2 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            {/* Micro-onda al activarse */}
            {selected && (
                <motion.span
                    initial={{ scale: 0.7, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-primary"
                />
            )}

            {/* Prefijo (# o icono) */}
            {prefix && (
                <span className={`text-[10px] font-bold ${selected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                    {prefix}
                </span>
            )}

            <span className="relative z-10">{label}</span>

            {/* Badge de cantidad (ej. contador de posts) */}
            {badge !== null && badge !== undefined && (
                <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                        selected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                    {badge}
                </span>
            )}

            {/* Botón de borrado opcional con burst */}
            {onRemove && (
                <button
                    type="button"
                    onClick={handleRemoveClick}
                    className={`-mr-1 ml-1 flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                        selected
                            ? 'text-white/70 hover:bg-white/20 hover:text-white'
                            : 'text-slate-400 hover:bg-slate-300 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white'
                    }`}
                    title="Eliminar"
                >
                    <X className="h-2.5 w-2.5" />
                </button>
            )}
        </motion.div>
    );
}

