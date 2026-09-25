<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users and clients with their assigned CPTs.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $perPage = min((int) $request->input('per_page', 15), 100);

        $users = User::with([
            'role:id,name,slug',
            'contentTypes' => fn ($q) => $q->select(['id', 'user_id', 'name', 'singular_name', 'slug', 'icon', 'is_public', 'public_slug'])->orderBy('order'),
            'assignedContentTypes' => fn ($q) => $q->select(['content_types.id', 'content_types.name', 'content_types.singular_name', 'content_types.slug', 'content_types.icon', 'content_types.is_public', 'content_types.public_slug'])->orderBy('order'),
        ])
            ->withCount(['contents', 'visits'])
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        $users->through(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role_id' => $u->role_id,
            'role' => $u->role?->slug ?? 'user',
            'role_name' => $u->role?->name ?? 'Cliente',
            'has_telemetry' => (bool) $u->has_telemetry,
            'is_active' => (bool) $u->is_active,
            'contents_count' => $u->contents_count,
            'visits_count' => $u->visits_count,
            'content_types' => $u->assignedContentTypes->isNotEmpty() ? $u->assignedContentTypes : $u->contentTypes,
            'created_at' => $u->created_at?->format('d M Y'),
        ]);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($users);
        }

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => Role::all(['id', 'name', 'slug']),
            'stats' => [
                'totalUsers' => User::count(),
                'activeClients' => User::whereHas('role', fn ($q) => $q->where('slug', 'user'))->where('is_active', true)->count(),
                'inactiveUsers' => User::where('is_active', false)->count(),
                'telemetryUsers' => User::where('has_telemetry', true)->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new user or client (Dedicated View).
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('Admin/Users/Form', [
            'user' => null,
            'roles' => Role::all(['id', 'name', 'slug']),
        ]);
    }

    /**
     * Store a newly created user or client.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', Password::defaults()],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'has_telemetry' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'has_telemetry' => $validated['has_telemetry'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'email_verified_at' => now(),
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "Usuario '{$user->name}' registrado con éxito.");
    }

    /**
     * Display the detailed information of a client or user (Dedicated View).
     */
    public function show(Request $request, User $user): Response|JsonResponse
    {
        $this->authorize('view', $user);

        $user->load([
            'role:id,name,slug',
            'preference',
            'assignedContentTypes' => fn ($q) => $q->select(['content_types.id', 'content_types.name', 'content_types.singular_name', 'content_types.slug', 'content_types.icon', 'content_types.is_public', 'content_types.public_slug'])->orderBy('order'),
            'contentTypes' => fn ($q) => $q->select(['content_types.id', 'content_types.name', 'content_types.singular_name', 'content_types.slug', 'content_types.icon', 'content_types.is_public', 'content_types.public_slug'])->orderBy('order'),
        ]);

        $assignedCpts = $user->assignedContentTypes->isNotEmpty() ? $user->assignedContentTypes : $user->contentTypes;

        $recentContents = $user->contents()
            ->with(['contentType:id,name,slug,icon', 'media' => fn ($q) => $q->where('content_media.collection', 'thumbnail')])
            ->orderByDesc('created_at')
            ->limit(8)
            ->get(['id', 'content_type_id', 'title', 'slug', 'status', 'published_at', 'created_at']);

        $publishedCount = $user->contents()->where('status', 'published')->count();
        $draftCount = $user->contents()->where('status', 'draft')->count();
        $mediaCount = $user->media()->count();
        $visitsCount = $user->visits()->count();

        $clientData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role?->slug ?? 'user',
            'role_name' => $user->role?->name ?? 'Cliente',
            'has_telemetry' => (bool) $user->has_telemetry,
            'is_active' => (bool) $user->is_active,
            'created_at' => $user->created_at?->format('d M Y, H:i'),
            'content_types' => $assignedCpts,
            'recent_contents' => $recentContents,
            'stats' => [
                'totalContents' => $publishedCount + $draftCount,
                'published' => $publishedCount,
                'drafts' => $draftCount,
                'totalVisits' => $visitsCount,
                'totalMedia' => $mediaCount,
            ],
        ];

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($clientData);
        }

        return Inertia::render('Admin/Users/Show', [
            'client' => $clientData,
        ]);
    }

    /**
     * Show the form for editing the specified user (Dedicated View).
     */
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        $user->load('role:id,name,slug');

        return Inertia::render('Admin/Users/Form', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => $user->role?->slug ?? 'user',
                'has_telemetry' => (bool) $user->has_telemetry,
                'is_active' => (bool) $user->is_active,
            ],
            'roles' => Role::all(['id', 'name', 'slug']),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'password' => ['nullable', Password::defaults()],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'has_telemetry' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        if (isset($validated['is_active']) && ! $validated['is_active'] && $user->id === auth()->id()) {
            return back()->with('error', 'No puedes pausar tu propia cuenta de Super Administrador.');
        }

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
            'has_telemetry' => $validated['has_telemetry'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ];

        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "Usuario '{$user->name}' actualizado con éxito.");
    }

    /**
     * Remote API search for asynchronous user selection with limit.
     */
    public function apiSearch(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $search = trim((string) $request->input('search', ''));
        $limit = min(max((int) $request->input('limit', 10), 1), 30);

        $query = User::with('role:id,name,slug')->select(['id', 'name', 'email', 'role_id']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->limit($limit)->get();

        return response()->json($users);
    }

    /**
     * Toggle visit counter tracking (telemetry monetization flag) for a user.
     */
    public function toggleTelemetry(User $user): RedirectResponse
    {
        $this->authorize('toggleTelemetry', $user);

        $user->update([
            'has_telemetry' => ! $user->has_telemetry,
        ]);

        $status = $user->has_telemetry ? 'activado' : 'desactivado';

        return back()->with('success', "Contador de visitas {$status} para {$user->name}.");
    }

    /**
     * Toggle active / paused status for a user (subscription access control).
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        $this->authorize('toggleStatus', $user);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes pausar tu propia cuenta de Super Administrador.');
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $status = $user->is_active ? 'activado' : 'pausado';

        return back()->with('success', "Acceso del usuario '{$user->name}' {$status} correctamente.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminar tu propia cuenta de Super Administrador.');
        }

        $userName = $user->name;
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', "Usuario '{$userName}' eliminado con éxito.");
    }
}
