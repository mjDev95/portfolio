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
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role?->slug ?? 'user',
                    'role_name' => $request->user()->role?->name ?? 'Usuario',
                    'has_telemetry' => (bool) $request->user()->has_telemetry,
                    'is_active' => (bool) $request->user()->is_active,
                    'theme' => $request->user()->preference?->theme ?? 'system',
                    'color_palette' => $request->user()->preference?->colorPalette ? [
                        'id' => $request->user()->preference->colorPalette->id,
                        'name' => $request->user()->preference->colorPalette->name,
                        'primary' => $request->user()->preference->colorPalette->primary_color,
                        'secondary' => $request->user()->preference->colorPalette->secondary_color,
                        'tertiary' => $request->user()->preference->colorPalette->tertiary_color,
                        'accent' => $request->user()->preference->colorPalette->accent_color,
                    ] : ($request->user()->preference?->color_palette['colors'] ?? null),
                ] : null,
            ],

            'content_types' => $request->user()
                ? PortfolioCacheService::rememberUserCptIds($request->user()->id, function () use ($request) {
                    return ContentType::where(function ($q) use ($request) {
                        $q->where('content_types.user_id', $request->user()->id)
                            ->orWhereHas('users', fn ($uq) => $uq->where('users.id', $request->user()->id));
                    })
                        ->select(['content_types.id', 'content_types.name', 'content_types.singular_name', 'content_types.slug', 'content_types.icon', 'content_types.order', 'content_types.is_public', 'content_types.public_slug'])
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
            ],
        ];
    }
}
