import { Link } from '@inertiajs/react';
import { Layers, Users, Plus, ArrowUpRight } from 'lucide-react';

export default function DashboardQuickActions() {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Link
                href={route('admin.content-types.index')}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]"
            >
                <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition group-hover:bg-brand-primary group-hover:text-white">
                        <Layers className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-primary">
                        Estructura
                    </span>
                </div>
                <div className="mt-4">
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        Tipos de Contenido (CPT)
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Crea y configura modelos de datos personalizados, campos dinámicos y visibilidad.
                    </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-brand-primary">
                    <span>Gestionar modelos CPT</span>
                    <ArrowUpRight className="h-4 w-4" />
                </div>
            </Link>

            <Link
                href={route('admin.users.index')}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]"
            >
                <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary transition group-hover:bg-brand-secondary group-hover:text-white">
                        <Users className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-brand-secondary/10 px-2.5 py-1 text-xs font-semibold text-brand-secondary">
                        Clientes
                    </span>
                </div>
                <div className="mt-4">
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        Gestor de Usuarios
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Registra cuentas de clientes, asigna roles y activa el contador de visitas.
                    </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-brand-secondary">
                    <span>Abrir directorio de usuarios</span>
                    <ArrowUpRight className="h-4 w-4" />
                </div>
            </Link>

            <Link
                href={route('admin.content-types.create')}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-[#161b24]"
            >
                <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent transition group-hover:bg-brand-accent group-hover:text-white">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-brand-accent/10 px-2.5 py-1 text-xs font-semibold text-brand-accent">
                        Nuevo
                    </span>
                </div>
                <div className="mt-4">
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        Crear Nuevo CPT
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Diseña un nuevo modelo de datos a medida y asígnalo a un cliente.
                    </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-brand-accent">
                    <span>Diseñar modelo de datos</span>
                    <ArrowUpRight className="h-4 w-4" />
                </div>
            </Link>
        </div>
    );
}

