import { useState } from 'react';
import ColorSwatchCard from './ColorSwatchCard';
import { Download, Code2, Check, Pencil, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PaletteSection({
    palette,
    onToast,
    onEdit,
    onDelete,
    isActive = false,
    onActivate,
}) {
    const [downloading, setDownloading] = useState(false);
    const [copiedTokens, setCopiedTokens] = useState(false);

    const swatches = Array.isArray(palette.colors) && palette.colors.length > 0
        ? palette.colors.slice(0, 4)
        : [
            {
                label: 'Color Primario',
                title: 'Primario Principal',
                hex: palette.primary_color || '#CB2128',
                rgb: '203, 33, 40',
                role: 'CTA principal, interacción y conversión',
                darkContent: false,
            },
            {
                label: 'Color Secundario',
                title: 'Secundario Institucional',
                hex: palette.secondary_color || '#DFB136',
                rgb: '223, 177, 54',
                role: 'Prestigio, jerarquía y acentos secundarios',
                darkContent: true,
            },
            ...(palette.tertiary_color ? [{
                label: 'Color Terciario',
                title: 'Terciario Funcional',
                hex: palette.tertiary_color,
                rgb: '29, 78, 216',
                role: 'Arquitectura, tags y microinteracciones',
                darkContent: false,
            }] : []),
            ...(palette.accent_color ? [{
                label: 'Color de Acento',
                title: 'Acento Destacado',
                hex: palette.accent_color,
                rgb: '245, 158, 11',
                role: 'Destacados, badges especiales e hitos',
                darkContent: true,
            }] : []),
        ];

    // Descargar Paleta como PNG en Alta Definición (Retina 2x) usando Canvas 2D nativo
    const handleDownloadPng = () => {
        setDownloading(true);
        try {
            const scale = 2;
            const cardWidth = 260;
            const cardHeight = 320;
            const gap = 20;
            const padding = 44;
            const headerHeight = 90;

            const totalCols = swatches.length <= 4 ? swatches.length : Math.min(swatches.length, 4);
            const totalRows = Math.ceil(swatches.length / totalCols);

            const canvasWidth = padding * 2 + totalCols * cardWidth + (totalCols - 1) * gap;
            const canvasHeight = padding * 2 + headerHeight + totalRows * cardHeight + (totalRows - 1) * gap;

            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth * scale;
            canvas.height = canvasHeight * scale;
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);

            // Fondo claro limpio
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Cabecera: Título de la paleta
            ctx.fillStyle = '#09090b';
            ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(palette.name, padding, padding + 28);

            if (palette.description) {
                ctx.fillStyle = '#52525b';
                ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText(palette.description, padding, padding + 54);
            }

            // Renderizado de tarjetas de muestra
            swatches.forEach((swatch, idx) => {
                const col = idx % totalCols;
                const row = Math.floor(idx / totalCols);
                const x = padding + col * (cardWidth + gap);
                const y = padding + headerHeight + row * (cardHeight + gap);
                const radius = 16;

                ctx.fillStyle = swatch.hex;
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(x, y, cardWidth, cardHeight, radius);
                } else {
                    ctx.rect(x, y, cardWidth, cardHeight);
                }
                ctx.fill();

                const textColor = swatch.darkContent ? '#0a0a0c' : '#ffffff';
                const mutedColor = swatch.darkContent ? 'rgba(10,10,12,0.65)' : 'rgba(255,255,255,0.7)';

                ctx.fillStyle = mutedColor;
                ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText(swatch.label.toUpperCase(), x + 18, y + 32);

                ctx.fillStyle = textColor;
                ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText(swatch.title, x + 18, y + 60);

                ctx.fillStyle = mutedColor;
                ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('HEX', x + 18, y + cardHeight - 56);

                ctx.fillStyle = textColor;
                ctx.font = '600 14px ui-monospace, SFMono-Regular, Menlo, monospace';
                ctx.fillText(swatch.hex, x + 18, y + cardHeight - 38);

                ctx.fillStyle = mutedColor;
                ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('RGB', x + 120, y + cardHeight - 56);

                ctx.fillStyle = textColor;
                ctx.font = '500 13px ui-monospace, SFMono-Regular, Menlo, monospace';
                ctx.fillText(swatch.rgb, x + 120, y + cardHeight - 38);
            });

            const cleanFilename = `paleta-${palette.id}.png`;
            const link = document.createElement('a');
            link.download = cleanFilename;
            link.href = canvas.toDataURL('image/png');
            link.click();

            if (onToast) onToast(cleanFilename, 'Imagen PNG generada y descargada');
        } catch (err) {
            console.error('Error al generar canvas de paleta:', err);
        } finally {
            setDownloading(false);
        }
    };

    // Copiar tokens CSS de esta paleta
    const handleCopyTokens = () => {
        const cssVariables = swatches
            .map((c) => {
                const varName = `--color-${c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                return `  ${varName}: ${c.hex}; /* RGB: ${c.rgb} */`;
            })
            .join('\n');

        const fullBlock = `/* ${palette.name} */\n:root {\n${cssVariables}\n}`;
        navigator.clipboard?.writeText(fullBlock);
        setCopiedTokens(true);
        if (onToast) onToast('CSS Variables', 'Tokens CSS de la paleta copiados al portapapeles');
        setTimeout(() => setCopiedTokens(false), 1600);
    };

    return (
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all dark:border-gray-800/40 dark:bg-[#1e2126] sm:p-8">
            {/* Header de la paleta */}
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 dark:border-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-[#293951] dark:text-white sm:text-3xl">
                        {palette.name}
                    </h2>

                    {isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Activa en Admin
                        </span>
                    ) : (
                        onActivate && (
                            <button
                                type="button"
                                onClick={() => onActivate(palette)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary transition hover:bg-brand-primary hover:text-white dark:bg-brand-primary/20 dark:hover:bg-brand-primary dark:hover:text-white"
                                title="Aplicar esta paleta al panel de administración"
                            >
                                <Sparkles className="h-3 w-3" />
                                <span>Usar en Admin</span>
                            </button>
                        )
                    )}
                </div>

                {/* Acciones de cabecera */}
                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={handleCopyTokens}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#293951] shadow-xs transition hover:bg-gray-50 dark:border-gray-700/60 dark:bg-[#16191c] dark:text-white dark:hover:bg-[#20252b]"
                        title="Copiar tokens CSS"
                    >
                        {copiedTokens ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Copiado</span>
                            </>
                        ) : (
                            <>
                                <Code2 className="h-3.5 w-3.5 text-[#95aac9] dark:text-[#a7a6a8]" />
                                <span>Tokens CSS</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadPng}
                        disabled={downloading}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#ebf1f7] px-3.5 py-2 text-xs font-semibold text-[#293951] shadow-xs transition hover:bg-[#dfe7ef] dark:bg-[#16191c] dark:text-white dark:hover:bg-[#20252b]"
                        title="Descargar paleta en PNG (Retina 2x)"
                    >
                        <Download className="h-3.5 w-3.5 text-[#95aac9] dark:text-[#a7a6a8]" />
                        <span>{downloading ? 'Generando...' : 'Descargar PNG'}</span>
                    </button>

                    {onEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit(palette)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#293951] shadow-xs transition hover:bg-gray-50 dark:border-gray-700/60 dark:bg-[#16191c] dark:text-white dark:hover:bg-[#20252b]"
                            title="Editar paleta"
                        >
                            <Pencil className="h-3.5 w-3.5 text-[#95aac9] dark:text-[#a7a6a8]" />
                            <span>Editar</span>
                        </button>
                    )}

                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(palette)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/60 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 shadow-xs transition hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                            title="Eliminar paleta"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Eliminar</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Grilla de colores (4 swatches) */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {swatches.map((color, index) => (
                    <ColorSwatchCard
                        key={`${palette.id}-${color.hex}-${index}`}
                        color={color}
                        onCopied={onToast}
                    />
                ))}
            </div>
        </section>
    );
}
