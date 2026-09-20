<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CustomField extends Model
{
    use HasFactory;

    protected $fillable = [
        'content_type_id',
        'user_id',
        'label',
        'name',
        'type',
        'options',
        'placeholder',
        'is_required',
        'sort_order',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'options' => 'array',
        'is_required' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $field): void {
            if (empty($field->name)) {
                $field->name = Str::snake(Str::ascii($field->label));
            }
        });
    }

    public function contentType(): BelongsTo
    {
        return $this->belongsTo(ContentType::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
