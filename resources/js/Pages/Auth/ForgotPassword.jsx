import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar Contraseña — Panel de Administración" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
                    <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                    Recuperar Contraseña
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu contraseña.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-2xl bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                        isFocused={true}
                        placeholder="tu-correo@ejemplo.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center rounded-full py-2.5 text-sm font-semibold" disabled={processing}>
                        Enviar Enlace de Recuperación
                    </PrimaryButton>
                </div>

                <div className="pt-2 text-center">
                    <Link
                        href={route('admin.login')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Volver al inicio de sesión</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
