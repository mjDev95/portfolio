import { FileCheck, Sparkles, Check, Info } from 'lucide-react';

export default function ImageCompressionSection({ compression, onCompressionChange }) {
    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-7">
            <div className="flex items-center gap-2.5">
                <FileCheck className="h-5 w-5 text-brand-primary" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Compresión y Optimización de Imágenes
                </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Elige el motor de procesamiento WebP aplicado a los archivos multimedia que subas a la plataforma.
            </p>

            {/* Banner Informativo sobre Retroactividad */}
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-blue-50/80 p-4 text-xs text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                <Info className="h-4 w-4 shrink-0 text-brand-primary mt-0.5" />
                <p className="leading-relaxed">
                    <strong className="font-semibold">Aviso sobre archivos existentes:</strong> El método de compresión seleccionado se aplicará a partir del momento en que guardes los cambios a las <span className="underline decoration-brand-primary underline-offset-2">nuevas imágenes</span> que subas. Las imágenes y miniaturas subidas previamente conservarán su estado y fidelidad original.
                </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Opción 1: Lossless */}
                <button
                    type="button"
                    onClick={() => onCompressionChange('lossless')}
                    className={`flex flex-col items-start rounded-2xl p-5 text-start transition ${
                        compression === 'lossless'
                            ? 'border-2 border-brand-primary/60 bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30 dark:bg-brand-primary/20 dark:text-brand-primary'
                            : 'border border-slate-200/80 bg-[#f8f9fb] text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white'
                    }`}
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary">
                                <FileCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-base font-bold text-slate-900 dark:text-white block">
                                    WebP Lossless (Original)
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Fidelidad 100% sin pérdida
                                </span>
                            </div>
                        </div>
                        {compression === 'lossless' && (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm">
                                <Check className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Mantiene intactos los píxeles originales y canales alfa. Recomendado para diagramas, UI mockups, capturas nítidas y logotipos donde cada detalle cuenta.
                    </p>
                </button>

                {/* Opción 2: Lossy 90% */}
                <button
                    type="button"
                    onClick={() => onCompressionChange('lossy90')}
                    className={`flex flex-col items-start rounded-2xl p-5 text-start transition ${
                        compression === 'lossy90'
                            ? 'border-2 border-emerald-500/60 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'border border-slate-200/80 bg-[#f8f9fb] text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-[#12161f] dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white'
                    }`}
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-base font-bold text-slate-900 dark:text-white block">
                                    WebP Optimizado 90%
                                </span>
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    Alta compresión y carga ultrarrápida
                                </span>
                            </div>
                        </div>
                        {compression === 'lossy90' && (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                                <Check className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Aplica compresión visual al 90% preservando la resolución nativa y reduciendo drásticamente el peso del archivo. Ideal para galerías pesadas y fotografías.
                    </p>
                </button>
            </div>
        </div>
    );
}

