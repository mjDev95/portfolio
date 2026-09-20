import { useState } from 'react';
import { Copy, Check, FileCode2 } from 'lucide-react';
import { BRAND_PALETTES } from '../data/brandData';

export default function TokensCodeSection({ onToast }) {
    const [activeTab, setActiveTab] = useState('tailwind');
    const [copied, setCopied] = useState(false);

    // 1. Snippet para tailwind.config.js
    const tailwindSnippet = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#CB2128',          // Cardinal Red (CTA y Conversión)
          'primary-hover': '#ad171d',  // Cardinal Dark
          'primary-subtle': '#fdf2f2', // Tint de fondo
          secondary: '#DFB136',        // Radiant Aurum (Prestigio)
          'secondary-hover': '#c99e2e',
          carbon: '#0B0D0E',           // Obsidian Carbon (Neutro Oscuro)
          surface: '#F8FAFC',          // Mineral Off-White (Neutro Claro)
          carmine: '#CC282F',          // Carmine Tech
          sapphire: '#1D4ED8',         // Sapphire Code
          teal: '#00B4D8',             // Cyber Teal
          chartreuse: '#DFE94B',       // Acid Chartreuse
          periwinkle: '#836CEC',       // Periwinkle Violet
          sunglow: '#FFCA3A',          // Sunglow
          mint: '#00E5A3',             // Bright Mint
        },
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', '"Space Grotesk"', 'sans-serif'],
        body: ['"Aileron"', '"Inter"', 'sans-serif'],
      },
    },
  },
};`;

    // 2. Snippet para CSS Custom Properties (:root)
    const cssSnippet = `/* Variables Maestras de Marca (color.css) */
:root {
  /* Fuentes de Marca */
  --font-heading: 'Bricolage Grotesque', 'Space Grotesk', sans-serif;
  --font-body: 'Aileron', 'Inter', sans-serif;

  /* Prioridad 01: Cardinal & Aurum Carbon */
  --color-brand-primary: #CB2128;
  --color-brand-primary-rgb: 203, 33, 40;
  --color-brand-secondary: #DFB136;
  --color-brand-secondary-rgb: 223, 177, 54;
  --color-brand-carbon: #0B0D0E;
  --color-brand-carbon-rgb: 11, 13, 14;
  --color-brand-surface: #F8FAFC;
  --color-brand-surface-rgb: 248, 250, 252;

  /* Prioridad 02: Carmine Nexus */
  --color-carmine-tech: #CC282F;
  --color-sapphire-code: #1D4ED8;
  --color-cyber-teal: #00B4D8;
  --color-prestige-gold: #D4AF37;

  /* Prioridad 03: Cobalt to Scarlet */
  --color-cobalt-royal: #2563EB;
  --color-electric-violet: #7C3AED;
  --color-neon-magenta: #DB2777;
  --color-crimson-red: #E61E32;

  /* Prioridad 04: Acid Chartreuse & Periwinkle */
  --color-acid-chartreuse: #DFE94B;
  --color-periwinkle-violet: #836CEC;
  --color-soft-coral: #E57373;
  --color-aqua-teal: #38B2AC;

  /* Prioridad 05: Sunglow & Ultramarine */
  --color-sunglow: #FFCA3A;
  --color-ultramarine: #2563EB;
  --color-vivid-vermilion: #FF4500;
  --color-bright-mint: #00E5A3;
}`;

    // 3. Snippet JSON de tokens
    const jsonSnippet = JSON.stringify(
        {
            $schema: 'https://tr.designtokens.org/format/',
            brand: BRAND_PALETTES.reduce((acc, p) => {
                acc[p.id] = {
                    name: p.name,
                    priority: p.priority,
                    colors: p.colors.reduce((cAcc, c) => {
                        cAcc[c.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')] = {
                            $value: c.hex,
                            $type: 'color',
                            rgb: c.rgb,
                            role: c.label,
                        };
                        return cAcc;
                    }, {}),
                };
                return acc;
            }, {}),
        },
        null,
        2
    );

    const currentCode =
        activeTab === 'tailwind'
            ? tailwindSnippet
            : activeTab === 'css'
            ? cssSnippet
            : jsonSnippet;

    const handleCopy = () => {
        navigator.clipboard?.writeText(currentCode);
        setCopied(true);
        if (onToast) onToast('Código copiado', `Tokens ${activeTab.toUpperCase()} copiados`);
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary">
                        <FileCode2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                            Tokens de Diseño & Exportación
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Exporta los colores y tokens a Tailwind CSS, variables CSS nativas o JSON estructurado.
                        </p>
                    </div>
                </div>

                {/* Selector de Pestaña y Botón Copiar */}
                <div className="flex items-center gap-2">
                    <div className="flex rounded-full bg-slate-100 p-1 dark:bg-[#12161f]">
                        <button
                            type="button"
                            onClick={() => setActiveTab('tailwind')}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                activeTab === 'tailwind'
                                    ? 'bg-white text-slate-900 shadow-sm dark:bg-[#202735] dark:text-white'
                                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            Tailwind CSS
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('css')}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                activeTab === 'css'
                                    ? 'bg-white text-slate-900 shadow-sm dark:bg-[#202735] dark:text-white'
                                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            CSS Variables
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('json')}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                activeTab === 'json'
                                    ? 'bg-white text-slate-900 shadow-sm dark:bg-[#202735] dark:text-white'
                                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            Tokens JSON
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-primary-hover active:scale-95"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Copiado</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copiar Código</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Bloque de código con resaltado oscuro */}
            <div className="relative mt-6 overflow-hidden rounded-2xl bg-[#0e1219] p-6 shadow-inner ring-1 ring-slate-800/60">
                <pre className="max-h-[480px] overflow-x-auto font-mono text-xs leading-relaxed text-zinc-300">
                    <code>{currentCode}</code>
                </pre>
            </div>
        </div>
    );
}

