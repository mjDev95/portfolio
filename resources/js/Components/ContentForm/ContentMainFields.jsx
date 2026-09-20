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
                        className="w-full rounded-2xl border-0 bg-[#ebf1f7]/50 px-4 py-3 font-heading text-xl font-bold text-[#293951] placeholder-[#95aac9] transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:bg-[#121517] dark:text-[#ffffff] dark:placeholder-[#606770] sm:text-2xl"
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
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                        <Globe className="h-4 w-4 text-brand-primary flex-shrink-0" />
                        <span className="font-bold text-[#293951] dark:text-[#ffffff]">
                            Enlace permanente:
                        </span>
                        <span className="font-mono text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                            /{contentType.public_slug || contentType.slug}/
                        </span>
                        <input
                            id="slug"
                            type="text"
                            className="rounded-lg border-0 bg-[#ebf1f7]/60 px-2.5 py-1 font-mono text-xs font-semibold text-brand-primary transition-all focus:outline-none focus:ring-1 focus:ring-brand-primary dark:bg-[#121517] dark:text-brand-primary min-w-[200px]"
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
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126] sm:p-8">
                <div className="space-y-6">
                    {/* Extracto Breve */}
                    <div>
                        <InputLabel htmlFor="excerpt" className="font-semibold text-xs">
                            Extracto / Resumen Corto
                        </InputLabel>
                        <textarea
                            id="excerpt"
                            rows={3}
                            className="mt-1.5 w-full rounded-xl border-0 bg-[#ebf1f7]/50 px-3.5 py-2.5 text-sm text-[#293951] placeholder-[#95aac9] transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:bg-[#121517] dark:text-[#ffffff] dark:placeholder-[#606770]"
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
                            <span className="text-xs text-[#95aac9] dark:text-[#606770]">
                                Sintaxis Markdown limpia y segura
                            </span>
                        </div>
                        <textarea
                            id="body"
                            rows={14}
                            className="w-full rounded-2xl border-0 bg-[#ebf1f7]/50 p-4 font-mono text-sm leading-relaxed text-[#293951] placeholder-[#95aac9] transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:bg-[#121517] dark:text-[#ffffff] dark:placeholder-[#606770]"
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

