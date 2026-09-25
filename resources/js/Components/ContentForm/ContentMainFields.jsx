import { useState, useRef, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Globe, ExternalLink, Check, X, Pencil } from 'lucide-react';

export default function ContentMainFields({
    contentType,
    content = null,
    data,
    setData,
    errors = {},
}) {
    const [isEditingSlug, setIsEditingSlug] = useState(false);
    const [tempSlug, setTempSlug] = useState(data.slug || '');
    const slugInputRef = useRef(null);

    // Auto-focus y selección al entrar en modo edición
    useEffect(() => {
        if (isEditingSlug && slugInputRef.current) {
            slugInputRef.current.focus();
            slugInputRef.current.select();
        }
    }, [isEditingSlug]);

    // Mantener tempSlug sincronizado si data.slug cambia externamente
    useEffect(() => {
        if (!isEditingSlug) {
            setTempSlug(data.slug || '');
        }
    }, [data.slug, isEditingSlug]);

    const generatedSlugFallback = data.title
        ? data.title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
        : '';

    const displaySlug = data.slug || generatedSlugFallback || 'enlace-permanente';

    const handleStartEditSlug = () => {
        setTempSlug(data.slug || generatedSlugFallback || '');
        setIsEditingSlug(true);
    };

    const handleSaveSlug = () => {
        const cleaned = tempSlug
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9-_]/g, '-')
            .replace(/^-+|-+$/g, '');
        setData('slug', cleaned);
        setIsEditingSlug(false);
    };

    const handleCancelSlug = () => {
        setTempSlug(data.slug || '');
        setIsEditingSlug(false);
    };

    const handleSlugKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveSlug();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelSlug();
        }
    };
    return (
        <div className="space-y-6">
            {/* Cabecera: Título y Enlace permanente */}
            <div>
                {/* Título Prominente */}
                <div>
                    <input
                        id="title"
                        type="text"
                        className="w-full rounded-[24px] border border-slate-200/80 bg-white px-5 py-4 font-heading text-xl font-bold text-slate-900 placeholder:text-slate-400 transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white dark:placeholder:text-slate-500 sm:text-2xl shadow-xs"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder={`Escribe el título de tu ${contentType.singular_name.toLowerCase()}...`}
                        required
                    />
                    {errors.title && (
                        <InputError message={errors.title} className="mt-2" />
                    )}
                </div>

                {/* Enlace Permanente idéntico a WordPress */}
                <div className="py-2.5 px-3 text-xs leading-normal">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-700 dark:text-slate-200 shrink-0">
                            Enlace permanente:
                        </span>

                        {!isEditingSlug ? (
                            <>
                                <a
                                    href={contentType?.is_public ? `/${contentType.public_slug || contentType.slug}/${displaySlug}` : '#'}
                                    target={contentType?.is_public ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline font-normal break-all"
                                    title={contentType?.is_public ? 'Abrir publicación en nueva pestaña' : undefined}
                                >
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/{contentType.public_slug || contentType.slug}/{displaySlug}/
                                </a>

                                <button
                                    type="button"
                                    onClick={handleStartEditSlug}
                                    className="ml-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-blue-600 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-[#161b24] dark:text-blue-400 dark:hover:bg-[#1f2636] transition-colors shrink-0"
                                >
                                    Editar
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-wrap items-center gap-1 font-normal">
                                <span className="text-slate-600 dark:text-slate-400">
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/{contentType.public_slug || contentType.slug}/
                                </span>

                                <input
                                    ref={slugInputRef}
                                    id="slug"
                                    type="text"
                                    className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-[#12161f] dark:text-white min-w-[160px] h-7"
                                    value={tempSlug}
                                    onChange={(e) => setTempSlug(e.target.value)}
                                    onKeyDown={handleSlugKeyDown}
                                    placeholder={generatedSlugFallback || 'slug'}
                                />

                                <span className="text-slate-600 dark:text-slate-400">/</span>

                                <button
                                    type="button"
                                    onClick={handleSaveSlug}
                                    className="ml-1 rounded border border-slate-300 bg-white px-2.5 py-0.5 text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-200 transition-colors h-7"
                                >
                                    Aceptar
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCancelSlug}
                                    className="ml-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 underline cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                    {errors.slug && (
                        <InputError message={errors.slug} className="mt-1.5" />
                    )}
                </div>
            </div>

            {/* Bloque: Extracto y Cuerpo Markdown */}
            <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                <div className="space-y-6">
                    {/* Extracto Breve */}
                    <div>
                        <InputLabel htmlFor="excerpt" className="font-semibold text-xs">
                            Extracto / Resumen Corto
                        </InputLabel>
                        <textarea
                            id="excerpt"
                            rows={3}
                            className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white dark:placeholder:text-slate-500 shadow-xs"
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                            placeholder="Breve introducción o resumen para tarjetas y listados..."
                        />
                        {errors.excerpt && (
                            <InputError message={errors.excerpt} className="mt-1" />
                        )}
                    </div>

                    {/* Editor de Contenido Principal Markdown */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <InputLabel htmlFor="body" className="font-semibold text-xs">
                                Contenido Principal (Markdown soportado)
                            </InputLabel>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                Sintaxis Markdown limpia y segura
                            </span>
                        </div>
                        <textarea
                            id="body"
                            rows={14}
                            className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 font-mono text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white dark:placeholder:text-slate-500 shadow-xs"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="# Escribe tu artículo, caso o detalles aquí..."
                        />
                        {errors.body && (
                            <InputError message={errors.body} className="mt-1" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

