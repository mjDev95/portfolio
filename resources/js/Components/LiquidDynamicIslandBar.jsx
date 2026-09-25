import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, X, Loader2, Layers } from 'lucide-react';

/**
 * LiquidDynamicIslandBar
 * Barra de acciones flotante estilo Apple Dynamic Island que se adapta al modo
 * claro y oscuro respetando el sistema de diseño del panel. Centrada sobre el eje X,
 * con física fluida sin trabas de renderizado y con separación para móviles
 * para evitar colisiones con el botón de acceso rápido de la esquina inferior.
 */
export default function LiquidDynamicIslandBar({
    selectedCount = 0,
    totalCount = 0,
    isAllSelected = false,
    onSelectAll = () => {},
    onClearSelection = () => {},
    onDelete = () => {},
    onDownload = () => {},
    isDeleting = false,
    isDownloading = false,
    className = '',
}) {
    if (selectedCount <= 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.94 }}
            transition={{
                type: 'spring',
                stiffness: 440,
                damping: 28,
                mass: 0.8,
            }}
            style={{ willChange: 'transform, opacity' }}
            className="fixed bottom-24 sm:bottom-6 inset-x-0 z-[90] flex justify-center px-3 sm:px-4 pointer-events-none select-none"
        >
            <div
                className={`pointer-events-auto flex max-w-[calc(100vw-1.5rem)] items-center gap-1.5 sm:gap-3 rounded-full border border-slate-200/90 bg-white/95 px-2.5 py-1.5 sm:px-4 sm:py-2 text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-colors duration-200 dark:border-slate-800/90 dark:bg-[#161b24]/95 dark:text-white dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] ${className}`}
            >
                {/* ── 1. GOTA / BADGE NUMÉRICO CON RESORTE ELÁSTICO ── */}
                <div className="flex items-center gap-2 pl-0.5 sm:pl-1 pr-1 sm:pr-2">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={selectedCount}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: [1.2, 0.96, 1], opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                            className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-brand-primary text-[11px] sm:text-xs font-bold text-white shadow-xs"
                        >
                            {selectedCount}
                        </motion.div>
                    </AnimatePresence>

                    {/* Texto descriptivo: adaptable en mobile vs desktop */}
                    <span className="text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        <span className="hidden sm:inline">
                            {selectedCount === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                        </span>
                        <span className="inline sm:hidden text-[11px]">
                            {selectedCount === 1 ? 'sel.' : 'sel.'}
                        </span>
                    </span>
                </div>

                <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 shrink-0" />

                {/* ── 2. BOTÓN DE DESCARGA EN WEBP (ADAPTABLE) ── */}
                <motion.button
                    type="button"
                    onClick={onDownload}
                    disabled={isDownloading}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    className="relative group flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition whitespace-nowrap dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    title="Descargar selección en formato .webp"
                >
                    {isDownloading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Download className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">
                        {isDownloading
                            ? 'Generando...'
                            : selectedCount > 1
                            ? 'Descargar ZIP (.webp)'
                            : 'Descargar .webp'}
                    </span>
                    <span className="inline sm:hidden text-[11px]">
                        {isDownloading ? '...' : '.webp'}
                    </span>
                </motion.button>

                {/* ── 3. BOTÓN SELECCIONAR / DESELECCIONAR TODO ── */}
                <motion.button
                    type="button"
                    onClick={onSelectAll}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden md:flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition whitespace-nowrap"
                >
                    <Layers className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    <span>{isAllSelected ? 'Deseleccionar' : 'Seleccionar todo'}</span>
                </motion.button>

                {/* ── 4. BOTÓN CANCELAR ── */}
                <motion.button
                    type="button"
                    onClick={onClearSelection}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition whitespace-nowrap"
                    title="Cancelar selección"
                >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Cancelar</span>
                </motion.button>

                <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 shrink-0" />

                {/* ── 5. BOTÓN ELIMINAR ── */}
                <motion.button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                    title="Eliminar seleccionadas"
                >
                    {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">Eliminar</span>
                </motion.button>
            </div>
        </motion.div>
    );
}
