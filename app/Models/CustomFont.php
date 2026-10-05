<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomFont extends Model
{
    use HasFactory;

    protected $table = 'custom_fonts';

    protected $fillable = [
        'user_id',
        'role',
        'family_name',
        'file_path',
        'file_name',
        'file_size',
        'format',
        'is_active',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'url',
        'css_format',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Public URL for serving font file locally via storage symlink.
     */
    public function url(): Attribute
    {
        return Attribute::get(
            fn () => asset('storage/'.$this->file_path)
        );
    }

    /**
     * Map format to CSS @font-face format string.
     */
    public function cssFormat(): Attribute
    {
        return Attribute::get(function () {
            $format = strtolower($this->format);

            return match ($format) {
                'woff2' => 'woff2',
                'woff' => 'woff',
                'ttf', 'truetype' => 'truetype',
                'otf', 'opentype' => 'opentype',
                default => 'woff2',
            };
        });
    }

    /**
     * Helper to detect format from file extension.
     */
    public static function formatFromExtension(string $extension): string
    {
        return match (strtolower($extension)) {
            'woff2' => 'woff2',
            'woff' => 'woff',
            'ttf' => 'truetype',
            'otf' => 'opentype',
            default => 'woff2',
        };
    }
}
