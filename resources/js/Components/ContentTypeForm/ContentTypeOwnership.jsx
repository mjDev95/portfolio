import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import AsyncUserSelect from '@/Components/AsyncUserSelect';
import { ShieldCheck } from 'lucide-react';

export default function ContentTypeOwnership({
    data,
    setData,
    assignedUsers = [],
    errors,
    onUsersChange = null,
}) {
    // Normalizar lista de IDs seleccionados
    const selectedUserIds = Array.isArray(data.user_ids)
        ? data.user_ids
        : (data.user_id ? [Number(data.user_id)] : []);

    const handleUsersChange = (newUserIds, newUsers) => {
        setData(prev => ({
            ...prev,
            user_ids: newUserIds,
            user_id: newUserIds[0] || null,
        }));
        if (onUsersChange && newUsers) {
            onUsersChange(newUsers);
        }
    };

    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800/80">
                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    2. Asignación de Clientes / Propietarios del CPT
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Puedes asignar este tipo de contenido a uno o múltiples clientes. Cada cliente tendrá su propio espacio privado.
                </p>
            </div>

            <div className="mt-6">
                <InputLabel className="font-semibold mb-2">
                    Clientes con Acceso a este CPT *
                </InputLabel>

                <AsyncUserSelect
                    selectedUserIds={selectedUserIds}
                    onChange={handleUsersChange}
                    initialUsers={assignedUsers}
                    error={errors.user_ids || errors.user_id}
                />

                <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span>
                        <strong className="text-slate-900 dark:text-white">Aislamiento Estricto de Datos:</strong> Si asignas este CPT a múltiples clientes (ej. <i>Cliente A</i> y <i>Cliente B</i>), cada cliente verá únicamente sus propias publicaciones en su panel. El contenido, categorías y medios nunca se mezclarán entre clientes.
                    </span>
                </div>
            </div>
        </div>
    );
}
