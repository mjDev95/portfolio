import { useState } from 'react';
import { BRAND_TYPOGRAPHY } from '../data/brandData';
import { Type, Sliders, CheckCircle2, Copy } from 'lucide-react';

export default function TypographySection() {
    const [previewTexts, setPreviewTexts] = useState({
        'Bricolage Grotesque': 'Diseño y desarrollo con intención.',
        'Poppins': 'Experiencias digitales intuitivas, fluidas y accesibles.',
    });
    const [selectedWeights, setSelectedWeights] = useState({
        'Bricolage Grotesque': '700',
        'Poppins': '400',
    });
    const [copiedClass, setCopiedClass] = useState(null);

    const handleCopy = (text) => {
        navigator.clipboard?.writeText(text);
        setCopiedClass(text);
        setTimeout(() => setCopiedClass(null), 1800);
    };

    return (
        <div className="space-y-8">
            {/* Cabecera & Contexto del Stack Tipográfico */}
            <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                            <Type className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                    Sistema Tipográfico Oficial
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    2 Familias Activas
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Tipografías reales configuradas en Tailwind CSS y servidas de alto rendimiento vía Bunny Fonts.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800 dark:text-slate-300">
                            font-heading
                        </span>
                        <span>+</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800 dark:text-slate-300">
                            font-sans
                        </span>
                    </div>
                </div>

                {/* Tarjetas de las 2 Fuentes Reales */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {BRAND_TYPOGRAPHY.fonts.map((font) => {
                        const weightsArray = font.weights.split(',').map((w) => w.trim());
                        const activeWeight = selectedWeights[font.name] || weightsArray[0];

                        return (
                            <div
                                key={font.name}
                                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-[#f8f9fb] p-6 transition hover:border-slate-200 dark:border-slate-800 dark:bg-[#12161f] dark:hover:border-slate-700/60"
                            >
                                <div>
                                    {/* Cabecera de la Fuente */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                                                {font.role}
                                            </span>
                                            <h3 className={`mt-1 text-2xl font-bold text-slate-900 dark:text-white ${font.fontClass}`}>
                                                {font.name}
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(font.fontClass)}
                                            className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#202735] dark:text-slate-300 dark:hover:bg-slate-700/50"
                                            title="Copiar clase de Tailwind"
                                        >
                                            <Copy className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                                            <span>{copiedClass === font.fontClass ? '¡Copiado!' : font.fontClass}</span>
                                        </button>
                                    </div>

                                    <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                        {font.description}
                                    </p>

                                    {/* Selector interactivo de Pesos */}
                                    <div className="mt-5 space-y-2">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                Pesos cargados en Bunny Fonts:
                                            </span>
                                            <span className="font-mono text-slate-400 dark:text-slate-500">
                                                font-weight: {activeWeight}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {weightsArray.map((weight) => (
                                                <button
                                                    key={weight}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedWeights((prev) => ({
                                                            ...prev,
                                                            [font.name]: weight,
                                                        }))
                                                    }
                                                    className={`rounded-lg px-2.5 py-1 text-xs font-mono transition ${
                                                        activeWeight === weight
                                                            ? 'bg-brand-primary font-bold text-white shadow-xs'
                                                            : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#12161f] dark:text-slate-300 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    {weight}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Input editable para probar la tipografía en vivo */}
                                    <div className="mt-5">
                                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            Escribe para probar en vivo:
                                        </label>
                                        <input
                                            type="text"
                                            value={previewTexts[font.name]}
                                            onChange={(e) =>
                                                setPreviewTexts((prev) => ({
                                                    ...prev,
                                                    [font.name]: e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Muestra Renderizada Real */}
                                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        <span>Render en Vivo</span>
                                        <span className="font-mono text-lowercase">{font.cssFamily}</span>
                                    </div>
                                    <div
                                        className={`mt-2 text-xl text-slate-900 dark:text-white ${font.fontClass}`}
                                        style={{ fontWeight: Number(activeWeight) || 400 }}
                                    >
                                        {previewTexts[font.name] || 'Texto de ejemplo'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Escala tipográfica fluida */}
            <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                <div className="flex items-center gap-2.5">
                    <Sliders className="h-5 w-5 text-brand-primary" />
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        Escala Fluida con clamp() & Jerarquía en Tailwind
                    </h3>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Escala tipográfica proporcional que responde de forma fluida a pantallas móviles y desktop sin saltos bruscos.
                </p>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Nivel / Jerarquía</th>
                                <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Función CSS Nativa clamp()</th>
                                <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Clases Tailwind</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {BRAND_TYPOGRAPHY.scales.map((s) => (
                                <tr key={s.label} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-[#1c222e]/60">
                                    <td className="py-3.5 font-semibold text-slate-900 dark:text-white">
                                        {s.label}
                                    </td>
                                    <td className="py-3.5 font-mono text-emerald-600 dark:text-emerald-400">
                                        {s.clamp}
                                    </td>
                                    <td className="py-3.5 font-mono text-brand-primary">
                                        {s.tailwind}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
