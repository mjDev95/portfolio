<?php

namespace App\Http\Middleware;

use App\Models\ContentType;
use App\Services\PortfolioCacheService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Handle the incoming request.
     */
    public function handle(Request $request, \Closure $next)
    {
        if ($request->user() || $request->is('admin*')) {
            Inertia::encryptHistory();
        }

        return parent::handle($request, $next);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        if ($request->user() || $request->is('admin*')) {
            Inertia::encryptHistory();
        }

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $request->user() ? (function () use ($request) {
                    $user = $request->user();
                    $isAdmin = $user->isAdmin();
                    $pref = $user->preference;
                    $palette = $pref?->colorPalette;

                    if (! $isAdmin && $palette && ($palette->is_master || ($palette->user_id !== null && $palette->user_id !== $user->id))) {
                        $palette = null;
                    }

                    $colors = null;
                    if ($palette) {
                        $colors = [
                            'id' => $palette->id,
                            'name' => $palette->name,
                            'primary' => $palette->primary_color,
                            'secondary' => $palette->secondary_color,
                            'tertiary' => $palette->tertiary_color,
                            'accent' => $palette->accent_color,
                        ];
                    } elseif ($isAdmin && ! empty($pref?->color_palette['colors'])) {
                        $colors = $pref->color_palette['colors'];
                    } elseif (! $isAdmin && ! empty($pref?->color_palette['colors'])) {
                        $customColors = $pref->color_palette['colors'];
                        $primaryHex = strtoupper(trim((string) ($customColors['primary'] ?? '')));
                        if ($primaryHex !== '#CB2128' && $primaryHex !== '#CC282F') {
                            $colors = $customColors;
                        }
                    }

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role?->slug ?? 'user',
                        'role_name' => $user->role?->name ?? 'Usuario',
                        'has_telemetry' => (bool) $user->has_telemetry,
                        'is_active' => (bool) $user->is_active,
                        'theme' => $pref?->theme ?? 'system',
                        'color_palette' => $colors,
                    ];
                })() : null,
            ],

            'content_types' => $request->user()
                ? PortfolioCacheService::rememberUserCptIds($request->user()->id, function () use ($request) {
                    $user = $request->user();

                    return ContentType::where(function ($q) use ($user) {
                        $q->whereHas('users', fn ($uq) => $uq->where('users.id', $user->id))
                            ->orWhere(function ($fallback) use ($user) {
                                $fallback->where('content_types.user_id', $user->id)
                                    ->doesntHave('users');
                            });
                    })
                        ->withCount([
                            'contents' => fn ($cq) => $cq->where('user_id', $user->id),
                        ])
                        ->select([
                            'content_types.id',
                            'content_types.name',
                            'content_types.singular_name',
                            'content_types.slug',
                            'content_types.icon',
                            'content_types.order',
                            'content_types.is_public',
                            'content_types.public_slug',
                            'content_types.has_categories',
                            'content_types.has_tags',
                        ])
                        ->distinct()
                        ->orderBy('order')
                        ->get()
                        ->toArray();
                })
                : [],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'public_url' => fn () => $request->session()->get('public_url'),
            ],
        ];
    }
}
