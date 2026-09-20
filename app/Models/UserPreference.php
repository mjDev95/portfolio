<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    protected $fillable = [
        'user_id',
        'theme',
        'items_per_page',
        'table_density',
        'editor_mode',
        'image_compression',
        'email_notifications',
        'color_palette',
        'color_palette_id',
        'settings',
    ];

    protected $casts = [
        'items_per_page' => 'integer',
        'email_notifications' => 'boolean',
        'color_palette' => 'array',
        'color_palette_id' => 'integer',
        'settings' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function colorPalette(): BelongsTo
    {
        return $this->belongsTo(ColorPalette::class, 'color_palette_id');
    }

    /**
     * Retrieve a specific key from preferences (explicit column first, then JSON settings).
     */
    public function getSetting(string $key, mixed $default = null): mixed
    {
        // First-class columns
        if (in_array($key, ['theme', 'items_per_page', 'table_density', 'editor_mode', 'image_compression', 'email_notifications', 'color_palette', 'color_palette_id'])) {
            return $this->{$key} ?? $default;
        }

        // Nested dot notation on color_palette (e.g., 'color_palette.colors.accent')
        if (str_starts_with($key, 'color_palette.')) {
            $subKey = substr($key, strlen('color_palette.'));

            return data_get($this->color_palette, $subKey, $default);
        }

        return data_get($this->settings, $key, $default);
    }

    /**
     * Set or update a specific key within preferences.
     */
    public function setSetting(string $key, mixed $value): self
    {
        if (in_array($key, ['theme', 'items_per_page', 'table_density', 'editor_mode', 'image_compression', 'email_notifications', 'color_palette', 'color_palette_id'])) {
            $this->{$key} = $value;

            return $this;
        }

        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->settings = $settings;

        return $this;
    }
}
