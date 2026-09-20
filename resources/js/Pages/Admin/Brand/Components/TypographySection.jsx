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
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800/40 dark:bg-[#1e2126] sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                            <Type className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-heading text-xl font-bold tracking-tight text-[#293951] dark:text-white sm:text-2xl">
                                    Sistema Tipográfico Oficial
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    2 Familias Activas
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                                Tipografías reales configuradas en Tailwind CSS y servidas de alto rendimiento vía Bunny Fonts.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[#95aac9]">
                        <span className="rounded-lg bg-gray-100 px-2 py-1 dark:bg-gray-800 dark:text-gray-300">
                            font-heading
                        </span>
                        <span>+</span>
                        <span className="rounded-lg bg-gray-100 px-2 py-1 dark:bg-gray-800 dark:text-gray-300">
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
                                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50/60 p-6 transition hover:border-gray-200 dark:border-gray-800/50 dark:bg-[#181b1f] dark:hover:border-gray-700/60"
                            >
                                <div>
                                    {/* Cabecera de la Fuente */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                                                {font.role}
                                            </span>
                                            <h3 className={`mt-1 text-2xl font-bold text-[#293951] dark:text-white ${font.fontClass}`}>
                                                {font.name}
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(font.fontClass)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200/80 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-[#293951] shadow-2xs transition hover:bg-gray-50 dark:border-gray-700/60 dark:bg-[#16191c] dark:text-white"
                                            title="Copiar clase de Tailwind"
                                        >
                                            <Copy className="h-3 w-3 text-[#95aac9]" />
                                            <span>{copiedClass === font.fontClass ? '¡Copiado!' : font.fontClass}</span>
                                        </button>
                                    </div>

                                    <p className="mt-3 text-xs leading-relaxed text-[#52525b] dark:text-[#a7a6a8]">
                                        {font.description}
                                    </p>

                                    {/* Selector interactivo de Pesos */}
                                    <div className="mt-5 space-y-2">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-semibold text-[#293951] dark:text-white">
                                                Pesos cargados en Bunny Fonts:
                                            </span>
                                            <span className="font-mono text-[#95aac9]">
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
                                                            : 'border border-gray-200 bg-white text-[#52525b] hover:bg-gray-100 dark:border-gray-700 dark:bg-[#16191c] dark:text-gray-300 dark:hover:bg-[#20252b]'
                                                    }`}
                                                >
                                                    {weight}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Input editable para probar la tipografía en vivo */}
                                    <div className="mt-5">
                                        <label className="block text-[11px] font-medium text-[#95aac9] dark:text-[#a7a6a8]">
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
                                            className="mt-1 w-full rounded-xl border-0 bg-white px-3 py-2 text-xs text-[#293951] shadow-2xs focus:ring-2 focus:ring-brand-primary dark:bg-[#16191c] dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Muestra Renderizada Real */}
                                <div className="mt-6 border-t border-gray-200/50 pt-4 dark:border-gray-800/60">
                                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#95aac9] dark:text-[#a7a6a8]">
                                        <span>Render en Vivo</span>
                                        <span className="font-mono text-lowercase">{font.cssFamily}</span>
                                    </div>
                                    <div
                                        className={`mt-2 text-xl text-[#293951] dark:text-white ${font.fontClass}`}
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
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800/40 dark:bg-[#1e2126] sm:p-8">
                <div className="flex items-center gap-2.5">
                    <Sliders className="h-5 w-5 text-brand-primary" />
                    <h3 className="font-heading text-lg font-bold text-[#293951] dark:text-white">
                        Escala Fluida con clamp() & Jerarquía en Tailwind
                    </h3>
                </div>
                <p className="mt-1 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                    Escala tipográfica proporcional que responde de forma fluida a pantallas móviles y desktop sin saltos bruscos.
                </p>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 text-[#95aac9] dark:border-gray-800/60 dark:text-[#a7a6a8]">
                                <th className="pb-3 font-semibold uppercase tracking-wider">Nivel / Jerarquía</th>
                                <th className="pb-3 font-semibold uppercase tracking-wider">Función CSS Nativa clamp()</th>
                                <th className="pb-3 font-semibold uppercase tracking-wider">Clases Tailwind</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
                            {BRAND_TYPOGRAPHY.scales.map((s) => (
                                <tr key={s.label} className="transition hover:bg-gray-50/50 dark:hover:bg-[#181b1f]">
                                    <td className="py-3.5 font-semibold text-[#293951] dark:text-white">
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
