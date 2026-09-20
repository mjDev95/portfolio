<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Support\ImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateMediaThumbnailsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:generate-thumbnails {--force : Regenerate existing thumbnails}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate ultra-lightweight WebP thumbnails (~20 KB) for all existing media files';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $disk = Storage::disk('public');
        $force = $this->option('force');

        $query = Media::query();
        if (! $force) {
            $query->whereNull('thumbnail_path');
        }

        $items = $query->get();
        $total = $items->count();

        if ($total === 0) {
            $this->info('No media files require thumbnail generation.');

            return self::SUCCESS;
        }

        $this->info("Processing {$total} media files for thumbnail generation...");

        $successCount = 0;
        $skippedCount = 0;

        foreach ($items as $media) {
            if (! $disk->exists($media->file_path)) {
                $this->warn("File missing on disk: {$media->file_path}");
                $skippedCount++;

                continue;
            }

            $sourceAbsolute = storage_path('app/public/'.$media->file_path);
            $dirname = dirname($media->file_path);
            $filenameNoExt = pathinfo($media->file_path, PATHINFO_FILENAME);

            $thumbRelative = $dirname.'/thumbs/'.$filenameNoExt.'.webp';
            $thumbAbsolute = storage_path('app/public/'.$thumbRelative);

            // Generar miniatura ultraligera (~15-25 KB)
            $created = ImageOptimizer::generateGridThumbnail($sourceAbsolute, $thumbAbsolute, 360, 80);

            if ($created) {
                $media->update(['thumbnail_path' => $thumbRelative]);
                $successCount++;
                $thumbSizeKb = round(filesize($thumbAbsolute) / 1024, 1);
                $this->line("  ✓ Generated: {$thumbRelative} ({$thumbSizeKb} KB)");
            } else {
                $this->error("  ✗ Failed to generate thumbnail for: {$media->file_path}");
            }
        }

        $this->info("Finished! {$successCount} thumbnails generated, {$skippedCount} skipped.");

        return self::SUCCESS;
    }
}
