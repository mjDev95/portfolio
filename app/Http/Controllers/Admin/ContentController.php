<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Media;
use App\Models\Tag;
use App\Support\SecureFileUploader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    protected function getContentType(string $typeSlug): ContentType
    {
        $contentType = ContentType::where(function ($q) use ($typeSlug) {
            $q->where('slug', $typeSlug)
                ->orWhere('public_slug', $typeSlug);
        })->firstOrFail();

        $this->authorize('view', $contentType);

        return $contentType;
    }

    public function index(Request $request, string $typeSlug): Response|JsonResponse
    {
        $contentType = $this->getContentType($typeSlug);
        $user = auth()->user();
        $isAdmin = $user->isAdmin();

        $targetUserId = ($isAdmin && $request->filled('client_id')) ? (int) $request->input('client_id') : $user->id;
        $contentType->setRelation('customFields', $contentType->fieldsForUser($targetUserId));

        $query = $contentType->contents()
            ->with(['media', 'categories', 'tags', 'user:id,name,email'])
            ->orderBy('sort_order')
            ->orderByDesc('created_at');

        // Aislamiento estricto de usuario: por defecto TODOS (incluido Super Admin) ven únicamente
        // las publicaciones creadas por sí mismos, a menos que el admin filtre explícitamente por un cliente.
        if ($isAdmin && $request->filled('client_id')) {
            $query->where('contents.user_id', (int) $request->input('client_id'));
        } else {
            $query->where('contents.user_id', $user->id);
        }

        if ($search = $request->input('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all' && $status !== '') {
                $query->where('status', $status);
            }
        }

        if ($categoryId = $request->input('category_id')) {
            $query->whereHas('categories', fn ($q) => $q->where('categories.id', $categoryId));
        }

        // Conteo reactivo estilo WordPress para pestañas de estado (Todos, Publicados, Borradores, Archivados)
        $statusCountsQuery = Content::where('content_type_id', $contentType->id);
        if ($isAdmin && $request->filled('client_id')) {
            $statusCountsQuery->where('contents.user_id', (int) $request->input('client_id'));
        } else {
            $statusCountsQuery->where('contents.user_id', $user->id);
        }

        if ($search) {
            $statusCountsQuery->where('title', 'like', "%{$search}%");
        }

        if ($categoryId) {
            $statusCountsQuery->whereHas('categories', fn ($q) => $q->where('categories.id', $categoryId));
        }

        $statusCounts = [
            'all' => (clone $statusCountsQuery)->count(),
            'published' => (clone $statusCountsQuery)->where('status', 'published')->count(),
            'draft' => (clone $statusCountsQuery)->where('status', 'draft')->count(),
            'archived' => (clone $statusCountsQuery)->where('status', 'archived')->count(),
        ];

        $perPage = min((int) $request->input('per_page', 20), 100);
        $contents = $query->paginate($perPage)->withQueryString();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($contents);
        }

        $taxUserId = ($isAdmin && $request->filled('client_id')) ? (int) $request->input('client_id') : $user->id;
        $categories = $contentType->has_categories
            ? Category::where('user_id', $taxUserId)
                ->where(fn ($q) => $q->where('content_type_id', $contentType->id)->orWhereNull('content_type_id'))
                ->orderBy('name')
                ->get(['id', 'name'])
            : [];

        $tags = $contentType->has_tags
            ? Tag::where('user_id', $taxUserId)->orderBy('name')->get(['id', 'name'])
            : [];

        $assignedClients = $isAdmin
            ? $contentType->users()->select(['users.id', 'users.name', 'users.email'])->orderBy('name')->get()
            : [];

        return Inertia::render('Admin/Content/Index', [
            'contentType' => $contentType,
            'contents' => $contents,
            'categories' => $categories,
            'tags' => $tags,
            'assignedClients' => $assignedClients,
            'statusCounts' => $statusCounts,
            'filters' => $request->only(['search', 'status', 'category_id', 'client_id']),
        ]);
    }

    public function create(string $typeSlug): Response
    {
        $contentType = $this->getContentType($typeSlug);
        $this->authorize('create', [Content::class, $contentType]);

        $user = auth()->user();
        $targetUserId = ! $user->isAdmin() ? $user->id : null;
        $contentType->setRelation('customFields', $contentType->fieldsForUser($targetUserId));

        $categories = $contentType->has_categories
            ? Category::where('user_id', $user->id)
                ->where(fn ($q) => $q->where('content_type_id', $contentType->id)->orWhereNull('content_type_id'))
                ->orderBy('name')
                ->get(['id', 'name'])
            : [];

        $tags = $contentType->has_tags
            ? Tag::where('user_id', $user->id)->orderBy('name')->get(['id', 'name'])
            : [];

        return Inertia::render('Admin/Content/Form', [
            'contentType' => $contentType,
            'content' => null,
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    public function store(Request $request, string $typeSlug): RedirectResponse|JsonResponse
    {
        $contentType = $this->getContentType($typeSlug);
        $this->authorize('create', [Content::class, $contentType]);
        $contentType->load('customFields');

        $rules = $this->buildValidationRules($contentType);
        $validated = $request->validate($rules);

        $rawSlug = ! empty($validated['slug']) ? $validated['slug'] : $validated['title'];
        $slug = Content::uniqueSlugFrom($rawSlug, auth()->id());

        $contentData = [
            'user_id' => auth()->id(),
            'content_type_id' => $contentType->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'body' => $validated['body'] ?? null,
            'custom_values' => $validated['custom_values'] ?? [],
            'status' => $validated['status'] ?? 'draft',
            'published_at' => $validated['published_at'] ?? null,
            'featured' => $validated['featured'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_keywords' => $validated['meta_keywords'] ?? null,
        ];

        $content = Content::create($contentData);

        // Subida directa o selección desde biblioteca de miniaturas / portadas
        if ($request->hasFile('thumbnail')) {
            $this->attachMediaFile($content, $request->file('thumbnail'), 'thumbnail');
        } elseif ($request->filled('thumbnail_media_id')) {
            $this->attachLibraryMedia($content, (int) $request->input('thumbnail_media_id'), 'thumbnail');
        }

        if ($request->hasFile('hero_image')) {
            $this->attachMediaFile($content, $request->file('hero_image'), 'hero');
        } elseif ($request->filled('hero_media_id')) {
            $this->attachLibraryMedia($content, (int) $request->input('hero_media_id'), 'hero');
        }

        if ($contentType->has_categories && $request->has('categories')) {
            $content->categories()->sync($request->input('categories', []));
        }

        if ($contentType->has_tags && $request->has('tags')) {
            $content->tags()->sync($request->input('tags', []));
        }

        if (! $request->header('X-Inertia') && ($request->wantsJson() || $request->ajax())) {
            return response()->json([
                'success' => true,
                'message' => "{$contentType->singular_name} guardado con éxito.",
                'content' => $content->load(['media', 'categories', 'tags']),
            ]);
        }

        $publicUrl = $contentType->is_public ? url(($contentType->public_slug ?: $contentType->slug).'/'.$content->slug) : null;

        if ($request->boolean('_from_modal')) {
            return back()
                ->with('success', "{$contentType->singular_name} guardado con éxito.")
                ->with('public_url', $publicUrl);
        }

        return redirect()
            ->route('admin.content.edit', [$contentType->slug, $content->id])
            ->with('success', "{$contentType->singular_name} guardado con éxito.")
            ->with('public_url', $publicUrl);
    }

    public function edit(string $typeSlug, Content $content): Response
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($content->content_type_id === $contentType->id, 404);
        $this->authorize('update', $content);

        $contentType->setRelation('customFields', $contentType->fieldsForUser($content->user_id));
        $content->load(['media', 'categories', 'tags']);

        $categories = $contentType->has_categories
            ? Category::where('user_id', $content->user_id)
                ->where(fn ($q) => $q->where('content_type_id', $contentType->id)->orWhereNull('content_type_id'))
                ->orderBy('name')
                ->get(['id', 'name'])
            : [];

        $tags = $contentType->has_tags
            ? Tag::where('user_id', $content->user_id)->orderBy('name')->get(['id', 'name'])
            : [];

        return Inertia::render('Admin/Content/Form', [
            'contentType' => $contentType,
            'content' => $content,
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    public function update(Request $request, string $typeSlug, Content $content): RedirectResponse|JsonResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($content->content_type_id === $contentType->id, 404);
        $this->authorize('update', $content);

        $contentType->load('customFields');
        $rules = $this->buildValidationRules($contentType, $content->id);
        $validated = $request->validate($rules);

        // Manejo de miniatura / thumbnail: eliminar, reemplazar por archivo o asignar de biblioteca
        if ($request->boolean('remove_thumbnail')) {
            $content->media()->wherePivot('collection', 'thumbnail')->detach();
        } elseif ($request->hasFile('thumbnail')) {
            $this->attachMediaFile($content, $request->file('thumbnail'), 'thumbnail');
        } elseif ($request->filled('thumbnail_media_id')) {
            $this->attachLibraryMedia($content, (int) $request->input('thumbnail_media_id'), 'thumbnail');
        }

        // Manejo de hero_image: eliminar, reemplazar por archivo o asignar de biblioteca
        if ($request->boolean('remove_hero_image')) {
            $content->media()->wherePivot('collection', 'hero')->detach();
        } elseif ($request->hasFile('hero_image')) {
            $this->attachMediaFile($content, $request->file('hero_image'), 'hero');
        } elseif ($request->filled('hero_media_id')) {
            $this->attachLibraryMedia($content, (int) $request->input('hero_media_id'), 'hero');
        }

        $rawSlug = ! empty($validated['slug']) ? $validated['slug'] : $content->slug;
        $slug = Content::uniqueSlugFrom($rawSlug, $content->user_id, $content->id);

        $content->update([
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'body' => $validated['body'] ?? null,
            'custom_values' => $validated['custom_values'] ?? [],
            'status' => $validated['status'] ?? 'draft',
            'published_at' => $validated['published_at'] ?? null,
            'featured' => $validated['featured'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_keywords' => $validated['meta_keywords'] ?? null,
        ]);

        if ($contentType->has_categories) {
            $content->categories()->sync($request->input('categories', []));
        }

        if ($contentType->has_tags) {
            $content->tags()->sync($request->input('tags', []));
        }

        if (! $request->header('X-Inertia') && ($request->wantsJson() || $request->ajax())) {
            return response()->json([
                'success' => true,
                'message' => "{$contentType->singular_name} actualizado con éxito.",
                'content' => $content->load(['media', 'categories', 'tags']),
            ]);
        }

        $publicUrl = $contentType->is_public ? url(($contentType->public_slug ?: $contentType->slug).'/'.$content->slug) : null;

        if ($request->boolean('_from_modal')) {
            return back()
                ->with('success', "{$contentType->singular_name} actualizado con éxito.")
                ->with('public_url', $publicUrl);
        }

        return redirect()
            ->route('admin.content.edit', [$contentType->slug, $content->id])
            ->with('success', "{$contentType->singular_name} actualizado con éxito.")
            ->with('public_url', $publicUrl);
    }

    public function destroy(string $typeSlug, Content $content): RedirectResponse
    {
        $contentType = $this->getContentType($typeSlug);
        abort_unless($content->content_type_id === $contentType->id, 404);
        $this->authorize('delete', $content);

        $content->load('media');
        $content->deleteAllMedia();
        $content->delete();

        return redirect()
            ->route('admin.content.index', $contentType->slug)
            ->with('success', "{$contentType->singular_name} eliminado con éxito.");
    }

    public function reorder(Request $request, string $typeSlug): RedirectResponse
    {
        $contentType = $this->getContentType($typeSlug);

        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:contents,id'],
        ]);

        foreach ($validated['order'] as $position => $contentId) {
            Content::where('id', $contentId)
                ->where('user_id', auth()->id())
                ->where('content_type_id', $contentType->id)
                ->update(['sort_order' => $position]);
        }

        return back();
    }

    // ─────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────

    protected function buildValidationRules(ContentType $contentType, ?int $contentId = null): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'excerpt' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'status' => ['required', 'string', Rule::in(['draft', 'published', 'archived'])],
            'published_at' => ['nullable', 'date'],
            'featured' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'meta_title' => ['nullable', 'string', 'max:70'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'meta_keywords' => ['nullable', 'string', 'max:255'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,heif,heic', 'max:20480'],
            'hero_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,heif,heic', 'max:20480'],
            'remove_thumbnail' => ['nullable', 'boolean'],
            'remove_hero_image' => ['nullable', 'boolean'],
            'thumbnail_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'hero_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['integer', 'exists:categories,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],
            'custom_values' => ['nullable', 'array'],
        ];

        foreach ($contentType->customFields as $field) {
            $fieldRules = [$field->is_required ? 'required' : 'nullable'];

            switch ($field->type) {
                case 'number':
                    $fieldRules[] = 'numeric';
                    break;
                case 'date':
                    $fieldRules[] = 'date';
                    break;
                case 'url':
                    $fieldRules[] = 'url';
                    break;
                case 'boolean':
                    $fieldRules[] = 'boolean';
                    break;
                case 'select':
                    if (! empty($field->options) && is_array($field->options)) {
                        $allowed = array_column($field->options, 'value');
                        if (! empty($allowed)) {
                            $fieldRules[] = Rule::in($allowed);
                        }
                    }
                    break;
                default:
                    $fieldRules[] = 'string';
                    break;
            }

            $rules["custom_values.{$field->name}"] = $fieldRules;
        }

        return $rules;
    }

    protected function attachMediaFile(Content $content, $file, string $collection): Media
    {
        $uploadResult = SecureFileUploader::storeWithThumbnail($file, 'media/library');

        $media = Media::create([
            'user_id' => auth()->id(),
            'disk' => 'public',
            'file_path' => $uploadResult['file_path'],
            'thumbnail_path' => $uploadResult['thumbnail_path'],
            'file_name' => SecureFileUploader::sanitizeOriginalFilename($file->getClientOriginalName()),
            'mime_type' => $uploadResult['mime_type'],
            'file_size' => $uploadResult['file_size'],
            'collection' => 'library',
            'order' => 0,
        ]);

        if (in_array($collection, ['thumbnail', 'hero'], true)) {
            $content->media()->wherePivot('collection', $collection)->detach();
        }

        $content->media()->syncWithoutDetaching([
            $media->id => [
                'collection' => $collection,
                'order' => 0,
            ],
        ]);

        return $media;
    }

    protected function attachLibraryMedia(Content $content, int $mediaId, string $collection): ?Media
    {
        $source = Media::where('id', $mediaId)
            ->where('user_id', auth()->id())
            ->first();

        if (! $source) {
            return null;
        }

        if (in_array($collection, ['thumbnail', 'hero'], true)) {
            $content->media()->wherePivot('collection', $collection)->detach();
        }

        $content->media()->syncWithoutDetaching([
            $source->id => [
                'collection' => $collection,
                'order' => 0,
            ],
        ]);

        return $source;
    }
}
