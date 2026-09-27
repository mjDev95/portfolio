<?php

namespace App\Http\View\Composers;

use App\Models\ContentType;
use App\Services\PortfolioCacheService;
use Illuminate\Support\Facades\Schema;
use Illuminate\View\View;

class NavigationComposer
{
    /**
     * Bind public active content types to the view.
     */
    public function compose(View $view): void
    {
        $existing = $view->getData()['navContentTypes'] ?? null;

        $rawTypes = $existing ?? PortfolioCacheService::rememberPublicContentTypes(function () {
            if (! Schema::hasTable('content_types')) {
                return [];
            }

            return ContentType::query()
                ->where('is_public', true)
                ->orderBy('order')
                ->get()
                ->map(fn (ContentType $type) => [
                    'name' => $type->name,
                    'slug' => $type->slug,
                    'public_route_slug' => $type->public_route_slug,
                ])
                ->all();
        });

        $navContentTypes = collect($rawTypes)->map(function ($item) {
            if ($item instanceof \__PHP_Incomplete_Class) {
                return null;
            }

            if ($item instanceof ContentType) {
                return (object) [
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'public_route_slug' => $item->public_route_slug,
                ];
            }

            if (is_array($item)) {
                $slug = $item['public_route_slug'] ?? $item['slug'] ?? '';
                if (empty($slug) || str_contains((string) $slug, '\\')) {
                    return null;
                }

                return (object) [
                    'name' => $item['name'] ?? ucfirst($slug),
                    'slug' => $item['slug'] ?? $slug,
                    'public_route_slug' => $slug,
                ];
            }

            if (is_object($item)) {
                $slug = $item->public_route_slug ?? $item->slug ?? '';
                if (empty($slug) || str_contains((string) $slug, '\\')) {
                    return null;
                }

                return (object) [
                    'name' => $item->name ?? ucfirst($slug),
                    'slug' => $item->slug ?? $slug,
                    'public_route_slug' => $slug,
                ];
            }

            $str = trim((string) $item);
            if (empty($str) || str_contains($str, '\\')) {
                return null;
            }

            return (object) [
                'name' => ucfirst($str),
                'slug' => $str,
                'public_route_slug' => $str,
            ];
        })->filter(fn ($item) => ! empty($item?->public_route_slug))->values();

        $view->with('navContentTypes', $navContentTypes);
    }
}
