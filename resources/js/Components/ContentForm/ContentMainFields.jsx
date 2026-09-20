import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Globe } from 'lucide-react';

export default function ContentMainFields({ contentType, data, setData, errors = {} }) {
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

                {/* Enlace Permanente tipo WordPress (Editable para cada single) */}
                <div className="p-3.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Globe className="h-4 w-4 text-brand-primary flex-shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white">
                            Enlace permanente:
                        </span>
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                            /{contentType.public_slug || contentType.slug}/
                        </span>
                        <input
                            id="slug"
                            type="text"
                            className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 font-mono text-xs font-semibold text-brand-primary transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-brand-primary min-w-[200px]"
                            value={data.slug}
                            onChange={(e) =>
                                setData(
                                    'slug',
                                    e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
                                )
                            }
                            placeholder={
                                data.title
                                    ? data.title
                                          .toLowerCase()
                                          .replace(/[^a-z0-9]+/g, '-')
                                          .replace(/^-|-$/g, '')
                                    : 'enlace-permanente'
                            }
                        />
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

