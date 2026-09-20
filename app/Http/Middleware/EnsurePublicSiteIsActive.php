<?php

namespace App\Http\Middleware;

use App\Models\ContentType;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePublicSiteIsActive
{
    /**
     * Handle an incoming request to the public portfolio site.
     * If the client owning the content/site has their subscription paused, abort with 401 Unauthorized.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Verificar si es una ruta pública de un Custom Post Type específico
        $typeSlug = $request->route('typeSlug');

        if ($typeSlug) {
            $cpt = ContentType::where(function ($q) use ($typeSlug) {
                $q->where('public_slug', $typeSlug)
                    ->orWhere('slug', $typeSlug);
            })->first();

            if ($cpt && $cpt->user && ! $cpt->user->isActive()) {
                abort(401, 'El sitio web o catálogo solicitado se encuentra suspendido temporalmente por mensualidad pendiente.');
            }
        }

        // 2. Para las páginas principales del portafolio (home, sobre-mí, contacto)
        $primaryClient = User::getPrimaryClient();

        if ($primaryClient && ! $primaryClient->isActive()) {
            abort(401, 'Sitio web suspendido temporalmente por falta de pago o mensualidad pendiente.');
        }

        return $next($request);
    }
}
