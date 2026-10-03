import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Megaphone, ExternalLink } from 'lucide-react';

export default function CtaSection({ data, onChange, errors = {} }) {
    const customValues = data.custom_values || {};
    const heading = customValues.cta_heading || '';
    const description = customValues.cta_description || '';
    const buttonText = customValues.cta_button_text || '';
    const buttonUrl = customValues.cta_button_url || '';

    const baseInputStyles =
        'w-full rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white dark:placeholder-slate-500';

    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        <Megaphone className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                            Llamada a la Acción (Call to Action)
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Propuesta de conversión y contacto al pie del ensayo editorial.
                        </p>
                    </div>
                </div>

                {buttonText && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <span>Vista previa botón:</span>
                        <span className="font-semibold text-brand-primary">{buttonText} &nearr;</span>
                    </div>
                )}
            </div>

            <div className="space-y-5">
                {/* Titular del CTA */}
                <div>
                    <InputLabel htmlFor="cta_heading" value="Titular de la Propuesta (Heading)" />
                    <input
                        type="text"
                        id="cta_heading"
                        value={heading}
                        onChange={(e) => onChange('cta_heading', e.target.value)}
                        placeholder="ej: ¿Tu plataforma corporativa sufre de lentitud o deuda técnica?"
                        className={baseInputStyles}
                    />
                    <InputError message={errors['custom_values.cta_heading']} className="mt-1" />
                </div>

                {/* Bloque de Texto / Descripción */}
                <div>
                    <InputLabel
                        htmlFor="cta_description"
                        value="Bloque de Texto / Descripción de la Solución"
                    />
                    <textarea
                        id="cta_description"
                        rows={3}
                        value={description}
                        onChange={(e) => onChange('cta_description', e.target.value)}
                        placeholder="Describe brevemente cómo como desarrollador o arquitecto puedes ayudar a la marca del cliente..."
                        className={baseInputStyles}
                    />
                    <InputError message={errors['custom_values.cta_description']} className="mt-1" />
                </div>

                {/* Fila de 2 columnas: Texto del Botón y URL de Destino */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="cta_button_text" value="Texto del Botón" />
                        <input
                            type="text"
                            id="cta_button_text"
                            value={buttonText}
                            onChange={(e) => onChange('cta_button_text', e.target.value)}
                            placeholder="ej: Conversar sobre un proyecto"
                            className={baseInputStyles}
                        />
                        <InputError message={errors['custom_values.cta_button_text']} className="mt-1" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel htmlFor="cta_button_url" value="URL de Destino del Botón" />
                            <span className="text-[11px] text-slate-400">
                                Opcional (por defecto: /contacto)
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="url"
                                id="cta_button_url"
                                value={buttonUrl}
                                onChange={(e) => onChange('cta_button_url', e.target.value)}
                                placeholder="https://... o deja vacío para /contacto"
                                className={baseInputStyles}
                            />
                            {buttonUrl && (
                                <a
                                    href={buttonUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary"
                                    title="Abrir enlace"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                        <InputError message={errors['custom_values.cta_button_url']} className="mt-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
