<?php

namespace App\Models;

use App\Models\Traits\HasMedia;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use League\CommonMark\CommonMarkConverter;
use Mews\Purifier\Facades\Purifier;

class Content extends Model
{
    use HasFactory, HasMedia, SoftDeletes;

    protected $fillable = [
        'user_id',
        'content_type_id',
        'title',
        'slug',
        'excerpt',
        'body',
        'custom_values',
        'status',
        'published_at',
        'featured',
        'sort_order',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'custom_values' => 'array',
        'published_at' => 'datetime',
        'featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'thumbnail',
        'hero_image',
    ];

    protected static function booted(): void
    {
        static::creating(function (Content $content): void {
            if (empty($content->slug)) {
                $content->slug = static::uniqueSlugFrom($content->title, $content->user_id);
            }
        });
    }

    public static function uniqueSlugFrom(string $title, ?int $userId = null): string
    {
        $base = Str::slug($title);
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

    // ─────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contentType(): BelongsTo
    {
        return $this->belongsTo(ContentType::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'content_category');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'content_tag');
    }

    // ─────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });
    }

    public function scopeForType(Builder $query, string $typeSlug): Builder
    {
        return $query->whereHas('contentType', function ($q) use ($typeSlug) {
            $q->where('slug', $typeSlug);
        });
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Map of indexed virtual columns for fast querying on dynamic custom fields.
     */
    public const VIRTUAL_CUSTOM_COLUMNS = [
        'client' => 'custom_client',
        'year' => 'custom_year',
        'reading_time' => 'custom_reading_time',
    ];

    /**
     * Efficiently filter by a custom dynamic field.
     * Uses indexed virtual column when available, otherwise falls back to JSON querying.
     */
    public function scopeWhereCustomField(Builder $query, string $field, mixed $operator = null, mixed $value = null): Builder
    {
        if (func_num_args() === 2) {
            $value = $operator;
            $operator = '=';
        }

        if (isset(self::VIRTUAL_CUSTOM_COLUMNS[$field])) {
            $virtualColumn = self::VIRTUAL_CUSTOM_COLUMNS[$field];

            return $query->where($virtualColumn, $operator, $value);
        }

        return $query->where("custom_values->{$field}", $operator, $value);
    }

    /**
     * Batch filter by an associative array of custom fields and values.
     * Example: ['client' => 'Google', 'year' => '2026']
     */
    public function scopeFilterByCustomFields(Builder $query, array $filters): Builder
    {
        foreach ($filters as $field => $val) {
            if ($val !== null && $val !== '') {
                $query->whereCustomField($field, '=', $val);
            }
        }

        return $query;
    }

    // ─────────────────────────────────────────────
    // Helpers & Accessors
    // ─────────────────────────────────────────────

    public function getAttribute($key)
    {
        $value = parent::getAttribute($key);
        if ($value !== null || $key === 'custom_values') {
            return $value;
        }

        $customValues = parent::getAttribute('custom_values');
        if (is_array($customValues) && array_key_exists($key, $customValues)) {
            return $customValues[$key];
        }

        return null;
    }

    public function getCustomValue(string $key, mixed $default = null): mixed
    {
        return data_get($this->custom_values, $key, $default);
    }

    protected function bodyHtml(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (blank($this->body)) {
                    return '';
                }

                $html = (new CommonMarkConverter([
                    'html_input' => 'strip',
                    'allow_unsafe_links' => false,
                ]))->convert($this->body)->getContent();

                return Purifier::clean($html, 'content_body');
            },
        );
    }

    protected function seoTitle(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->meta_title ?: $this->title,
        );
    }

    protected function seoDescription(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->meta_description ?: $this->excerpt ?: '',
        );
    }
}
