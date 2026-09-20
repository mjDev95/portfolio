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
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126] sm:p-8">
            <div className="border-b border-[#f5f7fa] pb-4 dark:border-[#16191c]">
                <h2 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                    2. Asignación de Clientes / Propietarios del CPT
                </h2>
                <p className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">
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

                <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-[#f8fafc] p-4 text-xs text-[#95aac9] dark:bg-[#16191c] dark:text-[#a7a6a8]">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span>
                        <strong>Aislamiento Estricto de Datos:</strong> Si asignas este CPT a múltiples clientes (ej. <i>Cliente A</i> y <i>Cliente B</i>), cada cliente verá únicamente sus propias publicaciones en su panel. El contenido, categorías y medios nunca se mezclarán entre clientes.
                    </span>
                </div>
            </div>
        </div>
    );
}
