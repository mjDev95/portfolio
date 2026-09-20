<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = [
        'user_id',
        'content_id',
        'disk',
        'file_path',
        'thumbnail_path',
        'file_name',
        'title',
        'alt',
        'caption',
        'description',
        'mime_type',
        'file_size',
        'collection',
        'order',
        'mediable_id',
        'mediable_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Append the computed URLs so they are always included in JSON/Inertia serialization.
     */
    protected $appends = ['url', 'thumbnail_url'];

    /**
     * The attributes that should be hidden for serialization to protect
     * internal database paths, disk names, and polymorphic relations.
     */
    protected $hidden = [
        'disk',
        'file_path',
        'thumbnail_path',
        'mediable_id',
        'mediable_type',
        'content_id',
        'user_id',
    ];

    // ─────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────

    public function content(): BelongsTo
    {
        return $this->belongsTo(Content::class);
    }

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────

    /**
     * Public URL for this file via the storage symlink.
     * Serialized automatically through $appends.
     */
    public function url(): Attribute
    {
        return Attribute::get(
            fn () => asset('storage/'.$this->file_path)
        );
    }

    /**
     * Public URL for the optimized ~20KB thumbnail variant.
     * Falls back to full-size URL if thumbnail is not generated.
     */
    public function thumbnailUrl(): Attribute
    {
        return Attribute::get(
            fn () => $this->thumbnail_path ? asset('storage/'.$this->thumbnail_path) : $this->url
        );
    }
}
