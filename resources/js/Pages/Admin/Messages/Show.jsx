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

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#293951] dark:text-white sm:text-3xl">
                                Mensaje de {message.name}
                            </h1>
                            <p className="mt-1 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                                Detalles de la consulta y datos de contacto.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-6 rounded-2xl bg-white p-7 shadow-sm dark:bg-[#1e2126] sm:p-9">
                        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            <div className="rounded-xl bg-[#ebf1f7] p-4 dark:bg-[#16191c]">
                                <dt className="flex items-center gap-2 text-sm font-semibold text-[#95aac9] dark:text-[#a7a6a8]">
                                    <User className="h-4 w-4" />
                                    Nombre del cliente
                                </dt>
                                <dd className="mt-1.5 text-base font-semibold text-[#293951] dark:text-white">{message.name}</dd>
                            </div>
                            <div className="rounded-xl bg-[#ebf1f7] p-4 dark:bg-[#16191c]">
                                <dt className="flex items-center gap-2 text-sm font-semibold text-[#95aac9] dark:text-[#a7a6a8]">
                                    <Mail className="h-4 w-4" />
                                    Correo electrónico
                                </dt>
                                <dd className="mt-1.5 text-base font-semibold text-[#293951] dark:text-white">{message.email}</dd>
                            </div>
                            <div className="rounded-xl bg-[#ebf1f7] p-4 dark:bg-[#16191c]">
                                <dt className="flex items-center gap-2 text-sm font-semibold text-[#95aac9] dark:text-[#a7a6a8]">
                                    <DollarSign className="h-4 w-4" />
                                    Rango de presupuesto
                                </dt>
                                <dd className="mt-1.5 text-base font-semibold text-[#293951] dark:text-white">{message.budget_range ?? 'No especificado'}</dd>
                            </div>
                            <div className="rounded-xl bg-[#ebf1f7] p-4 dark:bg-[#16191c]">
                                <dt className="flex items-center gap-2 text-sm font-semibold text-[#95aac9] dark:text-[#a7a6a8]">
                                    <Calendar className="h-4 w-4" />
                                    Fecha de recepción
                                </dt>
                                <dd className="mt-1.5 font-mono text-base font-semibold text-[#293951] dark:text-white">{message.created_at}</dd>
                            </div>
                        </dl>

                        <div>
                            <span className="block text-sm font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                                Contenido del mensaje
                            </span>
                            <div className="mt-2.5 rounded-xl bg-[#ebf1f7] p-5 text-base text-[#293951] dark:bg-[#16191c] dark:text-white">
                                <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#f5f7fa] pt-6 dark:border-[#16191c]">
                            <Link
                                href={route('admin.messages.index')}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver a la bandeja
                            </Link>
                            <button
                                onClick={destroy}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20"
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar mensaje
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
