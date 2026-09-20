import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Save, Loader2 } from 'lucide-react';

export default function PublishingSidebar({ data, setData, processing }) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126]">
            <h3 className="font-heading text-base font-bold text-[#293951] dark:text-[#ffffff] mb-4">
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
                        className="mt-1 w-full rounded-xl border-0 bg-[#ebf1f7]/50 px-3.5 py-2.5 text-sm text-[#293951] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:bg-[#121517] dark:text-[#ffffff]"
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
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-[#293951] dark:text-[#ffffff]">
                        <input
                            type="checkbox"
                            checked={data.featured}
                            onChange={(e) => setData('featured', e.target.checked)}
                            className="rounded border-0 bg-[#ebf1f7] text-brand-primary focus:ring-brand-primary dark:bg-[#121517]"
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
                <div className="pt-4">
                    <PrimaryButton disabled={processing} className="w-full justify-center gap-2 py-2.5">
                        {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        <span>{processing ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}

