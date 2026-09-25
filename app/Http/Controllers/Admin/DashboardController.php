<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Media;
use App\Models\Message;
use App\Models\Role;
use App\Models\User;
use App\Models\Visit;
use App\Services\PortfolioCacheService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        $userId = $user->id;

        // ── 1. Métricas Agregadas y Analíticas (Cacheadas por 5 min / invalidables) ─
        $dashboardData = PortfolioCacheService::rememberDashboardData($userId, $isAdmin, function () use ($userId, $isAdmin) {
            return $this->computeDashboardMetrics($userId, $isAdmin);
        });

        $stats = $dashboardData['stats'];
        $activityData = $dashboardData['activityData'];

        // ── 2. Listados Recientes en Tiempo Real (Consultas ligeras con limit) ──────
        if ($isAdmin) {
            $usersList = User::with([
                'role:id,name,slug',
                'contentTypes' => fn ($q) => $q->select(['id', 'user_id', 'name', 'singular_name', 'slug', 'icon', 'is_public', 'public_slug'])->orderBy('order'),
            ])
                ->withCount(['contents', 'visits'])
                ->orderBy('name')
                ->get()
                ->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role?->slug ?? 'user',
                    'role_name' => $u->role?->name ?? 'Cliente',
                    'has_telemetry' => (bool) $u->has_telemetry,
                    'is_active' => (bool) $u->is_active,
                    'contents_count' => $u->contents_count,
                    'visits_count' => $u->visits_count,
                    'content_types' => $u->contentTypes,
                    'created_at' => $u->created_at?->format('d M Y'),
                ]);

            $recentContents = Content::where('user_id', $userId)
                ->with([
                    'contentType:id,name,singular_name,slug,icon',
                    'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                ])
                ->latest()
                ->take(6)
                ->get()
                ->map(function ($content) {
                    $thumb = $content->media->first();

                    return [
                        'id' => $content->id,
                        'title' => $content->title,
                        'slug' => $content->slug,
                        'status' => $content->status,
                        'featured' => (bool) $content->featured,
                        'sort_order' => $content->sort_order,
                        'content_type' => $content->contentType,
                        'thumbnail_url' => $thumb?->url,
                        'created_at' => $content->created_at?->format('d M Y'),
                    ];
                });

            $recentMedia = Media::where('user_id', $userId)
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'file_name' => $m->file_name,
                    'title' => $m->title,
                    'alt' => $m->alt,
                    'url' => $m->url,
                    'file_size' => $m->file_size,
                    'collection' => $m->collection,
                    'created_at' => $m->created_at?->format('d M Y'),
                ]);

            $recentMessages = Message::where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                    ->orWhereNull('user_id');
            })
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn ($msg) => [
                    'id' => $msg->id,
                    'name' => $msg->name,
                    'email' => $msg->email,
                    'budget_range' => $msg->budget_range,
                    'message' => $msg->message,
                    'read_at' => $msg->read_at?->toIso8601String(),
                    'created_at' => $msg->created_at?->format('d M Y, H:i'),
                ]);
        } else {
            $usersList = [];

            $recentContents = Content::where('user_id', $userId)
                ->with([
                    'contentType:id,name,singular_name,slug,icon',
                    'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
                ])
                ->latest()
                ->take(6)
                ->get()
                ->map(function ($content) {
                    $thumb = $content->media->first();

                    return [
                        'id' => $content->id,
                        'title' => $content->title,
                        'slug' => $content->slug,
                        'status' => $content->status,
                        'featured' => (bool) $content->featured,
                        'sort_order' => $content->sort_order,
                        'content_type' => $content->contentType,
                        'thumbnail_url' => $thumb?->url,
                        'created_at' => $content->created_at?->format('d M Y'),
                    ];
                });

            $recentMedia = Media::where('user_id', $userId)
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'file_name' => $m->file_name,
                    'title' => $m->title,
                    'alt' => $m->alt,
                    'url' => $m->url,
                    'file_size' => $m->file_size,
                    'collection' => $m->collection,
                    'created_at' => $m->created_at?->format('d M Y'),
                ]);

            $recentMessages = Message::where('user_id', $userId)
                ->latest()
                ->limit(3)
                ->get()
                ->map(fn ($msg) => [
                    'id' => $msg->id,
                    'name' => $msg->name,
                    'email' => $msg->email,
                    'budget_range' => $msg->budget_range,
                    'message' => $msg->message,
                    'read_at' => $msg->read_at?->toIso8601String(),
                    'created_at' => $msg->created_at?->format('d M Y, H:i'),
                ]);
        }

        return Inertia::render('Admin/Dashboard', [
            'isAdmin' => $isAdmin,
            'usersList' => $usersList,
            'roles' => $isAdmin ? Role::all(['id', 'name', 'slug']) : [],
            'stats' => $stats,
            'recentContents' => $recentContents,
            'recentMedia' => $recentMedia,
            'recentMessages' => $recentMessages,
            'analytics' => $activityData,
            'activityData' => $activityData,
        ]);
    }

    /**
     * Calcula las métricas globales o de cliente utilizando consultas agregadas optimizadas.
     */
    protected function computeDashboardMetrics(int $userId, bool $isAdmin): array
    {
        if ($isAdmin) {
            $totalUsers = User::count();
            $totalClients = User::whereHas('role', fn ($q) => $q->where('slug', 'user'))->count();
            $totalContentTypes = ContentType::count();
            $totalContents = Content::count();
            $publishedContents = Content::where('status', 'published')->count();
            $draftContents = Content::where('status', 'draft')->count();
            $totalViews = Visit::count();
            $totalMedia = Media::where('user_id', $userId)->count();
            $totalMediaSize = (int) Media::where('user_id', $userId)->sum('file_size');
            $totalMessages = Message::count();
            $unreadMessages = Message::whereNull('read_at')->count();

            $currentPeriodViews = Visit::whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])->count();
            $previousPeriodViews = Visit::whereBetween('created_at', [now()->subDays(13)->startOfDay(), now()->subDays(7)->endOfDay()])->count();
        } else {
            $totalUsers = 1;
            $totalClients = 1;
            $totalContents = Content::where('user_id', $userId)->count();
            $publishedContents = Content::where('user_id', $userId)->where('status', 'published')->count();
            $draftContents = Content::where('user_id', $userId)->where('status', 'draft')->count();
            $totalContentTypes = ContentType::where('user_id', $userId)->count();
            $totalViews = Visit::where('user_id', $userId)->count();
            $totalMedia = Media::where('user_id', $userId)->count();
            $totalMediaSize = (int) Media::where('user_id', $userId)->sum('file_size');
            $totalMessages = Message::where('user_id', $userId)->count();
            $unreadMessages = Message::where('user_id', $userId)->whereNull('read_at')->count();

            $currentPeriodViews = Visit::where('user_id', $userId)->whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])->count();
            $previousPeriodViews = Visit::where('user_id', $userId)->whereBetween('created_at', [now()->subDays(13)->startOfDay(), now()->subDays(7)->endOfDay()])->count();
        }

        if ($previousPeriodViews === 0) {
            $growthPercentage = $currentPeriodViews > 0 ? '+100%' : '0.0%';
        } else {
            $diff = $currentPeriodViews - $previousPeriodViews;
            $percentage = ($diff / $previousPeriodViews) * 100;
            $growthPercentage = ($percentage >= 0 ? '+' : '').number_format($percentage, 1).'%';
        }

        $projectsCount = Content::whereHas('contentType', fn ($q) => $q->where('slug', 'proyectos'))
            ->where('status', 'published')
            ->count();
        $postsCount = Content::whereHas('contentType', fn ($q) => $q->where('slug', 'blog'))
            ->where('status', 'published')
            ->count();

        $categoriesList = Category::withCount('contents')
            ->orderByDesc('contents_count')
            ->get(['id', 'name', 'slug'])
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'count' => $cat->contents_count,
            ])
            ->all();

        $topItem = Content::where('featured', true)
            ->with([
                'contentType:id,name,slug',
                'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail'),
            ])
            ->first();

        $activityData = $this->getActivityData($userId, $isAdmin);

        return [
            'stats' => [
                'users' => [
                    'total' => $totalUsers,
                    'clients' => $totalClients,
                ],
                'contents' => [
                    'total' => $totalContents,
                    'published' => $publishedContents,
                    'drafts' => $draftContents,
                ],
                'projects' => [
                    'total' => $projectsCount,
                ],
                'posts' => [
                    'total' => $postsCount,
                ],
                'categories' => $categoriesList,
                'topItem' => $topItem ? [
                    'id' => $topItem->id,
                    'title' => $topItem->title,
                    'slug' => $topItem->slug,
                    'type' => $topItem->contentType?->name ?? 'Proyecto',
                    'type_slug' => $topItem->contentType?->slug ?? 'proyectos',
                    'thumbnail_url' => $topItem->media->first()?->url,
                ] : null,
                'contentTypes' => [
                    'total' => $totalContentTypes,
                ],
                'messages' => [
                    'total' => $totalMessages,
                    'unread' => $unreadMessages,
                ],
                'media' => [
                    'total' => $totalMedia,
                    'totalSize' => $totalMediaSize,
                ],
                'traffic' => [
                    'weeklyViews' => $currentPeriodViews,
                    'totalViews' => $totalViews,
                    'growthPercentage' => $growthPercentage,
                ],
                'totalViews' => $totalViews,
                'viewsTrend' => $growthPercentage,
            ],
            'activityData' => $activityData,
        ];
    }

    /**
     * Obtiene el tráfico de los últimos 7 días con 2 consultas agregadas en lugar de 14 consultas individuales.
     */
    protected function getActivityData(int $userId, bool $isAdmin): array
    {
        $startDate = now()->subDays(6)->startOfDay();
        $endDate = now()->endOfDay();
        $isSqlite = config('database.default') === 'sqlite';
        $dateExpr = $isSqlite ? 'date(created_at)' : 'DATE(created_at)';

        // 1 consulta única para visitas de los 7 días
        $viewsQuery = Visit::whereBetween('created_at', [$startDate, $endDate]);
        if (! $isAdmin) {
            $viewsQuery->where('user_id', $userId);
        }
        $viewsPerDay = $viewsQuery
            ->selectRaw("{$dateExpr} as log_date, count(*) as total")
            ->groupBy('log_date')
            ->pluck('total', 'log_date')
            ->all();

        // 1 consulta única para mensajes / interacciones de los 7 días
        $messagesQuery = Message::whereBetween('created_at', [$startDate, $endDate]);
        if (! $isAdmin) {
            $messagesQuery->where('user_id', $userId);
        }
        $messagesPerDay = $messagesQuery
            ->selectRaw("{$dateExpr} as log_date, count(*) as total")
            ->groupBy('log_date')
            ->pluck('total', 'log_date')
            ->all();

        // Ensamblado en memoria sin consultas SQL adicionales
        return collect(range(6, 0))->map(function ($dayOffset) use ($viewsPerDay, $messagesPerDay) {
            $date = now()->subDays($dayOffset);
            $dateKey = $date->toDateString();

            return [
                'day' => ucfirst($date->locale('es')->isoFormat('ddd')),
                'date' => $dateKey,
                'views' => (int) ($viewsPerDay[$dateKey] ?? 0),
                'interactions' => (int) ($messagesPerDay[$dateKey] ?? 0),
            ];
        })->values()->all();
    }
}
