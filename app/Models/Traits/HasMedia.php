<?php

namespace App\Models\Traits;

use App\Models\Media;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasMedia
{
    /**
     * All media items attached to this model via content_media pivot, ordered by `order` column.
     */
    public function media(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'content_media', 'content_id', 'media_id')
            ->withPivot(['id', 'collection', 'order'])
            ->withTimestamps()
            ->orderBy('content_media.order');
    }

    /**
     * Dynamic property accessor: $model->thumbnail returns the first Media in 'thumbnail' collection.
     */
    public function getThumbnailAttribute(): ?Media
    {
        if ($this->relationLoaded('media')) {
            $thumb = $this->media->firstWhere('collection', 'thumbnail')
                ?? $this->media->firstWhere('pivot.collection', 'thumbnail')
                ?? $this->media->firstWhere('collection', 'hero')
                ?? $this->media->firstWhere('pivot.collection', 'hero')
                ?? $this->media->first();
            if ($thumb) {
                $thumb->collection = 'thumbnail';

                return $thumb;
            }
        } else {
            $thumb = $this->media()->where('content_media.collection', 'thumbnail')->first()
                ?? $this->media()->where('content_media.collection', 'hero')->first()
                ?? $this->media()->first();
            if ($thumb) {
                $thumb->collection = 'thumbnail';

                return $thumb;
            }
        }

        // Resilient fallback: ensure project always has an image if media exists in database
        $fallback = Media::where('mime_type', 'like', 'image/%')
            ->whereNotNull('file_path')
            ->orderBy('id')
            ->first();

        if ($fallback) {
            $fallback->collection = 'thumbnail';

            return $fallback;
        }

        return null;
    }

    /**
     * Dynamic property accessor: $model->hero_image returns the first Media in 'hero' collection.
     */
    public function getHeroImageAttribute(): ?Media
    {
        if ($this->relationLoaded('media')) {
            $hero = $this->media->firstWhere('collection', 'hero')
                ?? $this->media->firstWhere('pivot.collection', 'hero');
            if ($hero) {
                $hero->collection = 'hero';
            }

            return $hero;
        }

        $hero = $this->media()->where('content_media.collection', 'hero')->first();
        if ($hero) {
            $hero->collection = 'hero';
        }

        return $hero;
    }

    /**
     * Helper method: returns the gallery collection of Media items.
     * Usage: $model->gallery or $model->getGalleryAttribute()
     */
    public function getGalleryAttribute()
    {
        if ($this->relationLoaded('media')) {
            $gallery = $this->media->filter(fn ($m) => ($m->pivot?->collection ?? $m->collection) === 'gallery')->values();
            foreach ($gallery as $item) {
                $item->collection = 'gallery';
            }

            return $gallery;
        }

        $gallery = $this->media()->where('content_media.collection', 'gallery')->get();
        foreach ($gallery as $item) {
            $item->collection = 'gallery';
        }

        return $gallery;
    }

    /**
     * Detach all media when a content model is removed.
     * Library assets remain safely stored in the Media Library.
     */
    public function deleteAllMedia(): void
    {
        $this->media()->detach();
    }
}
