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
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800/40 dark:bg-[#1e2126] sm:p-8">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 dark:border-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary">
                        <FileCode2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-heading text-xl font-bold tracking-tight text-[#293951] dark:text-white sm:text-2xl">
                            Tokens de Diseño & Exportación
                        </h2>
                        <p className="mt-0.5 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                            Exporta los colores y tokens a Tailwind CSS, variables CSS nativas o JSON estructurado.
                        </p>
                    </div>
                </div>

                {/* Selector de Pestaña y Botón Copiar */}
                <div className="flex items-center gap-2">
                    <div className="flex rounded-xl bg-[#ebf1f7] p-1 dark:bg-[#16191c]">
                        <button
                            type="button"
                            onClick={() => setActiveTab('tailwind')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                activeTab === 'tailwind'
                                    ? 'bg-white text-[#293951] shadow-xs dark:bg-[#1e2126] dark:text-white'
                                    : 'text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-white'
                            }`}
                        >
                            Tailwind CSS
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('css')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                activeTab === 'css'
                                    ? 'bg-white text-[#293951] shadow-xs dark:bg-[#1e2126] dark:text-white'
                                    : 'text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-white'
                            }`}
                        >
                            CSS Variables
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('json')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                activeTab === 'json'
                                    ? 'bg-white text-[#293951] shadow-xs dark:bg-[#1e2126] dark:text-white'
                                    : 'text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-white'
                            }`}
                        >
                            Tokens JSON
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-primary-hover active:scale-95"
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
            <div className="relative mt-6 overflow-hidden rounded-2xl bg-[#0B0D0E] p-6 shadow-inner">
                <pre className="max-h-[480px] overflow-x-auto font-mono text-xs leading-relaxed text-zinc-300">
                    <code>{currentCode}</code>
                </pre>
            </div>
        </div>
    );
}

