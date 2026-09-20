import { Link } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';
import CptIcon from '@/Components/Dashboard/CptIcon';

export default function DashboardRecentContents({ isAdmin, contents = [] }) {
    return (
        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm dark:bg-[#161b24] border border-slate-100/90 dark:border-slate-800/80">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        Publicaciones Recientes
                    </h2>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Últimos casos de estudio y artículos gestionados en el portafolio.
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm dark:divide-slate-800/80">
                    <thead className="bg-[#f8f9fb] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-[#12161f] dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th scope="col" className="py-3.5 pl-6 pr-3">Título</th>
                            <th scope="col" className="px-3 py-3.5">Tipo CPT</th>
                            <th scope="col" className="px-3 py-3.5">Fecha</th>
                            <th scope="col" className="px-3 py-3.5">Estado</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-6">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                        {contents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                                    No hay publicaciones registradas todavía.
                                </td>
                            </tr>
                        ) : (
                            contents.map((item) => (
                                <tr key={item.id} className="transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-[#1c222e]/60">
                                    <td className="py-4 pl-6 pr-3">
                                        <div className="flex items-center gap-3.5">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-[#202735] ring-1 ring-slate-200/50 dark:ring-slate-800">
                                                {item.thumbnail_url ? (
                                                    <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                )}
                                            </div>
                                            <div>
                                                {item.content_type?.slug ? (
                                                    <Link
                                                        href={route('admin.content.edit', [item.content_type.slug, item.id])}
                                                        className="font-heading text-sm font-bold text-slate-900 hover:text-brand-primary dark:text-white dark:hover:text-brand-primary"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                ) : (
                                                    <span className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                                                        {item.title}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-[#202735] dark:text-slate-300">
                                            <CptIcon name={item.content_type?.icon} />
                                            {item.content_type?.name || 'General'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 font-mono text-xs text-slate-400 dark:text-slate-500">
                                        {item.created_at}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                item.status === 'published'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20'
                                            }`}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            {item.status === 'published' ? 'Publicado' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                                        {item.content_type?.slug && (
                                            <Link
                                                href={route('admin.content.edit', [item.content_type.slug, item.id])}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                                            >
                                                Editar &rarr;
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

