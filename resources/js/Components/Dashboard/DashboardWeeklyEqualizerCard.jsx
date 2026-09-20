export default function DashboardWeeklyEqualizerCard({
    title = 'Tráfico Semanal',
    subtitle,
    activityData = [],
    totalViews = 0,
    onViewAll,
}) {
    // Computar las 7 barras verticales reales basadas en activityData
    const items = activityData && activityData.length > 0 ? activityData : [
        { day: 'Lun', views: 0 },
        { day: 'Mar', views: 0 },
        { day: 'Mié', views: 0 },
        { day: 'Jue', views: 0 },
        { day: 'Vie', views: 0 },
        { day: 'Sáb', views: 0 },
        { day: 'Dom', views: 0 },
    ];

    const maxViews = Math.max(...items.map((d) => d.views || 0), 1);
    const maxIdx = items.reduce((maxI, el, i, arr) => (el.views > arr[maxI].views ? i : maxI), items.length - 1);

    const bars = items.map((item, idx) => {
        const heightPct = Math.max(Math.round(((item.views || 0) / maxViews) * 85), item.views > 0 ? 25 : 14);
        return {
            day: item.day || `D${idx + 1}`,
            views: item.views || 0,
            height: `${heightPct}%`,
            isHighlight: idx === maxIdx,
        };
    });

    const displaySubtitle = subtitle || `${totalViews} ${totalViews === 1 ? 'visita registrada' : 'visitas registradas'} en los últimos 7 días`;

    return (
        <div className="flex flex-col justify-between rounded-[28px] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-[#161b24] border border-slate-100/90 dark:border-slate-800/80 overflow-hidden">
            {/* Header: Barra vertical morada + Título + View All */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-brand-primary" />
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                        {title}
                    </h3>
                </div>

                <a
                    href="#traffic-section"
                    onClick={onViewAll}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                    Ver Todo
                </a>
            </div>

            {/* Subtítulo dinámico con telemetría real */}
            <div className="mt-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {displaySubtitle}
                </p>
            </div>

            {/* Barras verticales tipo Ecualizador / Soundwave */}
            <div className="mt-4 flex flex-col justify-end">
                <div className="flex h-20 items-end justify-between gap-2 px-1">
                    {bars.map((bar, idx) => (
                        <div key={idx} className="flex flex-1 items-end justify-center h-full group relative">
                            <div
                                style={{ height: bar.height }}
                                className={`w-full max-w-[12px] rounded-full transition-all duration-300 ${
                                    bar.isHighlight
                                        ? 'bg-brand-primary shadow-sm shadow-brand-primary/40'
                                        : 'bg-[#e8ecf2] dark:bg-[#252b37]'
                                }`}
                            />
                            {/* Tooltip con conteo exacto de visitas */}
                            <div className="absolute -top-7 hidden rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md group-hover:block dark:bg-white dark:text-slate-900 z-10 whitespace-nowrap pointer-events-none">
                                {bar.views} vistas
                            </div>
                        </div>
                    ))}
                </div>

                {/* Etiquetas de Días: Lun, Mar, Mié, etc. */}
                <div className="mt-2.5 flex items-center justify-between px-1">
                    {bars.map((bar, idx) => (
                        <span
                            key={idx}
                            className={`text-[10px] font-medium transition-colors ${
                                bar.isHighlight
                                    ? 'font-bold text-brand-primary'
                                    : 'text-slate-400 dark:text-slate-500'
                            }`}
                        >
                            {bar.day}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
