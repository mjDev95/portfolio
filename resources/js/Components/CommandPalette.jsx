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
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay translúcido suave para cerrar al hacer clic afuera sin bloquear la vista */}
                        <div
                            className="fixed inset-0 z-40 bg-black/15 dark:bg-black/40 backdrop-blur-[2px]"
                            onClick={onClose}
                        />

                        {/* Píldora Flotante Centrada (Estilo idéntico a GlobalBanner) */}
                        <motion.div
                            initial={{ opacity: 0, y: -24, scale: 0.95, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                            exit={{ opacity: 0, y: -16, scale: 0.95, x: '-50%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 380 }}
                            style={{ left: '50%' }}
                            className="fixed top-6 z-50 w-[94vw] max-w-xl pointer-events-auto"
                        >
                            {/* Píldora Input principal */}
                            <div className="flex items-center gap-3 rounded-full bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl border border-[#e3ebf6] dark:bg-[#1e2126]/95 dark:border-[#282d35] dark:shadow-black/60">
                                {/* Ícono lupa */}
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
                                    <Search className="h-4 w-4" />
                                </div>

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
                                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-[#293951] placeholder-[#95aac9] focus:outline-none focus:ring-0 dark:text-[#ffffff] dark:placeholder-[#606770]"
                                />

                                {loading && (
                                    <Loader2 className="h-4 w-4 animate-spin text-brand-primary shrink-0" />
                                )}

                                {query && !loading && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="rounded-full p-1 text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-white transition-colors"
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
                                    className="rounded-full p-1.5 text-[#95aac9] hover:bg-[#ebf1f7] hover:text-brand-primary dark:text-[#a7a6a8] dark:hover:bg-[#282d35] dark:hover:text-brand-primary transition-colors shrink-0"
                                >
                                    <HelpCircle className="h-4 w-4" />
                                </button>

                                {/* Botón de Cerrar */}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    title="Cerrar buscador"
                                    aria-label="Cerrar buscador"
                                    className="rounded-full p-1.5 text-[#95aac9] hover:bg-[#ebf1f7] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:bg-[#282d35] dark:hover:text-[#ffffff] transition-colors shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Desplegable Flotante de Resultados */}
                            <AnimatePresence>
                                {(results.commands.length > 0 || results.items.length > 0 || (query && !loading)) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                        transition={{ duration: 0.15 }}
                                        className="mt-2 w-full overflow-hidden rounded-2xl border border-[#e3ebf6] bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-[#282d35] dark:bg-[#1e2126]/95 dark:shadow-black/60 p-2 max-h-[60vh] overflow-y-auto space-y-3"
                                    >
                                        {/* Comandos y Acciones Rápidas */}
                                        {results.commands.length > 0 && (
                                            <div>
                                                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
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
                                                                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-brand-primary text-white shadow-sm font-semibold'
                                                                        : 'text-[#293951] hover:bg-[#f8fafc] dark:text-[#ffffff] dark:hover:bg-[#16191c]'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div
                                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                                                            isSelected
                                                                                ? 'bg-white/20 text-white'
                                                                                : 'bg-[#ebf1f7] text-brand-primary dark:bg-[#282d35] dark:text-brand-primary'
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
                                                                                    : 'text-[#95aac9] dark:text-[#a7a6a8]'
                                                                            }`}
                                                                        >
                                                                            {cmd.subtitle}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <span
                                                                    className={`rounded-md px-1.5 py-0.5 text-[10px] uppercase font-bold shrink-0 ${
                                                                        isSelected
                                                                            ? 'bg-white/20 text-white'
                                                                            : 'bg-[#f5f7fa] text-[#95aac9] dark:bg-[#16191c] dark:text-[#a7a6a8]'
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
                                                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
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
                                                                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-brand-primary text-white shadow-sm font-semibold'
                                                                        : 'text-[#293951] hover:bg-[#f8fafc] dark:text-[#ffffff] dark:hover:bg-[#16191c]'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div
                                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                                                            isSelected
                                                                                ? 'bg-white/20 text-white'
                                                                                : 'bg-[#ebf1f7] text-brand-primary dark:bg-[#282d35] dark:text-brand-primary'
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
                                                                                    : 'text-[#95aac9] dark:text-[#a7a6a8]'
                                                                            }`}
                                                                        >
                                                                            {item.subtitle}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {item.status && (
                                                                        <span
                                                                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
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
                                                                                : 'text-[#95aac9] dark:text-[#606770]'
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
                                            <div className="py-8 text-center text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                                <p className="font-semibold text-sm text-[#293951] dark:text-white mb-1">
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
