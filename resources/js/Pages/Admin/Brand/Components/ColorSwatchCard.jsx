import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ColorSwatchCard({ color, onCopied }) {
    const [copiedHex, setCopiedHex] = useState(false);
    const [copiedRgb, setCopiedRgb] = useState(false);

    const isDarkText = color.darkContent;
    const textClass = isDarkText ? 'text-[#0a0a0c]' : 'text-white';
    const mutedClass = isDarkText ? 'text-[#0a0a0c]/70' : 'text-white/70';
    const btnBgClass = isDarkText
        ? 'bg-black/10 hover:bg-black/20 text-[#0a0a0c]'
        : 'bg-white/20 hover:bg-white/30 text-white';

    const handleCopyHex = (e) => {
        e?.stopPropagation();
        navigator.clipboard?.writeText(color.hex);
        setCopiedHex(true);
        if (onCopied) onCopied(color.hex, `${color.title} (${color.hex}) copiado al portapapeles`);
        setTimeout(() => setCopiedHex(false), 1600);
    };

    const handleCopyRgb = (e) => {
        e?.stopPropagation();
        const rgbText = `rgb(${color.rgb})`;
        navigator.clipboard?.writeText(rgbText);
        setCopiedRgb(true);
        if (onCopied) onCopied(rgbText, `RGB ${color.rgb} copiado al portapapeles`);
        setTimeout(() => setCopiedRgb(false), 1600);
    };

    return (
        <div
            onClick={handleCopyHex}
            style={{ backgroundColor: color.hex }}
            className="group relative flex min-h-[260px] cursor-pointer flex-col justify-between rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:min-h-[290px]"
        >
            {/* Cabecera del swatch */}
            <div>
                <span className={`block text-xs font-semibold uppercase tracking-wider ${mutedClass}`}>
                    {color.label}
                </span>
                <h3 className={`mt-1 font-heading text-xl font-bold tracking-tight sm:text-2xl ${textClass}`}>
                    {color.title}
                </h3>
                {color.role && (
                    <p className={`mt-1.5 text-xs line-clamp-2 ${mutedClass}`}>
                        {color.role}
                    </p>
                )}
            </div>

            {/* Metadatos inferiores: HEX y RGB */}
            <div className="pt-6">
                <div className="flex items-end justify-between gap-3">
                    <div className="space-y-2">
                        <div>
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${mutedClass}`}>
                                HEX
                            </div>
                            <div className={`font-mono text-sm font-semibold tracking-wide ${textClass}`}>
                                {color.hex}
                            </div>
                        </div>
                        <div>
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${mutedClass}`}>
                                RGB
                            </div>
                            <div className={`font-mono text-xs font-medium ${mutedClass}`}>
                                {color.rgb}
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción rápida */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={handleCopyHex}
                            title="Copiar código HEX"
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-sm transition-all ${btnBgClass}`}
                        >
                            {copiedHex ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                                <Copy className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

