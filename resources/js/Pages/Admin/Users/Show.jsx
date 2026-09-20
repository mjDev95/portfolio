import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Edit2,
    Shield,
    User,
    Mail,
    Calendar,
    Activity,
    Boxes,
    FileText,
    Image as ImageIcon,
    Eye,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    ExternalLink,
    Briefcase,
    BookOpen,
    Scale,
    Stethoscope,
    Award,
    Sparkles,
    FolderGit2,
    Layers,
    MessageSquare,
    PauseCircle,
    PlayCircle,
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

export default function Show({ client }) {
    const [togglingTelemetry, setTogglingTelemetry] = useState(false);

    const handleToggleTelemetry = () => {
        setTogglingTelemetry(true);
        router.patch(
            route('admin.users.telemetry', client.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingTelemetry(false),
            }
        );
    };

    const renderCptIcon = (iconName) => {
        const Icon = ICON_MAP[iconName] || FileText;
        return <Icon className="h-5 w-5" />;
    };

    return (
        <>
            <Head title={`Detalle de ${client.name} — Admin`} />

            <div className="w-full space-y-8">
                {/* Botón Volver */}
                    <div>
                        <Link
                            href={route('admin.users.index')}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver a Directorio de Usuarios</span>
                        </Link>
                    </div>

                    {/* ── Cabecera del Perfil de Cliente ───────────────────────── */}
                    <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-primary font-heading text-3xl font-bold text-white shadow-md">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                            {client.name}
                                        </h1>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${
                                                client.role === 'admin'
                                                    ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-primary'
                                                    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700/60'
                                            }`}
                                        >
                                            {client.role === 'admin' ? (
                                                <Shield className="h-3.5 w-3.5" />
                                            ) : (
                                                <User className="h-3.5 w-3.5" />
                                            )}
                                            {client.role_name}
                                        </span>

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${
                                                client.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400'
                                                    : 'bg-red-500/10 text-red-600 ring-1 ring-red-500/20 dark:text-red-400'
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    client.is_active ? 'bg-emerald-500' : 'bg-red-500'
                                                }`}
                                            />
                                            {client.is_active ? 'Activo' : 'Suspendido (401)'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-brand-primary" />
                                            {client.email}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Registrado el {client.created_at}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleToggleTelemetry}
                                    disabled={togglingTelemetry}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                                        client.has_telemetry
                                            ? 'bg-brand-accent/10 text-brand-accent ring-1 ring-brand-accent/20 hover:bg-brand-accent/20 dark:text-brand-accent'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-[#202735] dark:text-slate-400'
                                    }`}
                                    title="Alternar Telemetría"
                                >
                                    <Activity className="h-4 w-4" />
                                    <span>
                                        {client.has_telemetry
                                            ? 'Telemetría: Activa'
                                            : 'Telemetría: Inactiva'}
                                    </span>
                                </button>

                                <Link
                                    href={route('admin.users.edit', client.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    <span>Editar Cuenta</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ── Métricas y KPIs del Cliente ──────────────────────────── */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Total Contenidos
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                    <FileText className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-3 font-heading text-2xl font-bold text-slate-900 dark:text-white">
                                {client.stats.totalContents}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Publicados
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-3 font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {client.stats.published}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Borradores
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                                    <Clock className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-3 font-heading text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {client.stats.drafts}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Visitas Totales
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                    <Eye className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-3 font-heading text-2xl font-bold text-slate-900 dark:text-white">
                                {client.stats.totalVisits}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Archivos Media
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
                                    <ImageIcon className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-3 font-heading text-2xl font-bold text-slate-900 dark:text-white">
                                {client.stats.totalMedia}
                            </div>
                        </div>
                    </div>

                    {/* ── CPTs Asignados a este Cliente ────────────────────────── */}
                    <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                        <div className="border-b border-slate-100 pb-4 dark:border-slate-800/80">
                            <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Boxes className="h-5 w-5 text-brand-primary" />
                                <span>Tipos de Contenido Habilitados (CPTs)</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Esquemas a los que este cliente tiene acceso para gestionar sus publicaciones privadas.
                            </p>
                        </div>

                        {client.content_types && client.content_types.length > 0 ? (
                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {client.content_types.map((cpt) => (
                                    <div
                                        key={cpt.id}
                                        className="flex flex-col justify-between rounded-2xl border border-slate-100/80 bg-slate-50/60 p-5 transition hover:shadow-xs dark:border-slate-800/60 dark:bg-[#12161f]"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20">
                                                        {renderCptIcon(cpt.icon)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                                                            {cpt.name}
                                                        </h3>
                                                        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                                                            /{cpt.slug}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        cpt.is_public
                                                            ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400'
                                                            : 'bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {cpt.is_public ? 'Público' : 'Privado'}
                                                </span>
                                            </div>

                                            {cpt.description && (
                                                <p className="mt-3 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                                                    {cpt.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-5 flex items-center gap-2 border-t border-slate-200/60 pt-3 dark:border-slate-800">
                                            <Link
                                                href={`${route('admin.content.index', cpt.slug)}?client_id=${client.id}`}
                                                className="flex-1 text-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-brand-primary hover:text-brand-primary dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-300 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                                            >
                                                Ver Contenidos
                                            </Link>
                                            <Link
                                                href={route('admin.content-types.edit', cpt.id)}
                                                className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-400 dark:hover:text-brand-primary"
                                                title="Configuración de esquema"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-[#12161f]">
                                <Boxes className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Este cliente aún no tiene Tipos de Contenido asignados.
                                </p>
                                <Link
                                    href={route('admin.content-types.index')}
                                    className="mt-3 text-xs font-semibold text-brand-primary hover:underline"
                                >
                                    Ir a Tipos de Contenido para asignarle uno →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ── Publicaciones Recientes ──────────────────────────────── */}
                    <div className="overflow-hidden rounded-[28px] border border-slate-100/90 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800/80 flex items-center justify-between">
                            <div>
                                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                    Publicaciones Recientes del Cliente
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    Últimos contenidos creados o actualizados por esta cuenta.
                                </p>
                            </div>
                        </div>

                        {client.recent_contents && client.recent_contents.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100/80 text-left text-sm dark:divide-slate-800/60">
                                    <thead className="border-b border-slate-100 bg-[#f8f9fb] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400">
                                        <tr>
                                            <th scope="col" className="px-6 py-3.5">Contenido</th>
                                            <th scope="col" className="px-6 py-3.5">Tipo (CPT)</th>
                                            <th scope="col" className="px-6 py-3.5">Estado</th>
                                            <th scope="col" className="px-6 py-3.5">Fecha de Creación</th>
                                            <th scope="col" className="px-6 py-3.5 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                                        {client.recent_contents.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="transition-colors hover:bg-slate-50/80 dark:hover:bg-[#1c222e]/60"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20">
                                                            {renderCptIcon(item.content_type?.icon)}
                                                        </div>
                                                        <div>
                                                            <div className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                                                                {item.title}
                                                            </div>
                                                            <div className="font-mono text-xs text-slate-400 dark:text-slate-500">
                                                                {item.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700/80 dark:bg-[#1b222c] dark:text-slate-300">
                                                        {item.content_type?.name || 'CPT'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                            item.status === 'published'
                                                                ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400'
                                                                : 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400'
                                                        }`}
                                                    >
                                                        {item.status === 'published' ? 'Publicado' : 'Borrador'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(item.created_at).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={route('admin.content.edit', [
                                                            item.content_type?.slug,
                                                            item.id,
                                                        ])}
                                                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-brand-primary hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300"
                                                    >
                                                        <span>Editar</span>
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-sm text-slate-400 dark:text-slate-500">
                                    Este cliente aún no ha redactado ninguna publicación.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
        </>
    );
}

Show.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

