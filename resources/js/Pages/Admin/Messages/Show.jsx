import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Mail, DollarSign, Calendar, User } from 'lucide-react';

export default function Show({ message }) {
    const destroy = () => {
        if (confirm(`¿Eliminar mensaje de "${message.name}"?`)) {
            router.delete(route('admin.messages.destroy', message.id), {
                onSuccess: () => router.visit(route('admin.messages.index')),
            });
        }
    };

    return (
        <>
            <Head title={`Mensaje de ${message.name}`} />

            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                Mensaje de {message.name}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Detalles de la consulta y datos de contacto.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-6 rounded-[28px] border border-slate-100/90 bg-white p-7 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-9">
                        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 dark:border-slate-800 dark:bg-[#12161f]">
                                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <User className="h-4 w-4" />
                                    Nombre del cliente
                                </dt>
                                <dd className="mt-1.5 text-base font-semibold text-slate-900 dark:text-white">{message.name}</dd>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 dark:border-slate-800 dark:bg-[#12161f]">
                                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <Mail className="h-4 w-4" />
                                    Correo electrónico
                                </dt>
                                <dd className="mt-1.5 text-base font-semibold text-slate-900 dark:text-white">{message.email}</dd>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 dark:border-slate-800 dark:bg-[#12161f]">
                                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <DollarSign className="h-4 w-4" />
                                    Rango de presupuesto
                                </dt>
                                <dd className="mt-1.5 text-base font-semibold text-slate-900 dark:text-white">{message.budget_range ?? 'No especificado'}</dd>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 dark:border-slate-800 dark:bg-[#12161f]">
                                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <Calendar className="h-4 w-4" />
                                    Fecha de recepción
                                </dt>
                                <dd className="mt-1.5 font-mono text-base font-semibold text-slate-900 dark:text-white">{message.created_at}</dd>
                            </div>
                        </dl>

                        <div>
                            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Contenido del mensaje
                            </span>
                            <div className="mt-2.5 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-5 text-sm text-slate-800 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-200">
                                <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
                            <Link
                                href={route('admin.messages.index')}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-brand-primary dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver a la bandeja
                            </Link>
                            <button
                                onClick={destroy}
                                className="inline-flex items-center gap-2 rounded-full border border-red-200/60 bg-red-50/50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100/80 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar mensaje
                            </button>
                        </div>
                    </div>
                </div>
        </>
    );
}

Show.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
