<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Tag;
use App\Services\PortfolioCacheService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class ContentController extends Controller
{
    public function index(string $typeSlug): View|JsonResponse|RedirectResponse
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

        // Si se recibe por query param, redirigir 301 a la ruta canónica dedicada de categoría estilo WordPress
        if ($selectedCategory && ! request()->ajax() && request()->header('X-Requested-With') !== 'XMLHttpRequest') {
            return redirect()->route('public.content.category', [
                'typeSlug' => $cpt->public_route_slug,
                'categorySlug' => $selectedCategory,
            ], 301);
        }

        $query = Content::where('content_type_id', $cpt->id)
            ->with([
                'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                'categories',
                'tags',
            ])
            ->published();

        $query->orderBy('sort_order')->orderByDesc('published_at');

        // Paginación asíncrona diferida para el Blog (5 iniciales + 10 por scroll)
        if ($cpt->slug === 'blog') {
            $page = max((int) request('page', 1), 1);
            $offset = $page === 1 ? 0 : 5 + ($page - 2) * 10;
            $limit = $page === 1 ? 5 : 10;

            if (request()->ajax() || request()->header('X-Requested-With') === 'XMLHttpRequest' || request()->wantsJson()) {
                $total = (clone $query)->count();
                $items = (clone $query)->skip($offset)->take($limit)->get();
                $hasMore = ($offset + $items->count()) < $total;
                $nextPage = $hasMore ? $page + 1 : null;

                return response()->json([
                    'html' => view('public.content.blog.partials.card-item', [
                        'contents' => $items,
                        'cpt' => $cpt,
                    ])->render(),
                    'has_more' => $hasMore,
                    'next_page' => $nextPage,
                    'total' => $total,
                    'title' => 'Blog — '.config('app.name'),
                    'category_slug' => '',
                ]);
            }

            $total = (clone $query)->count();
            $contents = (clone $query)->take(5)->get();
            $hasMore = $total > 5;
            $nextPage = $hasMore ? 2 : null;
        } else {
            $contents = $query->paginate(9)->withQueryString();
            $hasMore = false;
            $nextPage = null;
            $total = $contents->total();
        }

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
            'selectedCategory' => null,
            'hasMore' => $hasMore,
            'nextPage' => $nextPage,
            'total' => $total,
        ]);
    }

    /**
     * Vista de archivo dedicada por Categoría (estilo taxonomías de WordPress)
     */
    public function category(string $typeSlug, string $categorySlug): View|JsonResponse
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

        $category = Category::where('slug', $categorySlug)->firstOrFail();

        $query = Content::where('content_type_id', $cpt->id)
            ->whereHas('categories', function ($q) use ($category) {
                $q->where('categories.id', $category->id);
            })
            ->with([
                'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                'categories',
                'tags',
            ])
            ->published()
            ->orderBy('sort_order')
            ->orderByDesc('published_at');

        // Paginación asíncrona diferida para la categoría del Blog (5 iniciales + 10 por scroll)
        if ($cpt->slug === 'blog') {
            $page = max((int) request('page', 1), 1);
            $offset = $page === 1 ? 0 : 5 + ($page - 2) * 10;
            $limit = $page === 1 ? 5 : 10;

            if (request()->ajax() || request()->header('X-Requested-With') === 'XMLHttpRequest' || request()->wantsJson()) {
                $total = (clone $query)->count();
                $items = (clone $query)->skip($offset)->take($limit)->get();
                $hasMore = ($offset + $items->count()) < $total;
                $nextPage = $hasMore ? $page + 1 : null;

                return response()->json([
                    'html' => view('public.content.blog.partials.card-item', [
                        'contents' => $items,
                        'cpt' => $cpt,
                    ])->render(),
                    'has_more' => $hasMore,
                    'next_page' => $nextPage,
                    'total' => $total,
                    'title' => $category->name.' — Blog — '.config('app.name'),
                    'category_slug' => $category->slug,
                ]);
            }

            $total = (clone $query)->count();
            $contents = (clone $query)->take(5)->get();
            $hasMore = $total > 5;
            $nextPage = $hasMore ? 2 : null;
        } else {
            $contents = $query->paginate(9)->withQueryString();
            $hasMore = false;
            $nextPage = null;
            $total = $contents->total();
        }

        $categories = Category::whereHas('contents', function ($q) use ($cpt) {
            $q->where('content_type_id', $cpt->id)->published();
        })->withCount(['contents' => function ($q) use ($cpt) {
            $q->where('content_type_id', $cpt->id)->published();
        }])->get();

        $view = view()->exists("public.content.{$cpt->slug}.category")
            ? "public.content.{$cpt->slug}.category"
            : (view()->exists("public.content.{$cpt->slug}.index")
                ? "public.content.{$cpt->slug}.index"
                : 'public.content.universal-index');

        return view($view, [
            'cpt' => $cpt,
            'contentType' => $cpt,
            'category' => $category,
            'contents' => $contents,
            'categories' => $categories,
            'selectedCategory' => $category->slug,
            'hasMore' => $hasMore,
            'nextPage' => $nextPage,
            'total' => $total,
        ]);
    }

    /**
     * Vista de archivo dedicada por Etiqueta / Tag (estilo taxonomías de WordPress)
     */
    public function tag(string $typeSlug, string $tagSlug): View|JsonResponse
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

        $tag = Tag::where('slug', $tagSlug)->firstOrFail();

        $query = Content::where('content_type_id', $cpt->id)
            ->whereHas('tags', function ($q) use ($tag) {
                $q->where('tags.id', $tag->id);
            })
            ->with([
                'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                'categories',
                'tags',
            ])
            ->published()
            ->orderBy('sort_order')
            ->orderByDesc('published_at');

        // Paginación asíncrona diferida para la etiqueta del Blog (5 iniciales + 10 por scroll)
        if ($cpt->slug === 'blog') {
            $page = max((int) request('page', 1), 1);
            $offset = $page === 1 ? 0 : 5 + ($page - 2) * 10;
            $limit = $page === 1 ? 5 : 10;

            if (request()->ajax() || request()->header('X-Requested-With') === 'XMLHttpRequest' || request()->wantsJson()) {
                $total = (clone $query)->count();
                $items = (clone $query)->skip($offset)->take($limit)->get();
                $hasMore = ($offset + $items->count()) < $total;
                $nextPage = $hasMore ? $page + 1 : null;

                return response()->json([
                    'html' => view('public.content.blog.partials.card-item', [
                        'contents' => $items,
                        'cpt' => $cpt,
                    ])->render(),
                    'has_more' => $hasMore,
                    'next_page' => $nextPage,
                    'total' => $total,
                    'title' => '#'.$tag->name.' — Blog — '.config('app.name'),
                    'tag_slug' => $tag->slug,
                ]);
            }

            $total = (clone $query)->count();
            $contents = (clone $query)->take(5)->get();
            $hasMore = $total > 5;
            $nextPage = $hasMore ? 2 : null;
        } else {
            $contents = $query->paginate(9)->withQueryString();
            $hasMore = false;
            $nextPage = null;
            $total = $contents->total();
        }

        $tags = Tag::whereHas('contents', function ($q) use ($cpt) {
            $q->where('content_type_id', $cpt->id)->published();
        })->withCount(['contents' => function ($q) use ($cpt) {
            $q->where('content_type_id', $cpt->id)->published();
        }])->orderBy('name')->get();

        $totalAll = Content::where('content_type_id', $cpt->id)->published()->count();

        $view = view()->exists("public.content.{$cpt->slug}.tag")
            ? "public.content.{$cpt->slug}.tag"
            : (view()->exists("public.content.{$cpt->slug}.category")
                ? "public.content.{$cpt->slug}.category"
                : (view()->exists("public.content.{$cpt->slug}.index")
                    ? "public.content.{$cpt->slug}.index"
                    : 'public.content.universal-index'));

        return view($view, [
            'cpt' => $cpt,
            'contentType' => $cpt,
            'tag' => $tag,
            'contents' => $contents,
            'tags' => $tags,
            'totalAll' => $totalAll,
            'selectedTag' => $tag->slug,
            'hasMore' => $hasMore,
            'nextPage' => $nextPage,
            'total' => $total,
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
            ->with(['media', 'categories', 'tags', 'user'])
            ->firstOrFail();

        $otherPosts = Content::where('content_type_id', $cpt->id)
            ->published()
            ->where('id', '!=', $content->id)
            ->with([
                'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                'categories',
                'tags',
            ])
            ->orderByDesc('published_at')
            ->take(2)
            ->get();

        $nextPost = $otherPosts->first();

        $view = view()->exists("public.content.{$cpt->slug}.show")
            ? "public.content.{$cpt->slug}.show"
            : (view()->exists('public.content.universal-show')
                ? 'public.content.universal-show'
                : 'content.show');

        return view($view, [
            'cpt' => $cpt,
            'contentType' => $cpt,
            'content' => $content,
            'otherPosts' => $otherPosts,
            'nextPost' => $nextPost,
        ]);
    }
}
