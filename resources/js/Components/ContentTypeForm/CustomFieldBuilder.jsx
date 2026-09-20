import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export const FIELD_TYPES = [
    { value: 'text', label: 'Texto corto (Text)' },
    { value: 'textarea', label: 'Texto largo (Textarea)' },
    { value: 'number', label: 'Número (Number)' },
    { value: 'date', label: 'Fecha (Date)' },
    { value: 'url', label: 'Enlace web (URL)' },
    { value: 'boolean', label: 'Booleano / Interruptor (Sí/No)' },
    { value: 'select', label: 'Menú desplegable (Select)' },
];

export default function CustomFieldBuilder({
    fields,
    availableUsers = [],
    addField,
    updateField,
    removeField,
    moveField,
    addSelectOption,
    updateSelectOption,
    removeSelectOption,
    toSnakeCase,
}) {
    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80">
                <div>
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        4. Campos Personalizados (Custom Fields)
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Define las propiedades específicas que solicitará este contenido. Puedes definir campos globales o específicos para un cliente.
                    </p>
                </div>

                <SecondaryButton
                    type="button"
                    onClick={addField}
                    className="gap-1.5 self-start sm:self-auto"
                >
                    <Plus className="h-4 w-4" />
                    Añadir Campo
                </SecondaryButton>
            </div>

            {fields.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#f8f9fb] p-8 text-center dark:border-slate-800 dark:bg-[#12161f]">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Este tipo de contenido utilizará los campos base (Título, Extracto, Contenido Markdown, Imágenes y SEO).
                    </p>
                    <button
                        type="button"
                        onClick={addField}
                        className="mt-3 text-xs font-semibold text-brand-primary hover:underline"
                    >
                        + Añadir el primer campo personalizado
                    </button>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {fields.map((field, index) => {
                        const specificUser = field.user_id
                            ? availableUsers.find((u) => u.id === Number(field.user_id))
                            : null;

                        return (
                            <div
                                key={index}
                                className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-5 transition-all dark:border-slate-800 dark:bg-[#12161f]"
                            >
                                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800/80">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900 shadow-xs dark:bg-[#202735] dark:text-white">
                                            {index + 1}
                                        </span>
                                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                            {field.label || `Campo #${index + 1}`}
                                        </span>
                                        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[11px] font-mono text-brand-primary dark:bg-brand-primary/20">
                                            {field.name || 'sin_identificador'}
                                        </span>
                                        {field.user_id ? (
                                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                                Solo para {specificUser ? specificUser.name : `Cliente #${field.user_id}`}
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                Global (Todos)
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveField(index, -1)}
                                            disabled={index === 0}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-900 disabled:opacity-30 dark:hover:bg-[#202735] dark:hover:text-white"
                                            title="Subir posición"
                                        >
                                            <ArrowUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveField(index, 1)}
                                            disabled={index === fields.length - 1}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-900 disabled:opacity-30 dark:hover:bg-[#202735] dark:hover:text-white"
                                            title="Bajar posición"
                                        >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeField(index)}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                            title="Eliminar campo"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                                            Etiqueta visible *
                                        </label>
                                        <TextInput
                                            type="text"
                                            className="mt-1 w-full text-xs"
                                            value={field.label}
                                            onChange={(e) =>
                                                updateField(index, 'label', e.target.value)
                                            }
                                            placeholder="ej: Tribunal, Cliente"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                                            Identificador (snake_case) *
                                        </label>
                                        <TextInput
                                            type="text"
                                            className="mt-1 w-full font-mono text-xs"
                                            value={field.name}
                                            onChange={(e) => {
                                                const val = toSnakeCase(e.target.value);
                                                updateField(index, 'name', val);
                                                updateField(index, '_autoName', false);
                                            }}
                                            placeholder="ej: tribunal, cliente"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                                            Tipo de dato *
                                        </label>
                                        <select
                                            className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#161b24] dark:text-white"
                                            value={field.type}
                                            onChange={(e) =>
                                                updateField(index, 'type', e.target.value)
                                            }
                                        >
                                            {FIELD_TYPES.map((t) => (
                                                <option key={t.value} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                                            Ámbito / Cliente Asignado
                                        </label>
                                        <select
                                            className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#161b24] dark:text-white"
                                            value={field.user_id ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? null : Number(e.target.value);
                                                updateField(index, 'user_id', val);
                                            }}
                                        >
                                            <option value="">🌐 Global (Todos los clientes)</option>
                                            {availableUsers.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    👤 Solo {u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                                            Texto de ayuda / Placeholder
                                        </label>
                                        <TextInput
                                            type="text"
                                            className="mt-1 w-full text-xs"
                                            value={field.placeholder}
                                            onChange={(e) =>
                                                updateField(
                                                    index,
                                                    'placeholder',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Instrucción para el usuario..."
                                        />
                                    </div>

                                    <div className="flex items-center sm:col-span-2 pt-5">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={field.is_required}
                                                onChange={(e) =>
                                                    updateField(
                                                        index,
                                                        'is_required',
                                                        e.target.checked
                                                    )
                                                }
                                                className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary dark:border-slate-700 dark:bg-[#161b24]"
                                            />
                                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                                Campo obligatorio (requerido para publicar)
                                            </span>
                                        </label>
                                    </div>
                                </div>

                            {/* Si es tipo 'select', editor de opciones */}
                            {field.type === 'select' && (
                                <div className="mt-4 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            Opciones del Menú Desplegable
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => addSelectOption(index)}
                                            className="text-xs font-semibold text-brand-primary hover:underline"
                                        >
                                            + Añadir Opción
                                        </button>
                                    </div>

                                    <div className="mt-2 space-y-2">
                                        {(field.options || []).map((opt, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className="flex items-center gap-2"
                                            >
                                                <TextInput
                                                    type="text"
                                                    className="w-1/2 text-xs"
                                                    placeholder="Etiqueta visible"
                                                    value={opt.label}
                                                    onChange={(e) =>
                                                        updateSelectOption(
                                                            index,
                                                            optIdx,
                                                            'label',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    type="text"
                                                    className="w-1/2 font-mono text-xs"
                                                    placeholder="valor_interno"
                                                    value={opt.value}
                                                    onChange={(e) =>
                                                        updateSelectOption(
                                                            index,
                                                            optIdx,
                                                            'value',
                                                            toSnakeCase(e.target.value)
                                                        )
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSelectOption(index, optIdx)
                                                    }
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                    title="Eliminar opción"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}

                                        {(!field.options || field.options.length === 0) && (
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                                                No hay opciones definidas aún. Añade al menos una.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                </div>
            )}
        </div>
    );
}
