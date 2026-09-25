<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('content_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_id')->constrained('contents')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->string('collection')->default('thumbnail'); // thumbnail, hero, gallery
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['content_id', 'media_id', 'collection']);
            $table->index(['content_id', 'collection']);
        });

        // ── 1. Migrar asociaciones existentes desde media a content_media ──────────
        $existingAttachedMedia = DB::table('media')
            ->whereNotNull('content_id')
            ->orWhere(function ($q) {
                $q->where('mediable_type', 'App\\Models\\Content')
                    ->whereNotNull('mediable_id');
            })
            ->get();

        foreach ($existingAttachedMedia as $row) {
            $targetContentId = $row->content_id ?: $row->mediable_id;

            // Verificar que el contenido exista
            $contentExists = DB::table('contents')->where('id', $targetContentId)->exists();
            if (! $contentExists) {
                continue;
            }

            $collection = in_array($row->collection, ['thumbnail', 'hero', 'gallery'], true)
                ? $row->collection
                : 'thumbnail';

            DB::table('content_media')->updateOrInsert(
                [
                    'content_id' => $targetContentId,
                    'media_id' => $row->id,
                    'collection' => $collection,
                ],
                [
                    'order' => $row->order ?? 0,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at ?? now(),
                ]
            );
        }

        // ── 2. Consolidar registros duplicados en media por file_path ───────────
        // Agrupar filas que compartan el mismo file_path y user_id
        $duplicateGroups = DB::table('media')
            ->select('file_path', 'user_id', DB::raw('count(*) as total'))
            ->groupBy('file_path', 'user_id')
            ->having('total', '>', 1)
            ->get();

        foreach ($duplicateGroups as $group) {
            $rows = DB::table('media')
                ->where('file_path', $group->file_path)
                ->where('user_id', $group->user_id)
                ->orderByRaw("CASE WHEN collection = 'library' THEN 0 ELSE 1 END")
                ->orderBy('id')
                ->get();

            if ($rows->count() <= 1) {
                continue;
            }

            $primaryMedia = $rows->first();
            $duplicateIds = $rows->slice(1)->pluck('id')->all();

            // Reasignar asociaciones en content_media hacia el ID principal
            foreach ($duplicateIds as $dupId) {
                $attachedRecords = DB::table('content_media')->where('media_id', $dupId)->get();
                foreach ($attachedRecords as $att) {
                    DB::table('content_media')->updateOrInsert(
                        [
                            'content_id' => $att->content_id,
                            'media_id' => $primaryMedia->id,
                            'collection' => $att->collection,
                        ],
                        [
                            'order' => $att->order,
                            'updated_at' => now(),
                        ]
                    );
                }

                DB::table('content_media')->where('media_id', $dupId)->delete();
                DB::table('media')->where('id', $dupId)->delete();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_media');
    }
};
