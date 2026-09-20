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

            <div className="w-full space-y-8">
                {/* ── A. Header Principal (Alineado con Dashboard / Preferences) ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                    Tipos de Contenido (CPT)
                                </h1>
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                    {isAdmin ? 'Gestión Global' : 'Módulos Activos'}
                                </span>
                            </div>
                            <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
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
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-300 dark:hover:text-brand-primary"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Ver Sitio Público
                            </a>

                            {isAdmin && (
                                <Link
                                    href={route('admin.content-types.create')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Tipo de Contenido
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* ── B. Tarjetas de Métricas ─ */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="group relative overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Total Módulos
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-colors">
                                    <Boxes className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {totalTypes}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {isAdmin ? 'modelos en sistema' : 'módulos disponibles'}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400">
                                    Catálogo Universal
                                </span>
                                <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                                    Dinámicos
                                </span>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Activos en la Web
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition-colors dark:text-emerald-400">
                                    <Globe className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-heading text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                                    {publicTypes}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    visibles al público
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400">
                                    Con presencia web
                                </span>
                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                                    Públicos
                                </span>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Ocultos / Privados
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors dark:bg-[#12161f] dark:text-slate-400">
                                    <EyeOff className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {privateTypes}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    panel interno
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400">
                                    Solo administradores
                                </span>
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    Privados
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── C. Banner Informativo para Clientes (Rol User) ───────────── */}
                    {!isAdmin && (
                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                                        Módulos Personalizados
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        Cada tipo de contenido te permite gestionar de forma ordenada y privada tus publicaciones específicas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── D. Grid de CPTs (Tarjetas Bento) */}
                    {contentTypes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[28px] border border-slate-100/90 bg-white p-12 text-center shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-brand-primary dark:bg-[#12161f]">
                                <Boxes className="h-8 w-8" />
                            </div>
                            <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
                                {isAdmin
                                    ? 'No has creado ningún Tipo de Contenido aún'
                                    : 'No tienes Tipos de Contenido asignados actualmente'}
                            </h3>
                            <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
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
                                        className="group flex flex-col justify-between rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]"
                                    >
                                        <div>
                                            {/* Cabecera de la tarjeta: Icono, Nombre y Pill */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20">
                                                        {getIconComponent(type.icon)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                                            {type.name}
                                                        </h3>
                                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                                            Singular: {type.singular_name}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                        type.is_public
                                                            ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400'
                                                            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700/60'
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            type.is_public
                                                                ? 'bg-emerald-500 animate-pulse'
                                                                : 'bg-slate-400'
                                                        }`}
                                                    />
                                                    {type.is_public ? 'Público' : 'Privado'}
                                                </span>
                                            </div>

                                            {/* Si es Super Admin: Mostrar usuario asignado */}
                                            {isAdmin && (
                                                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs dark:border-slate-800 dark:bg-[#12161f]">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <UserIcon className="h-3.5 w-3.5 text-brand-primary" />
                                                        <span className="font-medium text-slate-900 dark:text-white truncate">
                                                            {type.user?.name || 'Administrador'}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                                            (type.user?.role?.slug === 'admin' || type.user?.role === 'admin')
                                                                ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-primary'
                                                                : 'bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}
                                                    >
                                                        {(type.user?.role?.slug === 'admin' || type.user?.role === 'admin') ? 'Super Admin' : 'Cliente'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Switch Interactivo de Visibilidad Pública (Cliente y Admin) */}
                                            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-[#12161f]">
                                                <div>
                                                    <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                                                        {type.is_public
                                                            ? 'Visible en sitio web'
                                                            : 'Oculto del sitio web'}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
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
                                                            : 'bg-slate-300 dark:bg-slate-700'
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
                                            <p className="mt-4 text-xs leading-relaxed text-slate-500 line-clamp-2 dark:text-slate-400">
                                                {type.description || 'Sin descripción configurada.'}
                                            </p>

                                            {/* Metadatos (Publicaciones, Campos) */}
                                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-brand-primary dark:border-slate-800 dark:bg-[#12161f]">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {type.contents_count || 0} publicaciones
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-300">
                                                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                                                    {type.custom_fields_count || 0} campos
                                                </span>
                                                {type.has_categories && (
                                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400">
                                                        Categorías
                                                    </span>
                                                )}
                                                {type.has_tags && (
                                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400">
                                                        Tags
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Acciones inferiores */}
                                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
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
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-primary dark:text-slate-400"
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
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-400 dark:hover:text-brand-primary"
                                                        title="Editar estructura y campos"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(type)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200/60 bg-red-50/50 text-red-600 transition hover:bg-red-100/80 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                                        title="Eliminar tipo"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
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

            {/* Modal de confirmación para eliminar CPT */}
            {isAdmin && (
                <Modal show={Boolean(deletingType)} onClose={() => setDeletingType(null)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                            ¿Eliminar Tipo de Contenido?
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            ¿Estás seguro de que deseas eliminar <strong className="font-semibold text-slate-900 dark:text-white">{deletingType?.name}</strong>? Se eliminarán también todas sus publicaciones y la estructura de sus campos. Esta acción es irreversible.
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
