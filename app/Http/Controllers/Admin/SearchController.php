<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = trim((string) $request->input('q', ''));
        $typeSlug = $request->input('type');
        $userId = auth()->id();

        $contentTypes = ContentType::where('user_id', $userId)
            ->orderBy('order')
            ->get(['id', 'name', 'singular_name', 'slug', 'icon', 'public_slug']);

        $contentTypeBySlug = $contentTypes->keyBy('slug');

        $results = [
            'context_cpt' => null,
            'items' => [],
            'commands' => [],
        ];

        if ($typeSlug && isset($contentTypeBySlug[$typeSlug])) {
            $results['context_cpt'] = $contentTypeBySlug[$typeSlug];
        }

        // ── 1. Comandos y Acciones Rápidas (Prefijo '>' o cuando la búsqueda coincide) ──
        $isCommandSearch = str_starts_with($query, '>') || str_starts_with($query, '/');
        $commandTerm = $isCommandSearch ? trim(ltrim($query, '>/')) : $query;

        $availableCommands = collect();

        // Comandos de creación de nuevos contenidos
        foreach ($contentTypes as $cpt) {
            $availableCommands->push([
                'id' => 'create-'.$cpt->slug,
                'title' => 'Crear nuevo '.$cpt->singular_name,
                'subtitle' => 'Crear publicación en '.$cpt->name,
                'url' => route('admin.content.create', $cpt->slug),
                'icon' => 'Plus',
                'badge' => $cpt->name,
                'type' => 'action',
            ]);
        }

        // Comandos de navegación del panel
        $availableCommands->push([
            'id' => 'nav-dashboard',
            'title' => 'Ir al Dashboard',
            'subtitle' => 'Métricas, resumen general y analíticas',
            'url' => route('admin.dashboard'),
            'icon' => 'LayoutDashboard',
            'badge' => 'Panel',
            'type' => 'navigation',
        ]);

        $availableCommands->push([
            'id' => 'nav-messages',
            'title' => 'Ver Mensajes de Contacto',
            'subtitle' => 'Bandeja de entrada y leads recibidos',
            'url' => route('admin.messages.index'),
            'icon' => 'MessageSquare',
            'badge' => 'Mensajes',
            'type' => 'navigation',
        ]);

        $availableCommands->push([
            'id' => 'nav-preferences',
            'title' => 'Preferencias del Portafolio',
            'subtitle' => 'Configuración de SEO, enlaces sociales y diseño',
            'url' => route('admin.preferences.edit'),
            'icon' => 'Settings',
            'badge' => 'Ajustes',
            'type' => 'navigation',
        ]);

        if (auth()->user()?->role?->slug === 'admin') {
            $availableCommands->push([
                'id' => 'nav-users',
                'title' => 'Gestión de Usuarios',
                'subtitle' => 'Control de clientes y roles',
                'url' => route('admin.users.index'),
                'icon' => 'Users',
                'badge' => 'Seguridad',
                'type' => 'navigation',
            ]);
        }

        // Filtrar comandos según el término
        if ($isCommandSearch || $query !== '') {
            $results['commands'] = $availableCommands->filter(function ($cmd) use ($commandTerm) {
                if ($commandTerm === '') {
                    return true;
                }

                return str_contains(mb_strtolower($cmd['title']), mb_strtolower($commandTerm)) ||
                       str_contains(mb_strtolower($cmd['subtitle']), mb_strtolower($commandTerm)) ||
                       str_contains(mb_strtolower($cmd['badge']), mb_strtolower($commandTerm));
            })->values()->take(6);
        }

        // Si es puramente comando ('>...'), retornamos solo los comandos
        if ($isCommandSearch) {
            return response()->json($results);
        }

        // ── 2. Búsqueda de Publicaciones en Contenidos (CPT) ──────────────────
        if ($query !== '') {
            $contentsQuery = Content::where('user_id', $userId)
                ->with(['contentType:id,name,singular_name,slug,icon'])
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                        ->orWhere('excerpt', 'like', "%{$query}%")
                        ->orWhere('slug', 'like', "%{$query}%");
                });

            // Si hay filtro contextual activo
            if ($typeSlug && isset($contentTypeBySlug[$typeSlug])) {
                $contentsQuery->where('content_type_id', $contentTypeBySlug[$typeSlug]->id);
            }

            $contents = $contentsQuery->orderByDesc('updated_at')
                ->take(12)
                ->get(['id', 'content_type_id', 'title', 'slug', 'excerpt', 'status', 'published_at', 'updated_at']);

            foreach ($contents as $content) {
                $cpt = $content->contentType;
                $results['items'][] = [
                    'id' => 'content-'.$content->id,
                    'title' => $content->title,
                    'subtitle' => $content->excerpt ?: 'Sin extracto',
                    'slug' => $content->slug,
                    'url' => route('admin.content.edit', [$cpt->slug, $content->id]),
                    'status' => $content->status,
                    'cpt_name' => $cpt->name,
                    'cpt_singular' => $cpt->singular_name,
                    'cpt_slug' => $cpt->slug,
                    'cpt_icon' => $cpt->icon,
                    'date' => $content->updated_at?->diffForHumans() ?? '',
                    'type' => 'content',
                ];
            }

            // ── 3. Búsqueda de Mensajes (Solo en búsqueda global) ─────────────
            if (! $typeSlug) {
                $messages = Message::where('user_id', $userId)
                    ->where(function ($q) use ($query) {
                        $q->where('name', 'like', "%{$query}%")
                            ->orWhere('email', 'like', "%{$query}%")
                            ->orWhere('message', 'like', "%{$query}%");
                    })
                    ->latest()
                    ->take(3)
                    ->get(['id', 'name', 'email', 'message', 'read_at', 'created_at']);

                foreach ($messages as $msg) {
                    $results['items'][] = [
                        'id' => 'msg-'.$msg->id,
                        'title' => $msg->name.' ('.$msg->email.')',
                        'subtitle' => mb_substr($msg->message, 0, 75).'...',
                        'url' => route('admin.messages.show', $msg->id),
                        'status' => $msg->read_at ? 'read' : 'unread',
                        'badge' => 'Mensaje',
                        'icon' => 'Mail',
                        'date' => $msg->created_at?->diffForHumans() ?? '',
                        'type' => 'message',
                    ];
                }
            }
        }

        return response()->json($results);
    }
}
