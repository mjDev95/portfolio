import { FileCheck, Sparkles, Check, Info } from 'lucide-react';

export default function ImageCompressionSection({ compression, onCompressionChange }) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126] dark:shadow-none sm:p-7">
            <div className="flex items-center gap-2.5">
                <FileCheck className="h-5 w-5 text-brand-primary" />
                <h2 className="text-base font-bold text-[#293951] dark:text-[#ffffff]">
                    Compresión y Optimización de Imágenes
                </h2>
            </div>
            <p className="mt-1 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
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
                            ? 'bg-brand-primary/15 text-brand-primary ring-2 ring-brand-primary/40 dark:bg-brand-primary/20 dark:text-brand-primary'
                            : 'bg-[#ebf1f7] text-[#95aac9] hover:bg-white hover:text-[#293951] dark:bg-[#16191c] dark:text-[#a7a6a8] dark:hover:bg-[#20252b] dark:hover:text-[#ffffff]'
                    }`}
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary">
                                <FileCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-base font-bold text-[#293951] dark:text-[#ffffff] block">
                                    WebP Lossless (Original)
                                </span>
                                <span className="text-[11px] text-[#95aac9] dark:text-[#a7a6a8]">
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
                    <p className="mt-3 text-xs leading-relaxed text-[#95aac9] dark:text-[#a7a6a8]">
                        Mantiene intactos los píxeles originales y canales alfa. Recomendado para diagramas, UI mockups, capturas nítidas y logotipos donde cada detalle cuenta.
                    </p>
                </button>

                {/* Opción 2: Lossy 90% */}
                <button
                    type="button"
                    onClick={() => onCompressionChange('lossy90')}
                    className={`flex flex-col items-start rounded-2xl p-5 text-start transition ${
                        compression === 'lossy90'
                            ? 'bg-emerald-500/15 text-emerald-600 ring-2 ring-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-[#ebf1f7] text-[#95aac9] hover:bg-white hover:text-[#293951] dark:bg-[#16191c] dark:text-[#a7a6a8] dark:hover:bg-[#20252b] dark:hover:text-[#ffffff]'
                    }`}
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-base font-bold text-[#293951] dark:text-[#ffffff] block">
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
                    <p className="mt-3 text-xs leading-relaxed text-[#95aac9] dark:text-[#a7a6a8]">
                        Aplica compresión visual al 90% preservando la resolución nativa y reduciendo drásticamente el peso del archivo. Ideal para galerías pesadas y fotografías.
                    </p>
                </button>
            </div>
        </div>
    );
}

