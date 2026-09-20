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
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1e2126]">
            <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <Users className="h-5 w-5 text-brand-primary" />
                        <h2 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                            Clientes y Módulos CPT Asignados
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                        Visualiza qué CPTs tiene asignados cada cliente y activa o desactiva su contador de visitas con un clic.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={route('admin.users.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
                    >
                        <span>Gestionar Usuarios &rarr;</span>
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#f5f7fa] text-left text-sm dark:divide-[#16191c]">
                    <thead className="bg-[#ebf1f7] text-xs font-semibold uppercase tracking-wider text-[#293951] dark:bg-[#16191c] dark:text-[#a7a6a8]">
                        <tr>
                            <th scope="col" className="px-6 py-4">Usuario</th>
                            <th scope="col" className="px-6 py-4">Rol</th>
                            <th scope="col" className="px-6 py-4">Estado</th>
                            <th scope="col" className="px-6 py-4">CPTs Asignados</th>
                            <th scope="col" className="px-6 py-4 text-center">Publicaciones</th>
                            <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f7fa] dark:divide-[#16191c]">
                        {usersList.map((client) => (
                            <tr key={client.id} className="transition hover:bg-[#ebf1f7]/50 dark:hover:bg-[#16191c]/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 font-heading text-sm font-bold text-brand-primary">
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[#293951] dark:text-[#ffffff]">
                                                {client.name}
                                                {client.id === currentUser?.id && (
                                                    <span className="ml-1.5 text-xs font-normal text-[#95aac9] dark:text-[#a7a6a8]">
                                                        (Tú)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                                {client.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                                            client.role === 'admin'
                                                ? 'bg-brand-primary/10 text-brand-primary'
                                                : 'bg-brand-secondary/10 text-brand-secondary'
                                        }`}
                                    >
                                        {client.role === 'admin' ? 'Super Admin' : 'Cliente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            client.is_active
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
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
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#ebf1f7] px-2.5 py-1 text-xs font-medium text-[#293951] transition hover:bg-brand-primary hover:text-white dark:bg-[#16191c] dark:text-[#ffffff] dark:hover:bg-brand-primary"
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
                                        <span className="text-xs italic text-[#95aac9] dark:text-[#a7a6a8]">
                                            Sin CPTs asignados
                                        </span>
                                    )}
                                </td>
                                
                                <td className="px-6 py-4 text-center font-mono font-semibold text-[#293951] dark:text-[#ffffff]">
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

