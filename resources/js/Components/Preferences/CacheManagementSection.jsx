import { useState } from 'react';
import { Database, Globe, Shield, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

export default function CacheManagementSection() {
    const [clearingScope, setClearingScope] = useState(null);
    const [lastCleared, setLastCleared] = useState(null);

    const handleClearCache = async (scope) => {
        if (clearingScope) return;

        setClearingScope(scope);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(route('admin.preferences.cache.clear'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify({ scope }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setLastCleared({ scope, time: new Date().toLocaleTimeString() });

                window.dispatchEvent(
                    new CustomEvent('admin-feedback', {
                        detail: {
                            type: 'success',
                            title: '¡Caché purgada!',
                            message: data.message || 'La caché seleccionada se ha limpiado correctamente.',
                        },
                    })
                );
            } else {
                throw new Error(data.message || 'Error al purgar la caché');
            }
        } catch (err) {
            console.error('Error al purgar la caché:', err);
            window.dispatchEvent(
                new CustomEvent('admin-feedback', {
                    detail: {
                        type: 'error',
                        title: 'Error de purga',
                        message: 'No se pudo vaciar la caché. Inténtalo nuevamente.',
                    },
                })
            );
        } finally {
            setClearingScope(null);
        }
    };

    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                    <Database className="h-5 w-5 text-brand-primary" />
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Rendimiento y Mantenimiento de Caché
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Optimiza la velocidad de respuesta del sitio y del panel de administración purgando datos almacenados en memoria.
                        </p>
                    </div>
                </div>

                {lastCleared && (
                    <div className="flex items-center gap-1.5 self-start rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:self-auto">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Última purga: {lastCleared.time}</span>
                    </div>
                )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* 1. Caché del Sitio Público */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-[#f8f9fb] p-5 dark:border-slate-800/60 dark:bg-[#12161f]">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                                <Globe className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                Sitio Público
                            </span>
                        </div>
                        <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">
                            Limpia la caché de la portada, listados de CPTs y páginas públicas de contenidos y proyectos.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={clearingScope !== null}
                        onClick={() => handleClearCache('public')}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-brand-primary hover:text-white hover:border-brand-primary disabled:opacity-50 dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-200 dark:hover:bg-brand-primary dark:hover:border-brand-primary"
                    >
                        {clearingScope === 'public' ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Limpiando...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-white dark:text-slate-500" />
                                <span>Vaciar Caché Pública</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 2. Caché del Panel de Administración */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-[#f8f9fb] p-5 dark:border-slate-800/60 dark:bg-[#12161f]">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                Panel de Administración
                            </span>
                        </div>
                        <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">
                            Limpia la caché de navegación de CPTs asignados, contadores de módulos y preferencias de usuarios.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={clearingScope !== null}
                        onClick={() => handleClearCache('admin')}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-brand-secondary hover:text-white hover:border-brand-secondary disabled:opacity-50 dark:border-slate-700 dark:bg-[#161b24] dark:text-slate-200 dark:hover:bg-brand-secondary dark:hover:border-brand-secondary"
                    >
                        {clearingScope === 'admin' ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Limpiando...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-white dark:text-slate-500" />
                                <span>Vaciar Caché de Admin</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 3. Limpieza Completa */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-[#f8f9fb] p-5 dark:border-slate-800/60 dark:bg-[#12161f]">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                Limpieza Total
                            </span>
                        </div>
                        <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">
                            Purga completa e instantánea de todo el almacén de caché del sistema (público y administración).
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={clearingScope !== null}
                        onClick={() => handleClearCache('all')}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-xs transition hover:bg-rose-600 hover:text-white hover:border-rose-600 disabled:opacity-50 dark:border-rose-500/30 dark:bg-[#161b24] dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white"
                    >
                        {clearingScope === 'all' ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Purgando Todo...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 text-rose-500" />
                                <span>Vaciar Toda la Caché</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

