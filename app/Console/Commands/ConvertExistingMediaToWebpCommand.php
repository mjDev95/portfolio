<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Support\ImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ConvertExistingMediaToWebpCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:convert-to-webp {--force : Force conversion of files already registered as WebP} {--recompress-bloat : Recompress large WebP files that exceed original sizes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convert existing original media files (JPG, PNG) to WebP Lossless and safely update the database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        @ini_set('memory_limit', '1024M');
        $disk = Storage::disk('public');
        $force = (bool) $this->option('force');
        $recompressBloat = (bool) $this->option('recompress-bloat');

        $query = Media::query();
        if (! $force && ! $recompressBloat) {
            $query->where('mime_type', '!=', 'image/webp');
        } elseif ($recompressBloat && ! $force) {
            $query->where(function ($q) {
                $q->where('mime_type', '!=', 'image/webp')
                    ->orWhere('file_size', '>', 3 * 1024 * 1024);
            });
        }

        $items = $query->get();
        $total = $items->count();

        if ($total === 0) {
            $this->info('No existing media files require WebP conversion.');

            return self::SUCCESS;
        }

        $this->info("Found {$total} media file(s) to convert to WebP Lossless...");

        $convertedCount = 0;
        $skippedCount = 0;
        $failedCount = 0;
        $totalBytesSaved = 0;

        foreach ($items as $media) {
            if (! $disk->exists($media->file_path)) {
                $this->warn("  ⚠ File missing on disk: {$media->file_path}");
                $skippedCount++;

                continue;
            }

            $sourceAbsolute = storage_path('app/public/'.$media->file_path);
            $dirname = dirname($media->file_path);
            $filenameNoExt = pathinfo($media->file_path, PATHINFO_FILENAME);
            $extension = strtolower(pathinfo($media->file_path, PATHINFO_EXTENSION));

            if ($extension === 'webp' && ! $force && ! $recompressBloat) {
                $skippedCount++;

                continue;
            }

            // Si es recompressBloat pero ya es webp, source y target pueden coincidir
            $isSamePath = ($extension === 'webp');
            $targetRelative = ($dirname !== '.' ? $dirname.'/' : '').$filenameNoExt.'.webp';
            $targetAbsolute = storage_path('app/public/'.$targetRelative);

            $oldSize = (int) filesize($sourceAbsolute);

            if ($isSamePath) {
                // Recomprimir archivo WebP pesado existente a calidad 90 para reducir drásticamente su tamaño
                $success = ImageOptimizer::recompressWebpWithHighQuality($sourceAbsolute, 90);
                if (! $success) {
                    $skippedCount++;

                    continue;
                }
            } else {
                // Realizar la conversión WebP
                $success = ImageOptimizer::convertToWebpLossless($sourceAbsolute, $targetAbsolute);
            }

            if (! $success || ! file_exists($targetAbsolute) || filesize($targetAbsolute) === 0) {
                $this->error("  ✗ Failed to convert: {$media->file_path}");
                $failedCount++;

                continue;
            }

            $newSize = (int) filesize($targetAbsolute);
            $savedBytes = max(0, $oldSize - $newSize);
            $totalBytesSaved += $savedBytes;

            // Actualizar registro en BD
            $newFileName = pathinfo($media->file_name, PATHINFO_FILENAME).'.webp';
            $oldFilePath = $media->file_path;

            $media->update([
                'file_path' => $targetRelative,
                'file_name' => $newFileName,
                'mime_type' => 'image/webp',
                'file_size' => $newSize,
            ]);

            // Si no tiene miniatura, generarla a partir del nuevo WebP
            if (blank($media->thumbnail_path)) {
                $thumbRelative = ($dirname !== '.' ? $dirname.'/' : '').'thumbs/'.$filenameNoExt.'.webp';
                $thumbAbsolute = storage_path('app/public/'.$thumbRelative);
                if (ImageOptimizer::generateGridThumbnail($targetAbsolute, $thumbAbsolute, 360, 80)) {
                    $media->update(['thumbnail_path' => $thumbRelative]);
                }
            }

            // Eliminar archivo original viejo si ya no es referenciado por ningún otro medio
            $isUsedElsewhere = Media::where('file_path', $oldFilePath)->where('id', '!=', $media->id)->exists();
            if (! $isUsedElsewhere && $oldFilePath !== $targetRelative && file_exists($sourceAbsolute)) {
                @unlink($sourceAbsolute);
            }

            $convertedCount++;
            $oldKb = round($oldSize / 1024, 1);
            $newKb = round($newSize / 1024, 1);
            $savedPct = $oldSize > 0 ? round((($oldSize - $newSize) / $oldSize) * 100, 1) : 0;

            $this->line("  ✓ [ID {$media->id}] {$media->file_name} → {$newKb} KB (antes {$oldKb} KB, -{$savedPct}%)");

            gc_collect_cycles();
        }

        $totalSavedMb = round($totalBytesSaved / (1024 * 1024), 2);
        $this->info("Completed: {$convertedCount} file(s) converted to WebP Lossless, {$skippedCount} skipped, {$failedCount} failed.");
        if ($totalSavedMb > 0) {
            $this->info("Total disk space saved: {$totalSavedMb} MB");
        }

        return self::SUCCESS;
    }
}
