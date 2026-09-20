<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'path',
        'visitor_hash',
        'referer',
    ];

    /**
     * Relationship to the user owning the portfolio.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for records created within the last N days (default: 7).
     */
    public function scopeRecentDays(Builder $query, int $days = 7): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days)->startOfDay());
    }

    /**
     * Scope for a specific path.
     */
    public function scopeForPath(Builder $query, string $path): Builder
    {
        return $query->where('path', $path);
    }
}
