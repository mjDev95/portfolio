import { Link } from '@inertiajs/react';
import { Images } from 'lucide-react';

export default function DashboardRecentMedia({ recentMedia = [] }) {
    return (
        <div className="flex flex-col justify-between rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#161b24] border border-slate-100/90 dark:border-slate-800/80 overflow-hidden">
            <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                        <Images className="h-5 w-5 text-brand-primary" />
                        <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                            Medios Recientes
                        </h2>
                    </div>
                    <Link
                        href={route('admin.media.index')}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white shadow-xs"
                    >
                        Biblioteca &rarr;
                    </Link>
                </div>

                <div className="mt-5">
                    {!recentMedia || recentMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Images className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                No hay imágenes subidas recientemente.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {recentMedia.map((m) => (
                                <Link
                                    key={m.id}
                                    href={route('admin.media.index')}
                                    className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/50 transition hover:ring-2 hover:ring-brand-primary dark:bg-[#202735] dark:ring-slate-800"
                                >
                                    <img
                                        src={m.thumbnail_url || m.url}
                                        alt={m.alt || m.file_name}
                                        title={m.title || m.file_name}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

