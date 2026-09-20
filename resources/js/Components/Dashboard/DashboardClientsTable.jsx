import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import CptIcon from '@/Components/Dashboard/CptIcon';

export default function DashboardClientsTable({
    usersList = [],
    currentUser,
    togglingTelemetryId,
    onToggleTelemetry,
}) {
    return (
        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm dark:bg-[#161b24] border border-slate-100/90 dark:border-slate-800/80">
            <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/80">
                <div>
                    <div className="flex items-center gap-2.5">
                        <Users className="h-5 w-5 text-brand-primary" />
                        <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                            Clientes y Módulos CPT Asignados
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Visualiza qué CPTs tiene asignados cada cliente y audita publicaciones y telemetría.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={route('admin.users.index')}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white shadow-xs"
                    >
                        <span>Gestionar Usuarios &rarr;</span>
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm dark:divide-slate-800/80">
                    <thead className="bg-[#f8f9fb] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-[#12161f] dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-3.5">Usuario</th>
                            <th scope="col" className="px-6 py-3.5">Rol</th>
                            <th scope="col" className="px-6 py-3.5">Estado</th>
                            <th scope="col" className="px-6 py-3.5">CPTs Asignados</th>
                            <th scope="col" className="px-6 py-3.5 text-center">Publicaciones</th>
                            <th scope="col" className="px-6 py-3.5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                        {usersList.map((client) => (
                            <tr key={client.id} className="transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-[#1c222e]/60">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 font-heading text-xs font-bold text-brand-primary ring-2 ring-brand-primary/20">
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                {client.name}
                                                {client.id === currentUser?.id && (
                                                    <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">
                                                        (Tú)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400 dark:text-slate-500">
                                                {client.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                                            client.role === 'admin'
                                                ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/25'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        {client.role === 'admin' ? 'Super Admin' : 'Cliente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            client.is_active
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20'
                                                : 'bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                client.is_active ? 'bg-emerald-500' : 'bg-red-500'
                                            }`}
                                        />
                                        {client.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {client.content_types && client.content_types.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {client.content_types.map((cpt) => (
                                                <Link
                                                    key={cpt.id}
                                                    href={route('admin.content-types.edit', cpt.id)}
                                                    title={`Modificar estructura de ${cpt.name}`}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-brand-primary hover:text-white dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-brand-primary dark:hover:text-white"
                                                >
                                                    <CptIcon name={cpt.icon} />
                                                    <span>{cpt.name}</span>
                                                    {cpt.is_public ? (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Público" />
                                                    ) : (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" title="Privado" />
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-xs italic text-slate-400 dark:text-slate-500">
                                            Sin CPTs asignados
                                        </span>
                                    )}
                                </td>
                                
                                <td className="px-6 py-4 text-center font-mono text-xs font-bold text-slate-900 dark:text-white">
                                    {client.contents_count || 0}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={route('admin.users.index')}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                                    >
                                        Administrar &rarr;
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

