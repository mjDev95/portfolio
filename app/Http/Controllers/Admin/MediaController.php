<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Models\Content;
use App\Models\Media;
use App\Support\SecureFileUploader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    /**
     * List all media assets for the current user with pagination, search, and collection filtering.
     * Supports both dedicated Inertia page view and JSON responses for modal pickers.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $query = Media::query()->where('user_id', auth()->id());

        if ($search = trim((string) $request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('alt', 'like', "%{$search}%")
                    ->orWhere('caption', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($collection = $request->input('collection')) {
            if ($collection === 'library') {
                $query->where(function ($q) {
                    $q->where('collection', 'library')
                        ->orWhereDoesntHave('contents');
                });
            } elseif (in_array($collection, ['thumbnail', 'hero', 'gallery'], true)) {
                $query->where(function ($q) use ($collection) {
                    $q->where('collection', $collection)
                        ->orWhereHas('contents', fn ($cq) => $cq->where('content_media.collection', $collection));
                });
            }
        }

        $perPage = min((int) $request->input('per_page', 24), 100);
        $media = $query->latest('id')->paginate($perPage)->withQueryString();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($media);
        }

        return Inertia::render('Admin/Media/Index', [
            'media' => $media,
            'filters' => [
                'search' => $search,
                'collection' => $collection ?? 'all',
            ],
            'stats' => [
                'total' => Media::where('user_id', auth()->id())->count(),
                'totalSize' => (int) Media::where('user_id', auth()->id())->sum('file_size'),
            ],
        ]);
    }

    /**
     * Upload a file and attach it to a mediable model or save as a standalone media library asset.
     */
    public function store(StoreMediaRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $collection = $request->validated('collection') ?: 'library';

        $uploadResult = SecureFileUploader::storeWithThumbnail(
            $file,
            'media/'.$collection
        );

        $mediableType = $request->validated('mediable_type');
        $mediableId = $request->validated('mediable_id');
        if ($mediableType && $mediableId) {
            $mediable = $mediableType::findOrFail($mediableId);
            $this->authorize('update', $mediable);
        }

        $contentId = $request->validated('content_id') ?? (($mediableType === 'App\\Models\\Content') ? $mediableId : null);

        $media = Media::create([
            'user_id' => auth()->id(),
            'content_id' => $contentId,
            'disk' => 'public',
            'file_path' => $uploadResult['file_path'],
            'thumbnail_path' => $uploadResult['thumbnail_path'],
            'file_name' => $uploadResult['file_name'],
            'mime_type' => $uploadResult['mime_type'],
            'file_size' => $uploadResult['file_size'],
            'collection' => $collection,
            'caption' => $this->sanitizeMetadata($request->validated('caption')),
            'order' => $request->validated('order', 0),
            'mediable_id' => $mediableId,
            'mediable_type' => $mediableType,
        ]);

        if ($mediableType === 'App\\Models\\Content' && $mediableId) {
            $content = Content::find($mediableId);
            if ($content) {
                $content->media()->syncWithoutDetaching([
                    $media->id => [
                        'collection' => $collection,
                        'order' => (int) $request->validated('order', 0),
                    ],
                ]);
            }
        }

        return response()->json($media);
    }

    /**
     * Attach an existing media library asset to a content item (thumbnail, hero, or gallery).
     */
    public function attach(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'media_id' => ['required', 'integer', 'exists:media,id'],
            'content_id' => ['required', 'integer', 'exists:contents,id'],
            'collection' => ['required', 'string', Rule::in(['thumbnail', 'hero', 'gallery'])],
        ]);

        $source = Media::where('id', $validated['media_id'])
            ->when(! auth()->user()->isAdmin(), fn ($q) => $q->where('user_id', auth()->id()))
            ->firstOrFail();

        $content = Content::findOrFail($validated['content_id']);
        $this->authorize('update', $content);

        // If attaching as thumbnail or hero, safely detach previous one for this content
        if (in_array($validated['collection'], ['thumbnail', 'hero'], true)) {
            $content->media()->wherePivot('collection', $validated['collection'])->detach();
        }

        $order = $validated['collection'] === 'gallery'
            ? (($content->media()->wherePivot('collection', 'gallery')->max('content_media.order') ?? -1) + 1)
            : 0;

        $content->media()->syncWithoutDetaching([
            $source->id => [
                'collection' => $validated['collection'],
                'order' => $order,
            ],
        ]);

        $source->collection = $validated['collection'];

        return response()->json($source);
    }

    /**
     * Update metadata for a media asset (title, alt, description, caption).
     * Returns JSON for seamless async saving (WordPress-style).
     */
    public function update(Request $request, Media $media): JsonResponse
    {
        abort_unless($media->user_id === auth()->id() || auth()->user()->isAdmin(), 403);

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'alt' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        if (isset($validated['title'])) {
            $validated['title'] = $this->sanitizeMetadata($validated['title']);
        }
        if (isset($validated['alt'])) {
            $validated['alt'] = $this->sanitizeMetadata($validated['alt']);
        }
        if (isset($validated['caption'])) {
            $validated['caption'] = $this->sanitizeMetadata($validated['caption']);
        }
        if (isset($validated['description'])) {
            $validated['description'] = $this->sanitizeMetadata($validated['description']);
        }

        $media->update($validated);

        return response()->json($media);
    }

    /**
     * Sanitize string by stripping script/style blocks and HTML tags.
     */
    protected function sanitizeMetadata(?string $input): ?string
    {
        if ($input === null) {
            return null;
        }

        $clean = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $input);
        $clean = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $clean);

        return trim(strip_tags($clean));
    }

    /**
     * Delete a media record and its physical file from disk (if not referenced elsewhere),
     * or detach it from a specific content item if content_id is passed.
     */
    public function destroy(Request $request, Media $media): JsonResponse
    {
        abort_unless($media->user_id === auth()->id() || auth()->user()->isAdmin(), 403);

        // Si se especificó content_id, solo desasociar de esa publicación sin borrar el activo de la biblioteca
        if ($request->filled('content_id')) {
            $contentId = (int) $request->input('content_id');
            $media->contents()->detach($contentId);

            return response()->json(['detached' => true]);
        }

        $isUsedElsewhere = Media::where('file_path', $media->file_path)
            ->where('id', '!=', $media->id)
            ->exists();

        if (! $isUsedElsewhere) {
            SecureFileUploader::delete($media->file_path, $media->thumbnail_path);
        }

        $media->delete();

        return response()->json(['deleted' => true]);
    }

    /**
     * Bulk-update the `order` field for a set of media IDs.
     * Expects: { order: [1, 3, 5, 2] } — array of media IDs in desired order.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:media,id'],
        ]);

        foreach ($validated['order'] as $position => $mediaId) {
            Media::where('id', $mediaId)
                ->where('user_id', auth()->id())
                ->update(['order' => $position]);
        }

        return response()->json(['reordered' => true]);
    }

    /**
     * Delete multiple media records and their physical files in bulk.
     * Expects: { ids: [1, 2, 3] }
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:media,id'],
        ]);

        $mediaItems = Media::whereIn('id', $validated['ids'])
            ->where('user_id', auth()->id())
            ->get();

        $deletedCount = 0;

        foreach ($mediaItems as $media) {
            $isUsedElsewhere = Media::where('file_path', $media->file_path)
                ->where('id', '!=', $media->id)
                ->exists();

            if (! $isUsedElsewhere) {
                SecureFileUploader::delete($media->file_path, $media->thumbnail_path);
            }

            $media->delete();
            $deletedCount++;
        }

        return response()->json([
            'success' => true,
            'deletedCount' => $deletedCount,
        ]);
    }

    /**
     * Download a single media file as .webp.
     */
    public function download(Media $media)
    {
        abort_unless($media->user_id === auth()->id(), 403);

        $disk = Storage::disk($media->disk ?? 'public');
        if (! $disk->exists($media->file_path)) {
            abort(404, 'File not found');
        }

        $baseName = pathinfo($media->file_name, PATHINFO_FILENAME);
        $downloadName = Str::slug($baseName ?: 'imagen').'.webp';

        return $disk->download($media->file_path, $downloadName, [
            'Content-Type' => 'image/webp',
        ]);
    }

    /**
     * Download multiple media files in bulk as .webp (direct single download if 1, or zip if > 1).
     * Expects: { ids: [1, 2, 3] } via POST or GET (e.g. ids comma separated or array)
     */
    public function downloadBulk(Request $request)
    {
        $rawIds = $request->input('ids');
        if (is_string($rawIds)) {
            $rawIds = array_filter(explode(',', $rawIds));
        }

        $request->merge(['ids' => $rawIds]);

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:media,id'],
        ]);

        $mediaItems = Media::whereIn('id', $validated['ids'])
            ->where('user_id', auth()->id())
            ->get();

        if ($mediaItems->isEmpty()) {
            abort(404, 'No media found.');
        }

        // If only 1 file is requested, return it directly as .webp
        if ($mediaItems->count() === 1) {
            return $this->download($mediaItems->first());
        }

        // Multiple files -> create a ZIP archive containing the .webp files
        $disk = Storage::disk('public');
        $tempDir = storage_path('app/temp');
        if (! file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $zipFileName = 'imagenes-webp-'.now()->format('Ymd-His').'.zip';
        $zipPath = $tempDir.'/'.$zipFileName;

        $zip = new \ZipArchive;
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Unable to create zip file');
        }

        $usedNames = [];
        foreach ($mediaItems as $media) {
            $fullPath = $disk->path($media->file_path);
            if (file_exists($fullPath)) {
                $baseName = Str::slug(pathinfo($media->file_name, PATHINFO_FILENAME)) ?: 'imagen';
                $entryName = $baseName.'.webp';

                // Prevent name collisions inside the ZIP
                $i = 1;
                while (isset($usedNames[$entryName])) {
                    $entryName = "{$baseName}-{$i}.webp";
                    $i++;
                }
                $usedNames[$entryName] = true;

                $zip->addFile($fullPath, $entryName);
            }
        }

        $zip->close();

        return response()->download($zipPath, $zipFileName, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }
}
