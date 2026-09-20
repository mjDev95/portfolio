<?php

namespace App\Services;

use Closure;
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

    public const PREFIX_CPT_ID = 'portfolio:cpt:id:';

    public const PREFIX_CONTENT_ID = 'portfolio:content:id:';

    public const PREFIX_USER_CPT_IDS = 'portfolio:user:cpt_ids:';

    public const PREFIX_DASHBOARD = 'portfolio:admin:dashboard:';

    public const PREFIX_TRACKED_KEYS = 'portfolio:tracked_keys';

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

        $keys = Cache::get(self::PREFIX_TRACKED_KEYS, []);
        $remainingKeys = [];

        foreach ($keys as $key) {
            if (
                str_starts_with($key, self::PREFIX_HOME_IDS) ||
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
