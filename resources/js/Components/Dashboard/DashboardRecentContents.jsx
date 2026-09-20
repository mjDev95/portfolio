import { Link } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';
import CptIcon from '@/Components/Dashboard/CptIcon';

export default function DashboardRecentContents({ isAdmin, contents = [] }) {
    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1e2126]">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h2 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                        Tus Publicaciones Recientes
                    </h2>
                    <p className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                        Últimos contenidos gestionados en tus CPTs asignados.
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#f5f7fa] text-left text-sm dark:divide-[#16191c]">
                    <thead className="bg-[#f5f7fa] text-xs font-semibold uppercase tracking-wider text-[#95aac9] dark:bg-[#16191c] dark:text-[#a7a6a8]">
                        <tr>
                            <th scope="col" className="py-4 pl-6 pr-3">Título</th>
                            <th scope="col" className="px-3 py-4">Tipo CPT</th>
                            <th scope="col" className="px-3 py-4">Fecha</th>
                            <th scope="col" className="px-3 py-4">Estado</th>
                            <th scope="col" className="relative py-4 pl-3 pr-6">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f7fa] dark:divide-[#16191c]">
                        {contents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-base text-[#95aac9] dark:text-[#a7a6a8]">
                                    No hay publicaciones registradas todavía.
                                </td>
                            </tr>
                        ) : (
                            contents.map((item) => (
                                <tr key={item.id} className="transition-colors hover:bg-[#f5f7fa] dark:hover:bg-[#16191c]">
                                    <td className="py-4 pl-6 pr-3">
                                        <div className="flex items-center gap-3.5">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#ebf1f7] dark:bg-[#16191c]">
                                                {item.thumbnail_url ? (
                                                    <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="h-4 w-4 text-[#95aac9] dark:text-[#a7a6a8]" />
                                                )}
                                            </div>
                                            <div>
                                                {item.content_type?.slug ? (
                                                    <Link
                                                        href={route('admin.content.edit', [item.content_type.slug, item.id])}
                                                        className="font-heading text-sm font-bold text-[#293951] hover:text-brand-primary dark:text-[#ffffff] dark:hover:text-brand-primary"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                ) : (
                                                    <span className="font-heading text-sm font-bold text-[#293951] dark:text-[#ffffff]">
                                                        {item.title}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#ebf1f7] px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-[#16191c] dark:text-brand-primary">
                                            <CptIcon name={item.content_type?.icon} />
                                            {item.content_type?.name || 'General'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                        {item.created_at}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                                item.status === 'published'
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                            }`}
                                        >
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

