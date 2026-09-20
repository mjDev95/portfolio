import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Shield, ExternalLink, Users, Plus } from 'lucide-react';
import DashboardMetrics from '@/Components/Dashboard/DashboardMetrics';
import DashboardClientsTable from '@/Components/Dashboard/DashboardClientsTable';
import DashboardQuickActions from '@/Components/Dashboard/DashboardQuickActions';
import DashboardTrafficChart from '@/Components/Dashboard/DashboardTrafficChart';
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

    return (
        <>
            <Head title={isAdmin ? 'Panel — Admin' : 'Dashboard — Admin'} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* ── A. Header y Acciones Globales ───────────────────────────── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-heading text-2xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff] sm:text-3xl">
                                    {isAdmin ? 'Panel de Administración' : 'Resumen General'}
                                </h1>
                            </div>
                            
                        </div>

                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <>
                                    <Link
                                        href={route('admin.users.index')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#293951] shadow-sm transition hover:bg-[#ebf1f7] hover:text-brand-secondary dark:bg-[#1e2126] dark:text-[#ffffff] dark:hover:bg-[#282d35]"
                                    >
                                        <Users className="h-4 w-4 text-brand-secondary" />
                                        Gestionar Usuarios
                                    </Link>
                                    <Link
                                        href={route('admin.content-types.create')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Nuevo CPT
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── B. Tarjetas de Métricas (KPIs) ───────────────────────────── */}
                    <DashboardMetrics isAdmin={isAdmin} stats={stats} usersList={usersList} />

                    {/* ── C. SECCIÓN EXCLUSIVA DE SUPER ADMIN: Gestión de Clientes y CPTs ── */}
                    {isAdmin && (
                        <DashboardClientsTable
                            usersList={usersList}
                            currentUser={user}
                            togglingTelemetryId={togglingTelemetryId}
                            onToggleTelemetry={handleToggleTelemetry}
                        />
                    )}

                    {/* ── D. Quick Action Cards del Super Admin ───────────────────── */}
                    {isAdmin && <DashboardQuickActions />}

                    {/* ── E. Métricas Gráficas y Medios Recientes ───────────────── */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <DashboardTrafficChart isAdmin={isAdmin} chartData={chartData} />
                        <DashboardRecentMedia recentMedia={recentMedia} />
                    </div>

                    {/* ── F. Publicaciones Recientes ────────────────────────────── */}
                    <DashboardRecentContents isAdmin={isAdmin} contents={contents} />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
