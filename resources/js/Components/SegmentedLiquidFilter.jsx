import React from 'react';
import { motion } from 'framer-motion';
import { Archive, CheckCircle2, FileEdit, LayoutGrid } from 'lucide-react';

/**
 * Segmented Liquid Filter (Control Segmentado Líquido con Estilo WordPress)
 * Proporciona una pastilla con física de rebote elástica y viscosa
 * para alternar entre estados y filtros de contenido con contadores reactivos.
 */
export default function SegmentedLiquidFilter({
    value = '',
    onChange,
    counts = null,
    options = null,
    className = '',
}) {
    const resolvedOptions = options || [
        {
            key: '',
            label: 'Todos',
            icon: LayoutGrid,
            count: counts?.all,
        },
        {
            key: 'published',
            label: 'Publicados',
            icon: CheckCircle2,
            count: counts?.published,
        },
        {
            key: 'draft',
            label: 'Borradores',
            icon: FileEdit,
            count: counts?.draft,
        },
        {
            key: 'archived',
            label: 'Archivados',
            icon: Archive,
            count: counts?.archived,
        },
    ];

    return (
        <div
            className={`relative inline-flex items-center rounded-full bg-slate-100/90 p-1 border border-slate-200/70 shadow-inner-xs dark:bg-[#12161f] dark:border-slate-800/80 ${className}`}
            role="tablist"
        >
            {resolvedOptions.map((opt) => {
                const isActive = value === opt.key;
                const Icon = opt.icon;

                return (
                    <button
                        key={opt.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(opt.key)}
                        className={`relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 outline-none select-none ${
                            isActive
                                ? 'text-brand-primary font-bold dark:text-white'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        {/* ── Píldora Activa Líquida (Física Spring Orgánica con deformación elástica) ── */}
                        {isActive && (
                            <motion.div
                                layoutId="segmentedLiquidPill"
                                className="absolute inset-0 z-0 rounded-full bg-white shadow-xs dark:bg-[#1f2635] border border-slate-200/60 dark:border-slate-700/60"
                                transition={{
                                    type: 'spring',
                                    stiffness: 420,
                                    damping: 26,
                                    mass: 0.8,
                                }}
                            >
                                {/* Micro-acento líquido superior brillante */}
                                <div className="absolute inset-x-2 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent opacity-60 dark:via-white/20" />
                            </motion.div>
                        )}

                        {Icon && (
                            <span
                                className={`relative z-10 transition-colors duration-200 ${
                                    isActive
                                        ? 'text-brand-primary dark:text-brand-primary'
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </span>
                        )}

                        <span className="relative z-10">{opt.label}</span>

                        {/* Contador reactivo estilo WordPress: Todos (12), Publicados (8), etc. */}
                        {opt.count !== undefined && (
                            <span
                                className={`relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors duration-200 ${
                                    isActive
                                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-white/15 dark:text-white'
                                        : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                            >
                                {opt.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
