import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function DashboardMetricOverviewCard({
    title = 'Proyectos Publicados',
    value = 0,
    subtitle = 'Casos de estudio activos en el portafolio',
    trend = 'Activos',
    onAction,
    actionLabel = 'Ver Proyectos',
    href,
}) {
    const formatValue = (num) => {
        if (!num && num !== 0) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    const ActionWrapper = ({ children, className, title: itemTitle }) => {
        if (href) {
            return (
                <Link href={href} className={className} title={itemTitle}>
                    {children}
                </Link>
            );
        }
        return (
            <a href="#contents-section" onClick={onAction} className={className} title={itemTitle}>
                {children}
            </a>
        );
    };

    return (
        <div className="relative flex flex-col justify-between rounded-[28px] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-[#161b24] border border-slate-100/90 dark:border-slate-800/80">
            {/* Header: Título de la métrica */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {title}
                </span>
                {trend && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {trend}
                    </span>
                )}
            </div>

            {/* Gran Cifra Numérica + Botón Circular (>) */}
            <div className="my-5 flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                        {formatValue(value)}
                    </span>
                </div>
                <ActionWrapper
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform duration-200 hover:scale-105 hover:bg-slate-200 dark:bg-[#202735] dark:text-slate-300"
                    title="Ir a detalle"
                >
                    <ChevronRight className="h-4 w-4" />
                </ActionWrapper>
            </div>

            {/* Subtítulo y Botón Pill de Acción */}
            <div className="flex flex-col gap-3 pt-1">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 line-clamp-1">
                    {subtitle}
                </p>
                <div>
                    <ActionWrapper
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white shadow-xs"
                    >
                        {actionLabel}
                    </ActionWrapper>
                </div>
            </div>
        </div>
    );
}
