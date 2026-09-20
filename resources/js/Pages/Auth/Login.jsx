import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheck, AlertCircle, Lock } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Check de consentimiento de cookies y almacenamiento en caché obligatorio
    const [consentAccepted, setConsentAccepted] = useState(true);

    const submit = (e) => {
        e.preventDefault();

        if (!consentAccepted) {
            return;
        }

        post(route('admin.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión — Panel de Administración" />

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <div className="mb-6 text-center">
                <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                    Acceso al Panel
                </h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Ingresa tus credenciales para administrar tus contenidos y preferencias.
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
                        isFocused={true}
                        placeholder="admin@ejemplo.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Contraseña" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" />
                        {canResetPassword && (
                            <Link
                                href={route('admin.password.request')}
                                className="text-xs font-medium text-brand-primary hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                </div>

                {/* ── Check 1: Recordarme (Remember me) ── */}
                <div className="pt-1">
                    <label className="flex cursor-pointer items-center gap-2.5">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f]"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Recordar sesión en este dispositivo
                        </span>
                    </label>
                </div>

                {/* ── Check 2: Consentimiento de cookies y caché obligatorio ── */}
                <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-3.5 dark:border-slate-800 dark:bg-[#12161f]">
                    <label className="flex cursor-pointer items-start gap-2.5">
                        <Checkbox
                            name="consent_cache_cookies"
                            checked={consentAccepted}
                            onChange={(e) => setConsentAccepted(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary dark:border-slate-700 dark:bg-[#161b24]"
                        />
                        <div className="text-xs">
                            <span className="font-semibold text-slate-900 dark:text-white">
                                Consentimiento de cookies esenciales y caché
                            </span>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                Acepto el almacenamiento seguro de sesión y la memoria caché para autenticarme de forma protegida.
                            </p>
                        </div>
                    </label>

                    {!consentAccepted && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>Debes aceptar este consentimiento para habilitar el inicio de sesión.</span>
                        </div>
                    )}
                </div>

                {/* ── Botón de Iniciar Sesión ── */}
                <div className="pt-2">
                    <PrimaryButton
                        className={`w-full justify-center rounded-full py-2.5 text-sm font-semibold transition ${
                            !consentAccepted
                                ? 'cursor-not-allowed bg-slate-400 opacity-60 hover:bg-slate-400 dark:bg-slate-700'
                                : 'bg-brand-primary hover:bg-brand-primary-hover'
                        }`}
                        disabled={processing || !consentAccepted}
                    >
                        {processing ? (
                            <span>Autenticando...</span>
                        ) : !consentAccepted ? (
                            <span className="flex items-center gap-1.5">
                                <Lock className="h-4 w-4" />
                                <span>Acepta el consentimiento</span>
                            </span>
                        ) : (
                            <span>Iniciar Sesión</span>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
