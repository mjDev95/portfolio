import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

export default function DynamicFieldInput({ field, value, onChange, error }) {
    const { label, name, type, options, placeholder, is_required } = field;

    const baseInputStyles =
        'w-full rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white dark:placeholder-slate-500';

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        id={`field_${name}`}
                        name={name}
                        rows={3}
                        value={value ?? ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        placeholder={placeholder || ''}
                        className={baseInputStyles}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        id={`field_${name}`}
                        name={name}
                        value={value ?? ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        placeholder={placeholder || ''}
                        className={baseInputStyles}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        id={`field_${name}`}
                        name={name}
                        value={value ?? ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        className={baseInputStyles}
                    />
                );

            case 'url':
                return (
                    <input
                        type="url"
                        id={`field_${name}`}
                        name={name}
                        value={value ?? ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        placeholder={placeholder || 'https://...'}
                        className={baseInputStyles}
                    />
                );

            case 'boolean':
                return (
                    <div className="flex items-center gap-3 pt-1">
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                id={`field_${name}`}
                                name={name}
                                checked={Boolean(value)}
                                onChange={(e) => onChange(name, e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-primary peer-checked:after:translate-x-full peer-focus:outline-none dark:bg-slate-700"></div>
                        </label>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {value ? 'Activo / Sí' : 'Inactivo / No'}
                        </span>
                    </div>
                );

            case 'select':
                return (
                    <select
                        id={`field_${name}`}
                        name={name}
                        value={value ?? ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        className={baseInputStyles}
                    >
                        <option value="">
                            {placeholder || 'Selecciona una opción...'}
                        </option>
                        {Array.isArray(options) &&
                            options.map((opt, idx) => (
                                <option
                                    key={idx}
                                    value={typeof opt === 'object' ? opt.value : opt}
                                >
                                    {typeof opt === 'object' ? opt.label : opt}
                                </option>
                            ))}
                    </select>
                );

            case 'text':
            default:
                return (
                    <input
                        type="text"
                        id={`field_${name}`}
                        name={name}
                        value={value ?? ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        placeholder={placeholder || ''}
                        className={baseInputStyles}
                    />
                );
        }
    };

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <InputLabel htmlFor={`field_${name}`} className="font-semibold">
                    {label}
                    {is_required && (
                        <span className="ms-1 text-red-500" title="Obligatorio">
                            *
                        </span>
                    )}
                </InputLabel>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {type}
                </span>
            </div>

            {renderInput()}

            {error && <InputError message={error} className="mt-1" />}
        </div>
    );
}

