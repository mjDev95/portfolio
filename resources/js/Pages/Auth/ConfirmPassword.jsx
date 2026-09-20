import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirmar Contraseña — Panel de Administración" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                    Área Protegida
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Por favor, confirma tu contraseña administrativa antes de continuar.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="password" value="Contraseña" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                        isFocused={true}
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center rounded-full py-2.5 text-sm font-semibold" disabled={processing}>
                        Confirmar Identidad
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
