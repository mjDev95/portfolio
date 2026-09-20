import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { ShieldCheck, Users, Boxes, Activity, ArrowRight, CheckCircle2, XCircle, Palette } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    return (
        <>
            <Head title="Perfil — Admin" />

            <div className="w-full space-y-6">
                    <div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            Perfil de {isAdmin ? 'Super Administrador' : 'Usuario'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Gestiona tus credenciales, revisa tus privilegios y configuración de cuenta.
                        </p>
                    </div>

                    {/* Account Privileges & Roles Card */}
                    <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                                    isAdmin 
                                        ? 'bg-brand-primary/10 text-brand-primary' 
                                        : 'bg-brand-secondary/10 text-brand-secondary'
                                }`}>
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            Privilegios de Cuenta
                                        </h2>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            isAdmin 
                                                ? 'bg-brand-primary/15 text-brand-primary' 
                                                : 'bg-brand-secondary/10 text-brand-secondary'
                                        }`}>
                                            {isAdmin ? 'Super Administrador' : (user?.role_name || 'Cliente')}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {isAdmin
                                            ? 'Cuentas con control total sobre la plataforma: gestión de usuarios, asignación de CPTs y telemetría de visitas.'
                                            : 'Cuenta de cliente con acceso a su catálogo personal de publicaciones y portafolio.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Account Status Indicator */}
                                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#f8f9fb] px-4 py-2.5 dark:border-slate-800 dark:bg-[#12161f]">
                                    <ShieldCheck className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <div className="text-xs">
                                        <span className="block text-slate-400 dark:text-slate-500">Estado de Acceso:</span>
                                        <span className="flex items-center gap-1 font-medium">
                                            {user?.is_active ? (
                                                <>
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-emerald-600 dark:text-emerald-400">Activo (Al Día)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                                                    <span className="text-red-600 dark:text-red-400">Pausado (401)</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Telemetry Indicator */}
                                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#f8f9fb] px-4 py-2.5 dark:border-slate-800 dark:bg-[#12161f]">
                                    <Activity className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <div className="text-xs">
                                        <span className="block text-slate-400 dark:text-slate-500">Servicio de Telemetría:</span>
                                        <span className="flex items-center gap-1 font-medium">
                                            {user?.has_telemetry ? (
                                                <>
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-emerald-600 dark:text-emerald-400">Contador Activo</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="text-gray-500 dark:text-gray-400">Desactivado</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Action Shortcuts */}
                        {isAdmin && (
                            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Accesos Rápidos de Administración
                                </h3>
                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <Link
                                        href="/admin/users"
                                        className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 transition-all hover:border-slate-200 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-[#12161f] dark:hover:border-slate-700/60 dark:hover:bg-[#1c222e]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    Gestión de Usuarios
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    Asignar CPTs y visitas
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 dark:text-slate-500" />
                                    </Link>

                                    <Link
                                        href="/admin/content-types"
                                        className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 transition-all hover:border-slate-200 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-[#12161f] dark:hover:border-slate-700/60 dark:hover:bg-[#1c222e]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
                                                <Boxes className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    Tipos de Contenido (CPTs)
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    Definir estructuras y slugs
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 dark:text-slate-500" />
                                    </Link>

                                    <Link
                                        href={route('admin.brand.index')}
                                        className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 transition-all hover:border-slate-200 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-[#12161f] dark:hover:border-slate-700/60 dark:hover:bg-[#1c222e]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                                                <Palette className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    Identidad Corporativa
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    Paletas, tipografía y tokens
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 dark:text-slate-500" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
        </>
    );
}

Edit.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
