<?php

namespace App\Support;

class ImageOptimizer
{
    /**
     * Convierte una imagen a WebP preservando resolución nativa, fidelidad cromática y transparencia.
     * Si WebP Lossless genera un archivo mayor que el original (común en JPEGs con ruido de compresión),
     * aplica WebP de ultra-alta fidelidad (Q90) para garantizar compresión real sin pérdida perceptible.
     */
    public static function convertToWebpLossless(string $sourcePath, string $destinationPath, bool $preventBloat = true): bool
    {
        if (! file_exists($sourcePath)) {
            return false;
        }

        if ((int) ini_get('memory_limit') < 512) {
            @ini_set('memory_limit', '512M');
        }

        $image = self::createImageResource($sourcePath);
        if (! $image) {
            return false;
        }

        self::ensureDirectoryExists(dirname($destinationPath));

        imagealphablending($image, false);
        imagesavealpha($image, true);

        // Primer intento: WebP Lossless nativo
        $result = imagewebp($image, $destinationPath, defined('IMG_WEBP_LOSSLESS') ? IMG_WEBP_LOSSLESS : 100);

        // Si el archivo lossless resultó más pesado que el original, aplicar WebP Q90 (máxima resolución nativa sin inflar tamaño)
        if ($result && $preventBloat && file_exists($sourcePath) && file_exists($destinationPath)) {
            $origSize = filesize($sourcePath);
            $newSize = filesize($destinationPath);

            if ($newSize > $origSize) {
                imagewebp($image, $destinationPath, 90);
            }
        }

        imagedestroy($image);

        return $result;
    }

    /**
     * Convierte una imagen a WebP con compresión de alta calidad (calidad por defecto 90).
     * Reduce drásticamente el peso del archivo preservando gran nitidez visual y canal alfa.
     */
    public static function convertToWebpLossy(string $sourcePath, string $destinationPath, int $quality = 90): bool
    {
        if (! file_exists($sourcePath)) {
            return false;
        }

        if ((int) ini_get('memory_limit') < 512) {
            @ini_set('memory_limit', '512M');
        }

        $image = self::createImageResource($sourcePath);
        if (! $image) {
            return false;
        }

        self::ensureDirectoryExists(dirname($destinationPath));

        imagealphablending($image, false);
        imagesavealpha($image, true);

        $result = imagewebp($image, $destinationPath, max(1, min(100, $quality)));

        imagedestroy($image);

        return $result;
    }

    /**
     * Recomprime un archivo WebP que haya quedado excesivamente pesado (>3MB) usando calidad visual 90
     * para preservar resolución nativa completa (ej. 6000x4000) reduciendo drásticamente su tamaño.
     */
    public static function recompressWebpWithHighQuality(string $path, int $quality = 90): bool
    {
        if (! file_exists($path)) {
            return false;
        }

        if ((int) ini_get('memory_limit') < 512) {
            @ini_set('memory_limit', '512M');
        }

        $image = self::createImageResource($path);
        if (! $image) {
            return false;
        }

        $tmpPath = $path.'.tmp.webp';
        imagealphablending($image, false);
        imagesavealpha($image, true);

        $result = imagewebp($image, $tmpPath, $quality);
        imagedestroy($image);

        if ($result && file_exists($tmpPath) && filesize($tmpPath) > 0) {
            if (filesize($tmpPath) < filesize($path)) {
                @rename($tmpPath, $path);

                return true;
            }
            @unlink($tmpPath);
        }

        return false;
    }

    /**
     * Genera una miniatura ultraligera (~15-25 KB) para cuadrículas y tablas del admin en WebP.
     * Escala proporcionalmente hasta un máximo de $maxDim manteniendo aspecto y canal alfa.
     */
    public static function generateGridThumbnail(string $sourcePath, string $destinationPath, int $maxDim = 360, int $quality = 82): bool
    {
        if (! file_exists($sourcePath)) {
            return false;
        }

        $image = self::createImageResource($sourcePath);
        if (! $image) {
            return false;
        }

        $origW = imagesx($image);
        $origH = imagesy($image);

        if ($origW <= 0 || $origH <= 0) {
            imagedestroy($image);

            return false;
        }

        // Si ya es más pequeña que el máximo, mantenemos dimensiones
        $ratio = min($maxDim / $origW, $maxDim / $origH, 1.0);
        $newW = max(1, (int) round($origW * $ratio));
        $newH = max(1, (int) round($origH * $ratio));

        $thumb = imagecreatetruecolor($newW, $newH);
        imagealphablending($thumb, false);
        imagesavealpha($thumb, true);

        // Rellenar con transparencia por si hay canal alfa
        $transparent = imagecolorallocatealpha($thumb, 0, 0, 0, 127);
        imagefilledrectangle($thumb, 0, 0, $newW, $newH, $transparent);

        imagecopyresampled($thumb, $image, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

        self::ensureDirectoryExists(dirname($destinationPath));

        $result = imagewebp($thumb, $destinationPath, $quality);

        imagedestroy($image);
        imagedestroy($thumb);

        return $result;
    }

    /**
     * Carga el recurso GD desde archivo según el tipo de imagen.
     *
     * @return \GdImage|resource|false
     */
    protected static function createImageResource(string $path)
    {
        $info = @getimagesize($path);
        if (! $info) {
            $content = @file_get_contents($path);

            return $content ? @imagecreatefromstring($content) : false;
        }

        $mime = $info['mime'] ?? '';

        return match ($mime) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/webp' => @imagecreatefromwebp($path),
            default => false,
        };
    }

    /**
     * Asegura la existencia del directorio destino.
     */
    protected static function ensureDirectoryExists(string $dir): void
    {
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }
}
