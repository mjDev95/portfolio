import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { useInfiniteScroll } from '@/utils/useInfiniteScroll';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Users,
    UserPlus,
    Edit2,
    Trash2,
    Shield,
    Activity,
    Boxes,
    FileText,
    Check,
    Lock,
    Eye,
    EyeOff,
    Briefcase,
    BookOpen,
    Layers,
    FolderGit2,
    Sparkles,
    PauseCircle,
    PlayCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react';

const ICON_MAP = {
    Briefcase,
    BookOpen,
    Layers,
    FolderGit2,
    Sparkles,
    Boxes,
    FileText,
};

export default function Index({ users = {}, roles = [], stats = {} }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    // Scroll Infinito con IntersectionObserver
    const {
        items: userList,
        setItems: setUserList,
        loading: loadingMore,
        hasMore,
        total: totalUsers,
        sentinelRef,
    } = useInfiniteScroll(users);

    const [deletingUser, setDeletingUser] = useState(null);
    const [togglingTelemetryId, setTogglingTelemetryId] = useState(null);

    const handleToggleTelemetry = (user) => {
        setTogglingTelemetryId(user.id);
        router.patch(
            route('admin.users.telemetry', user.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setTogglingTelemetryId(null),
            }
        );
    };

    const confirmDelete = (user) => {
        setDeletingUser(user);
    };

    const handleDelete = () => {
        if (!deletingUser) return;
        router.delete(route('admin.users.destroy', deletingUser.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setDeletingUser(null),
        });
    };

    const renderCptIcon = (iconName) => {
        const Icon = ICON_MAP[iconName] || FileText;
        return <Icon className="h-3.5 w-3.5" />;
    };

    return (
        <>
            <Head title="Gestión de Usuarios y Clientes — Admin" />

            <div className="w-full space-y-8">
                {/* ── Cabecera Principal ─────────────────────────────────── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                    Usuarios y Clientes
                                </h1>
                                <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-sm font-medium text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary">
                                    <Shield className="h-4 w-4" />
                                    Super Admin • {userList.length} {totalUsers > userList.length ? `de ${totalUsers}` : ''} cuentas
                                </span>
                            </div>
                            <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
                                Gestiona las cuentas del sistema, visualiza los CPTs asignados a cada cliente y activa o desactiva su contador de visitas.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href={route('admin.users.create')}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>Nuevo Usuario / Cliente</span>
                            </Link>
                        </div>
                    </div>

                    {/* ── KPIs Rápidos ────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cuentas</span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 font-heading text-3xl font-bold text-slate-900 dark:text-white">
                                {stats.totalUsers ?? totalUsers}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Clientes Activos</span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                                    <Boxes className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 font-heading text-3xl font-bold text-slate-900 dark:text-white">
                                {stats.activeClients ?? userList.filter((u) => u.role === 'user' && u.is_active).length}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pausados (401)</span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                                    <PauseCircle className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 font-heading text-3xl font-bold text-red-600 dark:text-red-400">
                                {stats.inactiveUsers ?? userList.filter((u) => !u.is_active).length}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Telemetría Activa</span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                                    <Activity className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 font-heading text-3xl font-bold text-slate-900 dark:text-white">
                                {stats.telemetryUsers ?? userList.filter((u) => u.has_telemetry).length}
                            </div>
                        </div>
                    </div>

                    {/* ── Tabla de Usuarios y Clientes ───────────────────────── */}
                    <div className="overflow-hidden rounded-[28px] border border-slate-100/90 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800/80">
                            <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                Directorio de Cuentas y Asignaciones
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                El Super Admin puede pausar el acceso por falta de pago (aplicando 401 en el sitio público), asignar telemetría y auditar contenidos.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100/80 text-left text-sm dark:divide-slate-800/60">
                                <thead className="border-b border-slate-100 bg-[#f8f9fb] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Usuario / Cuenta</th>
                                        <th scope="col" className="px-6 py-4">Rol</th>
                                        <th scope="col" className="px-6 py-4">Estado</th>
                                        <th scope="col" className="px-6 py-4">CPTs Asignados</th>
                                        <th scope="col" className="px-6 py-4">Contador (Telemetría)</th>
                                        <th scope="col" className="px-6 py-4 text-center">Publicaciones</th>
                                        <th scope="col" className="px-6 py-4 text-center">Visitas</th>
                                        <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                                    {userList.map((user) => (
                                        <tr key={user.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-[#1c222e]/60">
                                            {/* Nombre y Email */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 font-heading text-sm font-bold text-brand-primary ring-1 ring-brand-primary/20">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-heading font-semibold text-slate-900 dark:text-white">
                                                            {user.name}
                                                            {user.id === currentUserId && (
                                                                <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
                                                                    (Tú)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Rol */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                        user.role === 'admin'
                                                            ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-primary'
                                                            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700/60'
                                                    }`}
                                                >
                                                    {user.role === 'admin' ? (
                                                        <>
                                                            <Shield className="h-3 w-3" />
                                                            Super Admin
                                                        </>
                                                    ) : (
                                                        'Cliente'
                                                    )}
                                                </span>
                                            </td>

                                            {/* Estado */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                        user.is_active
                                                            ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400'
                                                            : 'bg-red-500/10 text-red-600 ring-1 ring-red-500/20 dark:text-red-400'
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            user.is_active ? 'bg-emerald-500' : 'bg-red-500'
                                                        }`}
                                                    />
                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>

                                            {/* CPTs Asignados */}
                                            <td className="px-6 py-4">
                                                {user.content_types && user.content_types.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {user.content_types.map((cpt) => (
                                                            <Link
                                                                key={cpt.id}
                                                                href={route('admin.content-types.edit', cpt.id)}
                                                                title={`Editar estructura de ${cpt.name}`}
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-brand-primary hover:text-brand-primary dark:border-slate-700/80 dark:bg-[#1b222c] dark:text-slate-300 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                                                            >
                                                                {renderCptIcon(cpt.icon)}
                                                                <span>{cpt.name}</span>
                                                                {cpt.is_public ? (
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Público" />
                                                                ) : (
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" title="Privado" />
                                                                )}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs italic text-slate-400 dark:text-slate-500">
                                                        Sin CPTs asignados
                                                    </span>
                                                )}
                                            </td>

                                            {/* Contador / Telemetría Toggle */}
                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    disabled={togglingTelemetryId === user.id}
                                                    onClick={() => handleToggleTelemetry(user)}
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                                        user.has_telemetry
                                                            ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400'
                                                            : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:bg-[#1c222e] dark:text-slate-400'
                                                    }`}
                                                    title="Clic para cambiar el estado del contador de visitas"
                                                >
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${
                                                            user.has_telemetry
                                                                ? 'animate-pulse bg-emerald-500'
                                                                : 'bg-slate-400'
                                                        }`}
                                                    />
                                                    <span>{user.has_telemetry ? 'Activo' : 'Desactivado'}</span>
                                                </button>
                                            </td>

                                            {/* Publicaciones Totales */}
                                            <td className="px-6 py-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                                                {user.contents_count || 0}
                                            </td>

                                            {/* Visitas */}
                                            <td className="px-6 py-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                                                {user.visits_count || 0}
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={route('admin.users.show', user.id)}
                                                        className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:text-brand-primary"
                                                        title="Ver detalle del cliente"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.users.edit', user.id)}
                                                        className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:text-brand-primary"
                                                        title="Editar usuario"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Link>
                                                    {user.id !== currentUserId && (
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(user)}
                                                            className="rounded-full border border-red-200/60 bg-red-50/50 p-2 text-red-600 transition hover:bg-red-100/80 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                                            title="Eliminar usuario"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Centinela y Feedback de Scroll Infinito */}
                        <div ref={sentinelRef} className="flex flex-col items-center justify-center gap-2 py-6">
                            {loadingMore && (
                                <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 shadow-sm dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400">
                                    <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                                    <span>Cargando más cuentas...</span>
                                </div>
                            )}
                            {!hasMore && userList.length > 0 && totalUsers > 15 && (
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Has llegado al final de los usuarios ({totalUsers} en total)
                                </p>
                            )}
                        </div>
                    </div>
            </div>

            {/* ── Modal Confirmar Eliminar Usuario ───────────────────────── */}
            <Modal show={Boolean(deletingUser)} onClose={() => setDeletingUser(null)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        ¿Eliminar Cuenta de Usuario?
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        ¿Estás seguro de que deseas eliminar la cuenta de <strong className="font-semibold text-slate-900 dark:text-white">{deletingUser?.name}</strong> ({deletingUser?.email})? Se perderán sus contenidos y accesos asociados. Esta acción no se puede deshacer.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeletingUser(null)}>
                            Cancelar
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>
                            Eliminar Cuenta
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

