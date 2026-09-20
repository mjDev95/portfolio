import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MailCheck, LogOut } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verificar Correo — Panel de Administración" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
                    <MailCheck className="h-6 w-6" />
                </div>
                <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                    Verifica tu Correo
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    ¡Gracias por ser parte del sistema! Antes de continuar, verifica tu correo haciendo clic en el enlace que te hemos enviado.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-2xl bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Se ha enviado un nuevo enlace de verificación al correo electrónico registrado.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center rounded-full py-2.5 text-sm font-semibold" disabled={processing}>
                        Reenviar Correo de Verificación
                    </PrimaryButton>
                </div>

                <div className="pt-2 text-center">
                    <Link
                        href={route('admin.logout')}
                        method="post"
                        as="button"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Cerrar Sesión</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
