import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Restablecer Contraseña — Panel de Administración" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
                    <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                    Nueva Contraseña
                </h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Introduce tu correo y la nueva clave que utilizarás para acceder.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Nueva Contraseña" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                        autoComplete="new-password"
                        isFocused={true}
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar Contraseña"
                        className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    />

                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1.5 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5 text-xs text-rose-500"
                    />
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center rounded-full py-2.5 text-sm font-semibold" disabled={processing}>
                        Restablecer Contraseña
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
