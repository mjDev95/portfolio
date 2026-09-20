<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Schema;

#[Fillable(['name', 'email', 'password', 'role', 'role_id', 'has_telemetry', 'is_active'])]
#[Hidden(['password', 'remember_token', 'two_factor_recovery_codes', 'two_factor_secret'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role_id' => 'integer',
            'has_telemetry' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Mutator to seamlessly support setting 'role' => 'admin' or 'user'
     */
    public function setRoleAttribute(mixed $value): void
    {
        if (is_string($value)) {
            if (Schema::hasColumn('users', 'role_id')) {
                $this->attributes['role_id'] = ($value === 'admin') ? 1 : 2;
            }
            if (Schema::hasColumn('users', 'role')) {
                $this->attributes['role'] = $value;
            }

            return;
        }

        if (is_int($value)) {
            if (Schema::hasColumn('users', 'role_id')) {
                $this->attributes['role_id'] = $value;
            }
        }
    }

    public function contentTypes(): HasMany
    {
        return $this->hasMany(ContentType::class)->orderBy('order');
    }

    public function assignedContentTypes(): BelongsToMany
    {
        return $this->belongsToMany(ContentType::class, 'content_type_user')->orderBy('order');
    }

    public function contents(): HasMany
    {
        return $this->hasMany(Content::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function preference(): HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    public function colorPalettes(): HasMany
    {
        return $this->hasMany(ColorPalette::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }

    public function isAdmin(): bool
    {
        return $this->role?->slug === 'admin';
    }

    public function hasRole(string $slug): bool
    {
        return $this->role?->slug === $slug;
    }

    public function canTrackVisits(): bool
    {
        return (bool) $this->has_telemetry;
    }

    public function isActive(): bool
    {
        return (bool) ($this->is_active ?? true);
    }

    /**
     * Resolve the primary client owner of the public portfolio.
     */
    public static function getPrimaryClient(): ?User
    {
        return static::whereHas('role', fn ($q) => $q->where('slug', 'user'))
            ->orWhere('email', 'mjgaliciab@gmail.com')
            ->first() ?? static::where('id', '>', 1)->first() ?? static::first();
    }

    /**
     * Retrieve a preference setting for this user with a default fallback.
     */
    public function getSetting(string $key, mixed $default = null): mixed
    {
        return $this->preference?->getSetting($key, $default) ?? $default;
    }
}
