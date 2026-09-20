import { Link } from '@inertiajs/react';
import { Users, FileText, Boxes, Images, TrendingUp } from 'lucide-react';

export default function DashboardMetrics({ isAdmin, stats = {}, usersList = [] }) {
    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Usuarios / Clientes (Admin) o Publicaciones (Cliente) */}
            {isAdmin ? (
                <div className="group relative overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Clientes Registrados
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-colors dark:bg-brand-primary/20 dark:text-brand-primary">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {stats.users?.total ?? usersList.length}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">cuentas</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3 text-sm dark:border-slate-800/60">
                        <Link href={route('admin.users.index')} className="text-xs font-semibold text-brand-primary hover:underline">
                            Ver Directorio &rarr;
                        </Link>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            {usersList.filter((u) => u.has_telemetry).length} con telemetría
                        </span>
                    </div>
                </div>
            ) : (
                <div className="group relative overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Mis Publicaciones
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-colors dark:bg-brand-primary/20 dark:text-brand-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {stats.contents?.total ?? 0}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">totales</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3 text-sm dark:border-slate-800/60">
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.contents?.published ?? 0}</strong> publicados
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {stats.contents?.drafts ?? 0} borradores
                        </span>
                    </div>
                </div>
            )}

            {/* 2. Tipos de Contenido (CPT) - Rol SECUNDARIO */}
            <div className="group relative overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Modelos CPT
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary transition-colors dark:bg-brand-secondary/20 dark:text-brand-secondary">
                        <Boxes className="h-5 w-5" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {stats.contentTypes?.total ?? 0}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">activos</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3 text-sm dark:border-slate-800/60">
                    {isAdmin ? (
                        <Link href={route('admin.content-types.index')} className="text-xs font-semibold text-brand-secondary hover:underline">
                            Estructura CPT &rarr;
                        </Link>
                    ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">Asignados a tu cuenta</span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-brand-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-secondary">
                        Dinámicos
                    </span>
                </div>
            </div>

            {/* 3. Archivos Multimedia - Rol TERCIARIO */}
            <div className="group relative overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Biblioteca de Medios
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-tertiary/10 text-brand-tertiary transition-colors dark:bg-brand-tertiary/20 dark:text-brand-tertiary">
                        <Images className="h-5 w-5" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {stats.media?.total ?? 0}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">archivos</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3 text-sm dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                        <strong className="text-slate-900 dark:text-white font-semibold">{formatBytes(stats.media?.totalSize ?? 0)}</strong> en uso
                    </span>
                    <Link href={route('admin.media.index')} className="text-xs font-semibold text-brand-tertiary hover:underline">
                        Explorar &rarr;
                    </Link>
                </div>
            </div>

            {/* 4. Vistas Totales - Rol ACENTO */}
            <div className="group relative overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {isAdmin ? 'Vistas Globales' : 'Visitas Recibidas'}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent transition-colors dark:bg-brand-accent/20 dark:text-brand-accent">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {stats.traffic?.totalViews ?? stats.totalViews ?? 0}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">visitas</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3 text-sm dark:border-slate-800/60">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Cookieless</span>
                    <span className="inline-flex items-center rounded-full bg-brand-accent/10 px-2.5 py-0.5 text-xs font-semibold text-brand-accent">
                        {stats.traffic?.growthPercentage ?? '+0.0%'}
                    </span>
                </div>
            </div>
        </div>
    );
}

