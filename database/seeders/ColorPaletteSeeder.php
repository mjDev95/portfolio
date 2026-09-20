<?php

namespace Database\Seeders;

use App\Models\ColorPalette;
use App\Models\User;
use Illuminate\Database\Seeder;

class ColorPaletteSeeder extends Seeder
{
    public function run(): void
    {
        $palettes = [
            [
                'name' => 'Cardinal & Aurum Carbon',
                'slug' => 'cardinal-aurum',
                'priority' => '01',
                'is_master' => true,
                'is_system' => true,
                'order' => 1,
                'tagline' => 'Identidad Maestra de Marca (Alto Prestigio & Conversión)',
                'description' => 'Armonía análoga cálida: Rojo conversión (#CB2128), Oro institucional (#DFB136), Zafiro (#1D4ED8) y Ámbar (#F59E0B).',
                'theory_title' => 'Construcción Técnica • Armonía Análoga Cálida',
                'theory_text' => 'Binomio Activo: Rojo Cardinal (#CB2128) para CTA de conversión y Radiant Aurum (#DFB136) para prestigio y jerarquía. Soporte Funcional: Sapphire Code (#1D4ED8) para arquitectura y Amber Flame (#F59E0B) para destacados.',
                'primary_color' => '#CB2128',
                'secondary_color' => '#DFB136',
                'tertiary_color' => '#1D4ED8',
                'accent_color' => '#F59E0B',
                'dark_neutral' => '#0B0D0E',
                'light_neutral' => '#F8F9FA',
                'colors' => [
                    [
                        'label' => 'Color Primario',
                        'title' => 'Cardinal Red',
                        'hex' => '#CB2128',
                        'rgb' => '203, 33, 40',
                        'hsb' => '358°, 84%, 80%',
                        'role' => 'CTA principal, conversión, botones de acción',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color Secundario',
                        'title' => 'Radiant Aurum',
                        'hex' => '#DFB136',
                        'rgb' => '223, 177, 54',
                        'hsb' => '44°, 76%, 87%',
                        'role' => 'Prestigio, jerarquía, acentos institucionales',
                        'darkContent' => true,
                    ],
                    [
                        'label' => 'Color Terciario',
                        'title' => 'Sapphire Code',
                        'hex' => '#1D4ED8',
                        'rgb' => '29, 78, 216',
                        'hsb' => '224°, 87%, 85%',
                        'role' => 'Arquitectura técnica, enlaces y tags',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color de Acento',
                        'title' => 'Amber Flame',
                        'hex' => '#F59E0B',
                        'rgb' => '245, 158, 11',
                        'hsb' => '38°, 92%, 96%',
                        'role' => 'Destacados, badges especiales e hitos',
                        'darkContent' => true,
                    ],
                ],
            ],
            [
                'name' => 'Carmine Nexus',
                'slug' => 'carmine-nexus',
                'priority' => '02',
                'is_master' => false,
                'is_system' => true,
                'order' => 2,
                'tagline' => 'Tetrádica Tech & Conversión Digital',
                'description' => 'Tetrádica cruzada: Carmesí para CTA, Zafiro para código, Cyber Teal en UI y Oro de prestigio.',
                'theory_title' => 'Construcción Técnica • Tetrádica de Doble Eje',
                'theory_text' => 'Eje Conversión: Carmine Tech (#CC282F) para interacción directa enfrentado a Cyber Teal (#00B4D8) para microinteracciones. Eje Estructura: Sapphire Code (#1D4ED8) para arquitectura front-end con respaldo de Prestige Gold (#D4AF37) en elementos de valor.',
                'primary_color' => '#CC282F',
                'secondary_color' => '#1D4ED8',
                'tertiary_color' => '#00B4D8',
                'accent_color' => '#D4AF37',
                'dark_neutral' => '#0B0D0E',
                'light_neutral' => '#F8F9FA',
                'colors' => [
                    [
                        'label' => 'Color Primario',
                        'title' => 'Carmine Tech',
                        'hex' => '#CC282F',
                        'rgb' => '204, 40, 47',
                        'hsb' => '357°, 80%, 80%',
                        'role' => 'Interacción directa y CTA de alto impacto',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color Secundario',
                        'title' => 'Sapphire Code',
                        'hex' => '#1D4ED8',
                        'rgb' => '29, 78, 216',
                        'hsb' => '224°, 87%, 85%',
                        'role' => 'Arquitectura front-end, enlaces técnicos',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color Terciario',
                        'title' => 'Cyber Teal',
                        'hex' => '#00B4D8',
                        'rgb' => '0, 180, 216',
                        'hsb' => '190°, 100%, 85%',
                        'role' => 'Microinteracciones, badges y estados activos',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color de Acento',
                        'title' => 'Prestige Gold',
                        'hex' => '#D4AF37',
                        'rgb' => '212, 175, 55',
                        'hsb' => '46°, 74%, 83%',
                        'role' => 'Elementos de alto valor y reconocimientos',
                        'darkContent' => true,
                    ],
                ],
            ],
            [
                'name' => 'Cobalt to Scarlet',
                'slug' => 'cobalt-scarlet',
                'priority' => '03',
                'is_master' => false,
                'is_system' => true,
                'order' => 3,
                'tagline' => 'Análogo Extendido HSB (Interfaces Complejas)',
                'description' => 'Análogo continuo: Transición espectral azul-rojo con saturación uniforme para interfaces complejas.',
                'theory_title' => 'Construcción Técnica • Análogo Extendido HSB',
                'theory_text' => 'Curva Espectral: Conexión fluida Cobalto (#2563EB) → Violeta (#7C3AED) → Magenta (#DB2777) → Carmesí (#E61E32). Equilibrio Óptico: Saturación calibrada al 84% y brillo al 92% para garantizar idéntico peso visual entre elementos.',
                'primary_color' => '#2563EB',
                'secondary_color' => '#7C3AED',
                'tertiary_color' => '#DB2777',
                'accent_color' => '#E61E32',
                'dark_neutral' => '#0B0D0E',
                'light_neutral' => '#F8F9FA',
                'colors' => [
                    [
                        'label' => 'Color Primario',
                        'title' => 'Cobalt Royal',
                        'hex' => '#2563EB',
                        'rgb' => '37, 99, 235',
                        'hsb' => '221°, 84%, 92%',
                        'role' => 'Eje estructural primario',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color Secundario',
                        'title' => 'Electric Violet',
                        'hex' => '#7C3AED',
                        'rgb' => '124, 58, 237',
                        'hsb' => '262°, 76%, 93%',
                        'role' => 'Transición espectral creativa',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color Terciario',
                        'title' => 'Neon Magenta',
                        'hex' => '#DB2777',
                        'rgb' => '219, 39, 119',
                        'hsb' => '333°, 82%, 86%',
                        'role' => 'Acentos lumínicos y feedback',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color de Acento',
                        'title' => 'Crimson Red',
                        'hex' => '#E61E32',
                        'rgb' => '230, 30, 50',
                        'hsb' => '354°, 87%, 90%',
                        'role' => 'Llamados de atención críticos',
                        'darkContent' => false,
                    ],
                ],
            ],
            [
                'name' => 'Acid Chartreuse & Periwinkle',
                'slug' => 'acid-chartreuse',
                'priority' => '04',
                'is_master' => false,
                'is_system' => true,
                'order' => 4,
                'tagline' => 'Tétrada Lumínica (Alto Contraste Creativo)',
                'description' => 'Tétrada lumínica: Alto contraste cromático con desaturación selectiva para entornos creativos.',
                'theory_title' => 'Construcción Técnica • Tétrada en Cruz',
                'theory_text' => 'Ejes Ortogonales: Oposición directa Lima Ácido (#DFE94B) / Violeta (#836CEC) combinada con Coral (#E57373) / Teal (#38B2AC). Calibración Lumínica: Desaturación selectiva (50–70%) para alta distinción funcional sin provocar fatiga retiniana.',
                'primary_color' => '#DFE94B',
                'secondary_color' => '#836CEC',
                'tertiary_color' => '#E57373',
                'accent_color' => '#38B2AC',
                'dark_neutral' => '#0F172A',
                'light_neutral' => '#F8FAFC',
                'colors' => [
                    [
                        'label' => 'Color Primario',
                        'title' => 'Acid Chartreuse',
                        'hex' => '#DFE94B',
                        'rgb' => '223, 233, 75',
                        'hsb' => '64°, 68%, 91%',
                        'role' => 'Puntos focales y atención instantánea',
                        'darkContent' => true,
                    ],
                    [
                        'label' => 'Color Secundario',
                        'title' => 'Periwinkle Violet',
                        'hex' => '#836CEC',
                        'rgb' => '131, 108, 236',
                        'hsb' => '251°, 54%, 93%',
                        'role' => 'Contrapeso cromático equilibrado',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color Terciario',
                        'title' => 'Soft Coral',
                        'hex' => '#E57373',
                        'rgb' => '229, 115, 115',
                        'hsb' => '0°, 50%, 90%',
                        'role' => 'Cálido secundario, alertas amables',
                        'darkContent' => true,
                    ],
                    [
                        'label' => 'Color de Acento',
                        'title' => 'Aqua Teal',
                        'hex' => '#38B2AC',
                        'rgb' => '56, 178, 172',
                        'hsb' => '177°, 69%, 70%',
                        'role' => 'Indicadores positivos y métricas',
                        'darkContent' => true,
                    ],
                ],
            ],
            [
                'name' => 'Sunglow & Ultramarine',
                'slug' => 'sunglow-ultramarine',
                'priority' => '05',
                'is_master' => false,
                'is_system' => true,
                'order' => 5,
                'tagline' => 'Rectangular Cromática (Analítica & Dashboards)',
                'description' => 'Rectangular analítica: Máxima diferenciación categórica para dashboards, gráficos y métricas.',
                'theory_title' => 'Construcción Técnica • Rectangular de 4 Vértices',
                'theory_text' => 'Pares Desfasados: Sunglow (#FFCA3A) / Ultramarine (#2563EB) articulados con Bermellón (#FF4500) / Bright Mint (#00E5A3). Propósito Analítico: Rápida identificación de variables complejas en visualización de datos con balance térmico neutro.',
                'primary_color' => '#FFCA3A',
                'secondary_color' => '#2563EB',
                'tertiary_color' => '#FF4500',
                'accent_color' => '#00E5A3',
                'dark_neutral' => '#0B0D0E',
                'light_neutral' => '#F8F9FA',
                'colors' => [
                    [
                        'label' => 'Color Primario',
                        'title' => 'Sunglow',
                        'hex' => '#FFCA3A',
                        'rgb' => '255, 202, 58',
                        'hsb' => '44°, 77%, 100%',
                        'role' => 'Métricas clave, rankings y proyecciones',
                        'darkContent' => true,
                    ],
                    [
                        'label' => 'Color Secundario',
                        'title' => 'Ultramarine',
                        'hex' => '#2563EB',
                        'rgb' => '37, 99, 235',
                        'hsb' => '221°, 84%, 92%',
                        'role' => 'Serie principal de datos comparativos',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color Terciario',
                        'title' => 'Vivid Vermilion',
                        'hex' => '#FF4500',
                        'rgb' => '255, 69, 0',
                        'hsb' => '16°, 100%, 100%',
                        'role' => 'Umbrales altos y límites operativos',
                        'darkContent' => false,
                    ],
                    [
                        'label' => 'Color de Acento',
                        'title' => 'Bright Mint',
                        'hex' => '#00E5A3',
                        'rgb' => '0, 229, 163',
                        'hsb' => '163°, 100%, 90%',
                        'role' => 'Crecimiento, conversiones e hitos superados',
                        'darkContent' => true,
                    ],
                ],
            ],
        ];

        $masterPalette = null;

        foreach ($palettes as $data) {
            $palette = ColorPalette::where('name', $data['name'])
                ->orWhere('slug', $data['slug'])
                ->first();

            if ($palette) {
                $palette->update($data);
            } else {
                $palette = ColorPalette::create($data);
            }

            if ($palette->is_master) {
                $masterPalette = $palette;
            }
        }

        // Link primary master palette to super admin user preference if not set or update colors
        if ($masterPalette) {
            $superAdmins = User::whereHas('role', fn ($q) => $q->where('slug', 'admin'))->get();
            foreach ($superAdmins as $admin) {
                $pref = $admin->preference;
                if ($pref) {
                    $pref->update([
                        'color_palette_id' => $masterPalette->id,
                        'color_palette' => [
                            'id' => (string) $masterPalette->id,
                            'name' => $masterPalette->name,
                            'colors' => [
                                'primary' => $masterPalette->primary_color,
                                'secondary' => $masterPalette->secondary_color,
                                'tertiary' => $masterPalette->tertiary_color,
                                'accent' => $masterPalette->accent_color,
                            ],
                        ],
                    ]);
                }
            }
        }
    }
}
