import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import LiquidMorphingButton from '@/Components/LiquidMorphingButton';
import { Save, Loader2, ExternalLink } from 'lucide-react';

export default function PublishingSidebar({
    data,
    setData,
    processing,
    content = null,
    contentType = null,
}) {
    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white mb-4">
                Publicación
            </h3>

            <div className="space-y-4">
                {/* Estado */}
                <div>
                    <InputLabel htmlFor="status" className="font-semibold text-xs">
                        Estado del Contenido
                    </InputLabel>
                    <select
                        id="status"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white shadow-xs"
                    >
                        <option value="published">Publicado (Visible)</option>
                        <option value="draft">Borrador (Privado)</option>
                        <option value="archived">Archivado</option>
                    </select>
                </div>

                {/* Fecha de publicación */}
                <div>
                    <InputLabel htmlFor="published_at" className="font-semibold text-xs">
                        Fecha y Hora de Publicación
                    </InputLabel>
                    <TextInput
                        id="published_at"
                        type="datetime-local"
                        className="mt-1 w-full text-xs"
                        value={data.published_at}
                        onChange={(e) => setData('published_at', e.target.value)}
                    />
                </div>

                {/* Destacado en Homepage */}
                <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={data.featured}
                            onChange={(e) => setData('featured', e.target.checked)}
                            className="rounded-lg border-slate-300 text-brand-primary shadow-xs focus:ring-brand-primary/20 dark:border-slate-700 dark:bg-[#12161f]"
                        />
                        <span>Destacado en Homepage</span>
                    </label>
                </div>

                {/* Orden numérico */}
                <div>
                    <InputLabel htmlFor="sort_order" className="font-semibold text-xs">
                        Orden de Clasificación
                    </InputLabel>
                    <TextInput
                        id="sort_order"
                        type="number"
                        className="mt-1 w-full text-xs"
                        value={data.sort_order}
                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                    />
                </div>

                {/* Botón de guardado */}
                <div className="pt-4 flex justify-center">
                    <LiquidMorphingButton
                        processing={processing}
                        label="Guardar Cambios"
                        loadingLabel="Guardando..."
                        successLabel="¡Guardado!"
                        icon={Save}
                        className="w-full"
                    />
                </div>

                {/* Botón Ver Publicación (cuando el CPT es público y el contenido ya existe) */}
                {contentType?.is_public && content?.slug && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <a
                            href={`/${contentType.public_slug || contentType.slug}/${content.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-200 dark:hover:bg-[#1c222e]"
                        >
                            <ExternalLink className="h-3.5 w-3.5 text-brand-primary" />
                            <span>Ver publicación</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

