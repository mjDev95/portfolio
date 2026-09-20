import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ContentSubnav from './Partials/ContentSubnav';
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
}) {
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

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* Cabecera */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-heading text-2xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff] sm:text-3xl">
                                    {contentType.name}
                                </h1>
                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                    {items.length} {total > items.length ? `de ${total}` : ''} publicaciones
                                </span>
                            </div>
                            <p className="mt-1.5 text-base text-[#95aac9] dark:text-[#a7a6a8]">
                                Administra y publica tus {contentType.name.toLowerCase()}.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href={`/${contentType.public_slug || contentType.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#293951] shadow-sm transition hover:bg-[#ebf1f7] dark:bg-[#1e2126] dark:text-[#ffffff] dark:hover:bg-[#282d35]"
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
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#293951] shadow-sm transition hover:bg-[#ebf1f7] hover:text-brand-primary dark:bg-[#1e2126] dark:text-[#ffffff] dark:hover:bg-[#282d35] focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            >
                                <Search className="h-4 w-4" />
                            </button>

                            <Link
                                href={route('admin.content.create', contentType.slug)}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                            >
                                <Plus className="h-4 w-4" />
                                Nuevo {contentType.singular_name}
                            </Link>
                        </div>
                    </div>

                    {/* ── Subnavegación Contextual (Pestañas) ── */}
                    <ContentSubnav contentType={contentType} activeTab="contents" />

                    {/* ── Filtro por Cliente (Super Admin cuando hay múltiples clientes) ── */}
                    {isAdmin && assignedClients && assignedClients.length > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1e2126]">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-[#95aac9] dark:text-[#a7a6a8]">
                                    Filtrar por Cliente:
                                </span>
                                <select
                                    value={clientFilter}
                                    onChange={handleClientChange}
                                    className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#293951] focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-[#282d35] dark:bg-[#16191c] dark:text-[#ffffff]"
                                >
                                    <option value="">Todos los Clientes Asignados</option>
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
                                        Mostrar todos
                                    </button>
                                )}
                            </div>

                            <span className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                Mostrando contenidos de {clientFilter ? (assignedClients.find(c => String(c.id) === String(clientFilter))?.name || 'cliente seleccionado') : 'todos los clientes'}
                            </span>
                        </div>
                    )}

                    {/* Lista Unificada sin Tablas */}
                    {isSearching ? (
                        <div className="flex w-full flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="h-9 w-9 animate-spin text-brand-primary" />
                            <h3 className="mt-4 font-heading text-base font-bold text-[#293951] dark:text-[#ffffff]">
                                Buscando publicaciones...
                            </h3>
                            <p className="mt-1 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                {search ? `Filtrando resultados para "${search}"` : 'Cargando publicaciones filtradas...'}
                            </p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex w-full flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ebf1f7] text-brand-primary dark:bg-[#16191c]">
                                <Icon className="h-8 w-8" />
                            </div>
                            <h3 className="mt-4 font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                                {search ? 'Sin coincidencias' : 'No se encontraron publicaciones'}
                            </h3>
                            <p className="mt-1 max-w-md text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                                {search
                                    ? `No hay publicaciones en ${contentType.name} que coincidan con "${search}".`
                                    : `Comienza creando el primer elemento para tu tipo de contenido ${contentType.name}.`}
                            </p>
                            {search ? (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#ebf1f7] px-4 py-2 text-xs font-semibold text-[#293951] transition-colors hover:bg-[#dfe7ef] dark:bg-[#16191c] dark:text-white dark:hover:bg-[#282d35]"
                                >
                                    Limpiar filtro de búsqueda
                                </button>
                            ) : (
                                <Link
                                    href={route('admin.content.create', contentType.slug)}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover"
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
                                    className={`group flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-[#1e2126] sm:flex-row sm:items-center sm:justify-between ${
                                        draggedIndex === index ? 'opacity-40' : ''
                                    }`}
                                >
                                    {/* Izquierda: Drag Handle + Thumbnail + Título & Taxonomías */}
                                    <div className="flex min-w-0 flex-1 items-center gap-4">
                                        {/* Grip Handle */}
                                        <button
                                            type="button"
                                            className="cursor-grab text-[#95aac9] hover:text-brand-primary active:cursor-grabbing dark:text-[#606770]"
                                            title="Arrastrar para reordenar"
                                        >
                                            <GripVertical className="h-4 w-4" />
                                        </button>

                                        {/* Thumbnail or Icon */}
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f8fafc] dark:bg-[#16191c]">
                                            {item.thumbnail?.url ? (
                                                <img
                                                    src={item.thumbnail.url}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Icon className="h-6 w-6 text-[#95aac9] dark:text-[#606770]" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.content.edit', [contentType.slug, item.id])}
                                                    className="truncate font-heading text-base font-bold text-[#293951] hover:text-brand-primary dark:text-[#ffffff] dark:hover:text-brand-primary text-left"
                                                >
                                                    {item.title}
                                                </Link>
                                                {item.featured && (
                                                    <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                                        Destacado
                                                    </span>
                                                )}
                                            </div>

                                            {/* Badges / Taxonomías */}
                                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                                {getStatusBadge(item.status)}

                                                {isAdmin && item.user && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary">
                                                        👤 {item.user.name}
                                                    </span>
                                                )}

                                                {item.categories?.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-[#ebf1f7] px-2 py-0.5 text-xs font-medium text-brand-primary dark:bg-[#1e2126]">
                                                        <Folder className="h-3 w-3" />
                                                        {item.categories.map((c) => c.name).join(', ')}
                                                    </span>
                                                )}

                                                {item.tags?.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                                        <TagIcon className="h-3 w-3" />
                                                        {item.tags.map((t) => t.name).join(', ')}
                                                    </span>
                                                )}

                                                {item.published_at && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
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
                                                 className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f7fa] text-[#95aac9] transition-colors hover:bg-[#ebf1f7] hover:text-brand-primary dark:bg-[#1e2126] dark:text-[#a7a6a8] dark:hover:text-brand-primary"
                                                 title="Ver en sitio público"
                                             >
                                                 <ExternalLink className="h-4 w-4" />
                                             </a>
                                        )}

                                        <Link
                                            href={route('admin.content.edit', [contentType.slug, item.id])}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f7fa] text-[#95aac9] transition-colors hover:bg-[#ebf1f7] hover:text-brand-primary dark:bg-[#1e2126] dark:text-[#a7a6a8] dark:hover:text-brand-primary"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => confirmDelete(item)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f7fa] text-[#95aac9] transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-[#1e2126] dark:text-[#a7a6a8] dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Centinela y Feedback de Scroll Infinito */}
                            <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2">
                                {loadingMore && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-[#95aac9] dark:text-[#a7a6a8] bg-[#f8fafc] dark:bg-[#16191c] px-4 py-2 rounded-full shadow-sm">
                                        <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                                        <span>Cargando más publicaciones...</span>
                                    </div>
                                )}
                                {!hasMore && items.length > 0 && total > 20 && (
                                    <p className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                        Has llegado al final de {contentType.name.toLowerCase()} ({total} en total)
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmación para eliminar contenido */}
            <Modal show={Boolean(deletingContent)} onClose={() => setDeletingContent(null)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                        ¿Eliminar {contentType.singular_name}?
                    </h2>
                    <p className="mt-2 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                        ¿Estás seguro de que deseas eliminar <strong>{deletingContent?.title}</strong>? Se eliminarán también sus archivos multimedia asociados.
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


