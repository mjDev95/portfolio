import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    Shield,
    User,
    Mail,
    Lock,
    Activity,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

export default function Form({ user = null, roles = [] }) {
    const isEditing = Boolean(user?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role_id: user?.role_id || (roles.find((r) => r.slug === 'user')?.id ?? 2),
        has_telemetry: Boolean(user ? user.has_telemetry : false),
        is_active: Boolean(user ? user.is_active : true),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.users.update', user.id));
        } else {
            post(route('admin.users.store'));
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing
                        ? `Editar Usuario: ${user.name} — Admin`
                        : 'Nuevo Usuario / Cliente — Admin'
                }
            />

            <div className="w-full space-y-6">
                    {/* Botón Volver */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.users.index')}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver a Usuarios y Clientes</span>
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Cabecera Principal */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                    {isEditing ? `Editar Usuario: ${user.name}` : 'Registrar Nuevo Usuario / Cliente'}
                                </h1>
                                <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
                                    {isEditing
                                        ? 'Actualiza las credenciales, rol y permisos de acceso para esta cuenta.'
                                        : 'Crea una nueva cuenta de cliente o administrador para el sistema.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('admin.users.index')}
                                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-200 dark:hover:text-white"
                                >
                                    Cancelar
                                </Link>
                                <PrimaryButton disabled={processing} className="gap-2 px-6 py-2.5">
                                    <Save className="h-4 w-4" />
                                    <span>{processing ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* Card: Información Básica y Credenciales */}
                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                            <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="h-5 w-5 text-brand-primary" />
                                    <span>Información de la Cuenta</span>
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Datos de identificación y credenciales de inicio de sesión.
                                </p>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Nombre */}
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="name" value="Nombre Completo *" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="ej. Juan Pérez o Estudio de Diseño"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                {/* Email */}
                                <div>
                                    <InputLabel htmlFor="email" value="Correo Electrónico *" />
                                    <div className="relative mt-1">
                                        <TextInput
                                            id="email"
                                            type="email"
                                            className="block w-full pl-10"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="cliente@ejemplo.com"
                                            required
                                        />
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                {/* Contraseña */}
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value={isEditing ? 'Contraseña (Opcional)' : 'Contraseña *'}
                                    />
                                    <div className="relative mt-1">
                                        <TextInput
                                            id="password"
                                            type="password"
                                            className="block w-full pl-10"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder={isEditing ? 'Dejar en blanco para conservar actual' : '••••••••'}
                                            required={!isEditing}
                                        />
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    {isEditing && (
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Solo escribe si deseas cambiar la clave de acceso.
                                        </p>
                                    )}
                                    <InputError message={errors.password} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Card: Rol y Permisos */}
                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                            <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-brand-primary" />
                                    <span>Rol y Nivel de Acceso</span>
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Define si la cuenta administrará la plataforma o funcionará como cliente aislado.
                                </p>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {roles.map((r) => {
                                        const isSelected = Number(data.role_id) === Number(r.id);
                                        const isAdminRole = r.slug === 'admin';

                                        return (
                                            <div
                                                key={r.id}
                                                onClick={() => setData('role_id', r.id)}
                                                className={`cursor-pointer rounded-2xl p-5 transition-all ${
                                                    isSelected
                                                        ? 'bg-brand-primary/10 ring-2 ring-brand-primary dark:bg-brand-primary/20'
                                                        : 'border border-slate-100 bg-[#f8f9fb] hover:bg-slate-100/80 dark:border-slate-800 dark:bg-[#12161f] dark:hover:bg-[#1c222e]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                                                                isAdminRole
                                                                    ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary'
                                                                    : 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                                            }`}
                                                        >
                                                            {isAdminRole ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-900 dark:text-white">
                                                                {r.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                                                {r.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <CheckCircle2 className="h-5 w-5 text-brand-primary" />
                                                    )}
                                                </div>

                                                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    {isAdminRole
                                                        ? 'Acceso total a esquemas técnicos, asignación de CPTs y gestión completa de usuarios.'
                                                        : 'Acceso privado únicamente a los CPTs asignados. Sus datos quedan aislados.'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.role_id} className="mt-2" />
                            </div>
                        </div>

                        {/* Card: Configuración de Acceso y Telemetría */}
                        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                            <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-emerald-500" />
                                    <span>Estado y Telemetría</span>
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Control de suscripción, suspensión de servicio y analíticas de visitas.
                                </p>
                            </div>

                            <div className="mt-6 space-y-6">
                                {/* Estado Activo / Inactivo */}
                                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#12161f]">
                                    <div>
                                        <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
                                            <span>Estado de la Cuenta (Activa)</span>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    data.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {data.is_active ? 'Habilitada' : 'Suspendida (401)'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Si se desactiva, el usuario no podrá acceder al panel y sus contenidos públicos responderán con HTTP 401 por suspensión de servicio / falta de pago.
                                        </p>
                                    </div>

                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full dark:bg-slate-700 dark:after:bg-white"></div>
                                    </label>
                                </div>

                                {/* Contador de Visitas / Telemetría */}
                                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#12161f]">
                                    <div>
                                        <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
                                            <span>Contador de Visitas (Telemetría)</span>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    data.has_telemetry
                                                        ? 'bg-brand-accent/10 text-brand-accent dark:bg-brand-accent/20 dark:text-brand-accent'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                {data.has_telemetry ? 'Monitoreando' : 'Desactivado'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Registra y computa cada visualización única en las páginas de sus contenidos públicos.
                                        </p>
                                    </div>

                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.has_telemetry}
                                            onChange={(e) => setData('has_telemetry', e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-primary peer-checked:after:translate-x-full dark:bg-slate-700 dark:after:bg-white"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Botones Finales */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={route('admin.users.index')}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-200 dark:hover:text-white"
                            >
                                Cancelar
                            </Link>
                            <PrimaryButton disabled={processing} className="gap-2 px-6 py-2.5">
                                <Save className="h-4 w-4" />
                                <span>{processing ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
        </>
    );
}

Form.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

