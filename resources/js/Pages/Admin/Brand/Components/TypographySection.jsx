import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Type, UploadCloud, Trash2, CheckCircle2, AlertCircle, FileText, Sparkles, RefreshCw } from 'lucide-react';

export default function TypographySection({ customFonts = {}, onToast }) {
    const [uploadingRole, setUploadingRole] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [familyNames, setFamilyNames] = useState({});
    const [sampleHeading, setSampleHeading] = useState('Diseño y desarrollo con intención.');
    const [sampleBody, setSampleBody] = useState('Plataformas web de alto impacto, arquitecturas a medida en WordPress y experiencias interactivas diseñadas para convertir, escalar y cargar en milisegundos.');
    const [sampleMono, setSampleMono] = useState('01 / 2026 // Core Web Vitals LCP < 1.2s // CLS = 0');

    // Inyectar dinámicamente @font-face en el documento para que el preview del admin
    // renderice las fuentes locales subidas exactamente como en el sitio público
    useEffect(() => {
        const styleId = 'admin-dynamic-custom-fonts';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        let css = '';
        if (customFonts?.heading?.url) {
            css += `
                @font-face {
                    font-family: 'AdminPreviewHeading';
                    src: url('${customFonts.heading.url}') format('${customFonts.heading.css_format || 'woff2'}');
                    font-weight: 100 900;
                    font-style: normal;
                    font-display: swap;
                }
            `;
        }
        if (customFonts?.sans?.url) {
            css += `
                @font-face {
                    font-family: 'AdminPreviewSans';
                    src: url('${customFonts.sans.url}') format('${customFonts.sans.css_format || 'woff2'}');
                    font-weight: 100 900;
                    font-style: normal;
                    font-display: swap;
                }
            `;
        }
        if (customFonts?.mono?.url) {
            css += `
                @font-face {
                    font-family: 'AdminPreviewMono';
                    src: url('${customFonts.mono.url}') format('${customFonts.mono.css_format || 'woff2'}');
                    font-weight: 100 900;
                    font-style: normal;
                    font-display: swap;
                }
            `;
        }

        styleEl.innerHTML = css;
    }, [customFonts]);

    const handleFileChange = (role, file) => {
        if (!file) return;

        setSelectedFiles((prev) => ({ ...prev, [role]: file }));

        // Sugerir nombre de la familia si está vacío
        if (!familyNames[role]) {
            const raw = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            const suggested = raw.charAt(0).toUpperCase() + raw.slice(1);
            setFamilyNames((prev) => ({ ...prev, [role]: suggested }));
        }
    };

    const handleUpload = (e, role) => {
        e.preventDefault();
        const file = selectedFiles[role];
        if (!file) {
            onToast?.('Aviso', 'Debes seleccionar un archivo de tipografía primero.');
            return;
        }

        setUploadingRole(role);
        const formData = new FormData();
        formData.append('role', role);
        formData.append('font_file', file);
        if (familyNames[role]) {
            formData.append('family_name', familyNames[role]);
        }

        router.post(route('admin.brand.fonts.store'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setUploadingRole(null);
                setSelectedFiles((prev) => ({ ...prev, [role]: null }));
                onToast?.('Tipografía guardada', 'La fuente se ha almacenado localmente y está activa en el sitio público.');
            },
            onError: (errors) => {
                setUploadingRole(null);
                const msg = errors.font_file || errors.role || 'Ocurrió un error al subir la fuente.';
                onToast?.('Error', msg);
            },
        });
    };

    const handleDelete = (font) => {
        if (!confirm(`¿Deseas eliminar la tipografía personalizada para ${font.role}? El sitio público volverá a la fuente base del sistema.`)) {
            return;
        }

        router.delete(route('admin.brand.fonts.destroy', font.id), {
            preserveScroll: true,
            onSuccess: () => {
                onToast?.('Fuente eliminada', 'Se ha restaurado la fuente por defecto del sistema.');
            },
            onError: () => {
                onToast?.('Error', 'No se pudo eliminar la fuente.');
            },
        });
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 KB';
        const kb = (bytes / 1024).toFixed(1);
        return `${kb} KB`;
    };

    const rolesConfig = [
        {
            role: 'heading',
            title: 'Fuente de Titulares',
            cssVar: '--font-heading',
            fallback: 'Manrope / Bricolage Grotesque',
            description: 'Afecta H1–H6, cifras de estadísticas monumentales y títulos de proyectos en el Home y archivos.',
            activeFont: customFonts?.heading,
            previewFontFamily: customFonts?.heading ? "'AdminPreviewHeading', sans-serif" : 'var(--font-heading)',
        },
        {
            role: 'sans',
            title: 'Fuente de Cuerpo & UI',
            cssVar: '--font-sans',
            fallback: 'Aileron / Poppins',
            description: 'Afecta párrafos de lectura, bajadas editoriales, elementos de navegación, modales y formularios.',
            activeFont: customFonts?.sans,
            previewFontFamily: customFonts?.sans ? "'AdminPreviewSans', sans-serif" : 'var(--font-sans)',
        },
        {
            role: 'mono',
            title: 'Fuente Monospaciada & Código',
            cssVar: '--font-mono',
            fallback: 'JetBrains Mono',
            description: 'Afecta numeraciones editoriales (01, 02), badges de tecnología y reloj en tiempo real del pie de página.',
            activeFont: customFonts?.mono,
            previewFontFamily: customFonts?.mono ? "'AdminPreviewMono', monospace" : 'var(--font-mono)',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Cabecera Informativa */}
            <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                            <Type className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                    Tipografías Locales del Sitio Público
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Consumo 100% Local (Zero Google Fonts)
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Sube archivos de fuentes (<span className="font-mono font-medium text-slate-700 dark:text-slate-300">.woff2, .woff, .ttf, .otf</span>) para cada rol. Se almacenan en la base de datos y se sirven localmente mediante <span className="font-mono">@font-face</span> sin dependencias externas.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800 dark:text-slate-300">
                            storage/fonts/
                        </span>
                    </div>
                </div>

                {/* 3 Tarjetas de Subida por Rol */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {rolesConfig.map((item) => {
                        const font = item.activeFont;
                        const isUploading = uploadingRole === item.role;
                        const selectedFile = selectedFiles[item.role];

                        return (
                            <div
                                key={item.role}
                                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-[#f8f9fb] p-6 transition hover:border-slate-200 dark:border-slate-800 dark:bg-[#12161f] dark:hover:border-slate-700/60"
                            >
                                <div>
                                    {/* Cabecera de la tarjeta */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                                                {item.cssVar}
                                            </span>
                                            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                                                {item.title}
                                            </h3>
                                        </div>

                                        {font ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Local Activa
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                Sistema Base
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        {item.description}
                                    </p>

                                    {/* Detalle de la fuente actualmente activa */}
                                    <div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-700/60 dark:bg-[#1a202c]">
                                        {font ? (
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-bold text-slate-900 dark:text-white" style={{ fontFamily: item.previewFontFamily }}>
                                                            {font.family_name}
                                                        </span>
                                                        <span className="rounded bg-brand-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-brand-primary">
                                                            {font.format}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                                        {font.file_name} • {formatSize(font.file_size)}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(font)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                                    title="Eliminar fuente y restaurar sistema base"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Por defecto: {item.fallback}
                                                </span>
                                                <p className="text-[11px] text-slate-400">
                                                    Sube un archivo para sobrescribir esta tipografía en todo el sitio público.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Formulario de subida de nueva fuente */}
                                <form onSubmit={(e) => handleUpload(e, item.role)} className="mt-5 space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            {font ? 'Reemplazar con nuevo archivo' : 'Subir archivo de fuente'}
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept=".woff2,.woff,.ttf,.otf"
                                                onChange={(e) => handleFileChange(item.role, e.target.files[0])}
                                                className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-200/70 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300 dark:file:bg-slate-800 dark:file:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            Nombre de la familia (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={font?.family_name || 'Ej. Manrope, Aileron...'}
                                            value={familyNames[item.role] || ''}
                                            onChange={(e) => setFamilyNames({ ...familyNames, [item.role]: e.target.value })}
                                            className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-brand-primary focus:outline-hidden dark:border-slate-700 dark:bg-[#1a202c] dark:text-white"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUploading || !selectedFile}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                    >
                                        {isUploading ? (
                                            <>
                                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                <span>Subiendo y aplicando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="h-3.5 w-3.5" />
                                                <span>{font ? 'Actualizar Tipografía' : 'Guardar y Aplicar'}</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sandbox Interactivo de Previsualización en Vivo */}
            <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                            Previsualización en Vivo (Renderizado Real con Fuentes Locales)
                        </h3>
                    </div>
                    <span className="font-mono text-xs text-slate-400">
                        Editable en tiempo real
                    </span>
                </div>

                <div className="mt-6 space-y-6">
                    {/* Previsualización de Titulares */}
                    <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-6 dark:border-slate-800 dark:bg-[#12161f]">
                        <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-500">
                            <span>[Titulares --font-heading]: {customFonts?.heading?.family_name || 'Manrope (Seeded)'}</span>
                            <span className="text-[10px] uppercase">{customFonts?.heading?.format || 'Local'}</span>
                        </div>
                        <input
                            type="text"
                            value={sampleHeading}
                            onChange={(e) => setSampleHeading(e.target.value)}
                            className="w-full border-none bg-transparent p-0 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 focus:outline-hidden dark:text-white"
                            style={{ fontFamily: customFonts?.heading ? "'AdminPreviewHeading', sans-serif" : 'var(--font-heading)' }}
                        />
                    </div>

                    {/* Previsualización de Cuerpo / UI */}
                    <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-6 dark:border-slate-800 dark:bg-[#12161f]">
                        <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-500">
                            <span>[Cuerpo & UI --font-sans]: {customFonts?.sans?.family_name || 'Aileron (Seeded)'}</span>
                            <span className="text-[10px] uppercase">{customFonts?.sans?.format || 'Local'}</span>
                        </div>
                        <textarea
                            rows={3}
                            value={sampleBody}
                            onChange={(e) => setSampleBody(e.target.value)}
                            className="w-full resize-none border-none bg-transparent p-0 text-base leading-relaxed text-slate-700 focus:outline-hidden dark:text-slate-300"
                            style={{ fontFamily: customFonts?.sans ? "'AdminPreviewSans', sans-serif" : 'var(--font-sans)' }}
                        />
                    </div>

                    {/* Previsualización de Monospaciada */}
                    <div className="rounded-2xl border border-slate-100 bg-[#f8f9fb] p-6 dark:border-slate-800 dark:bg-[#12161f]">
                        <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-500">
                            <span>[Monospaciada & Código --font-mono]: {customFonts?.mono?.family_name || 'JetBrains Mono'}</span>
                            <span className="text-[10px] uppercase">{customFonts?.mono?.format || 'Local'}</span>
                        </div>
                        <input
                            type="text"
                            value={sampleMono}
                            onChange={(e) => setSampleMono(e.target.value)}
                            className="w-full border-none bg-transparent p-0 font-mono text-xs sm:text-sm text-slate-600 focus:outline-hidden dark:text-slate-400"
                            style={{ fontFamily: customFonts?.mono ? "'AdminPreviewMono', monospace" : 'var(--font-mono)' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
