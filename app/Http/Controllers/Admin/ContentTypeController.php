<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContentTypeController extends Controller
{
    public function index(): Response
    {
        $isAdmin = auth()->user()->isAdmin();

        $contentTypes = ContentType::query()
            ->when(! $isAdmin, function ($q) {
                $q->where(function ($sub) {
                    $sub->where('content_types.user_id', auth()->id())
                        ->orWhereHas('users', fn ($uq) => $uq->where('users.id', auth()->id()));
                });
            })
            ->with([
                'user:id,name,email,role_id',
                'user.role:id,name,slug',
                'users:id,name,email,role_id',
                'users.role:id,name,slug',
            ])
            ->withCount(['contents', 'customFields'])
            ->orderBy('order')
            ->get();

        return Inertia::render('Admin/ContentTypes/Index', [
            'contentTypes' => $contentTypes,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ContentType::class);

        return Inertia::render('Admin/ContentTypes/Form', [
            'contentType' => null,
            'assignedUsers' => [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ContentType::class);

        // Soporte tanto para array de user_ids como para user_id singular
        $targetUserIds = [];
        if ($request->has('user_ids') && is_array($request->input('user_ids'))) {
            $targetUserIds = array_map('intval', array_filter($request->input('user_ids')));
        } elseif ($request->filled('user_id')) {
            $targetUserIds = [(int) $request->input('user_id')];
        }

        if (empty($targetUserIds)) {
            $targetUserIds = [auth()->id()];
        }

        $primaryUserId = $targetUserIds[0];

        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'singular_name' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('content_types', 'slug')->where('user_id', $primaryUserId)],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_public' => ['boolean'],
            'public_slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'has_categories' => ['boolean'],
            'has_tags' => ['boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
            'fields' => ['nullable', 'array'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.name' => ['nullable', 'string', 'max:255'],
            'fields.*.type' => ['required', 'string', Rule::in(['text', 'textarea', 'number', 'date', 'url', 'boolean', 'select'])],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'fields.*.is_required' => ['boolean'],
            'fields.*.sort_order' => ['nullable', 'integer'],
            'fields.*.user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        DB::transaction(function () use ($validated, $primaryUserId, $targetUserIds, &$contentType) {
            $contentType = ContentType::create([
                'user_id' => $primaryUserId,
                'name' => $validated['name'],
                'singular_name' => $validated['singular_name'] ?? Str::singular($validated['name']),
                'slug' => $validated['slug'] ?? ContentType::uniqueSlugFrom($validated['name'], $primaryUserId),
                'icon' => $validated['icon'] ?? 'FileText',
                'description' => $validated['description'] ?? null,
                'is_public' => $validated['is_public'] ?? true,
                'public_slug' => ! empty($validated['public_slug']) ? Str::slug($validated['public_slug']) : null,
                'has_categories' => $validated['has_categories'] ?? true,
                'has_tags' => $validated['has_tags'] ?? true,
                'order' => $validated['order'] ?? 0,
            ]);

            // Sincronizar clientes asignados en la tabla pivot
            $contentType->users()->sync($targetUserIds);

            if (! empty($validated['fields'])) {
                foreach ($validated['fields'] as $index => $fieldData) {
                    $fieldName = ! empty($fieldData['name'])
                        ? Str::snake(Str::ascii($fieldData['name']))
                        : Str::snake(Str::ascii($fieldData['label']));

                    $contentType->customFields()->create([
                        'user_id' => ! empty($fieldData['user_id']) ? (int) $fieldData['user_id'] : null,
                        'label' => $fieldData['label'],
                        'name' => $fieldName,
                        'type' => $fieldData['type'],
                        'options' => $fieldData['options'] ?? null,
                        'placeholder' => $fieldData['placeholder'] ?? null,
                        'is_required' => $fieldData['is_required'] ?? false,
                        'sort_order' => $fieldData['sort_order'] ?? $index,
                    ]);
                }
            }
        });

        return redirect()
            ->route('admin.content-types.index')
            ->with('success', "Tipo de contenido '{$contentType->name}' creado con éxito.");
    }

    public function edit(ContentType $contentType): Response
    {
        $this->authorize('update', $contentType);

        $contentType->load([
            'customFields',
            'user:id,name,email,role_id',
            'user.role:id,name,slug',
            'users:id,name,email,role_id',
            'users.role:id,name,slug',
        ]);

        $assignedUsers = $contentType->users->isNotEmpty()
            ? $contentType->users
            : ($contentType->user ? collect([$contentType->user]) : collect());

        return Inertia::render('Admin/ContentTypes/Form', [
            'contentType' => $contentType,
            'assignedUsers' => $assignedUsers,
        ]);
    }

    public function update(Request $request, ContentType $contentType): RedirectResponse
    {
        $this->authorize('update', $contentType);

        $targetUserIds = [];
        if ($request->has('user_ids') && is_array($request->input('user_ids'))) {
            $targetUserIds = array_map('intval', array_filter($request->input('user_ids')));
        } elseif ($request->filled('user_id')) {
            $targetUserIds = [(int) $request->input('user_id')];
        }

        if (empty($targetUserIds)) {
            $targetUserIds = [$contentType->user_id ?? auth()->id()];
        }

        $primaryUserId = $targetUserIds[0];

        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'singular_name' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('content_types', 'slug')->ignore($contentType->id)->where('user_id', $primaryUserId)],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_public' => ['boolean'],
            'public_slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'has_categories' => ['boolean'],
            'has_tags' => ['boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
            'fields' => ['nullable', 'array'],
            'fields.*.id' => ['nullable', 'integer'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.name' => ['nullable', 'string', 'max:255'],
            'fields.*.type' => ['required', 'string', Rule::in(['text', 'textarea', 'number', 'date', 'url', 'boolean', 'select'])],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'fields.*.is_required' => ['boolean'],
            'fields.*.sort_order' => ['nullable', 'integer'],
            'fields.*.user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        DB::transaction(function () use ($contentType, $validated, $primaryUserId, $targetUserIds) {
            $contentType->update([
                'user_id' => $primaryUserId,
                'name' => $validated['name'],
                'singular_name' => $validated['singular_name'] ?? Str::singular($validated['name']),
                'slug' => $validated['slug'] ?? $contentType->slug,
                'icon' => $validated['icon'] ?? $contentType->icon,
                'description' => $validated['description'] ?? null,
                'is_public' => $validated['is_public'] ?? true,
                'public_slug' => ! empty($validated['public_slug']) ? Str::slug($validated['public_slug']) : null,
                'has_categories' => $validated['has_categories'] ?? true,
                'has_tags' => $validated['has_tags'] ?? true,
                'order' => $validated['order'] ?? $contentType->order,
            ]);

            // Sincronizar clientes asignados en pivot
            $contentType->users()->sync($targetUserIds);

            $keptFieldIds = [];

            if (! empty($validated['fields'])) {
                foreach ($validated['fields'] as $index => $fieldData) {
                    $fieldName = ! empty($fieldData['name'])
                        ? Str::snake(Str::ascii($fieldData['name']))
                        : Str::snake(Str::ascii($fieldData['label']));

                    $fieldUserId = ! empty($fieldData['user_id']) ? (int) $fieldData['user_id'] : null;

                    if (! empty($fieldData['id'])) {
                        $field = $contentType->customFields()->find($fieldData['id']);
                        if ($field) {
                            $field->update([
                                'user_id' => $fieldUserId,
                                'label' => $fieldData['label'],
                                'name' => $fieldName,
                                'type' => $fieldData['type'],
                                'options' => $fieldData['options'] ?? null,
                                'placeholder' => $fieldData['placeholder'] ?? null,
                                'is_required' => $fieldData['is_required'] ?? false,
                                'sort_order' => $fieldData['sort_order'] ?? $index,
                            ]);
                            $keptFieldIds[] = $field->id;

                            continue;
                        }
                    }

                    $newField = $contentType->customFields()->create([
                        'user_id' => $fieldUserId,
                        'label' => $fieldData['label'],
                        'name' => $fieldName,
                        'type' => $fieldData['type'],
                        'options' => $fieldData['options'] ?? null,
                        'placeholder' => $fieldData['placeholder'] ?? null,
                        'is_required' => $fieldData['is_required'] ?? false,
                        'sort_order' => $fieldData['sort_order'] ?? $index,
                    ]);
                    $keptFieldIds[] = $newField->id;
                }
            }

            // Eliminar campos que fueron removidos en la interfaz
            $contentType->customFields()
                ->whereNotIn('id', $keptFieldIds)
                ->delete();
        });

        return redirect()
            ->route('admin.content-types.index')
            ->with('success', "Tipo de contenido '{$contentType->name}' actualizado con éxito.");
    }

    public function destroy(ContentType $contentType): RedirectResponse
    {
        $this->authorize('delete', $contentType);

        $name = $contentType->name;

        DB::transaction(function () use ($contentType) {
            $contentType->customFields()->delete();
            $contentType->contents()->each(function ($content) {
                $content->deleteAllMedia();
                $content->delete();
            });
            $contentType->users()->detach();
            $contentType->delete();
        });

        return redirect()
            ->route('admin.content-types.index')
            ->with('success', "Tipo de contenido '{$name}' y sus publicaciones han sido eliminados.");
    }

    public function toggleVisibility(ContentType $contentType): RedirectResponse
    {
        $this->authorize('toggleVisibility', $contentType);

        $contentType->update([
            'is_public' => ! $contentType->is_public,
        ]);

        $status = $contentType->is_public ? 'habilitada' : 'pausada';

        return back()->with('success', "Visibilidad pública {$status} para '{$contentType->name}'.");
    }
}
