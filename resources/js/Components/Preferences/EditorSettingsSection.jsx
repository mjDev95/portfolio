import { LayoutList, FileText, Bell, Check } from 'lucide-react';

export default function EditorSettingsSection({
    tableDensity,
    onTableDensityChange,
    itemsPerPage,
    onItemsPerPageChange,
    editorMode,
    onEditorModeChange,
    emailNotifications,
    onEmailNotificationsChange,
}) {
    return (
        <div className="space-y-8">
            {/* ── Densidad de Tablas y Listados ───────────── */}
            <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-7">
                <div className="flex items-center gap-2.5">
                    <LayoutList className="h-5 w-5 text-brand-primary" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Densidad de Tablas y Listados
                    </h2>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Controla el espaciado vertical de las filas en las tablas administrativas de Proyectos, Publicaciones y Mensajes.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => onTableDensityChange('comfortable')}
                        className={`rounded-2xl p-5 text-start transition ${
                            tableDensity === 'comfortable'
                                ? 'bg-brand-primary/10 font-semibold text-brand-primary ring-2 ring-brand-primary/40 dark:bg-brand-primary/20 dark:text-brand-primary'
                                : 'bg-slate-50 border border-slate-200/80 text-slate-500 hover:bg-white hover:text-slate-900 dark:bg-[#12161f] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-[#1c222e] dark:hover:text-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-base font-bold text-slate-900 dark:text-white">
                                Cómoda (Comfortable)
                            </div>
                            {tableDensity === 'comfortable' && (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm">
                                    <Check className="h-3.5 w-3.5" />
                                </span>
                            )}
                        </div>
                        <div className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                            Mayor holgura y márgenes en cada fila, ideal para monitores grandes y lectura relajada.
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onTableDensityChange('compact')}
                        className={`rounded-2xl p-5 text-start transition ${
                            tableDensity === 'compact'
                                ? 'bg-brand-primary/10 font-semibold text-brand-primary ring-2 ring-brand-primary/40 dark:bg-brand-primary/20 dark:text-brand-primary'
                                : 'bg-slate-50 border border-slate-200/80 text-slate-500 hover:bg-white hover:text-slate-900 dark:bg-[#12161f] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-[#1c222e] dark:hover:text-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-base font-bold text-slate-900 dark:text-white">
                                Compacta (Compact)
                            </div>
                            {tableDensity === 'compact' && (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm">
                                    <Check className="h-3.5 w-3.5" />
                                </span>
                            )}
                        </div>
                        <div className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                            Filas condensadas para maximizar la cantidad de registros visibles sin necesidad de desplazarse.
                        </div>
                    </button>
                </div>
            </div>

            {/* ── Paginación y Modos de Redacción ─────────── */}
            <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-7">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-base font-bold text-slate-900 dark:text-white">
                            Registros por página
                        </label>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Número predeterminado de elementos a cargar en las tablas del panel.
                        </p>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="mt-3 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                        >
                            <option value={10}>10 registros por página</option>
                            <option value={20}>20 registros por página</option>
                            <option value={25}>25 registros por página</option>
                            <option value={50}>50 registros por página</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-white">
                            <FileText className="h-4 w-4 text-brand-primary" />
                            <span>Modo del editor de contenido</span>
                        </label>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Formato de redacción preferido para descripciones y artículos.
                        </p>
                        <select
                            value={editorMode}
                            onChange={(e) => onEditorModeChange(e.target.value)}
                            className="mt-3 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                        >
                            <option value="markdown">Markdown estructurado (Recomendado)</option>
                            <option value="rich_text">Editor Visual / WYSIWYG</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Notificaciones por Correo ───────────────── */}
            <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-7">
                <label className="flex cursor-pointer items-start gap-3.5">
                    <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => onEmailNotificationsChange(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded-lg border-slate-300 text-brand-primary shadow-xs focus:ring-brand-primary/20 dark:border-slate-700 dark:bg-[#12161f]"
                    />
                    <div>
                        <span className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                            <Bell className="h-5 w-5 text-brand-primary" />
                            <span>Alertas por correo electrónico de nuevos mensajes</span>
                        </span>
                        <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                            Recibir una notificación inmediata al correo administrativo cuando un visitante envíe una propuesta o mensaje mediante el formulario de contacto público.
                        </span>
                    </div>
                </label>
            </div>
        </div>
    );
}

