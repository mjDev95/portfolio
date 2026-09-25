<?php

namespace App\Support;

class ImageOptimizer
{
    /**
     * Convierte una imagen a WebP preservando resolución nativa, fidelidad cromática y transparencia.
     * Si WebP Lossless genera un archivo mayor que el original (común en JPEGs con ruido de compresión),
     * aplica WebP de ultra-alta fidelidad (Q90) para garantizar compresión real sin pérdida perceptible.
     */
    /**
     * Convierte una imagen a WebP preservando resolución nativa, fidelidad cromática y transparencia.
     * Si WebP Lossless genera un archivo mayor que el original (común en JPEGs con ruido de compresión),
     * aplica WebP de ultra-alta fidelidad (Q90) para garantizar compresión real sin pérdida perceptible.
     */
    public static function convertToWebpLossless(string $sourcePath, string $destinationPath, bool $preventBloat = true, ?string $hint = null): bool
    {
        if (! file_exists($sourcePath)) {
            return false;
        }

        if ((int) ini_get('memory_limit') < 512) {
            @ini_set('memory_limit', '512M');
        }

        // Si es HEIF/HEIC, usar conversión directa con Imagick si está disponible (rápida y fiel)
        if (self::isHeif($sourcePath, $hint) && extension_loaded('imagick')) {
            try {
                $imagick = new \Imagick($sourcePath);
                if (method_exists($imagick, 'autoOrient')) {
                    $imagick->autoOrient();
                }

                self::ensureDirectoryExists(dirname($destinationPath));
                $imagick->setImageFormat('webp');
                $imagick->setOption('webp:lossless', 'true');
                $written = $imagick->writeImage($destinationPath);
                $imagick->destroy();

                if ($written && file_exists($destinationPath) && filesize($destinationPath) > 0) {
                    if ($preventBloat && filesize($destinationPath) > filesize($sourcePath)) {
                        return self::convertToWebpLossy($sourcePath, $destinationPath, 90, $hint);
                    }

                    return true;
                }
            } catch (\Throwable $e) {
                report($e);
            }
        }

        $image = self::createImageResource($sourcePath, $hint);
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
    public static function convertToWebpLossy(string $sourcePath, string $destinationPath, int $quality = 90, ?string $hint = null): bool
    {
        if (! file_exists($sourcePath)) {
            return false;
        }

        if ((int) ini_get('memory_limit') < 512) {
            @ini_set('memory_limit', '512M');
        }

        // Si es HEIF/HEIC, usar conversión directa con Imagick
        if (self::isHeif($sourcePath, $hint) && extension_loaded('imagick')) {
            try {
                $imagick = new \Imagick($sourcePath);
                if (method_exists($imagick, 'autoOrient')) {
                    $imagick->autoOrient();
                }

                self::ensureDirectoryExists(dirname($destinationPath));
                $imagick->setImageFormat('webp');
                $imagick->setImageCompressionQuality(max(1, min(100, $quality)));
                $written = $imagick->writeImage($destinationPath);
                $imagick->destroy();

                if ($written && file_exists($destinationPath) && filesize($destinationPath) > 0) {
                    return true;
                }
            } catch (\Throwable $e) {
                report($e);
            }
        }

        $image = self::createImageResource($sourcePath, $hint);
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
    public static function generateGridThumbnail(string $sourcePath, string $destinationPath, int $maxDim = 360, int $quality = 82, ?string $hint = null): bool
    {
        if (! file_exists($sourcePath)) {
            return false;
        }

        $image = self::createImageResource($sourcePath, $hint);
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
     * Determina con precisión si un archivo es HEIF/HEIC mediante hint, extensión, MIME y bytes mágicos ftyp.
     */
    public static function isHeif(string $path, ?string $hint = null): bool
    {
        if ($hint) {
            $hintLower = strtolower($hint);
            if (in_array($hintLower, ['heif', 'heic', 'image/heif', 'image/heic', 'image/heif-sequence', 'image/heic-sequence'], true)) {
                return true;
            }
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (in_array($ext, ['heif', 'heic'], true)) {
            return true;
        }

        if (function_exists('finfo_open')) {
            $finfo = @finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo) {
                $detected = @finfo_file($finfo, $path);
                @finfo_close($finfo);
                if (in_array($detected, ['image/heif', 'image/heic', 'image/heif-sequence', 'image/heic-sequence'], true)) {
                    return true;
                }
            }
        }

        // Detección por bytes mágicos ISOBMFF (offset 4 'ftyp' seguido de major brand compatible con HEIF)
        if (file_exists($path) && filesize($path) >= 16) {
            $fp = @fopen($path, 'rb');
            if ($fp) {
                $bytes = fread($fp, 24);
                fclose($fp);
                if (substr($bytes, 4, 4) === 'ftyp') {
                    $majorBrand = substr($bytes, 8, 4);
                    if (in_array($majorBrand, ['heic', 'heix', 'hevc', 'heim', 'heis', 'heif', 'mif1', 'msf1'], true)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Carga el recurso GD desde archivo según el tipo de imagen (soporta JPEG, PNG, WebP y HEIF/HEIC).
     *
     * @return \GdImage|resource|false
     */
    protected static function createImageResource(string $path, ?string $hint = null)
    {
        // Soporte nativo para HEIF / HEIC (.heif, .heic)
        if (self::isHeif($path, $hint)) {
            $heifImage = self::createImageFromHeif($path);
            if ($heifImage) {
                if (! imageistruecolor($heifImage)) {
                    imagepalettetotruecolor($heifImage);
                }

                return $heifImage;
            }
        }

        $info = @getimagesize($path);
        $mime = $info['mime'] ?? '';

        $image = match ($mime) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/webp' => @imagecreatefromwebp($path),
            default => false,
        };

        if (! $image) {
            $content = @file_get_contents($path);
            $image = $content ? @imagecreatefromstring($content) : false;
        }

        if ($image && ! imageistruecolor($image)) {
            imagepalettetotruecolor($image);
        }

        return $image;
    }

    /**
     * Decodifica una imagen HEIF/HEIC usando Imagick (con autoOrient EXIF) o sips (en macOS).
     *
     * @return \GdImage|resource|false
     */
    protected static function createImageFromHeif(string $path)
    {
        // Estrategia 1: Extensión Imagick con libheif
        if (extension_loaded('imagick')) {
            try {
                $imagick = new \Imagick;
                $imagick->readImage($path);

                if (method_exists($imagick, 'autoOrient')) {
                    $imagick->autoOrient();
                }

                $imagick->setImageFormat('png');
                $blob = $imagick->getImageBlob();
                $imagick->destroy();

                if ($blob) {
                    $gd = @imagecreatefromstring($blob);
                    if ($gd) {
                        return $gd;
                    }
                }
            } catch (\Throwable $e) {
                report($e);
            }
        }

        // Estrategia 2: Fallback con sips en macOS
        if (PHP_OS_FAMILY === 'Darwin' && file_exists('/usr/bin/sips')) {
            $tmpPng = tempnam(sys_get_temp_dir(), 'heif_conv_').'.png';
            $cmd = '/usr/bin/sips -s format png '.escapeshellarg($path).' --out '.escapeshellarg($tmpPng).' 2>&1';
            exec($cmd, $output, $returnCode);

            if ($returnCode === 0 && file_exists($tmpPng)) {
                $content = @file_get_contents($tmpPng);
                @unlink($tmpPng);
                if ($content) {
                    $gd = @imagecreatefromstring($content);
                    if ($gd) {
                        return $gd;
                    }
                }
            }
            @unlink($tmpPng);
        }

        // Estrategia 3: GD directo si la versión instalada soporta heif en imagecreatefromstring
        $content = @file_get_contents($path);

        return $content ? @imagecreatefromstring($content) : false;
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
