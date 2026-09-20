<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Models\Content;
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
                    'media' => fn ($q) => $q->where('collection', 'thumbnail'),
                    'contentType',
                ])
                ->orderBy('sort_order')
                ->get()
            : collect();

        return view('home', [
            'featuredProjects' => $featuredContents,
            'featuredContents' => $featuredContents,
        ]);
    }
}
