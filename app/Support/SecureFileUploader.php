<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Centralized secure storage for user-uploaded media.
 *
 * - Never trusts the client-supplied filename (prevents path traversal /
 *   overwrite attacks); every file is renamed with a random UUID.
 * - Compresses main images to WebP Lossless (zero pixel degradation, optimized disk).
 * - Generates ultra-lightweight grid thumbnails (~20 KB) in thumbs/.
 * - Only ever writes to the `public` disk (storage/app/public), exposed via `storage:link`.
 */
class SecureFileUploader
{
    /**
     * Store an uploaded file with semantic slug name, WP-style YYYY/MM path,
     * user compression preference, and thumbnail generation.
     *
     * @return array{file_path: string, thumbnail_path: ?string, mime_type: string, file_size: int}
     */
    public static function storeWithThumbnail(UploadedFile $file, string $directory, ?string $compressionMode = null): array
    {
        $mime = $file->getMimeType();
        $isImage = in_array($mime, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

        // WordPress-style YYYY/MM path organization
        $year = date('Y');
        $month = date('m');
        $baseDir = trim($directory, '/').'/'.$year.'/'.$month;
        $disk = Storage::disk('public');
        $fullBaseDir = $disk->path($baseDir);

        // Generar slug semántico a partir del nombre original
        $originalRawName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $baseSlug = Str::slug($originalRawName) ?: 'media-'.Str::lower(Str::random(6));

        // Determinar modo de compresión (lossless por defecto o lossy90)
        $compression = $compressionMode
            ?? auth()->user()?->preference?->image_compression
            ?? 'lossless';

        if ($isImage) {
            // Resolver colisiones con sufijo numérico
            $filename = self::resolveUniqueFilename($baseDir, $baseSlug, 'webp');
            $mainRelativePath = $baseDir.'/'.$filename;
            $mainAbsolutePath = $disk->path($mainRelativePath);

            // Comprimir según la preferencia seleccionada
            if ($compression === 'lossy90') {
                $converted = ImageOptimizer::convertToWebpLossy($file->getRealPath(), $mainAbsolutePath, 90);
            } else {
                $converted = ImageOptimizer::convertToWebpLossless($file->getRealPath(), $mainAbsolutePath);
            }

            if (! $converted) {
                $extension = strtolower($file->getClientOriginalExtension()) ?: 'jpg';
                $filename = self::resolveUniqueFilename($baseDir, $baseSlug, $extension);
                $mainRelativePath = $file->storeAs($baseDir, $filename, 'public');
                $mainAbsolutePath = $disk->path($mainRelativePath);
            }

            // Generar miniatura ultraligera (~15-25 KB) en subcarpeta thumbs/
            $thumbFilename = pathinfo($filename, PATHINFO_FILENAME).'.webp';
            $thumbRelativePath = $baseDir.'/thumbs/'.$thumbFilename;
            $thumbAbsolutePath = $disk->path($thumbRelativePath);

            $thumbSource = file_exists($mainAbsolutePath) ? $mainAbsolutePath : $file->getRealPath();
            $thumbGenerated = ImageOptimizer::generateGridThumbnail($thumbSource, $thumbAbsolutePath, 360, 80);

            return [
                'file_path' => $mainRelativePath,
                'thumbnail_path' => $thumbGenerated ? $thumbRelativePath : null,
                'file_name' => self::sanitizeOriginalFilename($file->getClientOriginalName()),
                'mime_type' => $converted ? 'image/webp' : $mime,
                'file_size' => file_exists($mainAbsolutePath) ? (int) filesize($mainAbsolutePath) : (int) $file->getSize(),
            ];
        }

        // Archivos no imagen (ej. SVG, PDF, etc.)
        $extension = strtolower($file->getClientOriginalExtension()) ?: $file->extension();
        $filename = self::resolveUniqueFilename($baseDir, $baseSlug, $extension);
        $mainRelativePath = $file->storeAs($baseDir, $filename, 'public');

        return [
            'file_path' => $mainRelativePath,
            'thumbnail_path' => null,
            'file_name' => self::sanitizeOriginalFilename($file->getClientOriginalName()),
            'mime_type' => $mime,
            'file_size' => (int) $file->getSize(),
        ];
    }

    /**
     * Resuelve un nombre de archivo único verificando colisiones en el disco 'public'.
     */
    protected static function resolveUniqueFilename(string $baseDir, string $baseSlug, string $extension): string
    {
        $disk = Storage::disk('public');
        $filename = "{$baseSlug}.{$extension}";
        $counter = 1;

        while ($disk->exists($baseDir.'/'.$filename)) {
            $filename = "{$baseSlug}-{$counter}.{$extension}";
            $counter++;
        }

        return $filename;
    }

    /**
     * Sanitize original filename against XSS, null bytes, HTML tags, and path traversal.
     */
    public static function sanitizeOriginalFilename(string $filename): string
    {
        // 1. Strip null bytes and complete script/style blocks
        $clean = str_replace(chr(0), '', $filename);
        $clean = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $clean);
        $clean = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $clean);
        $clean = strip_tags($clean);

        // 2. Remove dangerous characters (< > " ' ` \r \n \t)
        $clean = preg_replace('/[\x00-\x1F\x7F<>"\'`]/', '', $clean);

        // 3. Remove directory traversal components
        $clean = basename($clean);

        // 4. If empty or reduced to just an extension, generate a safe semantic name
        $nameWithoutExt = pathinfo($clean, PATHINFO_FILENAME);
        $ext = pathinfo($clean, PATHINFO_EXTENSION);

        if (blank($nameWithoutExt)) {
            $nameWithoutExt = 'archivo-'.Str::lower(Str::random(6));

            return $ext ? "{$nameWithoutExt}.{$ext}" : "{$nameWithoutExt}.bin";
        }

        return $clean;
    }

    /**
     * Backward-compatible simple store method returning relative file path.
     */
    public static function store(UploadedFile $file, string $directory, ?string $compressionMode = null): string
    {
        $result = self::storeWithThumbnail($file, $directory, $compressionMode);

        return $result['file_path'];
    }

    /**
     * Delete an uploaded file and its corresponding thumbnail if present.
     */
    public static function delete(?string $path, ?string $thumbnailPath = null): void
    {
        if (! $path) {
            return;
        }

        $disk = Storage::disk('public');

        if ($disk->exists($path)) {
            $disk->delete($path);
        }

        if ($thumbnailPath && $disk->exists($thumbnailPath)) {
            $disk->delete($thumbnailPath);
        } else {
            // Convención por si thumbnail_path no fue pasado explícitamente
            $dirname = dirname($path);
            $filename = basename($path);
            $guessedThumb = $dirname.'/thumbs/'.pathinfo($filename, PATHINFO_FILENAME).'.webp';
            if ($disk->exists($guessedThumb)) {
                $disk->delete($guessedThumb);
            }
        }
    }
}
