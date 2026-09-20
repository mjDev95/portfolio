import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Boxes,
    Plus,
    Edit2,
    Trash2,
    FileText,
    ExternalLink,
    Layers,
    Briefcase,
    BookOpen,
    Scale,
    Stethoscope,
    Award,
    Sparkles,
    FolderGit2,
    MessageSquare,
    EyeOff,
    User as UserIcon,
    Lock,
    Globe,
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

export default function Index({ contentTypes = [], isAdmin: propIsAdmin }) {
    const { auth } = usePage().props;
    const isAdmin = typeof propIsAdmin === 'boolean' ? propIsAdmin : auth?.user?.role === 'admin';
    const [deletingType, setDeletingType] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const getIconComponent = (iconName) => {
        const Icon = ICON_MAP[iconName] || FileText;
        return <Icon className="h-5 w-5 text-brand-primary" />;
    };

    const confirmDelete = (type) => {
        setDeletingType(type);
    };

    const handleDelete = () => {
        if (!deletingType) return;
        router.delete(route('admin.content-types.destroy', deletingType.id), {
            onSuccess: () => setDeletingType(null),
        });
    };

    const handleToggleVisibility = (type) => {
        setTogglingId(type.id);
        router.patch(
            route('admin.content-types.visibility', type.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setTogglingId(null),
            }
        );
    };

    // KPIs
    const totalTypes = contentTypes.length;
    const publicTypes = contentTypes.filter((t) => t.is_public).length;
    const privateTypes = totalTypes - publicTypes;

    return (
        <>
            <Head title="Tipos de Contenido Personalizados — Admin" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* ── A. Header Principal (Alineado con Dashboard / Preferences) ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-heading text-2xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff] sm:text-3xl">
                                    Tipos de Contenido (CPT)
                                </h1>
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                    {isAdmin ? 'Gestión Global' : 'Módulos Activos'}
                                </span>
                            </div>
                            <p className="mt-1.5 text-base text-[#95aac9] dark:text-[#a7a6a8]">
                                {isAdmin
                                    ? 'Diseña y asigna modelos de datos a clientes con campos personalizados y control de visibilidad.'
                                    : 'Módulos y tipos de publicaciones personalizados asignados a tu cuenta.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#293951] shadow-sm transition hover:bg-[#ebf1f7] dark:bg-[#1e2126] dark:text-[#ffffff] dark:hover:bg-[#282d35]"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Ver Sitio Público
                            </a>

                            {isAdmin && (
                                <Link
                                    href={route('admin.content-types.create')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Tipo de Contenido
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* ── B. Tarjetas de Métricas (Idénticas al Dashboard, SIN BORDES) ─ */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#1e2126]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                                    Total Módulos
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebf1f7] text-brand-primary transition-colors dark:bg-[#16191c] dark:text-brand-primary">
                                    <Boxes className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff]">
                                    {totalTypes}
                                </span>
                                <span className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                                    {isAdmin ? 'modelos en sistema' : 'módulos disponibles'}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-[#f5f7fa] pt-3 text-sm dark:border-[#16191c]">
                                <span className="text-[#95aac9] dark:text-[#a7a6a8]">
                                    Catálogo Universal
                                </span>
                                <span className="inline-flex items-center rounded-lg bg-[#ebf1f7] px-2 py-0.5 text-xs font-medium text-brand-primary dark:bg-[#16191c] dark:text-brand-primary">
                                    Dinámicos
                                </span>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#1e2126]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                                    Activos en la Web
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors dark:bg-emerald-950/40 dark:text-emerald-400">
                                    <Globe className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                                    {publicTypes}
                                </span>
                                <span className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                                    visibles al público
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-[#f5f7fa] pt-3 text-sm dark:border-[#16191c]">
                                <span className="text-[#95aac9] dark:text-[#a7a6a8]">
                                    Con presencia web
                                </span>
                                <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    Públicos
                                </span>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#1e2126]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                                    Ocultos / Privados
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebf1f7] text-[#95aac9] transition-colors dark:bg-[#16191c] dark:text-[#a7a6a8]">
                                    <EyeOff className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff]">
                                    {privateTypes}
                                </span>
                                <span className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                                    panel interno
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-[#f5f7fa] pt-3 text-sm dark:border-[#16191c]">
                                <span className="text-[#95aac9] dark:text-[#a7a6a8]">
                                    Solo administradores
                                </span>
                                <span className="inline-flex items-center rounded-lg bg-[#ebf1f7] px-2 py-0.5 text-xs font-medium text-[#95aac9] dark:bg-[#16191c] dark:text-[#a7a6a8]">
                                    Privados
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── C. Banner Informativo para Clientes (Rol User) ───────────── */}
                    {!isAdmin && (
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebf1f7] text-brand-primary dark:bg-[#16191c]">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-heading text-base font-bold text-[#293951] dark:text-[#ffffff]">
                                        Módulos Personalizados
                                    </h3>
                                    <p className="mt-0.5 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                        Tu catálogo de tipos de contenido ha sido configurado por el Super Administrador. Puedes redactar y gestionar tus publicaciones, y activar o pausar la visibilidad de cada sección en tu sitio web público con el interruptor de cada tarjeta.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── D. Grid de CPTs (Tarjetas SIN BORDES, exactamente como Dashboard) */}
                    {contentTypes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-sm dark:bg-[#1e2126]">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ebf1f7] text-brand-primary dark:bg-[#16191c]">
                                <Boxes className="h-8 w-8" />
                            </div>
                            <h3 className="mt-4 font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                                {isAdmin
                                    ? 'No has creado ningún Tipo de Contenido aún'
                                    : 'No tienes Tipos de Contenido asignados actualmente'}
                            </h3>
                            <p className="mt-1 max-w-md text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                                {isAdmin
                                    ? 'Crea modelos universales como Proyectos, Casos de Éxito, Tratamientos o Testimonios y asígnalos a tus clientes.'
                                    : 'Comunícate con el Super Administrador para activar tus módulos personalizados.'}
                            </p>
                            {isAdmin && (
                                <Link href={route('admin.content-types.create')} className="mt-6">
                                    <PrimaryButton className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Crear primer CPT
                                    </PrimaryButton>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {contentTypes.map((type) => {
                                const isToggling = togglingId === type.id;
                                return (
                                    <div
                                        key={type.id}
                                        className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#1e2126]"
                                    >
                                        <div>
                                            {/* Cabecera de la tarjeta: Icono, Nombre y Pill */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ebf1f7] text-brand-primary transition-colors dark:bg-[#16191c] dark:text-brand-primary">
                                                        {getIconComponent(type.icon)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                                                            {type.name}
                                                        </h3>
                                                        <span className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                                            Singular: {type.singular_name}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                                        type.is_public
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                            : 'bg-[#ebf1f7] text-[#95aac9] dark:bg-[#16191c] dark:text-[#a7a6a8]'
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            type.is_public
                                                                ? 'bg-emerald-500 animate-pulse'
                                                                : 'bg-zinc-400'
                                                        }`}
                                                    />
                                                    {type.is_public ? 'Público' : 'Privado'}
                                                </span>
                                            </div>

                                            {/* Si es Super Admin: Mostrar usuario asignado */}
                                            {isAdmin && (
                                                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f8fafc] px-3.5 py-2 text-xs dark:bg-[#16191c]">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <UserIcon className="h-3.5 w-3.5 text-brand-primary" />
                                                        <span className="font-medium text-[#293951] dark:text-[#ffffff] truncate">
                                                            {type.user?.name || 'Administrador'}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                                            (type.user?.role?.slug === 'admin' || type.user?.role === 'admin')
                                                                ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary'
                                                                : 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                                        }`}
                                                    >
                                                        {(type.user?.role?.slug === 'admin' || type.user?.role === 'admin') ? 'Super Admin' : 'Cliente'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Switch Interactivo de Visibilidad Pública (Cliente y Admin) */}
                                            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f8fafc] p-3.5 dark:bg-[#16191c]">
                                                <div>
                                                    <span className="block text-xs font-semibold text-[#293951] dark:text-[#ffffff]">
                                                        {type.is_public
                                                            ? 'Visible en sitio web'
                                                            : 'Oculto del sitio web'}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-[#95aac9] dark:text-[#a7a6a8]">
                                                        /{type.public_slug || type.slug}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={type.is_public}
                                                    disabled={isToggling}
                                                    onClick={() => handleToggleVisibility(type)}
                                                    title={
                                                        type.is_public
                                                            ? 'Ocultar del sitio público'
                                                            : 'Mostrar en el sitio público'
                                                    }
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 ${
                                                        type.is_public
                                                            ? 'bg-brand-primary'
                                                            : 'bg-zinc-300 dark:bg-zinc-700'
                                                    }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                                            type.is_public
                                                                ? 'translate-x-5'
                                                                : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                            </div>

                                            {/* Descripción */}
                                            <p className="mt-4 text-xs leading-relaxed text-[#95aac9] line-clamp-2 dark:text-[#a7a6a8]">
                                                {type.description || 'Sin descripción configurada.'}
                                            </p>

                                            {/* Metadatos (Publicaciones, Campos) */}
                                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f5f7fa] pt-4 text-xs text-[#95aac9] dark:border-[#16191c] dark:text-[#a7a6a8]">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#ebf1f7] px-2.5 py-1 font-semibold text-brand-primary dark:bg-[#16191c]">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {type.contents_count || 0} publicaciones
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f8fafc] px-2.5 py-1 font-medium text-[#293951] dark:bg-[#16191c] dark:text-[#ffffff]">
                                                    <Layers className="h-3.5 w-3.5 text-[#95aac9]" />
                                                    {type.custom_fields_count || 0} campos
                                                </span>
                                                {type.has_categories && (
                                                    <span className="rounded-lg bg-[#f8fafc] px-2 py-0.5 text-xs dark:bg-[#16191c]">
                                                        Categorías
                                                    </span>
                                                )}
                                                {type.has_tags && (
                                                    <span className="rounded-lg bg-[#f8fafc] px-2 py-0.5 text-xs dark:bg-[#16191c]">
                                                        Tags
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Acciones inferiores */}
                                        <div className="mt-5 flex items-center justify-between border-t border-[#f5f7fa] pt-4 dark:border-[#16191c]">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={route('admin.content.index', type.slug)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                                                >
                                                    Gestionar publicaciones
                                                </Link>

                                                {type.is_public && (
                                                    <a
                                                        href={`/${type.public_slug || type.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-[#95aac9] hover:text-brand-primary dark:text-[#a7a6a8]"
                                                        title="Ver en la Web"
                                                    >
                                                        <span>Web</span>
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>

                                            {isAdmin ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Link
                                                        href={route('admin.content-types.edit', type.id)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#f8fafc] text-[#95aac9] transition-colors hover:bg-[#ebf1f7] hover:text-brand-primary dark:bg-[#16191c] dark:text-[#a7a6a8] dark:hover:text-brand-primary"
                                                        title="Editar estructura y campos"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(type)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#f8fafc] text-[#95aac9] transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-[#16191c] dark:text-[#a7a6a8] dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                        title="Eliminar tipo"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                                    <Lock className="h-3.5 w-3.5" />
                                                    <span>Estructura fija</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmación para eliminar CPT */}
            {isAdmin && (
                <Modal show={Boolean(deletingType)} onClose={() => setDeletingType(null)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                            ¿Eliminar Tipo de Contenido?
                        </h2>
                        <p className="mt-2 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                            ¿Estás seguro de que deseas eliminar <strong>{deletingType?.name}</strong>? Se eliminarán también todas sus publicaciones y la estructura de sus campos. Esta acción es irreversible.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setDeletingType(null)}>
                                Cancelar
                            </SecondaryButton>
                            <DangerButton onClick={handleDelete}>
                                Eliminar CPT
                            </DangerButton>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
