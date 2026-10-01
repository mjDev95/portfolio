<?php

use App\Http\Controllers\PublicSite\AboutController;
use App\Http\Controllers\PublicSite\ContactController;
use App\Http\Controllers\PublicSite\ContentController as PublicContentController;
use App\Http\Controllers\PublicSite\HomeController;
use App\Http\Controllers\PublicSite\VisitTrackingController;
use App\Http\Middleware\EnsurePublicSiteIsActive;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public site — Blade + Barba.js v2 + GSAP + Lenis (SEO-first, no SPA build)
|--------------------------------------------------------------------------
*/
Route::middleware([EnsurePublicSiteIsActive::class])->group(function () {
    Route::get('/', HomeController::class)->name('home');

    // ── Redirecciones permanentes para eliminar el prefijo /c/ ─────────────────
    Route::get('/c/{typeSlug}', fn (string $typeSlug) => redirect("/{$typeSlug}", 301));
    Route::get('/c/{typeSlug}/{slug}', fn (string $typeSlug, string $slug) => redirect("/{$typeSlug}/{$slug}", 301));

    // Rutas directas y personalizables de CPT (ej: /proyectos, /blog, /portfolio, /casos-de-exito)
    Route::get('/{typeSlug}', [PublicContentController::class, 'index'])
        ->where('typeSlug', '(?!admin|contacto|sobre-mi|api|storage|login|register|logout|forgot-password|reset-password)[a-zA-Z0-9\-_]+')
        ->name('public.content.index');

    // Rutas dedicadas para categorías estilo WordPress (ej: /blog/categoria/wordpress-architecture)
    Route::get('/{typeSlug}/categoria/{categorySlug}', [PublicContentController::class, 'category'])
        ->where('typeSlug', '(?!admin|contacto|sobre-mi|api|storage|login|register|logout|forgot-password|reset-password)[a-zA-Z0-9\-_]+')
        ->name('public.content.category');

    // Rutas dedicadas para etiquetas estilo WordPress (ej: /blog/etiqueta/laravel y alias /blog/tag/laravel)
    Route::get('/{typeSlug}/etiqueta/{tagSlug}', [PublicContentController::class, 'tag'])
        ->where('typeSlug', '(?!admin|contacto|sobre-mi|api|storage|login|register|logout|forgot-password|reset-password)[a-zA-Z0-9\-_]+')
        ->name('public.content.tag');

    Route::get('/{typeSlug}/tag/{tagSlug}', fn (string $typeSlug, string $tagSlug) => redirect("/{$typeSlug}/etiqueta/{$tagSlug}", 301))
        ->where('typeSlug', '(?!admin|contacto|sobre-mi|api|storage|login|register|logout|forgot-password|reset-password)[a-zA-Z0-9\-_]+');

    Route::get('/{typeSlug}/{slug}', [PublicContentController::class, 'show'])
        ->where('typeSlug', '(?!admin|contacto|sobre-mi|api|storage|login|register|logout|forgot-password|reset-password)[a-zA-Z0-9\-_]+')
        ->name('public.content.show');

    Route::get('/sobre-mi', AboutController::class)->name('about');

    Route::get('/contacto', [ContactController::class, 'index'])->name('contact');
    Route::post('/contacto', [ContactController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('contact.store');
});

Route::post('/api/track-visit', VisitTrackingController::class)
    ->name('api.track-visit');

require __DIR__.'/admin.php';
require __DIR__.'/auth.php';
