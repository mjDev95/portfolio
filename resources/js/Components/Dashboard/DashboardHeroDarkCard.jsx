import { Link } from '@inertiajs/react';
import { MessageSquare, ChevronDown } from 'lucide-react';

export default function DashboardHeroDarkCard({
    title = 'Leads & Mensajes',
    subtitle = 'Bandeja de Contacto',
    total = 0,
    unread = 0,
    growth = '+12%',
    href = route('admin.messages.index'),
}) {
    return (
        <div className="relative flex flex-col justify-between rounded-[28px] bg-[#172935] p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-[#0c101a] border border-[#1f3747] dark:border-slate-800/40 overflow-hidden">
            {/* Fila Superior: Ícono circular de mensaje + Etiqueta */}
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md">
                    <MessageSquare className="h-5 w-5 text-slate-200" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-300 truncate">
                        {subtitle}
                    </p>
                    <h4 className="text-xs font-semibold text-slate-300 truncate">
                        {title}
                    </h4>
                </div>
            </div>

            {/* Fila Central: Conteo Real de Mensajes / Leads */}
            <div className="my-6">
                <div className="flex items-baseline gap-2">
                    <span className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl 2xl:text-5xl truncate">
                        {total}
                    </span>
                    <span className="text-xs font-medium text-slate-400 shrink-0">recibidos</span>
                </div>
                {unread > 0 ? (
                    <p className="mt-1 text-xs font-bold text-amber-400">
                        ● {unread} {unread === 1 ? 'nuevo por responder' : 'nuevos por responder'}
                    </p>
                ) : (
                    <p className="mt-1 text-xs text-slate-400">
                        Bandeja al día
                    </p>
                )}
            </div>

            {/* Fila Inferior: Tendencia y Botón Dropdown hacia Mensajes */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>{growth}</span>
                    {unread > 0 ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                            !
                        </span>
                    ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                            ✓
                        </span>
                    )}
                    <span className="text-[10px] font-normal text-slate-400 ms-1">estado</span>
                </div>

                <Link
                    href={href}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    title="Ver todos los mensajes"
                >
                    <ChevronDown className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
