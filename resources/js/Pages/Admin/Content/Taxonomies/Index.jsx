import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ContentSubnav from '../Partials/ContentSubnav';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Folder,
    Tag as TagIcon,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    CheckCircle2,
    ArrowLeft,
    ExternalLink,
    FileText,
    Layers,
    Save,
    RotateCcw,
    Loader2,
} from 'lucide-react';
import { useInfiniteScroll } from '@/utils/useInfiniteScroll';

export default function Index({ contentType, taxonomyType = 'categories', items = {}, filters = {} }) {
    const isCategory = taxonomyType === 'categories';
    const singularName = isCategory ? 'Categoría' : 'Etiqueta';
    const pluralName = isCategory ? 'Categorías' : 'Etiquetas';
    const Icon = isCategory ? Folder : TagIcon;

    // Scroll Infinito con IntersectionObserver
    const {
        items: taxonomyList,
        setItems: setTaxonomyList,
        loading: loadingMore,
        hasMore,
        total: totalItems,
        sentinelRef,
    } = useInfiniteScroll(items);

    const [search, setSearch] = useState(filters.search || '');
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const searchTimeoutRef = useRef(null);
    const formRef = useRef(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        slug: '',
        description: '',
    });

    // Auto-generación de slug mientras se escribe el nombre en modo creación
    const handleNameChange = (e) => {
        const val = e.target.value;
        setData((prev) => ({
            ...prev,
            name: val,
            // Solo autogenerar slug si estamos creando y el slug está vacío o coincide con el slug del nombre anterior
            slug: !editingItem ? slugify(val) : prev.slug,
        }));
    };

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    // Al seleccionar editar un item
    const startEditing = (item) => {
        clearErrors();
        setEditingItem(item);
        setData({
            name: item.name,
            slug: item.slug,
            description: item.description || '',
        });
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    // Cancelar edición
    const cancelEditing = () => {
        clearErrors();
        setEditingItem(null);
        reset();
    };

    // Guardar (Crear o Actualizar)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingItem) {
            const url = isCategory
                ? route('admin.content.categories.update', [contentType.slug, editingItem.id])
                : route('admin.content.tags.update', [contentType.slug, editingItem.id]);

            put(url, {
                preserveScroll: true,
                onSuccess: () => {
                    cancelEditing();
                },
            });
        } else {
            const url = isCategory
                ? route('admin.content.categories.store', contentType.slug)
                : route('admin.content.tags.store', contentType.slug);

            post(url, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                },
            });
        }
    };

    // Eliminar
    const handleDelete = () => {
        if (!deletingItem) return;

        const url = isCategory
            ? route('admin.content.categories.destroy', [contentType.slug, deletingItem.id])
            : route('admin.content.tags.destroy', [contentType.slug, deletingItem.id]);

        router.delete(url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingItem(null);
                if (editingItem?.id === deletingItem.id) {
                    cancelEditing();
                }
            },
        });
    };

    // Búsqueda con debounce
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            const url = isCategory
                ? route('admin.content.categories.index', contentType.slug)
                : route('admin.content.tags.index', contentType.slug);

            router.get(
                url,
                { search: val },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['items', 'filters'],
                }
            );
        }, 300);
    };

    const clearSearch = () => {
        setSearch('');
        const url = isCategory
            ? route('admin.content.categories.index', contentType.slug)
            : route('admin.content.tags.index', contentType.slug);

        router.get(url, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title={`${pluralName} — ${contentType.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* ── Cabecera Principal ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-heading text-2xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff] sm:text-3xl">
                                    {pluralName} de {contentType.name}
                                </h1>
                                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-brand-primary">
                                    <Icon className="h-4 w-4" />
                                    {taxonomyList.length} {totalItems > taxonomyList.length ? `de ${totalItems}` : ''} {pluralName.toLowerCase()}
                                </span>
                            </div>
                            <p className="mt-1.5 text-base text-[#95aac9] dark:text-[#a7a6a8]">
                                Clasifica y organiza las publicaciones de tu modelo {contentType.singular_name.toLowerCase()}.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href={route('admin.content.index', contentType.slug)}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#293951] shadow-sm transition hover:bg-[#ebf1f7] dark:bg-[#1e2126] dark:text-[#ffffff] dark:hover:bg-[#282d35]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Ver {contentType.name}
                            </Link>
                        </div>
                    </div>

                    {/* ── Subnavegación Contextual (Pestañas) ── */}
                    <ContentSubnav contentType={contentType} activeTab={taxonomyType} />

                    {/* ── Estructura de 2 Columnas Estilo WordPress ── */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* COLUMNA IZQUIERDA: Formulario de Alta / Edición (4 de 12) */}
                        <div className="lg:col-span-4" ref={formRef}>
                            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126]">
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ebf1f7] text-brand-primary dark:bg-[#16191c]">
                                            {editingItem ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                        </div>
                                        <h2 className="font-heading text-base font-bold text-[#293951] dark:text-[#ffffff]">
                                            {editingItem ? `Editar ${singularName}` : `Añadir ${singularName}`}
                                        </h2>
                                    </div>
                                    {editingItem && (
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-white"
                                            title="Cancelar edición"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                            Cancelar
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Nombre */}
                                    <div>
                                        <InputLabel htmlFor="taxonomy_name" value="Nombre" />
                                        <TextInput
                                            id="taxonomy_name"
                                            type="text"
                                            value={data.name}
                                            onChange={handleNameChange}
                                            placeholder={`ej. ${isCategory ? 'Tecnología, Estrategia...' : 'React, Laravel...'}`}
                                            className="mt-1 w-full"
                                            required
                                            autoFocus={Boolean(editingItem)}
                                        />
                                        <p className="mt-1 text-[11px] text-[#95aac9] dark:text-[#a7a6a8]">
                                            El nombre visible tal como aparecerá en el sitio y en los filtros.
                                        </p>
                                        <InputError message={errors.name} className="mt-1" />
                                    </div>

                                    {/* Slug */}
                                    <div>
                                        <InputLabel htmlFor="taxonomy_slug" value="Slug (URL amigable)" />
                                        <TextInput
                                            id="taxonomy_slug"
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', slugify(e.target.value))}
                                            placeholder="ej. mi-categoria"
                                            className="mt-1 w-full font-mono text-xs"
                                        />
                                        <p className="mt-1 text-[11px] text-[#95aac9] dark:text-[#a7a6a8]">
                                            La parte de la URL para este término (solo minúsculas, números y guiones).
                                        </p>
                                        <InputError message={errors.slug} className="mt-1" />
                                    </div>

                                    {/* Descripción (Solo Categorías) */}
                                    {isCategory && (
                                        <div>
                                            <InputLabel htmlFor="taxonomy_description" value="Descripción (Opcional)" />
                                            <textarea
                                                id="taxonomy_description"
                                                rows="3"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Breve explicación del propósito de esta categoría..."
                                                className="mt-1 w-full rounded-xl border border-[#e3ebf6] bg-[#f8fafc] px-3.5 py-2.5 text-xs text-[#293951] placeholder-[#95aac9] focus:border-brand-primary focus:outline-none dark:border-[#282d35] dark:bg-[#16191c] dark:text-[#ffffff] dark:placeholder-[#606770]"
                                            />
                                            <InputError message={errors.description} className="mt-1" />
                                        </div>
                                    )}

                                    {/* Botón de Enviar */}
                                    <div className="pt-2">
                                        <PrimaryButton
                                            type="submit"
                                            disabled={processing}
                                            className="w-full justify-center gap-2 py-2.5"
                                        >
                                            {editingItem ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                            {editingItem ? `Guardar Cambios` : `Añadir Nueva ${singularName}`}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Listado en Tiempo Real (8 de 12) */}
                        <div className="space-y-4 lg:col-span-8">
                            {/* Barra de Filtro y Búsqueda */}
                            <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1e2126] sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#95aac9]" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={handleSearchChange}
                                        placeholder={`Buscar ${pluralName.toLowerCase()} en ${contentType.name}...`}
                                        className="w-full rounded-xl bg-[#f8fafc] py-2 pl-10 pr-9 text-xs text-[#293951] placeholder-[#95aac9] shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-[#16191c] dark:text-[#ffffff] dark:placeholder-[#606770]"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#95aac9] hover:text-[#293951] dark:text-[#606770] dark:hover:text-white"
                                            title="Limpiar búsqueda"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs text-[#95aac9] dark:text-[#a7a6a8] shrink-0">
                                    Mostrando {taxonomyList.length} {totalItems > taxonomyList.length ? `de ${totalItems}` : ''} {taxonomyList.length === 1 ? singularName.toLowerCase() : pluralName.toLowerCase()}
                                </span>
                            </div>

                            {/* Lista de Items */}
                            {taxonomyList.length === 0 ? (
                                <div className="flex w-full flex-col items-center justify-center py-16 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ebf1f7] text-brand-primary dark:bg-[#16191c]">
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="mt-4 font-heading text-base font-bold text-[#293951] dark:text-[#ffffff]">
                                        {search ? 'Sin coincidencias' : `No hay ${pluralName.toLowerCase()} creadas`}
                                    </h3>
                                    <p className="mt-1 max-w-sm text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                        {search
                                            ? `No se encontraron ${pluralName.toLowerCase()} que coincidan con "${search}".`
                                            : `Comienza añadiendo la primera ${singularName.toLowerCase()} usando el formulario de la izquierda.`}
                                    </p>
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#ebf1f7] px-4 py-2 text-xs font-semibold text-[#293951] transition-colors hover:bg-[#dfe7ef] dark:bg-[#16191c] dark:text-white dark:hover:bg-[#282d35]"
                                        >
                                            Limpiar filtro de búsqueda
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full space-y-3">
                                    {taxonomyList.map((item) => {
                                        const isBeingEdited = editingItem?.id === item.id;
                                        return (
                                            <div
                                                key={item.id}
                                                className={`group flex w-full flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-[#1e2126] sm:flex-row sm:items-center sm:justify-between ${
                                                    isBeingEdited
                                                        ? 'ring-2 ring-brand-primary bg-blue-50/20 dark:bg-blue-950/20'
                                                        : ''
                                                }`}
                                            >
                                                {/* Izquierda: Icono + Nombre + Slug + Descripción */}
                                                <div className="flex min-w-0 flex-1 items-start gap-3.5">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebf1f7] text-brand-primary dark:bg-[#16191c]">
                                                        <Icon className="h-5 w-5" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-heading text-sm font-bold text-[#293951] dark:text-[#ffffff]">
                                                                {item.name}
                                                            </span>
                                                            <span className="rounded-md bg-[#f5f7fa] px-2 py-0.5 font-mono text-[11px] text-[#95aac9] dark:bg-[#16191c] dark:text-[#a7a6a8]">
                                                                /{item.slug}
                                                            </span>
                                                        </div>

                                                        {item.description && (
                                                            <p className="mt-1 line-clamp-2 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Derecha: Conteo de Publicaciones + Botones */}
                                                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                                                    <Link
                                                        href={
                                                            isCategory
                                                                ? `${route('admin.content.index', contentType.slug)}?category_id=${item.id}`
                                                                : route('admin.content.index', contentType.slug)
                                                        }
                                                        title="Filtrar publicaciones con esta taxonomía"
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#ebf1f7] px-2.5 py-1 text-xs font-semibold text-brand-primary transition hover:bg-[#dfe7ef] dark:bg-[#16191c] dark:hover:bg-[#282d35]"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>
                                                            {item.contents_count ?? 0}{' '}
                                                            {item.contents_count === 1 ? 'publicación' : 'publicaciones'}
                                                        </span>
                                                    </Link>

                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditing(item)}
                                                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                                                isBeingEdited
                                                                    ? 'bg-brand-primary text-white'
                                                                    : 'bg-[#f5f7fa] text-[#95aac9] hover:bg-[#ebf1f7] hover:text-brand-primary dark:bg-[#16191c] dark:text-[#a7a6a8] dark:hover:text-brand-primary'
                                                            }`}
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingItem(item)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f7fa] text-[#95aac9] transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-[#16191c] dark:text-[#a7a6a8] dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Centinela y Feedback de Scroll Infinito */}
                                    <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2">
                                        {loadingMore && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-[#95aac9] dark:text-[#a7a6a8] bg-[#f8fafc] dark:bg-[#16191c] px-4 py-2 rounded-full shadow-sm">
                                                <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                                                <span>Cargando más {pluralName.toLowerCase()}...</span>
                                            </div>
                                        )}
                                        {!hasMore && taxonomyList.length > 0 && totalItems > 20 && (
                                            <p className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                                Has llegado al final de las {pluralName.toLowerCase()} ({totalItems} en total)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación para Eliminar Taxonomía */}
            <Modal show={Boolean(deletingItem)} onClose={() => setDeletingItem(null)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                        ¿Eliminar {singularName}?
                    </h2>
                    <p className="mt-2 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                        ¿Estás seguro de que deseas eliminar <strong>{deletingItem?.name}</strong>?
                    </p>
                    <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        Nota: Las publicaciones vinculadas a este término <strong>no se eliminarán</strong>; simplemente se desvincularán de esta {singularName.toLowerCase()}.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeletingItem(null)}>
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

