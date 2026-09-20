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

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#293951] dark:text-white sm:text-3xl">
                                Bandeja de Mensajes
                            </h1>
                            <p className="mt-1 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                                Prospectos y consultas recibidas a través del formulario de contacto.
                            </p>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1e2126]">
                        <table className="min-w-full divide-y divide-[#f5f7fa] text-left text-sm dark:divide-[#16191c]">
                            <thead className="bg-[#ebf1f7] text-sm font-semibold uppercase tracking-wider text-[#293951] dark:bg-[#16191c] dark:text-[#a7a6a8]">
                                <tr>
                                    <th scope="col" className="px-5 py-4">Remitente</th>
                                    <th scope="col" className="px-5 py-4">Email</th>
                                    <th scope="col" className="px-5 py-4">Presupuesto</th>
                                    <th scope="col" className="px-5 py-4">Fecha</th>
                                    <th scope="col" className="px-5 py-4">Estado</th>
                                    <th scope="col" className="px-5 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f5f7fa] dark:divide-[#16191c]">
                                {messages.data.map((message) => (
                                    <tr key={message.id} className="transition hover:bg-[#ebf1f7]/50 dark:hover:bg-[#16191c]/50">
                                        <td className="px-5 py-4 text-base font-semibold text-[#293951] dark:text-white">
                                            <Link href={route('admin.messages.show', message.id)} className="hover:underline">
                                                {message.name}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-4 text-base text-[#95aac9] dark:text-[#a7a6a8]">{message.email}</td>
                                        <td className="px-5 py-4 text-base text-[#95aac9] dark:text-[#a7a6a8]">
                                            {message.budget_range ? (
                                                <span className="rounded-lg bg-[#ebf1f7] px-2.5 py-1 text-sm font-semibold text-[#293951] dark:bg-[#16191c] dark:text-white">
                                                    {message.budget_range}
                                                </span>
                                            ) : (
                                                <span className="text-[#95aac9] dark:text-[#a7a6a8]">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 font-mono text-sm text-[#95aac9] dark:text-[#a7a6a8]">{message.created_at}</td>
                                        <td className="px-5 py-4">
                                            {message.read_at ? (
                                                <span className="inline-flex items-center rounded-lg bg-[#ebf1f7] px-2.5 py-1 text-sm font-semibold text-[#95aac9] dark:bg-[#16191c] dark:text-[#a7a6a8]">
                                                    Leído
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                    Nuevo
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('admin.messages.show', message.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#95aac9] transition hover:bg-[#ebf1f7] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:bg-[#16191c] dark:hover:text-white"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Ver
                                                </Link>
                                                <button
                                                    onClick={() => destroy(message)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
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
                                        <td colSpan={6} className="py-16 text-center text-base text-[#95aac9] dark:text-[#a7a6a8]">
                                            <Mail className="mx-auto mb-3 h-10 w-10 text-[#95aac9]/40 dark:text-[#a7a6a8]/40" />
                                            No hay mensajes en la bandeja todavía.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {messages.links && messages.links.length > 3 && (
                        <div className="mt-6 flex justify-center gap-1.5">
                            {messages.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-xl px-3.5 py-1.5 text-sm font-medium transition ${
                                        link.active
                                            ? 'bg-brand-primary text-white shadow-sm'
                                            : 'bg-white text-[#95aac9] shadow-sm hover:bg-[#ebf1f7] hover:text-[#293951] dark:bg-[#1e2126] dark:text-[#a7a6a8] dark:hover:bg-[#16191c] dark:hover:text-white'
                                    } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
