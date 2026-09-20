import DynamicFieldInput from '@/Components/DynamicFieldInput';
import { Layers } from 'lucide-react';

export default function CustomFieldsSection({ contentType, data, onChange, errors = {} }) {
    if (!contentType.custom_fields || contentType.custom_fields.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126] sm:p-8">
            <div className="flex items-center gap-2.5 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ebf1f7] text-brand-primary dark:bg-[#1e2126]">
                    <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                    <h3 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                        Campos Personalizados
                    </h3>
                    <p className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">
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

