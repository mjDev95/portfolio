<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\ContentType;
use App\Services\PortfolioCacheService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke(Request $request): View
    {
        $featuredIds = PortfolioCacheService::rememberPublicHomeIds(function () {
            return Content::query()
                ->where('featured', true)
                ->whereHas('contentType', fn ($q) => $q->where('is_public', true))
                ->published()
                ->orderBy('sort_order')
                ->limit(6)
                ->pluck('id')
                ->all();
        });

        $featuredContents = ! empty($featuredIds)
            ? Content::query()
                ->whereIn('id', $featuredIds)
                ->with([
                    'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                    'contentType',
                    'categories',
                ])
                ->orderBy('sort_order')
                ->get()
            : collect();

        $blogCpt = ContentType::where('slug', 'blog')->where('is_public', true)->first();

        $latestPosts = $blogCpt
            ? Content::query()
                ->where('content_type_id', $blogCpt->id)
                ->published()
                ->with([
                    'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                    'categories',
                    'contentType',
                ])
                ->orderByDesc('featured')
                ->orderByDesc('published_at')
                ->take(6)
                ->get()
            : collect();

        return view('home', [
            'featuredProjects' => $featuredContents,
            'featuredContents' => $featuredContents,
            'latestPosts' => $latestPosts,
            'blogCpt' => $blogCpt,
        ]);
    }
}
