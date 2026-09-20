<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ContentType;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TaxonomyController extends Controller
{
    /**
     * Obtener el CPT autorizado para el usuario en sesión.
     */
    protected function getContentType(string $typeSlug): ContentType
    {
        $contentType = ContentType::where(function ($q) use ($typeSlug) {
            $q->where('slug', $typeSlug)
                ->orWhere('public_slug', $typeSlug);
        })->firstOrFail();

        $this->authorize('view', $contentType);

        return $contentType;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Categorías
    // ─────────────────────────────────────────────────────────────────────────

    public function categories(Request $request, string $typeSlug): Response|JsonResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($contentType->has_categories, 404, 'Este tipo de contenido no tiene habilitadas las categorías.');

        $search = $request->input('search');
        $perPage = min((int) $request->input('per_page', 20), 100);
        $taxUserId = ! auth()->user()->isAdmin() ? auth()->id() : ($request->input('user_id') ?: $contentType->user_id);

        $categories = Category::query()
            ->where(function ($q) use ($taxUserId, $contentType) {
                $q->where('user_id', $taxUserId);
                if (auth()->user()->isAdmin() && $taxUserId !== $contentType->user_id) {
                    $q->orWhere('user_id', $contentType->user_id);
                }
            })
            ->where(function ($q) use ($contentType) {
                $q->where('content_type_id', $contentType->id)
                    ->orWhereNull('content_type_id');
            })
            ->withCount(['contents' => function ($q) use ($contentType) {
                $q->where('content_type_id', $contentType->id);
            }])
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($categories);
        }

        return Inertia::render('Admin/Content/Taxonomies/Index', [
            'contentType' => $contentType,
            'taxonomyType' => 'categories',
            'items' => $categories,
            'filters' => ['search' => $search ?? ''],
        ]);
    }

    public function storeCategory(Request $request, string $typeSlug): RedirectResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($contentType->has_categories, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $taxUserId = ! auth()->user()->isAdmin() ? auth()->id() : ($request->input('user_id') ?: $contentType->user_id);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        // Asegurar unicidad de slug para el usuario y CPT
        $originalSlug = $slug;
        $counter = 1;
        while (Category::where('user_id', $taxUserId)
            ->where('slug', $slug)
            ->where(fn ($q) => $q->where('content_type_id', $contentType->id)->orWhereNull('content_type_id'))
            ->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        Category::create([
            'user_id' => $taxUserId,
            'content_type_id' => $contentType->id,
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()
            ->route('admin.content.categories.index', $contentType->slug)
            ->with('success', "Categoría '{$validated['name']}' creada con éxito.");
    }

    public function updateCategory(Request $request, string $typeSlug, Category $category): RedirectResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($contentType->has_categories, 404);
        abort_unless($category->user_id === auth()->id() || auth()->user()->isAdmin(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        // Asegurar unicidad excluyendo la actual
        $originalSlug = $slug;
        $counter = 1;
        while (Category::where('user_id', $category->user_id)
            ->where('slug', $slug)
            ->where('id', '!=', $category->id)
            ->where(fn ($q) => $q->where('content_type_id', $contentType->id)->orWhereNull('content_type_id'))
            ->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $category->update([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()
            ->route('admin.content.categories.index', $contentType->slug)
            ->with('success', "Categoría '{$validated['name']}' actualizada con éxito.");
    }

    public function destroyCategory(string $typeSlug, Category $category): RedirectResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($contentType->has_categories, 404);
        abort_unless($category->user_id === auth()->id() || auth()->user()->isAdmin(), 403);

        $name = $category->name;
        // Desvincular de los contenidos de este CPT
        $category->contents()->where('content_type_id', $contentType->id)->detach();
        $category->delete();

        return redirect()
            ->route('admin.content.categories.index', $contentType->slug)
            ->with('success', "Categoría '{$name}' eliminada correctamente.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Etiquetas (Tags)
    // ─────────────────────────────────────────────────────────────────────────

    public function tags(Request $request, string $typeSlug): Response|JsonResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($contentType->has_tags, 404, 'Este tipo de contenido no tiene habilitadas las etiquetas.');

        $search = $request->input('search');
        $perPage = min((int) $request->input('per_page', 20), 100);
        $taxUserId = ! auth()->user()->isAdmin() ? auth()->id() : ($request->input('user_id') ?: $contentType->user_id);

        $tags = Tag::query()
            ->where(function ($q) use ($taxUserId, $contentType) {
                $q->where('user_id', $taxUserId);
                if (auth()->user()->isAdmin() && $taxUserId !== $contentType->user_id) {
                    $q->orWhere('user_id', $contentType->user_id);
                }
            })
            ->withCount(['contents' => function ($q) use ($contentType) {
                $q->where('content_type_id', $contentType->id);
            }])
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($tags);
        }

        return Inertia::render('Admin/Content/Taxonomies/Index', [
            'contentType' => $contentType,
            'taxonomyType' => 'tags',
            'items' => $tags,
            'filters' => ['search' => $search ?? ''],
        ]);
    }

    public function storeTag(Request $request, string $typeSlug): RedirectResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($contentType->has_tags, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
        ]);

        $taxUserId = ! auth()->user()->isAdmin() ? auth()->id() : ($request->input('user_id') ?: $contentType->user_id);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        $originalSlug = $slug;
        $counter = 1;
        while (Tag::where('user_id', $taxUserId)
            ->where('slug', $slug)
            ->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        Tag::create([
            'user_id' => $taxUserId,
            'name' => $validated['name'],
            'slug' => $slug,
        ]);

        return redirect()
            ->route('admin.content.tags.index', $contentType->slug)
            ->with('success', "Etiqueta '{$validated['name']}' creada con éxito.");
    }

    public function updateTag(Request $request, string $typeSlug, Tag $tag): RedirectResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($contentType->has_tags, 404);
        abort_unless($tag->user_id === auth()->id() || auth()->user()->isAdmin(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
        ]);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        $originalSlug = $slug;
        $counter = 1;
        while (Tag::where('user_id', $tag->user_id)
            ->where('slug', $slug)
            ->where('id', '!=', $tag->id)
            ->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $tag->update([
            'name' => $validated['name'],
            'slug' => $slug,
        ]);

        return redirect()
            ->route('admin.content.tags.index', $contentType->slug)
            ->with('success', "Etiqueta '{$validated['name']}' actualizada con éxito.");
    }

    public function destroyTag(string $typeSlug, Tag $tag): RedirectResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($contentType->has_tags, 404);
        abort_unless($tag->user_id === auth()->id() || auth()->user()->isAdmin(), 403);

        $name = $tag->name;
        $tag->contents()->where('content_type_id', $contentType->id)->detach();
        $tag->delete();

        return redirect()
            ->route('admin.content.tags.index', $contentType->slug)
            ->with('success', "Etiqueta '{$name}' eliminada correctamente.");
    }
}
