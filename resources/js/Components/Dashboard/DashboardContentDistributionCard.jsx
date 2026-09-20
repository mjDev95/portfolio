export default function DashboardContentDistributionCard({
    title = 'Distribución de Contenidos',
    badge = 'Publicados',
    total = 7,
    projectsCount = 3,
    postsCount = 4,
    categories = [],
}) {
    // 6 Pines verticales estilo Dumbbell chart representando las 6 categorías técnicas de la BD
    const defaultCategories = [
        { name: 'Desarrollo Web', count: 3 },
        { name: 'Diseño UI/UX', count: 1 },
        { name: 'Consultoría', count: 2 },
        { name: 'Arquitectura Cloud', count: 1 },
        { name: 'Tutoriales', count: 3 },
        { name: 'Buenas Prácticas', count: 2 },
    ];

    const categoryList = categories && categories.length > 0 ? categories.slice(0, 6) : defaultCategories;

    const pins = categoryList.map((cat, idx) => {
        const count = cat.count ?? cat.contents_count ?? 1;
        const isAccent = count >= 2;
        // Posiciones armónicas para el dumbbell
        const topPositions = ['20%', '35%', '15%', '30%', '20%', '25%'];
        const bottomPositions = ['80%', '65%', '85%', '70%', '80%', '75%'];
        return {
            name: cat.name,
            count,
            top: topPositions[idx % topPositions.length],
            bottom: bottomPositions[idx % bottomPositions.length],
            isAccent,
        };
    });

    return (
        <div className="flex flex-col justify-between rounded-[28px] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-[#161b24] border border-slate-100/90 dark:border-slate-800/80 overflow-hidden">
            {/* Header: Título y badge verde */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {title}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {badge}
                </span>
            </div>

            {/* Visualización Dumbbell Chart con Nodos Conectados y Tooltips */}
            <div className="my-3 flex h-20 items-center justify-between px-2">
                {pins.map((pin, i) => (
                    <div key={i} className="relative flex h-full flex-col items-center justify-center group">
                        {/* Barra vertical de fondo */}
                        <div className="h-16 w-0.5 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors group-hover:bg-brand-primary/40" />

                        {/* Nodo Superior */}
                        <div
                            style={{ top: pin.top }}
                            className={`absolute h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#161b24] transition-transform duration-200 group-hover:scale-125 ${
                                pin.isAccent
                                    ? 'bg-brand-primary'
                                    : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                        />

                        {/* Nodo Inferior */}
                        <div
                            style={{ top: pin.bottom }}
                            className={`absolute h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#161b24] transition-transform duration-200 group-hover:scale-125 ${
                                pin.isAccent
                                    ? 'bg-brand-primary'
                                    : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                        />

                        {/* Tooltip con nombre de categoría y conteo */}
                        <div className="absolute -top-7 hidden rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-md group-hover:block dark:bg-white dark:text-slate-900 z-10 whitespace-nowrap pointer-events-none">
                            {pin.name}: {pin.count}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fila Inferior: Leyenda Real a la izquierda y Gran Conteo Total a la derecha */}
            <div className="flex items-end justify-between gap-2 pt-1">
                <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                            Blog & Artículos ({postsCount})
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                            Proyectos & Casos ({projectsCount})
                        </span>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {total}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">total publicados</p>
                </div>
            </div>
        </div>
    );
}
