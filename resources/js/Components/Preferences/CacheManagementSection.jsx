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
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126] dark:shadow-none sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                    <Database className="h-5 w-5 text-brand-primary" />
                    <div>
                        <h2 className="text-base font-bold text-[#293951] dark:text-[#ffffff]">
                            Rendimiento y Mantenimiento de Caché
                        </h2>
                        <p className="mt-0.5 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
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
                <div className="flex flex-col justify-between rounded-2xl bg-[#ebf1f7] p-5 dark:bg-[#16191c]">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                                <Globe className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-[#293951] dark:text-[#ffffff]">
                                Sitio Público
                            </span>
                        </div>
                        <p className="mt-2.5 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                            Limpia la caché de la portada, listados de CPTs y páginas públicas de contenidos y proyectos.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={clearingScope !== null}
                        onClick={() => handleClearCache('public')}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#293951] shadow-sm transition hover:bg-brand-primary hover:text-white disabled:opacity-50 dark:bg-[#1e2126] dark:text-[#ffffff] dark:hover:bg-brand-primary"
                    >
                        {clearingScope === 'public' ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Limpiando...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 text-[#95aac9] group-hover:text-white dark:text-[#a7a6a8]" />
                                <span>Vaciar Caché Pública</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 2. Caché del Panel de Administración */}
                <div className="flex flex-col justify-between rounded-2xl bg-[#ebf1f7] p-5 dark:bg-[#16191c]">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-[#293951] dark:text-[#ffffff]">
                                Panel de Administración
                            </span>
                        </div>
                        <p className="mt-2.5 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                            Limpia la caché de navegación de CPTs asignados, contadores de módulos y preferencias de usuarios.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={clearingScope !== null}
                        onClick={() => handleClearCache('admin')}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#293951] shadow-sm transition hover:bg-brand-secondary hover:text-white disabled:opacity-50 dark:bg-[#1e2126] dark:text-[#ffffff] dark:hover:bg-brand-secondary"
                    >
                        {clearingScope === 'admin' ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Limpiando...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 text-[#95aac9] group-hover:text-white dark:text-[#a7a6a8]" />
                                <span>Vaciar Caché de Admin</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 3. Limpieza Completa */}
                <div className="flex flex-col justify-between rounded-2xl bg-[#ebf1f7] p-5 dark:bg-[#16191c]">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-[#293951] dark:text-[#ffffff]">
                                Limpieza Total
                            </span>
                        </div>
                        <p className="mt-2.5 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                            Purga completa e instantánea de todo el almacén de caché del sistema (público y administración).
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={clearingScope !== null}
                        onClick={() => handleClearCache('all')}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#293951] shadow-sm transition hover:bg-rose-600 hover:text-white disabled:opacity-50 dark:bg-[#1e2126] dark:text-[#ffffff] dark:hover:bg-rose-600"
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

