<?php

use App\Models\ContentType;
use App\Models\CustomField;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $proyectosCpt = ContentType::where('slug', 'proyectos')->first();

        if ($proyectosCpt) {
            // 1. Eliminar campos 'subtitle' y 'metrics_summary' de custom_fields
            CustomField::where('content_type_id', $proyectosCpt->id)
                ->whereIn('name', ['subtitle', 'metrics_summary'])
                ->delete();

            // 2. Registrar el nuevo campo 'summary' (Resumen del Proyecto, textarea Markdown)
            CustomField::firstOrCreate(
                [
                    'content_type_id' => $proyectosCpt->id,
                    'name' => 'summary',
                ],
                [
                    'user_id' => $proyectosCpt->user_id,
                    'label' => 'Resumen del Proyecto',
                    'type' => 'textarea',
                    'placeholder' => 'Escribe una síntesis del proyecto (admite Markdown)...',
                    'is_required' => false,
                    'sort_order' => 1,
                ]
            );

            // Reajustar sort_orders existentes
            $fieldsOrder = [
                'summary' => 1,
                'client' => 2,
                'year' => 3,
                'role' => 4,
                'stack' => 5,
                'external_url' => 6,
                'github_url' => 7,
                'video_facade_url' => 8,
            ];

            foreach ($fieldsOrder as $fName => $order) {
                CustomField::where('content_type_id', $proyectosCpt->id)
                    ->where('name', $fName)
                    ->update(['sort_order' => $order]);
            }

            // 3. Migrar valores existentes en contents.custom_values para proyectos
            $contents = DB::table('contents')->where('content_type_id', $proyectosCpt->id)->get();

            foreach ($contents as $content) {
                $custom = json_decode($content->custom_values ?? '{}', true) ?: [];

                // Si tenía subtitle o un extracto previo, poblar summary si no existe
                $existingSummary = $custom['summary'] ?? null;
                if (empty($existingSummary)) {
                    $sourceText = $custom['subtitle'] ?? $content->excerpt ?? null;
                    if (! empty($sourceText)) {
                        $custom['summary'] = $sourceText;
                    }
                }

                // Limpiar claves eliminadas
                unset($custom['subtitle'], $custom['metrics_summary']);

                DB::table('contents')->where('id', $content->id)->update([
                    'custom_values' => json_encode($custom, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $proyectosCpt = ContentType::where('slug', 'proyectos')->first();

        if ($proyectosCpt) {
            CustomField::where('content_type_id', $proyectosCpt->id)
                ->where('name', 'summary')
                ->delete();

            CustomField::firstOrCreate(
                [
                    'content_type_id' => $proyectosCpt->id,
                    'name' => 'subtitle',
                ],
                [
                    'user_id' => $proyectosCpt->user_id,
                    'label' => 'Subtítulo',
                    'type' => 'text',
                    'placeholder' => 'Lema o descripción corta',
                    'is_required' => false,
                    'sort_order' => 1,
                ]
            );
        }
    }
};
