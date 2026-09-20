import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Mail, Trash2, Eye } from 'lucide-react';

export default function Index({ messages }) {
    const destroy = (message) => {
        if (confirm(`¿Eliminar mensaje de "${message.name}"?`)) {
            router.delete(route('admin.messages.destroy', message.id));
        }
    };

    return (
        <>
            <Head title="Mensajes — Admin" />

            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                Bandeja de Mensajes
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Prospectos y consultas recibidas a través del formulario de contacto.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[28px] border border-slate-100/90 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100/80 text-left text-sm dark:divide-slate-800/60">
                                <thead className="border-b border-slate-100 bg-[#f8f9fb] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Remitente</th>
                                        <th scope="col" className="px-6 py-4">Email</th>
                                        <th scope="col" className="px-6 py-4">Presupuesto</th>
                                        <th scope="col" className="px-6 py-4">Fecha</th>
                                        <th scope="col" className="px-6 py-4">Estado</th>
                                        <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                                    {messages.data.map((message) => (
                                        <tr key={message.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-[#1c222e]/60">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 font-heading text-xs font-bold text-brand-primary ring-1 ring-brand-primary/20">
                                                        {message.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <Link
                                                        href={route('admin.messages.show', message.id)}
                                                        className="font-heading font-semibold text-slate-900 hover:text-brand-primary hover:underline dark:text-white dark:hover:text-brand-primary"
                                                    >
                                                        {message.name}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {message.email}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {message.budget_range ? (
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/60 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700/60">
                                                        {message.budget_range}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                {message.created_at}
                                            </td>
                                            <td className="px-6 py-4">
                                                {message.read_at ? (
                                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700/60">
                                                        Leído
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        Nuevo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('admin.messages.show', message.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:text-brand-primary"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Ver
                                                    </Link>
                                                    <button
                                                        onClick={() => destroy(message)}
                                                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200/60 bg-red-50/50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100/80 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {messages.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
                                                <Mail className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                                                No hay mensajes en la bandeja todavía.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {messages.links && messages.links.length > 3 && (
                        <div className="mt-6 flex justify-center gap-1.5">
                            {messages.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                                        link.active
                                            ? 'bg-brand-primary text-white shadow-sm'
                                            : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-[#161b24] dark:text-slate-400 dark:hover:bg-[#202735] dark:hover:text-white'
                                    } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
