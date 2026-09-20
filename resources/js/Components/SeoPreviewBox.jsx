import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Globe } from 'lucide-react';

export default function SeoPreviewBox({
    metaTitle = '',
    metaDescription = '',
    metaKeywords = '',
    slug = '',
    defaultTitle = '',
    defaultDescription = '',
    onChange,
    errors = {},
}) {
    const displayTitle = metaTitle || defaultTitle || 'Título de la publicación';
    const displayDescription =
        metaDescription ||
        defaultDescription ||
        'Descripción que aparecerá en los motores de búsqueda como Google para atraer visitas y clics cualificados.';

    const titleLength = (metaTitle || '').length;
    const descLength = (metaDescription || '').length;

    const getCounterColor = (len, maxOptimal, maxLimit) => {
        if (len === 0) return 'text-[#95aac9] dark:text-[#606770]';
        if (len <= maxOptimal) return 'text-emerald-500 font-medium';
        if (len <= maxLimit) return 'text-amber-500 font-semibold';
        return 'text-red-500 font-bold';
    };

    return (
        <div className="space-y-6">
            {/* Live Google Search Preview (SERP snippet) */}
            <div className="rounded-xl bg-[#f8fafc] p-4 transition-colors dark:bg-[#121517]">
                <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                    <Globe className="h-3.5 w-3.5 text-brand-primary" />
                    <span>Vista previa en Google Search (SERP)</span>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-[#16191c]">
                    <div className="flex items-center gap-2 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e8f0fe] text-[10px] font-bold text-[#1a73e8] dark:bg-[#1e2838] dark:text-[#8ab4f8]">
                            P
                        </div>
                        <span className="truncate">
                            https://tusitio.test &rsaquo; {slug || 'contenido'}
                        </span>
                    </div>

                    <h4 className="mt-1 text-base font-medium text-[#1a0dab] line-clamp-1 hover:underline dark:text-[#8ab4f8] cursor-pointer">
                        {displayTitle}
                    </h4>

                    <p className="mt-1 text-xs leading-relaxed text-[#4d5156] line-clamp-2 dark:text-[#bdc1c6]">
                        {displayDescription}
                    </p>
                </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
                {/* Meta Title */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <InputLabel htmlFor="meta_title" className="font-semibold">
                            Meta Título SEO
                        </InputLabel>
                        <span className={`text-xs ${getCounterColor(titleLength, 60, 70)}`}>
                            {titleLength} / 70 caracteres
                        </span>
                    </div>
                    <TextInput
                        id="meta_title"
                        type="text"
                        className="w-full"
                        value={metaTitle || ''}
                        onChange={(e) => onChange('meta_title', e.target.value)}
                        placeholder={defaultTitle || 'Recomendado: 50 - 60 caracteres'}
                        maxLength={70}
                    />
                    {errors.meta_title && (
                        <InputError message={errors.meta_title} className="mt-1" />
                    )}
                </div>

                {/* Meta Description */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <InputLabel htmlFor="meta_description" className="font-semibold">
                            Meta Descripción SEO
                        </InputLabel>
                        <span className={`text-xs ${getCounterColor(descLength, 150, 160)}`}>
                            {descLength} / 160 caracteres
                        </span>
                    </div>
                    <textarea
                        id="meta_description"
                        rows={3}
                        className="w-full rounded-xl border border-[#e3ebf6] bg-white px-3.5 py-2.5 text-sm text-[#293951] placeholder-[#95aac9] transition-all focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:border-[#282d35] dark:bg-[#16191c] dark:text-[#ffffff] dark:placeholder-[#606770]"
                        value={metaDescription || ''}
                        onChange={(e) => onChange('meta_description', e.target.value)}
                        placeholder={defaultDescription || 'Resumen atractivo para captar clics en Google...'}
                        maxLength={160}
                    />
                    {errors.meta_description && (
                        <InputError message={errors.meta_description} className="mt-1" />
                    )}
                </div>

                {/* Meta Keywords */}
                <div>
                    <InputLabel htmlFor="meta_keywords" className="font-semibold mb-1">
                        Palabras Clave (Meta Keywords)
                    </InputLabel>
                    <TextInput
                        id="meta_keywords"
                        type="text"
                        className="w-full"
                        value={metaKeywords || ''}
                        onChange={(e) => onChange('meta_keywords', e.target.value)}
                        placeholder="ej: react, laravel, consultoría, desarrollo"
                    />
                    <p className="mt-1 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                        Separa los términos con comas.
                    </p>
                    {errors.meta_keywords && (
                        <InputError message={errors.meta_keywords} className="mt-1" />
                    )}
                </div>
            </div>
        </div>
    );
}

