import { Link } from '@inertiajs/react';
import { Images } from 'lucide-react';

export default function DashboardRecentMedia({ recentMedia = [] }) {
    return (
        <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126]">
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Images className="h-5 w-5 text-brand-primary" />
                        <h2 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                            Tus Medios Recientes
                        </h2>
                    </div>
                    <Link href={route('admin.media.index')} className="text-sm font-semibold text-brand-primary hover:underline">
                        Biblioteca &rarr;
                    </Link>
                </div>

                <div className="mt-5">
                    {!recentMedia || recentMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Images className="h-8 w-8 text-[#95aac9] dark:text-[#a7a6a8]" />
                            <p className="mt-2 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                                No hay imágenes subidas recientemente.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {recentMedia.map((m) => (
                                <Link
                                    key={m.id}
                                    href={route('admin.media.index')}
                                    className="group relative aspect-square overflow-hidden rounded-xl bg-[#f5f7fa] transition hover:ring-2 hover:ring-brand-primary dark:bg-[#16191c]"
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

