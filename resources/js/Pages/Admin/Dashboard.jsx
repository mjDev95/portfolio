import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Users,
    Plus,
    RotateCcw,
    SlidersHorizontal,
    Calendar,
    History,
    ChevronDown,
} from 'lucide-react';
import DashboardMetricOverviewCard from '@/Components/Dashboard/DashboardMetricOverviewCard';
import DashboardHeroDarkCard from '@/Components/Dashboard/DashboardHeroDarkCard';
import DashboardWeeklyEqualizerCard from '@/Components/Dashboard/DashboardWeeklyEqualizerCard';
import DashboardContentDistributionCard from '@/Components/Dashboard/DashboardContentDistributionCard';
import DashboardTopItemCard from '@/Components/Dashboard/DashboardTopItemCard';
import DashboardCostBreakdownGauge from '@/Components/Dashboard/DashboardCostBreakdownGauge';
import DashboardMarketDemandChart from '@/Components/Dashboard/DashboardMarketDemandChart';
import DashboardClientsTable from '@/Components/Dashboard/DashboardClientsTable';
import DashboardRecentMedia from '@/Components/Dashboard/DashboardRecentMedia';
import DashboardRecentContents from '@/Components/Dashboard/DashboardRecentContents';

export default function Dashboard({
    isAdmin: propIsAdmin,
    usersList = [],
    roles = [],
    stats = {},
    recentContents = [],
    recentMedia = [],
    recentMessages = [],
    analytics = [],
    activityData = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = typeof propIsAdmin === 'boolean' ? propIsAdmin : user?.role === 'admin';

    const [togglingTelemetryId, setTogglingTelemetryId] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showSystemDetails, setShowSystemDetails] = useState(false);

    const chartData = activityData && activityData.length > 0 ? activityData : analytics;
    const contents = recentContents || [];

    const handleToggleTelemetry = (targetUser) => {
        setTogglingTelemetryId(targetUser.id);
        router.patch(
            route('admin.users.telemetry', targetUser.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingTelemetryId(null),
            }
        );
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['stats', 'activityData', 'recentContents', 'recentMedia', 'recentMessages'],
            onFinish: () => setIsRefreshing(false),
        });
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 MB';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const unreadCount = stats.messages?.unread ?? 0;
    const mediaUsageMb = formatBytes(stats.media?.totalSize ?? 0);

    return (
        <>
            <Head title={isAdmin ? 'Overview — Admin' : 'Dashboard — Admin'} />

            <div className="dashboard-container space-y-7">
                {/* ── 1. Barra de Título de la Sección: Resumen del Negocio / Portafolio ── */}
                <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-heading text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Resumen del Portafolio
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Métricas de casos de estudio, blog, almacenamiento y telemetría en tiempo real
                        </p>
                    </div>

                    {/* Botones de Utilidad de la derecha (Historial, Personalizar, Recargar) */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <button
                            type="button"
                            onClick={() => setShowSystemDetails(!showSystemDetails)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-300"
                            title="Ver detalles del sistema"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            {showSystemDetails ? 'Ocultar Tablas' : 'Ver Tablas'}
                        </button>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-300 shadow-2xs"
                        >
                            <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-brand-primary' : ''}`} />
                            Actualizar Datos
                        </button>
                    </div>
                </div>

                {/* ── 2. Fila 1 de Métricas Bento Bento Grid ───────────────────── */}
                <div className="dashboard-metrics-grid grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Tarjeta 1: Proyectos Publicados (3 en BD) */}
                    <DashboardMetricOverviewCard
                        title="Proyectos Publicados"
                        value={stats.projects?.total ?? 3}
                        subtitle="Casos de estudio activos en el portafolio"
                        trend={`${stats.projects?.total ?? 3} activos`}
                        actionLabel="Ver Proyectos"
                        href={route('admin.content.index', 'proyectos')}
                    />

                    {/* Tarjeta 2: Bandeja de Contacto / Leads */}
                    <DashboardHeroDarkCard
                        title="Leads & Mensajes"
                        subtitle="Bandeja de Contacto"
                        total={stats.messages?.total ?? 0}
                        unread={unreadCount}
                        growth={unreadCount > 0 ? `${unreadCount} nuevos` : 'Al día'}
                        href={route('admin.messages.index')}
                    />

                    {/* Tarjeta 3: Tráfico Semanal (Soundwave Equalizer con datos reales) */}
                    <DashboardWeeklyEqualizerCard
                        title="Tráfico Semanal"
                        activityData={chartData}
                        totalViews={stats.traffic?.weeklyViews ?? 0}
                    />

                    {/* Tarjeta 4: Distribución de Contenido (Dumbbell chart con categorías de la BD) */}
                    <DashboardContentDistributionCard
                        title="Distribución de Contenidos"
                        total={stats.contents?.published ?? 7}
                        projectsCount={stats.projects?.total ?? 3}
                        postsCount={stats.posts?.total ?? 4}
                        categories={stats.categories || []}
                    />
                </div>

                {/* ── 3. Fila 2 de Métricas Bento ── */}
                <div className="dashboard-details-grid grid grid-cols-1 gap-6">
                    {/* Columna Izquierda: Proyecto Destacado + Almacenamiento en MB */}
                    <div className="dashboard-details-left flex flex-col gap-6">
                        {/* Proyecto Destacado */}
                        <DashboardTopItemCard
                            title={stats.topItem?.title || 'Plataforma E-Commerce Headless'}
                            badge={stats.topItem?.type || 'Proyecto Destacado'}
                            subtitle="Caso de estudio con mayor interacción"
                            href={stats.topItem ? route('admin.content.index', stats.topItem.type_slug) : route('admin.content.index', 'proyectos')}
                        />

                        {/* Almacenamiento de Medios Radial Gauge (MB reales) */}
                        <DashboardCostBreakdownGauge
                            title="Almacenamiento de Medios"
                            percentage={Math.min(Math.round(((stats.media?.totalSize ?? 0) / (200 * 1024 * 1024)) * 100), 100)}
                            amount={mediaUsageMb}
                            label={`${stats.media?.total ?? 0} archivos subidos`}
                            badge={`${stats.media?.total ?? 0} archivos`}
                            href={route('admin.media.index')}
                        />
                    </div>

                    {/* Columna Derecha: Demanda de Especialidades Técnicas */}
                    <DashboardMarketDemandChart
                        title="Demanda de Especialidades Técnicas"
                        clientName={user?.name || 'Administrador'}
                        badgeClient="Creative Developer & UI/UX"
                        growth="+34%"
                        categories={stats.categories || []}
                    />
                </div>

                {/* ── 4. Secciones Inferiores Expandibles / Tablas del Sistema ─── */}
                <div className="mt-8 space-y-8 border-t border-slate-200/80 pt-8 dark:border-slate-800/80">
                    {/* Si es Super Admin: Gestión de Clientes */}
                    {isAdmin && (
                        <div id="clients-section">
                            <DashboardClientsTable
                                usersList={usersList}
                                currentUser={user}
                                togglingTelemetryId={togglingTelemetryId}
                                onToggleTelemetry={handleToggleTelemetry}
                            />
                        </div>
                    )}

                    {/* Medios y Publicaciones Recientes */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-1" id="media-section">
                            <DashboardRecentMedia recentMedia={recentMedia} />
                        </div>
                        <div className="lg:col-span-2" id="contents-section">
                            <DashboardRecentContents isAdmin={isAdmin} contents={contents} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
