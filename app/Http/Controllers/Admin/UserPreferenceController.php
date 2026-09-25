<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ColorPalette;
use App\Services\PortfolioCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserPreferenceController extends Controller
{
    /**
     * Display the authenticated user's preferences edit view.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        $preference = $user->preference;

        $palettesQuery = ColorPalette::orderBy('order')->orderBy('id');

        if (! $isAdmin) {
            // Clients must NEVER see Super Admin or master palettes
            $palettesQuery->where('user_id', $user->id)
                ->where('is_master', false);
        }

        $palettes = $palettesQuery->get([
            'id',
            'name',
            'slug',
            'primary_color',
            'secondary_color',
            'tertiary_color',
            'accent_color',
            'dark_neutral',
            'light_neutral',
            'is_master',
            'is_system',
            'tagline',
        ]);

        return Inertia::render('Admin/Preferences/Edit', [
            'preference' => $preference ? [
                'theme' => $preference->theme,
                'table_density' => $preference->table_density,
                'items_per_page' => $preference->items_per_page,
                'editor_mode' => $preference->editor_mode,
                'image_compression' => $preference->image_compression ?? 'lossless',
                'email_notifications' => (bool) $preference->email_notifications,
                'color_palette' => $preference->color_palette,
                'color_palette_id' => $preference->color_palette_id,
            ] : null,
            'palettes' => $palettes,
        ]);
    }

    /**
     * Retrieve the authenticated user's preferences as JSON.
     */
    public function show(Request $request): JsonResponse
    {
        $preference = $request->user()->preference;

        return response()->json([
            'preference' => $preference ? [
                'theme' => $preference->theme,
                'table_density' => $preference->table_density,
                'items_per_page' => $preference->items_per_page,
                'editor_mode' => $preference->editor_mode,
                'image_compression' => $preference->image_compression ?? 'lossless',
                'email_notifications' => (bool) $preference->email_notifications,
                'color_palette' => $preference->color_palette,
                'color_palette_id' => $preference->color_palette_id,
            ] : null,
        ]);
    }

    /**
     * Update or create the authenticated user's preferences.
     */
    public function update(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'theme' => ['sometimes', 'nullable', Rule::in(['dark', 'light'])],
            'image_compression' => ['sometimes', 'nullable', Rule::in(['lossless', 'lossy90'])],
            'color_palette_id' => ['sometimes', 'nullable', 'exists:color_palettes,id'],
            'settings' => ['sometimes', 'nullable', 'array'],
        ]);

        $attributes = [];
        if ($request->has('theme')) {
            $attributes['theme'] = $validated['theme'];
        }
        if ($request->has('image_compression') && ! empty($validated['image_compression'])) {
            $attributes['image_compression'] = $validated['image_compression'];
        }

        $incomingSettings = $request->input('settings', []);
        if (! is_array($incomingSettings)) {
            $incomingSettings = [];
        }

        // Map explicit columns from root or from settings payload
        if ($request->has('items_per_page') || isset($incomingSettings['items_per_page'])) {
            $attributes['items_per_page'] = (int) ($request->input('items_per_page') ?? $incomingSettings['items_per_page']);
        }
        if ($request->has('table_density') || isset($incomingSettings['table_density'])) {
            $attributes['table_density'] = (string) ($request->input('table_density') ?? $incomingSettings['table_density']);
        }
        if ($request->has('editor_mode') || isset($incomingSettings['editor_mode'])) {
            $attributes['editor_mode'] = (string) ($request->input('editor_mode') ?? $incomingSettings['editor_mode']);
        }
        if ($request->has('image_compression') || isset($incomingSettings['image_compression'])) {
            $val = (string) ($request->input('image_compression') ?? $incomingSettings['image_compression']);
            if (in_array($val, ['lossless', 'lossy90'], true)) {
                $attributes['image_compression'] = $val;
            }
        }
        if ($request->has('email_notifications') || isset($incomingSettings['email_notifications'])) {
            $attributes['email_notifications'] = (bool) ($request->input('email_notifications') ?? $incomingSettings['email_notifications']);
        }

        // Handle color_palette_id
        if ($request->has('color_palette_id')) {
            $attributes['color_palette_id'] = $request->input('color_palette_id');
        } elseif (isset($incomingSettings['color_palette_id'])) {
            $attributes['color_palette_id'] = $incomingSettings['color_palette_id'];
        }

        // Security check: Clients must not select master or admin-owned palettes
        if (! $request->user()->isAdmin() && ! empty($attributes['color_palette_id'])) {
            $allowedPalette = ColorPalette::where('id', $attributes['color_palette_id'])
                ->where('user_id', $request->user()->id)
                ->where('is_master', false)
                ->exists();

            if (! $allowedPalette) {
                $attributes['color_palette_id'] = null;
            }
        }

        if ($request->has('color_palette') || isset($incomingSettings['color_palette'])) {
            $rawColorPalette = $request->input('color_palette') ?? $incomingSettings['color_palette'];
            // If client, ensure they cannot save Super Admin colors
            if (! $request->user()->isAdmin() && is_array($rawColorPalette) && isset($rawColorPalette['colors']['primary'])) {
                $primaryHex = strtoupper(trim((string) $rawColorPalette['colors']['primary']));
                if ($primaryHex === '#CB2128' || $primaryHex === '#CC282F') {
                    $rawColorPalette = null;
                }
            }
            $attributes['color_palette'] = $rawColorPalette;
        } elseif (! empty($attributes['color_palette_id'])) {
            $palette = ColorPalette::find($attributes['color_palette_id']);
            if ($palette) {
                $attributes['color_palette'] = [
                    'id' => $palette->slug,
                    'name' => $palette->name,
                    'colors' => [
                        'primary' => $palette->primary_color,
                        'secondary' => $palette->secondary_color,
                        'tertiary' => $palette->tertiary_color,
                        'accent' => $palette->accent_color,
                    ],
                ];
            }
        }

        $currentSettings = $request->user()->preference?->settings ?? [];
        $attributes['settings'] = array_merge($currentSettings, $incomingSettings);

        $preference = $request->user()->preference()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $attributes
        );

        $preference->refresh();

        if ($request->header('X-Inertia')) {
            return back()->with('success', 'Preferencias actualizadas');
        }

        return response()->json([
            'success' => true,
            'preference' => [
                'theme' => $preference->theme,
                'table_density' => $preference->table_density,
                'items_per_page' => $preference->items_per_page,
                'editor_mode' => $preference->editor_mode,
                'image_compression' => $preference->image_compression ?? 'lossless',
                'email_notifications' => (bool) $preference->email_notifications,
                'color_palette' => $preference->color_palette,
                'color_palette_id' => $preference->color_palette_id,
            ],
        ]);
    }

    /**
     * Clear application cache from user preferences.
     */
    public function clearCache(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scope' => ['required', 'string', Rule::in(['public', 'admin', 'all'])],
        ]);

        $scope = $validated['scope'];

        if (in_array($scope, ['admin', 'all'], true)) {
            abort_unless($request->user()->isAdmin(), 403, 'Solo el Super Administrador puede purgar la caché del sistema.');
        }

        if ($scope === 'public') {
            PortfolioCacheService::clearPublicCache();
            $message = 'Caché pública purgada exitosamente.';
        } elseif ($scope === 'admin') {
            PortfolioCacheService::clearAdminCache();
            $message = 'Caché del panel de administración purgada exitosamente.';
        } else {
            PortfolioCacheService::clearAll();
            $message = 'Caché completa del sistema purgada exitosamente.';
        }

        return response()->json([
            'success' => true,
            'scope' => $scope,
            'message' => $message,
        ]);
    }
}
