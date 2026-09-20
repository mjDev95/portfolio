<?php

namespace App\Models\Traits;

use App\Models\Media;
use App\Support\SecureFileUploader;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasMedia
{
    /**
     * All media items attached to this model, ordered by `order` column.
     */
    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')->orderBy('order');
    }

    /**
     * Dynamic property accessor: $model->thumbnail returns the first Media in 'thumbnail' collection.
     * This replaces the old string column of the same name.
     */
    public function getThumbnailAttribute(): ?Media
    {
        // Use relation cache if already loaded, otherwise query
        if ($this->relationLoaded('media')) {
            return $this->media->firstWhere('collection', 'thumbnail');
        }

        return $this->media()->where('collection', 'thumbnail')->first();
    }

    /**
     * Dynamic property accessor: $model->hero_image returns the first Media in 'hero' collection.
     */
    public function getHeroImageAttribute(): ?Media
    {
        if ($this->relationLoaded('media')) {
            return $this->media->firstWhere('collection', 'hero');
        }

        return $this->media()->where('collection', 'hero')->first();
    }

    /**
     * Helper method: returns the gallery collection of Media items.
     * Usage: $model->gallery() or $model->getGalleryAttribute()
     */
    public function getGalleryAttribute()
    {
        if ($this->relationLoaded('media')) {
            return $this->media->where('collection', 'gallery')->values();
        }

        return $this->media()->where('collection', 'gallery')->get();
    }

    /**
     * Delete all physical files from disk when a media item is removed.
     * Call this before deleting the parent model to prevent orphaned files.
     */
    public function deleteAllMedia(): void
    {
        $this->media->each(function (Media $media): void {
            SecureFileUploader::delete($media->file_path);
            $media->delete();
        });
    }
}
