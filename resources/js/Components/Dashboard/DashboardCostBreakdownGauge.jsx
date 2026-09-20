import { Link } from '@inertiajs/react';

export default function DashboardCostBreakdownGauge({
    title = 'Almacenamiento de Medios',
    percentage = 28,
    amount = '55.3 MB',
    label = '58 archivos en biblioteca',
    badge = 'Optimizado',
    href,
}) {
    // Cálculo geométrico del semi-círculo SVG (radio 80, stroke 18)
    const radius = 70;
    const strokeWidth = 16;
    const circumference = Math.PI * radius; // Longitud del semicírculo
    const strokeDashoffset = circumference - (circumference * Math.min(Math.max(percentage, 5), 100)) / 100;

    const content = (
        <div className="flex flex-col justify-between rounded-[28px] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-[#161b24] border border-slate-100/80 dark:border-slate-800/80 overflow-hidden">
            {/* Header: Título y badge verde de porcentaje */}
            <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                    {title}
                </h3>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {badge}
                </span>
            </div>

            {/* Gauge Semi-Circular SVG */}
            <div className="relative my-3 flex flex-col items-center justify-center pt-2">
                <svg
                    className="w-full max-w-[192px] h-28 overflow-visible"
                    viewBox="0 0 180 100"
                >
                    {/* Arco de Fondo */}
                    <path
                        d="M 20 90 A 70 70 0 0 1 160 90"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        className="text-slate-100 dark:text-[#232a38]"
                    />

                    {/* Arco de Progreso con el color de marca dinámico */}
                    <path
                        d="M 20 90 A 70 70 0 0 1 160 90"
                        fill="none"
                        stroke="var(--brand-primary, #5e5ce6)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Gran Cifra Central y Etiqueta */}
                <div className="-mt-12 text-center">
                    <span className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        {amount}
                    </span>
                    <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {label}
                    </p>
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block transition hover:opacity-95" title="Ir a Biblioteca de Medios">
                {content}
            </Link>
        );
    }

    return content;
}

