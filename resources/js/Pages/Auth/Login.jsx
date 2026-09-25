import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { applySuperAdminPalette } from '@/Support/brandTheme';
import { motion } from 'framer-motion';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [consentAccepted, setConsentAccepted] = useState(true);
    const [shakeKey, setShakeKey] = useState(0);

    // Restablecer la paleta a los valores de fábrica de la marca al cargar el login
    useEffect(() => {
        applySuperAdminPalette({
            primary: '#CB2128',
            secondary: '#DFB136',
            tertiary: '#1D4ED8',
            accent: '#F59E0B',
        });
    }, []);

    const submit = (e) => {
        e.preventDefault();

        if (!consentAccepted) {
            setShakeKey((prev) => prev + 1);
            return;
        }

        const loginUrl = typeof route === 'function' && route().has('admin.login.store')
            ? route('admin.login.store')
            : route('admin.login');

        post(loginUrl, {
            onFinish: () => reset('password'),
            onError: () => setShakeKey((prev) => prev + 1),
        });
    };

    return (
        <GuestLayout layoutId="admin-sidebar-container">
            <Head title="Iniciar Sesión — Panel de Administración" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    x:
                        shakeKey > 0
                            ? [-12, 12, -8, 8, -4, 4, 0]
                            : 0,
                }}
                transition={{
                    opacity: { duration: 0.2, delay: 0.1 },
                    x: { duration: 0.4, ease: 'easeInOut' },
                }}
            >
                {/* ── Notificación de Estado / Flash ── */}
                {status && (
                    <div className="mb-4 rounded-2xl bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {status}
                    </div>
                )}

                {/* ── Cabecera Bento de Login ── */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
                        <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
                    </div>
                    <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                        Acceso al Panel
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Ingresa tus credenciales para administrar tus contenidos y preferencias.
                    </p>
                </div>

                {/* ── Formulario de Inicio de Sesión ── */}
                <form onSubmit={submit} className="space-y-4">
                    {/* Campo Correo */}
                    <div>
                        <InputLabel
                            htmlFor="email"
                            value="Correo Electrónico"
                            className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1.5 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                            autoComplete="username"
                            isFocused={true}
                            placeholder="admin@portfolio.test"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                    </div>

                    {/* Campo Contraseña con Toggle */}
                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel
                                htmlFor="password"
                                value="Contraseña"
                                className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                            />
                            {canResetPassword && (
                                <Link
                                    href={route('admin.password.request')}
                                    className="text-xs font-medium text-brand-primary hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            )}
                        </div>
                        <div className="relative mt-1.5">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                    </div>

                    {/* Checkbox: Recordarme */}
                    <div className="pt-1">
                        <label className="flex cursor-pointer items-center gap-2.5 select-none">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded-md border-slate-300 text-brand-primary focus:ring-brand-primary/20 dark:border-slate-700 dark:bg-[#12161f]"
                            />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                Recordar sesión en este dispositivo
                            </span>
                        </label>
                    </div>

                    {/* Checkbox: Consentimiento de cookies y sesión (sin caja extra) */}
                    <div>
                        <label className="flex cursor-pointer items-start gap-2.5 select-none">
                            <input
                                type="checkbox"
                                name="consent"
                                checked={consentAccepted}
                                onChange={(e) => setConsentAccepted(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-brand-primary focus:ring-brand-primary/20 dark:border-slate-700 dark:bg-[#12161f]"
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Acepto cookies esenciales y almacenamiento de sesión.
                            </span>
                        </label>
                        {!consentAccepted && (
                            <p className="mt-1.5 text-xs text-amber-500">
                                Debes aceptar el consentimiento para iniciar sesión.
                            </p>
                        )}
                    </div>

                    {/* Botón Iniciar Sesión */}
                    <div className="pt-2">
                        <PrimaryButton
                            className={`w-full justify-center rounded-full py-2.5 text-sm font-semibold transition shadow-md shadow-brand-primary/20 ${
                                !consentAccepted
                                    ? 'cursor-not-allowed bg-slate-300 opacity-60 dark:bg-slate-700'
                                    : 'bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary'
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
            </motion.div>
        </GuestLayout>
    );
}
