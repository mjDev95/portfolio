<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class VisitTrackingController extends Controller
{
    /**
     * Handle incoming cookieless visit ping.
     */
    public function __invoke(Request $request): Response
    {
        // 1. Skip tracking if authenticated to avoid polluting portfolio analytics
        if (auth()->check()) {
            return response()->noContent();
        }

        $path = (string) $request->input('path', '/');
        // Sanitize path (strip query strings, limit to 255 chars)
        $parsedPath = parse_url($path, PHP_URL_PATH);
        $path = ! empty($parsedPath) ? $parsedPath : '/';
        $path = substr($path, 0, 255);

        // Exclude admin or api routes if accidentally triggered
        if (str_starts_with($path, '/admin') || str_starts_with($path, '/api') || str_starts_with($path, '/build')) {
            return response()->noContent();
        }

        // 2. Identify portfolio owner (multi-tenant ready)
        $user = null;

        if ($contentId = $request->input('content_id')) {
            $user = Content::find($contentId)?->user;
        }

        if (! $user) {
            $segments = explode('/', trim($path, '/'));
            $typeSlug = $segments[0] ?? null;

            if ($typeSlug) {
                $cpt = ContentType::where('slug', $typeSlug)
                    ->orWhere('public_slug', $typeSlug)
                    ->first();
                if ($cpt) {
                    $user = $cpt->user;
                }
            }
        }

        if (! $user && $request->has('user_id')) {
            $user = User::find($request->integer('user_id'));
        }

        if (! $user) {
            $user = User::where('has_telemetry', true)->first()
                ?? User::where('email', 'mjgaliciab@gmail.com')->first()
                ?? User::first();
        }

        // Feature Flag: Validar si el usuario propietario está activo y tiene telemetría activa
        if (! $user || ! $user->isActive() || ! $user->canTrackVisits()) {
            return response()->noContent(); // 204 No Content sin registrar
        }

        $userId = $user->id;

        // 3. Generate daily GDPR-compliant anonymized hash (no raw IP storage)
        $ip = $request->ip() ?? '127.0.0.1';
        $userAgent = $request->userAgent() ?? 'unknown';
        $today = now()->toDateString(); // YYYY-MM-DD

        $visitorHash = hash('sha256', $ip.'|'.$userAgent.'|'.$today);

        // 4. Extract referer (max 255 chars)
        $referer = $request->input('referer') ?? $request->header('referer');
        if ($referer) {
            $referer = substr((string) $referer, 0, 255);
        }

        // 5. Store or deduplicate via firstOrCreate
        try {
            Visit::firstOrCreate(
                [
                    'user_id' => $userId,
                    'path' => $path,
                    'visitor_hash' => $visitorHash,
                ],
                [
                    'referer' => $referer,
                ]
            );
        } catch (\Throwable $e) {
            // Silently absorb concurrency race condition on unique key
        }

        return response()->noContent();
    }
}
