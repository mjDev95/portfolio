<?php

use App\Http\Controllers\Admin\BrandIdentityController;
use App\Http\Controllers\Admin\ColorPaletteController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\ContentTypeController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\SearchController;
use App\Http\Controllers\Admin\TaxonomyController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserPreferenceController;
use App\Http\Controllers\ProfileController;
use App\Models\Category;
use App\Models\ContentType;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Private admin panel — Inertia.js + React (Laravel Breeze auth)
|--------------------------------------------------------------------------
| Every route below requires an authenticated + verified admin user.
*/
Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'active'])->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::get('dashboard', DashboardController::class);
    Route::get('api/search', [SearchController::class, 'index'])->name('api.search');

    // ── Custom Post Types (CPT) Management ────────────────────────────────
    Route::get('content-types', [ContentTypeController::class, 'index'])->name('content-types.index');
    Route::patch('content-types/{contentType}/visibility', [ContentTypeController::class, 'toggleVisibility'])->name('content-types.visibility');

    Route::middleware('admin')->group(function () {
        Route::resource('content-types', ContentTypeController::class)->except(['index', 'show']);

        // ── Brand Identity & Design System ──────────────────────────────────
        Route::get('brand', [BrandIdentityController::class, 'index'])->name('brand.index');
        Route::post('brand/palettes/reorder', [ColorPaletteController::class, 'reorder'])->name('brand.palettes.reorder');
        Route::resource('brand/palettes', ColorPaletteController::class, ['as' => 'brand'])->except(['create', 'show', 'edit']);

        // ── User & Client Management (Dedicated Views CRUD) ──────────────────
        Route::get('api/users', [UserController::class, 'apiSearch'])->name('api.users.search');
        Route::resource('users', UserController::class);
        Route::patch('users/{user}/telemetry', [UserController::class, 'toggleTelemetry'])->name('users.telemetry');
        Route::patch('users/{user}/status', [UserController::class, 'toggleStatus'])->name('users.status');
    });

    // ── Universal CPT Content CRUD (Sin /c/ - URLs limpias /admin/{typeSlug}) ──
    Route::get('c/{typeSlug}', fn ($typeSlug) => redirect()->route('admin.content.index', $typeSlug));
    Route::get('c/{typeSlug}/create', fn ($typeSlug) => redirect()->route('admin.content.create', $typeSlug));
    Route::get('c/{typeSlug}/categories', fn ($typeSlug) => redirect()->route('admin.content.categories.index', $typeSlug));
    Route::get('c/{typeSlug}/tags', fn ($typeSlug) => redirect()->route('admin.content.tags.index', $typeSlug));
    Route::get('c/{typeSlug}/{content}/edit', fn ($typeSlug, $content) => redirect()->route('admin.content.edit', [$typeSlug, $content]));

    // ── Universal CPT Taxonomies (Categorías y Etiquetas por CPT) ──────────
    Route::get('{typeSlug}/categories', [TaxonomyController::class, 'categories'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.categories.index');
    Route::post('{typeSlug}/categories', [TaxonomyController::class, 'storeCategory'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.categories.store');
    Route::match(['put', 'patch'], '{typeSlug}/categories/{category}', [TaxonomyController::class, 'updateCategory'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.categories.update');
    Route::delete('{typeSlug}/categories/{category}', [TaxonomyController::class, 'destroyCategory'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.categories.destroy');

    Route::get('{typeSlug}/tags', [TaxonomyController::class, 'tags'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.tags.index');
    Route::post('{typeSlug}/tags', [TaxonomyController::class, 'storeTag'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.tags.store');
    Route::match(['put', 'patch'], '{typeSlug}/tags/{tag}', [TaxonomyController::class, 'updateTag'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.tags.update');
    Route::delete('{typeSlug}/tags/{tag}', [TaxonomyController::class, 'destroyTag'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.tags.destroy');

    Route::post('{typeSlug}/reorder', [ContentController::class, 'reorder'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.reorder');
    Route::get('{typeSlug}', [ContentController::class, 'index'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.index');
    Route::get('{typeSlug}/create', [ContentController::class, 'create'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.create');
    Route::post('{typeSlug}', [ContentController::class, 'store'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.store');
    Route::get('{typeSlug}/{content}/edit', [ContentController::class, 'edit'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.edit');
    Route::match(['put', 'patch'], '{typeSlug}/{content}', [ContentController::class, 'update'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.update');
    Route::delete('{typeSlug}/{content}', [ContentController::class, 'destroy'])
        ->where('typeSlug', '(?!dashboard|content-types|media|categories|tags|messages|profile|preferences|brand|login|logout|forgot-password|reset-password|verify-email|confirm-password|password|users|api)[a-zA-Z0-9\-_]+')
        ->name('content.destroy');

    // ── Media Library (polymorphic) ───────────────────────────────────────
    Route::get('media', [MediaController::class, 'index'])->name('media.index');
    Route::post('media', [MediaController::class, 'store'])->name('media.store');
    Route::post('media/bulk-destroy', [MediaController::class, 'bulkDestroy'])->name('media.bulk-destroy');
    Route::match(['put', 'patch'], 'media/{media}', [MediaController::class, 'update'])->name('media.update');
    Route::post('media/attach', [MediaController::class, 'attach'])->name('media.attach');
    Route::delete('media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');
    Route::post('media/reorder', [MediaController::class, 'reorder'])->name('media.reorder');

    // ── Universal Taxonomies Endpoints ─────────────────────────────────────
    Route::get('categories', fn () => Category::where(fn ($q) => $q->where('user_id', auth()->id())->orWhereNull('user_id'))->orderBy('name')->get(['id', 'name']))->name('categories.index');
    Route::post('categories', function (Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'content_type_id' => ['nullable', 'integer', 'exists:content_types,id'],
        ]);
        if (! empty($validated['content_type_id'])) {
            $ct = ContentType::findOrFail($validated['content_type_id']);
            abort_unless(auth()->user()->can('view', $ct), 403);
        }
        $category = Category::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'content_type_id' => $validated['content_type_id'] ?? null,
        ]);

        return response()->json($category, 201);
    })->name('categories.store');

    Route::get('tags', fn () => Tag::where(fn ($q) => $q->where('user_id', auth()->id())->orWhereNull('user_id'))->orderBy('name')->get(['id', 'name']))->name('tags.index');
    Route::post('tags', function (Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);
        $tag = Tag::firstOrCreate([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
        ]);

        return response()->json($tag, 201);
    })->name('tags.store');

    // ── Messages (leads) ──────────────────────────────────────────────────
    Route::get('messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('messages/{message}', [MessageController::class, 'show'])->name('messages.show');
    Route::delete('messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');

    // ── Profile ───────────────────────────────────────────────────────────
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── User Preferences ──────────────────────────────────────────────────
    Route::get('preferences', [UserPreferenceController::class, 'edit'])->name('preferences.edit');
    Route::get('preferences/data', [UserPreferenceController::class, 'show'])->name('preferences.show');
    Route::put('preferences', [UserPreferenceController::class, 'update'])->name('preferences.update');
    Route::post('preferences/cache/clear', [UserPreferenceController::class, 'clearCache'])->name('preferences.cache.clear');
});
