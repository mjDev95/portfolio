import DynamicFieldInput from '@/Components/DynamicFieldInput';
import { Layers } from 'lucide-react';

export default function CustomFieldsSection({ contentType, data, onChange, errors = {} }) {
    if (!contentType.custom_fields || contentType.custom_fields.length === 0) {
        return null;
    }

    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
            <div className="flex items-center gap-2.5 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
                    <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        Campos Personalizados
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Atributos específicos configurados para {contentType.name}.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {contentType.custom_fields.map((field) => (
                    <div
                        key={field.id}
                        className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                    >
                        <DynamicFieldInput
                            field={field}
                            value={data.custom_values?.[field.name]}
                            onChange={onChange}
                            error={errors[`custom_values.${field.name}`]}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

