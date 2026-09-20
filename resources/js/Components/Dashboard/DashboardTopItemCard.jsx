import { Link } from '@inertiajs/react';
import { Boxes, FolderGit2, BookOpen, Images } from 'lucide-react';

export default function DashboardTopItemCard({
    title = 'Plataforma E-Commerce Headless',
    badge = 'Proyecto Destacado',
    subtitle = 'Caso de estudio con mayor interacción',
    onViewAll,
    href,
}) {
    return (
        <div className="flex flex-col justify-between rounded-[28px] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-[#161b24] border border-slate-100/80 dark:border-slate-800/80">
            {/* Header: Ícono púrpura y badge verde */}
            <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-md shadow-brand-primary/25">
                    <Boxes className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {badge}
                </span>
            </div>

            {/* Título de la tarjeta */}
            <div className="mt-4">
                <h3 className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white line-clamp-1">
                    {title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                    {subtitle}
                </p>
            </div>

            {/* Fila Inferior: Accesos directos a CPTs + Botón Ver Casos */}
            <div className="mt-5 flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                    <Link
                        href={route('admin.content.index', 'proyectos')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-[#202735] dark:text-slate-300"
                        title="Ir a Proyectos"
                    >
                        <FolderGit2 className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('admin.content.index', 'blog')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-[#202735] dark:text-slate-300"
                        title="Ir a Blog"
                    >
                        <BookOpen className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('admin.media.index')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-[#202735] dark:text-slate-300"
                        title="Ir a Medios"
                    >
                        <Images className="h-4 w-4" />
                    </Link>
                </div>

                {href ? (
                    <Link
                        href={href}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white shadow-xs"
                    >
                        Ver Detalle
                    </Link>
                ) : (
                    <a
                        href="#contents-section"
                        onClick={onViewAll}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white shadow-xs"
                    >
                        Ver Casos
                    </a>
                )}
            </div>
        </div>
    );
}

