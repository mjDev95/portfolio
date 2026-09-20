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
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#1e2126]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                            Clientes Registrados
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors dark:bg-brand-primary/20 dark:text-brand-primary">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff]">
                            {stats.users?.total ?? usersList.length}
                        </span>
                        <span className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">cuentas</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-3 text-sm">
                        <Link href={route('admin.users.index')} className="text-xs font-semibold text-brand-primary hover:underline">
                            Ver Directorio &rarr;
                        </Link>
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            {usersList.filter((u) => u.has_telemetry).length} con telemetría
                        </span>
                    </div>
                </div>
            ) : (
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#1e2126]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                            Mis Publicaciones
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors dark:bg-brand-primary/20 dark:text-brand-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff]">
                            {stats.contents?.total ?? 0}
                        </span>
                        <span className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">totales</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-3 text-sm">
                        <span className="text-[#95aac9] dark:text-[#a7a6a8]">
                            <strong className="text-emerald-600 dark:text-emerald-400">{stats.contents?.published ?? 0}</strong> publicados
                        </span>
                        <span className="inline-flex items-center rounded-lg bg-[#ebf1f7] px-2 py-0.5 font-medium text-[#293951] dark:bg-[#16191c] dark:text-[#a7a6a8]">
                            {stats.contents?.drafts ?? 0} borradores
                        </span>
                    </div>
                </div>
            )}

            {/* 2. Tipos de Contenido (CPT) - Rol SECUNDARIO */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#1e2126]">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                        Modelos CPT
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary transition-colors dark:bg-brand-secondary/20 dark:text-brand-secondary">
                        <Boxes className="h-5 w-5" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff]">
                        {stats.contentTypes?.total ?? 0}
                    </span>
                    <span className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">activos</span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 text-sm">
                    {isAdmin ? (
                        <Link href={route('admin.content-types.index')} className="text-xs font-semibold text-brand-secondary hover:underline">
                            Estructura CPT &rarr;
                        </Link>
                    ) : (
                        <span className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">Asignados a tu cuenta</span>
                    )}
                    <span className="inline-flex items-center rounded-lg bg-brand-secondary/10 px-2 py-0.5 text-xs font-semibold text-brand-secondary">
                        Dinámicos
                    </span>
                </div>
            </div>

            {/* 3. Archivos Multimedia - Rol TERCIARIO */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#1e2126]">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                        Biblioteca de Medios
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-tertiary/10 text-brand-tertiary transition-colors dark:bg-brand-tertiary/20 dark:text-brand-tertiary">
                        <Images className="h-5 w-5" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff]">
                        {stats.media?.total ?? 0}
                    </span>
                    <span className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">archivos</span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 text-sm">
                    <span className="text-[#95aac9] dark:text-[#a7a6a8]">
                        <strong className="text-[#293951] dark:text-[#ffffff]">{formatBytes(stats.media?.totalSize ?? 0)}</strong> en uso
                    </span>
                    <Link href={route('admin.media.index')} className="text-xs font-semibold text-brand-tertiary hover:underline">
                        Explorar &rarr;
                    </Link>
                </div>
            </div>

            {/* 4. Vistas Totales - Rol ACENTO */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#1e2126]">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                        {isAdmin ? 'Vistas Globales' : 'Visitas Recibidas'}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent transition-colors dark:bg-brand-accent/20 dark:text-brand-accent">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff]">
                        {stats.traffic?.totalViews ?? stats.totalViews ?? 0}
                    </span>
                    <span className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">visitas</span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 text-sm">
                    <span className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">Cookieless</span>
                    <span className="inline-flex items-center rounded-lg bg-brand-accent/10 px-2 py-0.5 text-xs font-semibold text-brand-accent">
                        {stats.traffic?.growthPercentage ?? '+0.0%'}
                    </span>
                </div>
            </div>
        </div>
    );
}

