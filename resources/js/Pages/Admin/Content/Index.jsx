import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ContentSubnav from './Partials/ContentSubnav';
import SegmentedLiquidFilter from '@/Components/SegmentedLiquidFilter';
import TaxonomyManager from './Partials/TaxonomyManager';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { useInfiniteScroll } from '@/utils/useInfiniteScroll';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    GripVertical,
    Calendar,
    Tag as TagIcon,
    Folder,
    Globe,
    FileText,
    ArrowUpDown,
    Briefcase,
    BookOpen,
    Scale,
    Stethoscope,
    Award,
    Sparkles,
    FolderGit2,
    Boxes,
    Layers,
    MessageSquare,
    Eye,
    ExternalLink,
    CheckCircle2,
    X,
    Loader2,
} from 'lucide-react';

const ICON_MAP = {
    Briefcase,
    BookOpen,
    Scale,
    Stethoscope,
    Award,
    Sparkles,
    FolderGit2,
    FileText,
    Boxes,
    Layers,
    MessageSquare,
};

export default function Index({
    contentType,
    contents = {},
    categories = [],
    tags = [],
    filters = {},
    assignedClients = [],
    isAdmin = false,
    statusCounts = { all: 0, published: 0, draft: 0, archived: 0 },
    initialTab = 'contents',
}) {
    const [activeTab, setActiveTab] = useState(() => {
        if (initialTab && initialTab !== 'contents') return initialTab;
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.endsWith('/categories')) return 'categories';
            if (path.endsWith('/tags')) return 'tags';
        }
        return 'contents';
    });
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || '');
    const [clientFilter, setClientFilter] = useState(filters.client_id || '');
    const [deletingContent, setDeletingContent] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Scroll Infinito con IntersectionObserver
    const {
        items,
        setItems,
        loading: loadingMore,
        hasMore,
        total,
        sentinelRef,
    } = useInfiniteScroll(contents);

    // Estado para búsqueda y filtrado asíncrono con spinner
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const Icon = ICON_MAP[contentType.icon] || FileText;

    // Ejecutar filtro asíncrono sin desenfoque global
    const executeFilter = (newSearch, newStatus, newCategory, newClient) => {
        setIsSearching(true);
        router.get(
            route('admin.content.index', contentType.slug),
            {
                search: newSearch !== undefined ? newSearch : search,
                status: newStatus !== undefined ? newStatus : statusFilter,
                category_id: newCategory !== undefined ? newCategory : categoryFilter,
                client_id: newClient !== undefined ? newClient : clientFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['contents', 'filters'],
                onSuccess: () => {
                    setIsSearching(false);
                },
                onError: () => {
                    setIsSearching(false);
                },
                onFinish: () => {
                    setIsSearching(false);
                },
            }
        );
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        setIsSearching(true);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            executeFilter(val, statusFilter, categoryFilter, clientFilter);
        }, 320);
    };

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setCategoryFilter(val);
        executeFilter(search, statusFilter, val, clientFilter);
    };

    const handleStatusChange = (e) => {
        const val = e.target.value;
        setStatusFilter(val);
        executeFilter(search, val, categoryFilter, clientFilter);
    };

    const handleClientChange = (e) => {
        const val = e.target.value;
        setClientFilter(val);
        executeFilter(search, statusFilter, categoryFilter, val);
    };

    const clearSearch = () => {
        setSearch('');
        executeFilter('', statusFilter, categoryFilter, clientFilter);
    };

    const confirmDelete = (content) => {
        setDeletingContent(content);
    };

    const handleDelete = () => {
        if (!deletingContent) return;
        router.delete(
            route('admin.content.destroy', [contentType.slug, deletingContent.id]),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setDeletingContent(null);
                },
            }
        );
    };

    // Drag and Drop reordering
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newItems = [...items];
        const draggedItem = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);

        setDraggedIndex(index);
        setItems(newItems);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        const orderIds = items.map((item) => item.id);
        router.post(
            route('admin.content.reorder', contentType.slug),
            { order: orderIds },
            { preserveScroll: true, preserveState: true }
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
                return (
                    <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        Publicado
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                        Borrador
                    </span>
                );
            case 'archived':
            default:
                return (
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Archivado
                    </span>
                );
        }
    };

    return (
        <>
            <Head title={contentType.name} />

            <div className="w-full space-y-8">
                {/* Cabecera */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                    {activeTab === 'categories'
                                        ? `Categorías de ${contentType.name}`
                                        : activeTab === 'tags'
                                        ? `Etiquetas de ${contentType.name}`
                                        : contentType.name}
                                </h1>
                                {activeTab === 'contents' && (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                        {isSearching ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                                        ) : (
                                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                        )}
                                        {items.length} {total > items.length ? `de ${total}` : ''} publicaciones
                                    </span>
                                )}
                            </div>
                            <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
                                {activeTab === 'categories'
                                    ? `Clasifica y organiza las publicaciones de tu modelo ${contentType.singular_name.toLowerCase()}.`
                                    : activeTab === 'tags'
                                    ? `Etiqueta y relaciona las publicaciones de tu modelo ${contentType.singular_name.toLowerCase()}.`
                                    : `Administra y publica tus ${contentType.name.toLowerCase()}.`}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href={`/${contentType.public_slug || contentType.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-300 dark:hover:text-brand-primary"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Ver en la Web
                            </a>

                            {/* Botón Lupa */}
                            <button
                                type="button"
                                onClick={() => {
                                    window.dispatchEvent(
                                        new CustomEvent('open-admin-search', {
                                            detail: {
                                                context: {
                                                    slug: contentType.slug,
                                                    name: contentType.name,
                                                },
                                            },
                                        })
                                    );
                                }}
                                title="Buscar en el panel"
                                aria-label="Buscar en el panel"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-400 dark:hover:text-brand-primary"
                            >
                                <Search className="h-4 w-4" />
                            </button>

                            <Link
                                href={route('admin.content.create', contentType.slug)}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                            >
                                <Plus className="h-4 w-4" />
                                Nuevo {contentType.singular_name}
                            </Link>
                        </div>
                    </div>

                    {/* ── Subnavegación Contextual (Pestañas con Transición Elástica) ── */}
                    <ContentSubnav
                        contentType={contentType}
                        activeTab={activeTab}
                        onTabChange={(tabKey) => {
                            setActiveTab(tabKey);
                            const targetUrl = tabKey === 'contents'
                                ? route('admin.content.index', contentType.slug)
                                : tabKey === 'categories'
                                ? route('admin.content.categories.index', contentType.slug)
                                : route('admin.content.tags.index', contentType.slug);
                            window.history.pushState({}, '', targetUrl);
                        }}
                    />

                    {/* ── Vistas por Pestaña (Sin recarga de página) ── */}
                    {activeTab === 'categories' ? (
                        <TaxonomyManager
                            contentType={contentType}
                            taxonomyType="categories"
                            items={categories}
                            onSelectCategoryForFilter={(catId) => {
                                setCategoryFilter(catId);
                                setActiveTab('contents');
                                executeFilter(search, statusFilter, catId, clientFilter);
                                window.history.pushState({}, '', route('admin.content.index', contentType.slug));
                            }}
                        />
                    ) : activeTab === 'tags' ? (
                        <TaxonomyManager
                            contentType={contentType}
                            taxonomyType="tags"
                            items={tags}
                        />
                    ) : (
                        <>
                            {/* ── Filtro de Estado Líquido y Filtros Secundarios ── */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <SegmentedLiquidFilter
                                    value={statusFilter}
                                    onChange={handleStatusChange}
                                    counts={statusCounts}
                                />

                                {/* Filtro rápido por categoría si está habilitado */}
                                {contentType.has_categories && categories.length > 0 && (
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            Categoría:
                                        </span>
                                        <select
                                            value={categoryFilter}
                                            onChange={handleCategoryChange}
                                            className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-700/80 dark:bg-[#161b24] dark:text-slate-200"
                                        >
                                            <option value="">Todas las categorías</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {categoryFilter && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCategoryFilter('');
                                                    executeFilter(search, statusFilter, '', clientFilter);
                                                }}
                                                className="text-xs font-medium text-brand-primary hover:underline"
                                            >
                                                Limpiar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Filtro por Cliente (Super Admin cuando hay múltiples clientes) ── */}
                            {isAdmin && assignedClients && assignedClients.length > 1 && (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-slate-100/90 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            Filtrar por Cliente:
                                        </span>
                                        <select
                                            value={clientFilter}
                                            onChange={handleClientChange}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f] dark:text-white"
                                        >
                                            <option value="">Mis publicaciones (Solo creados por mí)</option>
                                            {assignedClients.map((client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name} ({client.email})
                                                </option>
                                            ))}
                                        </select>
                                        {clientFilter && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setClientFilter('');
                                                    executeFilter(search, statusFilter, categoryFilter, '');
                                                }}
                                                className="text-xs font-medium text-brand-primary hover:underline"
                                            >
                                                Ver solo mis publicaciones
                                            </button>
                                        )}
                                    </div>

                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {clientFilter
                                            ? `Viendo publicaciones de: ${assignedClients.find((c) => String(c.id) === String(clientFilter))?.name || 'cliente'}`
                                            : 'Viendo solo tus publicaciones'}
                                    </span>
                                </div>
                            )}

                            {/* Lista Unificada sin Tablas - Fluida sin saltos */}
                            <div className={`w-full space-y-4 transition-opacity duration-200 ${isSearching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                                {items.length === 0 && !isSearching ? (
                                    <div className="flex w-full flex-col items-center justify-center py-16 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-brand-primary dark:bg-[#12161f]">
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
                                            {search ? 'Sin coincidencias' : 'No se encontraron publicaciones'}
                                        </h3>
                                        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                                            {search
                                                ? `No hay publicaciones en ${contentType.name} que coincidan con "${search}".`
                                                : `Comienza creando el primer elemento para tu tipo de contenido ${contentType.name}.`}
                                        </p>
                                        {search ? (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-[#2a3447]"
                                            >
                                                Limpiar filtro de búsqueda
                                            </button>
                                        ) : (
                                            <Link
                                                href={route('admin.content.create', contentType.slug)}
                                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Crear {contentType.singular_name}
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full space-y-4">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`group flex w-full flex-col gap-4 rounded-[28px] border border-slate-100/90 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24] sm:flex-row sm:items-center sm:justify-between ${
                                        draggedIndex === index ? 'opacity-40' : ''
                                    }`}
                                >
                                    {/* Izquierda: Drag Handle + Thumbnail + Título & Taxonomías */}
                                    <div className="flex min-w-0 flex-1 items-center gap-4">
                                        {/* Grip Handle */}
                                        <button
                                            type="button"
                                            className="cursor-grab text-slate-400 hover:text-brand-primary active:cursor-grabbing dark:text-slate-500"
                                            title="Arrastrar para reordenar"
                                        >
                                            <GripVertical className="h-4 w-4" />
                                        </button>

                                        {/* Thumbnail or Icon */}
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/60 dark:bg-[#12161f] dark:ring-slate-800">
                                            {item.thumbnail?.url ? (
                                                <img
                                                    src={item.thumbnail.url}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.content.edit', [contentType.slug, item.id])}
                                                    className="truncate font-heading text-base font-bold text-slate-900 hover:text-brand-primary dark:text-white dark:hover:text-brand-primary text-left"
                                                >
                                                    {item.title}
                                                </Link>
                                                {item.featured && (
                                                    <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400">
                                                        Destacado
                                                    </span>
                                                )}
                                            </div>

                                            {/* Badges / Taxonomías */}
                                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                                {getStatusBadge(item.status)}

                                                {isAdmin && item.user && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary ring-1 ring-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-primary">
                                                        👤 {item.user.name}
                                                    </span>
                                                )}

                                                {item.categories?.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700/80 dark:bg-[#1b222c] dark:text-slate-300">
                                                        <Folder className="h-3 w-3 text-slate-400" />
                                                        {item.categories.map((c) => c.name).join(', ')}
                                                    </span>
                                                )}

                                                {item.tags?.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <TagIcon className="h-3 w-3" />
                                                        {item.tags.map((t) => t.name).join(', ')}
                                                    </span>
                                                )}

                                                {item.published_at && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(item.published_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Derecha: Botones de Acción */}
                                    <div className="flex shrink-0 items-center justify-end gap-1.5 self-end sm:self-center">
                                        {contentType.is_public && (
                                             <a
                                                 href={`/${contentType.public_slug || contentType.slug}/${item.slug}`}
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:text-brand-primary"
                                                 title="Ver en sitio público"
                                             >
                                                 <ExternalLink className="h-4 w-4" />
                                             </a>
                                        )}

                                        <Link
                                            href={route('admin.content.edit', [contentType.slug, item.id])}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:text-brand-primary"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => confirmDelete(item)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200/60 bg-red-50/50 text-red-600 transition hover:bg-red-100/80 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Centinela y Feedback de Scroll Infinito */}
                            <div ref={sentinelRef} className="flex flex-col items-center justify-center gap-2 py-6">
                                {loadingMore && (
                                    <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 shadow-sm dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400">
                                        <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                                        <span>Cargando más publicaciones...</span>
                                    </div>
                                )}
                                {!hasMore && items.length > 0 && total > 20 && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        Has llegado al final de {contentType.name.toLowerCase()} ({total} en total)
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </>
        )}
    </div>

            {/* Modal de confirmación para eliminar contenido */}
            <Modal show={Boolean(deletingContent)} onClose={() => setDeletingContent(null)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        ¿Eliminar {contentType.singular_name}?
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        ¿Estás seguro de que deseas eliminar <strong className="font-semibold text-slate-900 dark:text-white">{deletingContent?.title}</strong>? Se eliminarán también sus archivos multimedia asociados.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeletingContent(null)}>
                            Cancelar
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>
                            Eliminar
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;


