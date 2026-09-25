import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Search,
    X,
    Plus,
    FileText,
    LayoutDashboard,
    MessageSquare,
    Settings,
    Users,
    Mail,
    HelpCircle,
    Boxes,
    Briefcase,
    Folder,
    BookOpen,
    Sparkles,
    Tag,
    Globe,
    Award,
    Code,
    Camera,
    Layers,
    Loader2,
} from 'lucide-react';
import KeyboardShortcutsModal from '@/Components/KeyboardShortcutsModal';

const CPT_ICON_MAP = {
    FileText,
    Boxes,
    Briefcase,
    Folder,
    BookOpen,
    Sparkles,
    Tag,
    Globe,
    Award,
    Code,
    Camera,
    Layers,
    LayoutDashboard,
    MessageSquare,
    Settings,
    Users,
    Plus,
    Mail,
};

function renderItemIcon(iconName, className = 'h-4 w-4') {
    const Icon = CPT_ICON_MAP[iconName] || FileText;
    return <Icon className={className} />;
}

export default function CommandPalette({
    isOpen,
    onClose,
    contextCpt = null, // e.g. { slug: 'articulos', name: 'Artículos' }
}) {
    const [query, setQuery] = useState('');
    const [activeContext, setActiveContext] = useState(contextCpt);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({ items: [], commands: [] });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    const inputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Sincronizar contexto al abrir
    useEffect(() => {
        if (isOpen) {
            setActiveContext(contextCpt);
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 60);
        }
    }, [isOpen, contextCpt]);

    // Búsqueda asíncrona con debounce
    useEffect(() => {
        if (!isOpen) return;

        // Si escribe '?', abrir el tutorial
        if (query === '?') {
            setIsTutorialOpen(true);
            setQuery('');
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setLoading(true);

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const params = new URLSearchParams();
                if (query) params.append('q', query);
                if (activeContext?.slug) params.append('type', activeContext.slug);

                const res = await fetch(route('admin.api.search') + '?' + params.toString(), {
                    headers: { Accept: 'application/json' },
                });

                if (res.ok) {
                    const data = await res.json();
                    setResults({
                        items: data.items || [],
                        commands: data.commands || [],
                    });
                    setSelectedIndex(0);
                }
            } catch (err) {
                console.error('Error en búsqueda CommandPalette:', err);
            } finally {
                setLoading(false);
            }
        }, 180);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [query, activeContext, isOpen]);

    // Lista unificada para navegación con teclado
    const allItems = [...results.commands, ...results.items];

    // Manejador de teclado
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1 < allItems.length ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : allItems.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (allItems[selectedIndex]) {
                handleSelectItem(allItems[selectedIndex]);
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Alternar modo contextual vs global
            setActiveContext((prev) => (prev ? null : contextCpt));
        } else if (e.key === 'Backspace' && query === '' && activeContext) {
            // Borrar contexto y pasar a búsqueda global
            setActiveContext(null);
        }
    };

    const handleSelectItem = (item) => {
        onClose();
        if (item.url) {
            router.visit(item.url);
        }
    };

    return (
        <>
            {/* Filtro SVG Gooey para la apertura líquida del buscador */}
            <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                    <filter id="command-palette-goo" x="-20%" y="-20%" width="140%" height="140%">
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
                {isOpen && (
                    <>
                        {/* Overlay translúcido suave para cerrar al hacer clic afuera sin bloquear la vista */}
                        <div
                            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-xs"
                            onClick={onClose}
                        />

                        {/* Píldora Flotante Centrada con Física Líquida Gooey (Squash & Stretch Drop) */}
                        <motion.div
                            initial={{ opacity: 0, y: -44, scaleX: 0.55, scaleY: 1.45, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, scaleX: 1, scaleY: 1, x: '-50%' }}
                            exit={{ opacity: 0, y: -32, scaleX: 0.65, scaleY: 1.3, x: '-50%' }}
                            transition={{
                                type: 'spring',
                                damping: 22,
                                stiffness: 420,
                                mass: 0.75,
                            }}
                            style={{ left: '50%' }}
                            className="fixed top-5 sm:top-6 z-50 w-[94vw] max-w-xl pointer-events-auto"
                        >
                            {/* Píldora Input principal */}
                            <div className="flex items-center gap-3 rounded-full bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl border border-slate-200/80 dark:bg-[#161b24]/95 dark:border-slate-800/80 dark:shadow-black/60">
                                {/* Ícono lupa con pop elástico */}
                                <motion.div
                                    initial={{ scale: 0.4, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.05 }}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20"
                                >
                                    <Search className="h-4 w-4" />
                                </motion.div>

                                {/* Contexto activo si existe */}
                                {activeContext && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-primary/20 shrink-0">
                                        <span>{activeContext.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => setActiveContext(null)}
                                            className="hover:text-red-500 transition-colors"
                                            title="Quitar filtro contextual"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}

                                {/* Input de búsqueda limpio */}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={
                                        activeContext
                                            ? `Buscar en ${activeContext.name}...`
                                            : 'Buscar en el panel de administración...'
                                    }
                                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder-slate-500"
                                />

                                {loading && (
                                    <Loader2 className="h-4 w-4 animate-spin text-brand-primary shrink-0" />
                                )}

                                {query && !loading && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="rounded-full p-1 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                                        title="Limpiar texto"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}

                                {/* Botón discreto de Tutorial de atajos */}
                                <button
                                    type="button"
                                    onClick={() => setIsTutorialOpen(true)}
                                    title="Guía de uso y atajos"
                                    aria-label="Guía de uso y atajos"
                                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-primary dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-primary transition-colors shrink-0"
                                >
                                    <HelpCircle className="h-4 w-4" />
                                </button>

                                {/* Botón de Cerrar */}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    title="Cerrar buscador"
                                    aria-label="Cerrar buscador"
                                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Desplegable Flotante de Resultados con Elastic Spring Drop */}
                            <AnimatePresence>
                                {(results.commands.length > 0 || results.items.length > 0 || (query && !loading)) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scaleY: 0.75, scaleX: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scaleY: 1, scaleX: 1 }}
                                        exit={{ opacity: 0, y: -8, scaleY: 0.8, scaleX: 0.96 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 420,
                                            damping: 26,
                                            mass: 0.8,
                                        }}
                                        className="mt-2 w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-[#161b24]/95 dark:shadow-black/60 p-2 max-h-[60vh] overflow-y-auto space-y-3"
                                    >
                                        {/* Comandos y Acciones Rápidas */}
                                        {results.commands.length > 0 && (
                                            <div>
                                                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Acciones y Accesos Rápidos
                                                </p>
                                                <div className="space-y-0.5">
                                                    {results.commands.map((cmd) => {
                                                        const itemIndex = allItems.findIndex((x) => x.id === cmd.id);
                                                        const isSelected = itemIndex === selectedIndex;
                                                        return (
                                                            <button
                                                                key={cmd.id}
                                                                type="button"
                                                                onClick={() => handleSelectItem(cmd)}
                                                                onMouseEnter={() => setSelectedIndex(itemIndex)}
                                                                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left text-xs transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-brand-primary text-white shadow-sm font-semibold'
                                                                        : 'text-slate-700 hover:bg-slate-50 dark:text-white dark:hover:bg-[#1c222e]'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div
                                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                                                                            isSelected
                                                                                ? 'bg-white/20 text-white'
                                                                                : 'bg-slate-100 text-brand-primary dark:bg-slate-800 dark:text-brand-primary'
                                                                        }`}
                                                                    >
                                                                        {renderItemIcon(cmd.icon, 'h-3.5 w-3.5')}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="truncate font-medium">
                                                                            {cmd.title}
                                                                        </div>
                                                                        <div
                                                                            className={`text-[11px] truncate ${
                                                                                isSelected
                                                                                    ? 'text-white/80'
                                                                                    : 'text-slate-400 dark:text-slate-500'
                                                                            }`}
                                                                        >
                                                                            {cmd.subtitle}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-bold shrink-0 ${
                                                                        isSelected
                                                                            ? 'bg-white/20 text-white'
                                                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400'
                                                                    }`}
                                                                >
                                                                    {cmd.badge}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Publicaciones y Contenidos Encontrados */}
                                        {results.items.length > 0 && (
                                            <div>
                                                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Publicaciones ({results.items.length})
                                                </p>
                                                <div className="space-y-0.5">
                                                    {results.items.map((item) => {
                                                        const itemIndex = allItems.findIndex((x) => x.id === item.id);
                                                        const isSelected = itemIndex === selectedIndex;
                                                        return (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => handleSelectItem(item)}
                                                                onMouseEnter={() => setSelectedIndex(itemIndex)}
                                                                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left text-xs transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-brand-primary text-white shadow-sm font-semibold'
                                                                        : 'text-slate-700 hover:bg-slate-50 dark:text-white dark:hover:bg-[#1c222e]'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div
                                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                                                                            isSelected
                                                                                ? 'bg-white/20 text-white'
                                                                                : 'bg-slate-100 text-brand-primary dark:bg-slate-800 dark:text-brand-primary'
                                                                        }`}
                                                                    >
                                                                        {renderItemIcon(item.cpt_icon || item.icon || 'FileText', 'h-3.5 w-3.5')}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="truncate font-medium">
                                                                            {item.title}
                                                                        </div>
                                                                        <div
                                                                            className={`text-[11px] truncate ${
                                                                                isSelected
                                                                                    ? 'text-white/80'
                                                                                    : 'text-slate-400 dark:text-slate-500'
                                                                            }`}
                                                                        >
                                                                            {item.subtitle}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {item.status && (
                                                                        <span
                                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                                                isSelected
                                                                                    ? 'bg-white/20 text-white'
                                                                                    : item.status === 'published'
                                                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                                            }`}
                                                                        >
                                                                            {item.status === 'published' ? 'Publicado' : 'Borrador'}
                                                                        </span>
                                                                    )}
                                                                    <span
                                                                        className={`text-[11px] ${
                                                                            isSelected
                                                                                ? 'text-white/70'
                                                                                : 'text-slate-400 dark:text-slate-500'
                                                                        }`}
                                                                    >
                                                                        {item.cpt_name || item.badge}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sin coincidencias */}
                                        {!loading && query && allItems.length === 0 && (
                                            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                                                <p className="font-semibold text-sm text-slate-800 dark:text-white mb-1">
                                                    Sin coincidencias para &quot;{query}&quot;
                                                </p>
                                                <p>
                                                    Prueba con otro término de búsqueda.
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Modal de Guía de Atajos y Navegación */}
            <KeyboardShortcutsModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
            />
        </>
    );
}
