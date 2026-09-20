import { useState } from 'react';
import { Eye, Pen, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';

export default function DashboardMarketDemandChart({
    title = 'Demanda de Especialidades Técnicas',
    clientName = 'Administrador',
    badgeClient = 'Creative Developer',
    growth = '+34%',
    categories: propCategories = [],
    onViewAll,
}) {
    const defaultCategories = [
        { id: 'Desarrollo Web', label: 'Desarrollo Web' },
        { id: 'Diseño UI/UX', label: 'Diseño UI/UX' },
        { id: 'Consultoría', label: 'Consultoría' },
        { id: 'Arquitectura Cloud', label: 'Arquitectura Cloud' },
        { id: 'Tutoriales', label: 'Tutoriales' },
        { id: 'Buenas Prácticas', label: 'Buenas Prácticas' },
    ];

    const categories = propCategories.length > 0
        ? propCategories.map((c) => ({ id: c.name || c.id, label: c.name || c.label }))
        : defaultCategories;

    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'Desarrollo Web');
    const [selectedPeriod, setSelectedPeriod] = useState('2026 Q1');

    // Iniciales reales del usuario
    const initials = clientName
        ? clientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    // Gráfica de barras de demanda por mes/periodo
    const periods = [
        { name: 'Ene', height: '52%', isHighlight: false },
        { name: 'Feb', height: '88%', isHighlight: true },
        { name: 'Mar', height: '64%', isHighlight: false },
        { name: 'Abr', height: '76%', isHighlight: false },
    ];

    return (
        <div className="dashboard-details-right flex flex-col justify-between rounded-[28px] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-[#161b24] border border-slate-100/80 dark:border-slate-800/80">
            {/* Header: Título y botón Ver Todo */}
            <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    {title}
                </h3>
                <a
                    href="#contents-section"
                    onClick={onViewAll}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                    Ver Todo
                </a>
            </div>

            {/* Barra Intermedia: Creador/Perfil + Controles */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800/80">
                {/* Perfil del Especialista */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm shadow-md ring-2 ring-slate-100 dark:ring-slate-800">
                        {initials}
                    </div>
                    <div>
                        <span className="inline-block rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                            {badgeClient}
                        </span>
                        <p className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                            {clientName}
                        </p>
                    </div>
                </div>

                {/* Controles: Indicador de Métrica y Periodo */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-[#202735] dark:text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                        Métrica de Demanda
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-[#202735] dark:text-slate-300">
                        {selectedPeriod}
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                </div>
            </div>

            {/* Pestañas de Subcategoría Técnica */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                                isActive
                                    ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/30'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#202735] dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
                            }`}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Gran Gráfica de Barras Anchas con Esquinas Redondeadas */}
            <div className="relative mt-6 flex h-60 items-end justify-between gap-4 pt-8">
                {periods.map((m, idx) => (
                    <div key={idx} className="relative flex flex-1 flex-col items-center h-full justify-end">
                        {/* Etiqueta flotante del mes con flecha */}
                        <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {m.name} ↗
                        </div>

                        {/* Barra ancha con esquinas ultra redondeadas */}
                        <div
                            style={{ height: m.height }}
                            className={`w-full rounded-t-[28px] transition-all duration-500 ${
                                m.isHighlight
                                    ? 'bg-brand-primary shadow-lg shadow-brand-primary/25'
                                    : 'bg-[#f0f3f7] hover:bg-slate-200 dark:bg-[#202735] dark:hover:bg-[#293244]'
                            }`}
                        />

                        {/* Floating Dark Card sobre la barra activa */}
                        {m.isHighlight && (
                            <div className="absolute -left-12 bottom-4 z-10 hidden rounded-2xl bg-[#111827] p-3.5 text-white shadow-xl dark:bg-black sm:block">
                                <p className="text-[11px] font-medium text-slate-400">
                                    {activeCategory}
                                </p>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <span className="font-heading text-xl font-extrabold text-white">
                                        {growth}
                                    </span>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                                        ↑
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

