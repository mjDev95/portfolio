<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Post extends Content
{
    protected $table = 'contents';

    public const TYPE_SLUG = 'blog';

    protected static function booted(): void
    {
        parent::booted();

        static::addGlobalScope('post_type', function (Builder $builder) {
            $builder->whereHas('contentType', function ($q) {
                $q->where('slug', self::TYPE_SLUG);
            });
        });

        static::creating(function (Post $post): void {
            if (empty($post->content_type_id)) {
                $typeId = ContentType::where('slug', self::TYPE_SLUG)->value('id');
                if ($typeId) {
                    $post->content_type_id = $typeId;
                }
            }
        });
    }

    /**
     * Scope to retrieve latest published editorial posts.
     */
    public function scopeLatestEditorial(Builder $query, int $limit = 6): Builder
    {
        return $query->published()
            ->with([
                'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                'categories',
                'contentType',
            ])
            ->orderByDesc('featured')
            ->orderByDesc('published_at')
            ->take($limit);
    }
}
