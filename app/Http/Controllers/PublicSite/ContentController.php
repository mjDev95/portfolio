<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Services\PortfolioCacheService;
use Illuminate\Contracts\View\View;

class ContentController extends Controller
{
    public function index(string $typeSlug): View
    {
        $cptId = PortfolioCacheService::rememberPublicCptId($typeSlug, function () use ($typeSlug) {
            return ContentType::where('is_public', true)
                ->where(function ($q) use ($typeSlug) {
                    $q->where('public_slug', $typeSlug)
                        ->orWhere('slug', $typeSlug);
                })
                ->value('id');
        });

        abort_unless($cptId, 404);

        $cpt = ContentType::findOrFail($cptId);

        $selectedCategory = request('categoria') ?: request('category');

        $query = Content::where('content_type_id', $cpt->id)
            ->with([
                'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                'categories',
                'tags',
            ])
            ->published();

        if ($selectedCategory) {
            $query->whereHas('categories', function ($q) use ($selectedCategory) {
                $q->where('slug', $selectedCategory);
            });
        }

        $contents = $query->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->paginate(9)
            ->withQueryString();

        $categories = Category::whereHas('contents', function ($q) use ($cpt) {
            $q->where('content_type_id', $cpt->id)->published();
        })->withCount(['contents' => function ($q) use ($cpt) {
            $q->where('content_type_id', $cpt->id)->published();
        }])->get();

        $view = view()->exists("public.content.{$cpt->slug}.index")
            ? "public.content.{$cpt->slug}.index"
            : (view()->exists('public.content.universal-index')
                ? 'public.content.universal-index'
                : 'content.index');

        return view($view, [
            'cpt' => $cpt,
            'contentType' => $cpt,
            'contents' => $contents,
            'categories' => $categories,
            'selectedCategory' => $selectedCategory,
        ]);
    }

    public function show(string $typeSlug, string $slug): View
    {
        $cptId = PortfolioCacheService::rememberPublicCptId($typeSlug, function () use ($typeSlug) {
            return ContentType::where('is_public', true)
                ->where(function ($q) use ($typeSlug) {
                    $q->where('public_slug', $typeSlug)
                        ->orWhere('slug', $typeSlug);
                })
                ->value('id');
        });

        abort_unless($cptId, 404);

        $cpt = ContentType::with('customFields')->findOrFail($cptId);

        $contentId = PortfolioCacheService::rememberPublicContentId($cpt->slug, $slug, function () use ($cpt, $slug) {
            return Content::where('content_type_id', $cpt->id)
                ->where('slug', $slug)
                ->published()
                ->value('id');
        });

        abort_unless($contentId, 404);

        $content = Content::where('id', $contentId)
            ->with(['media', 'categories', 'tags'])
            ->firstOrFail();

        $nextPost = Content::where('content_type_id', $cpt->id)
            ->published()
            ->where('id', '!=', $content->id)
            ->with([
                'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                'categories',
            ])
            ->orderByDesc('published_at')
            ->first();

        $view = view()->exists("public.content.{$cpt->slug}.show")
            ? "public.content.{$cpt->slug}.show"
            : (view()->exists('public.content.universal-show')
                ? 'public.content.universal-show'
                : 'content.show');

        return view($view, [
            'cpt' => $cpt,
            'contentType' => $cpt,
            'content' => $content,
            'nextPost' => $nextPost,
        ]);
    }
}
