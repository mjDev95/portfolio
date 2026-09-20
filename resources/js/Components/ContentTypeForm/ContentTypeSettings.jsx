import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function ContentTypeSettings({
    data,
    setData,
    errors,
    toSnakeCase,
}) {
    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800/80">
                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    3. Visibilidad y URLs del Sitio Público
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Configura la presencia de este tipo de contenido en la web pública.
                </p>
            </div>

            <div className="mt-6 space-y-6">
                {/* Switch de Visibilidad Pública */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-[#f8f9fb] p-4 dark:border-slate-800 dark:bg-[#12161f]">
                    <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            Autorizar y mostrar en el sitio público
                        </span>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {data.is_public
                                ? 'Habilitado: El CPT tendrá vista pública activa y aparecerá en el menú web.'
                                : 'Deshabilitado: Solo accesible en panel privado. Los visitantes recibirán 404.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={data.is_public}
                        onClick={() => setData('is_public', !data.is_public)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
                            data.is_public ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                data.is_public ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>

                {/* URL Pública Personalizada */}
                <div>
                    <InputLabel htmlFor="public_slug" className="font-semibold">
                        URL Pública Personalizada (Opcional)
                    </InputLabel>
                    <TextInput
                        id="public_slug"
                        type="text"
                        className="mt-1 w-full font-mono text-sm"
                        value={data.public_slug}
                        onChange={(e) =>
                            setData('public_slug', toSnakeCase(e.target.value))
                        }
                        placeholder="ej: portfolio, articulos, trabajos"
                    />
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        Ruta pública resultante:{' '}
                        <code className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-brand-primary dark:bg-slate-800">
                            /{data.public_slug || data.slug || 'slug'}
                        </code>
                    </p>
                    {errors.public_slug && (
                        <InputError message={errors.public_slug} className="mt-1" />
                    )}
                </div>

                {/* Taxonomías */}
                <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.has_categories}
                            onChange={(e) =>
                                setData('has_categories', e.target.checked)
                            }
                            className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f]"
                        />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                            Permitir Categorías
                        </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.has_tags}
                            onChange={(e) => setData('has_tags', e.target.checked)}
                            className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary dark:border-slate-700 dark:bg-[#12161f]"
                        />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                            Permitir Etiquetas (Tags)
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}

