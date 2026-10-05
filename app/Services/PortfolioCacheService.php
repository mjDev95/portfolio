<?php

namespace App\Services;

use App\Models\ContentType;
use App\Models\CustomFont;
use Closure;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class PortfolioCacheService
{
    /**
     * Cache TTL in seconds (1 day default for static content).
     */
    public const TTL_DAY = 86400;

    /**
     * Cache TTL in seconds (1 hour default for dynamic queries).
     */
    public const TTL_HOUR = 3600;

    /**
     * Cache TTL in seconds (5 minutes for dashboard metrics).
     */
    public const TTL_DASHBOARD = 300;

    /**
     * Prefixes for selective cache invalidation.
     */
    public const PREFIX_HOME_IDS = 'portfolio:home:featured_ids';

    public const PREFIX_PUBLIC_CPTS = 'portfolio:public:content_types:v2';

    public const PREFIX_CPT_ID = 'portfolio:cpt:id:';

    public const PREFIX_CONTENT_ID = 'portfolio:content:id:';

    public const PREFIX_USER_CPT_IDS = 'portfolio:user:cpt_ids:';

    public const PREFIX_DASHBOARD = 'portfolio:admin:dashboard:';

    public const PREFIX_CUSTOM_FONTS = 'portfolio:custom_fonts:v1';

    public const PREFIX_TRACKED_KEYS = 'portfolio:tracked_keys';

    /**
     * Remember active custom typography fonts as an associative array.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function rememberCustomFonts(?Closure $callback = null): array
    {
        self::trackKey(self::PREFIX_CUSTOM_FONTS);

        $cached = Cache::remember(self::PREFIX_CUSTOM_FONTS, self::TTL_DAY, function () use ($callback) {
            $result = $callback instanceof Closure
                ? $callback()
                : CustomFont::where('is_active', true)->get()->keyBy('role');

            $items = $result instanceof \Illuminate\Support\Collection ? $result : collect($result ?? []);

            return $items->mapWithKeys(function ($font, $key) {
                $role = is_object($font) ? ($font->role ?? $key) : (data_get($font, 'role', $key));

                return [
                    $role => [
                        'id' => is_object($font) ? $font->id : data_get($font, 'id'),
                        'role' => $role,
                        'family_name' => is_object($font) ? $font->family_name : data_get($font, 'family_name', ''),
                        'file_path' => is_object($font) ? $font->file_path : data_get($font, 'file_path', ''),
                        'file_name' => is_object($font) ? $font->file_name : data_get($font, 'file_name', ''),
                        'file_size' => is_object($font) ? $font->file_size : data_get($font, 'file_size', 0),
                        'format' => is_object($font) ? $font->format : data_get($font, 'format', 'woff2'),
                        'css_format' => is_object($font) ? $font->css_format : data_get($font, 'css_format', 'woff2'),
                        'url' => is_object($font) ? $font->url : data_get($font, 'url', asset('storage/'.data_get($font, 'file_path', ''))),
                    ],
                ];
            })->all();
        });

        if (! is_array($cached)) {
            self::forgetCustomFonts();

            return [];
        }

        // Defensive check: if cached items are invalid/strings, clear cache and recompute
        foreach ($cached as $item) {
            if (! is_array($item) && ! is_object($item)) {
                self::forgetCustomFonts();

                return [];
            }
        }

        return $cached;
    }

    /**
     * Invalidate custom typography fonts cache.
     */
    public static function forgetCustomFonts(): void
    {
        Cache::forget(self::PREFIX_CUSTOM_FONTS);
    }

    /**
     * Remember all publicly visible content types ordered by `order`.
     *
     * @return Collection<int, ContentType>
     */
    public static function rememberPublicContentTypes(Closure $callback)
    {
        self::trackKey(self::PREFIX_PUBLIC_CPTS);

        return Cache::remember(self::PREFIX_PUBLIC_CPTS, self::TTL_DAY, $callback);
    }

    /**
     * Remember public home featured content IDs.
     *
     * @return array<int>
     */
    public static function rememberPublicHomeIds(Closure $callback): array
    {
        self::trackKey(self::PREFIX_HOME_IDS);

        return Cache::remember(self::PREFIX_HOME_IDS, self::TTL_HOUR, $callback);
    }

    /**
     * Remember public ContentType ID by slug or public_slug.
     */
    public static function rememberPublicCptId(string $slug, Closure $callback): ?int
    {
        $key = self::PREFIX_CPT_ID.$slug;
        self::trackKey($key);

        return Cache::remember($key, self::TTL_DAY, $callback);
    }

    /**
     * Remember individual public content ID.
     */
    public static function rememberPublicContentId(string $cptSlug, string $slug, Closure $callback): ?int
    {
        $key = self::PREFIX_CONTENT_ID."{$cptSlug}:{$slug}";
        self::trackKey($key);

        return Cache::remember($key, self::TTL_HOUR, $callback);
    }

    /**
     * Remember ContentType IDs visible for an authenticated admin user.
     *
     * @return array<int>
     */
    public static function rememberUserCptIds(int $userId, Closure $callback): array
    {
        $key = self::PREFIX_USER_CPT_IDS.$userId;
        self::trackKey($key);

        return Cache::remember($key, self::TTL_HOUR, $callback);
    }

    /**
     * Remember dashboard statistics and metrics.
     *
     * @return array<string, mixed>
     */
    public static function rememberDashboardData(int $userId, bool $isAdmin, Closure $callback): array
    {
        $roleKey = $isAdmin ? 'admin' : 'client';
        $key = self::PREFIX_DASHBOARD."{$userId}:{$roleKey}";
        self::trackKey($key);

        return Cache::remember($key, self::TTL_DASHBOARD, $callback);
    }

    /**
     * Clear dashboard cache for a specific user or all users.
     */
    public static function clearDashboardCache(?int $userId = null): void
    {
        $keys = Cache::get(self::PREFIX_TRACKED_KEYS, []);
        $remainingKeys = [];

        foreach ($keys as $key) {
            if (str_starts_with($key, self::PREFIX_DASHBOARD)) {
                if ($userId === null || str_contains($key, ":{$userId}:")) {
                    Cache::forget($key);

                    continue;
                }
            }
            $remainingKeys[] = $key;
        }

        Cache::forever(self::PREFIX_TRACKED_KEYS, array_values(array_unique($remainingKeys)));
    }

    /**
     * Clear all public cache items (home, CPTs, contents).
     */
    public static function clearPublicCache(): void
    {
        Cache::forget(self::PREFIX_HOME_IDS);
        Cache::forget(self::PREFIX_PUBLIC_CPTS);

        $keys = Cache::get(self::PREFIX_TRACKED_KEYS, []);
        $remainingKeys = [];

        foreach ($keys as $key) {
            if (
                str_starts_with($key, self::PREFIX_HOME_IDS) ||
                str_starts_with($key, self::PREFIX_PUBLIC_CPTS) ||
                str_starts_with($key, self::PREFIX_CPT_ID) ||
                str_starts_with($key, self::PREFIX_CONTENT_ID)
            ) {
                Cache::forget($key);
            } else {
                $remainingKeys[] = $key;
            }
        }

        Cache::forever(self::PREFIX_TRACKED_KEYS, array_values(array_unique($remainingKeys)));
    }

    /**
     * Clear admin navigation cache, user CPTs and dashboard metrics.
     */
    public static function clearAdminCache(): void
    {
        $keys = Cache::get(self::PREFIX_TRACKED_KEYS, []);
        $remainingKeys = [];

        foreach ($keys as $key) {
            if (
                str_starts_with($key, self::PREFIX_USER_CPT_IDS) ||
                str_starts_with($key, self::PREFIX_DASHBOARD)
            ) {
                Cache::forget($key);
            } else {
                $remainingKeys[] = $key;
            }
        }

        Cache::forever(self::PREFIX_TRACKED_KEYS, array_values(array_unique($remainingKeys)));
    }

    /**
     * Clear all application cached items.
     */
    public static function clearAll(): void
    {
        $keys = Cache::get(self::PREFIX_TRACKED_KEYS, []);
        foreach ($keys as $key) {
            Cache::forget($key);
        }

        Cache::forget(self::PREFIX_TRACKED_KEYS);
        Cache::forget(self::PREFIX_HOME_IDS);
        Cache::forget(self::PREFIX_PUBLIC_CPTS);
        Cache::forget(self::PREFIX_CUSTOM_FONTS);
    }

    /**
     * Helper to track custom keys for clean invalidation across different cache drivers.
     */
    protected static function trackKey(string $key): void
    {
        $keys = Cache::get(self::PREFIX_TRACKED_KEYS, []);
        if (! in_array($key, $keys, true)) {
            $keys[] = $key;
            Cache::forever(self::PREFIX_TRACKED_KEYS, $keys);
        }
    }
}
