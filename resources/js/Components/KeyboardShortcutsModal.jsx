import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Sparkles, CornerDownLeft, ArrowUpDown, ArrowRight, BookOpen, Layers, Zap } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdKey = isMac ? '⌘' : 'Ctrl';

    const shortcutGroups = [
        {
            title: 'Navegación Esencial',
            shortcuts: [
                { keys: [cmdKey, 'K'], label: 'Abrir / Cerrar el Command Palette desde cualquier lugar' },
                { keys: ['↑', '↓'], label: 'Moverse entre resultados y sugerencias' },
                { keys: ['↵'], label: 'Ejecutar comando o abrir publicación seleccionada' },
                { keys: ['Tab'], label: 'Alternar entre filtro contextual y búsqueda global' },
                { keys: ['ESC'], label: 'Cerrar el buscador o este tutorial' },
            ],
        },
        {
            title: 'Prefijos Mágicos (Escribe en el buscador)',
            shortcuts: [
                {
                    keys: ['>'],
                    label: 'Modo Comandos / Acciones Rápidas',
                    example: '> nuevo artículo, > cambiar tema, > ir a dashboard',
                },
                {
                    keys: ['@'],
                    label: 'Filtrar por tipo de CPT',
                    example: '@articulos react, @proyectos fintech',
                },
                {
                    keys: ['?'],
                    label: 'Abrir este tutorial interactivo',
                    example: 'Escribe "?" directamente para ver la guía',
                },
            ],
        },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop con desenfoque suave */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-2xl dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                    Guía y Atajos del Command Palette
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Navega, crea y gestiona tu contenido a la velocidad de la luz.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="Cerrar (ESC)"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Contenido / Grupos de atajos */}
                    <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                        {shortcutGroups.map((group, idx) => (
                            <div key={idx} className="space-y-3">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    {group.title}
                                </h4>

                                <div className="space-y-2">
                                    {group.shortcuts.map((shortcut, sIdx) => (
                                        <div
                                            key={sIdx}
                                            className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-3 transition dark:border-slate-800/60 dark:bg-[#12161f] sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-slate-800 dark:text-white">
                                                    {shortcut.label}
                                                </p>
                                                {shortcut.example && (
                                                    <p className="font-mono text-[11px] text-brand-primary mt-0.5">
                                                        {shortcut.example}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {shortcut.keys.map((k, kIdx) => (
                                                    <kbd
                                                        key={kIdx}
                                                        className="inline-flex min-w-[26px] h-6 items-center justify-center rounded-lg border border-slate-200/80 bg-white px-2 font-mono text-[11px] font-bold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-[#1e2634] dark:text-slate-200"
                                                    >
                                                        {k}
                                                    </kbd>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Tip de uso interactivo */}
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-200">
                            <div className="flex items-center gap-2 font-bold mb-1">
                                <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Tip Híbrido:</span>
                            </div>
                            <p className="text-[11px] leading-relaxed opacity-90">
                                Cuando estés dentro del listado de cualquier CPT (como Artículos o Proyectos), el buscador se activará en <strong>modo contextual</strong>. Al pulsar la tecla <kbd className="rounded bg-black/10 dark:bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">Tab</kbd>, se convertirá al instante en <strong>búsqueda global universal</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            Presiona <kbd className="rounded-md border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700">ESC</kbd> para salir
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full bg-brand-primary px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-primary-hover"
                        >
                            Entendido
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

