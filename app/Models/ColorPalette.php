<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ColorPalette extends Model
{
    use HasFactory;

    protected $table = 'color_palettes';

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'priority',
        'tagline',
        'description',
        'theory_title',
        'theory_text',
        'primary_color',
        'secondary_color',
        'tertiary_color',
        'accent_color',
        'dark_neutral',
        'light_neutral',
        'colors',
        'is_master',
        'is_system',
        'order',
    ];

    protected $casts = [
        'colors' => 'array',
        'is_master' => 'boolean',
        'is_system' => 'boolean',
        'order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (ColorPalette $palette): void {
            if (empty($palette->slug)) {
                $palette->slug = static::generateUniqueSlug($palette->name);
            }

            if (empty($palette->colors)) {
                $palette->colors = $palette->generateDefaultSwatches();
            }
        });

        static::updating(function (ColorPalette $palette): void {
            if (empty($palette->slug)) {
                $palette->slug = static::generateUniqueSlug($palette->name, $palette->id);
            }

            // Sync swatches if primary or secondary colors were changed directly
            if ($palette->isDirty(['primary_color', 'secondary_color', 'tertiary_color', 'accent_color']) && ! $palette->isDirty('colors')) {
                $palette->colors = $palette->generateDefaultSwatches();
            }
        });
    }

    protected static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $count = 1;

        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$count}";
            $count++;
        }

        return $slug;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function preferences(): HasMany
    {
        return $this->hasMany(UserPreference::class, 'color_palette_id');
    }

    /**
     * Construye un array de swatches estructurados a partir de los campos individuales
     */
    public function generateDefaultSwatches(): array
    {
        $existing = is_array($this->colors) ? $this->colors : [];

        $swatches = [
            [
                'label' => 'Color Primario',
                'title' => $existing[0]['title'] ?? 'Primario Principal',
                'hex' => strtoupper($this->primary_color),
                'rgb' => static::hexToRgbString($this->primary_color),
                'role' => $existing[0]['role'] ?? 'CTA principal, interacción y conversión',
                'darkContent' => static::isLightColor($this->primary_color),
            ],
            [
                'label' => 'Color Secundario',
                'title' => $existing[1]['title'] ?? 'Secundario Institucional',
                'hex' => strtoupper($this->secondary_color),
                'rgb' => static::hexToRgbString($this->secondary_color),
                'role' => $existing[1]['role'] ?? 'Prestigio, jerarquía y acentos secundarios',
                'darkContent' => static::isLightColor($this->secondary_color),
            ],
        ];

        if (! empty($this->tertiary_color)) {
            $swatches[] = [
                'label' => 'Color Terciario',
                'title' => $existing[2]['title'] ?? 'Terciario Funcional',
                'hex' => strtoupper($this->tertiary_color),
                'rgb' => static::hexToRgbString($this->tertiary_color),
                'role' => $existing[2]['role'] ?? 'Arquitectura, tags y microinteracciones',
                'darkContent' => static::isLightColor($this->tertiary_color),
            ];
        }

        if (! empty($this->accent_color)) {
            $swatches[] = [
                'label' => 'Color de Acento',
                'title' => $existing[3]['title'] ?? 'Acento de Alerta & Éxito',
                'hex' => strtoupper($this->accent_color),
                'rgb' => static::hexToRgbString($this->accent_color),
                'role' => $existing[3]['role'] ?? 'Destacados, badges especiales e hitos',
                'darkContent' => static::isLightColor($this->accent_color),
            ];
        }

        return $swatches;
    }

    public static function isLightColor(?string $hex): bool
    {
        if (empty($hex)) {
            return false;
        }
        $clean = ltrim($hex, '#');
        if (strlen($clean) === 3) {
            $clean = $clean[0].$clean[0].$clean[1].$clean[1].$clean[2].$clean[2];
        }
        if (strlen($clean) !== 6) {
            return false;
        }

        $r = hexdec(substr($clean, 0, 2));
        $g = hexdec(substr($clean, 2, 2));
        $b = hexdec(substr($clean, 4, 2));

        $yiq = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;

        return $yiq >= 150;
    }

    public static function hexToRgbString(?string $hex): string
    {
        if (empty($hex)) {
            return '0, 0, 0';
        }
        $clean = ltrim($hex, '#');
        if (strlen($clean) === 3) {
            $clean = $clean[0].$clean[0].$clean[1].$clean[1].$clean[2].$clean[2];
        }
        if (strlen($clean) !== 6) {
            return '0, 0, 0';
        }

        $r = hexdec(substr($clean, 0, 2));
        $g = hexdec(substr($clean, 2, 2));
        $b = hexdec(substr($clean, 4, 2));

        return "{$r}, {$g}, {$b}";
    }
}
