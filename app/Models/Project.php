<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Project extends Content
{
    protected $table = 'contents';

    public const TYPE_SLUG = 'proyectos';

    protected static function booted(): void
    {
        parent::booted();

        static::addGlobalScope('project_type', function (Builder $builder) {
            $builder->whereHas('contentType', function ($q) {
                $q->where('slug', self::TYPE_SLUG);
            });
        });

        static::creating(function (Project $project): void {
            if (empty($project->content_type_id)) {
                $typeId = ContentType::where('slug', self::TYPE_SLUG)->value('id');
                if ($typeId) {
                    $project->content_type_id = $typeId;
                }
            }
        });
    }

    /**
     * Scope to retrieve published projects ordered for public showcase.
     */
    public function scopeShowcase(Builder $query, int $limit = 6): Builder
    {
        return $query->published()
            ->with(['contentType', 'categories', 'media'])
            ->orderByDesc('featured')
            ->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->take($limit);
    }
}
