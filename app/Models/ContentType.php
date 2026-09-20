<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ContentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'singular_name',
        'slug',
        'icon',
        'description',
        'is_public',
        'public_slug',
        'has_categories',
        'has_tags',
        'order',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'has_categories' => 'boolean',
        'has_tags' => 'boolean',
        'order' => 'integer',
    ];

    protected $appends = [
        'public_route_slug',
    ];

    public function getPublicRouteSlugAttribute(): string
    {
        return ! empty($this->public_slug) ? $this->public_slug : $this->slug;
    }

    public function scopePubliclyAuthorized($query)
    {
        return $query->where('is_public', true);
    }

    protected static function booted(): void
    {
        static::creating(function (self $type): void {
            if (empty($type->slug)) {
                $type->slug = static::uniqueSlugFrom($type->name, $type->user_id);
            }
            if (empty($type->singular_name)) {
                $type->singular_name = Str::singular($type->name);
            }
        });
    }

    public static function uniqueSlugFrom(string $name, ?int $userId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        $query = static::where('slug', $slug);
        if ($userId) {
            $query->where('user_id', $userId);
        }

        while ($query->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
            $query = static::where('slug', $slug);
            if ($userId) {
                $query->where('user_id', $userId);
            }
        }

        return $slug;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'content_type_user');
    }

    public function customFields(): HasMany
    {
        return $this->hasMany(CustomField::class)->orderBy('sort_order');
    }

    /**
     * Devuelve los campos que aplican a un cliente específico:
     * Campos Globales (user_id is null) + Campos Específicos de este cliente (user_id = $userId).
     */
    public function fieldsForUser(?int $userId = null)
    {
        return $this->customFields()
            ->where(function ($q) use ($userId) {
                $q->whereNull('user_id');
                if ($userId) {
                    $q->orWhere('user_id', $userId);
                }
            })
            ->orderBy('sort_order')
            ->get();
    }

    public function contents(): HasMany
    {
        return $this->hasMany(Content::class)->orderBy('sort_order')->orderByDesc('created_at');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }
}
