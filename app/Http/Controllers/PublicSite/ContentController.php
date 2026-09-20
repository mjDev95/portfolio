<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
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

        $contents = Content::where('content_type_id', $cpt->id)
            ->with([
                'media' => fn ($q) => $q->where('collection', 'thumbnail'),
                'categories',
                'tags',
            ])
            ->published()
            ->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->paginate(9);

        $view = view()->exists("public.content.{$cpt->slug}.index")
            ? "public.content.{$cpt->slug}.index"
            : (view()->exists('public.content.universal-index')
                ? 'public.content.universal-index'
                : 'content.index');

        return view($view, [
            'cpt' => $cpt,
            'contentType' => $cpt,
            'contents' => $contents,
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

        $view = view()->exists("public.content.{$cpt->slug}.show")
            ? "public.content.{$cpt->slug}.show"
            : (view()->exists('public.content.universal-show')
                ? 'public.content.universal-show'
                : 'content.show');

        return view($view, [
            'cpt' => $cpt,
            'contentType' => $cpt,
            'content' => $content,
        ]);
    }
}
