<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreColorPaletteRequest;
use App\Http\Requests\Admin\UpdateColorPaletteRequest;
use App\Models\ColorPalette;
use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ColorPaletteController extends Controller
{
    /**
     * Devuelve todas las paletas registradas en la base de datos.
     */
    public function index(): JsonResponse
    {
        $palettes = ColorPalette::orderBy('order')
            ->orderBy('id')
            ->get();

        return response()->json($palettes);
    }

    /**
     * Registra una nueva paleta de colores.
     */
    public function store(StoreColorPaletteRequest $request): JsonResponse|RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        if (! empty($data['is_master'])) {
            ColorPalette::where('is_master', true)->update(['is_master' => false]);
        }

        $palette = ColorPalette::create($data);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Paleta creada con éxito.',
                'palette' => $palette,
            ], 201);
        }

        return back()->with('success', 'Paleta creada con éxito.');
    }

    /**
     * Actualiza una paleta existente.
     */
    public function update(UpdateColorPaletteRequest $request, ColorPalette $palette): JsonResponse|RedirectResponse
    {
        $data = $request->validated();

        if (! empty($data['is_master'])) {
            ColorPalette::where('id', '!=', $palette->id)
                ->where('is_master', true)
                ->update(['is_master' => false]);
        }

        $palette->update($data);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Paleta actualizada con éxito.',
                'palette' => $palette->fresh(),
            ]);
        }

        return back()->with('success', 'Paleta actualizada con éxito.');
    }

    /**
     * Elimina una paleta de color.
     */
    public function destroy(Request $request, ColorPalette $palette): JsonResponse|RedirectResponse
    {
        abort_unless(auth()->user()->isAdmin(), 403);

        // Si la paleta eliminada estaba activa en las preferencias de algún usuario,
        // reasignamos a otra paleta existente para que su interfaz mantenga consistencia
        $nextPalette = ColorPalette::where('id', '!=', $palette->id)
            ->orderBy('order')
            ->orderBy('id')
            ->first();

        UserPreference::where('color_palette_id', $palette->id)
            ->get()
            ->each(function ($pref) use ($nextPalette) {
                if ($nextPalette) {
                    $pref->update([
                        'color_palette_id' => $nextPalette->id,
                        'color_palette' => [
                            'id' => $nextPalette->slug,
                            'name' => $nextPalette->name,
                            'colors' => [
                                'primary' => $nextPalette->primary_color,
                                'secondary' => $nextPalette->secondary_color,
                                'tertiary' => $nextPalette->tertiary_color,
                                'accent' => $nextPalette->accent_color,
                            ],
                        ],
                    ]);
                } else {
                    $pref->update([
                        'color_palette_id' => null,
                        'color_palette' => null,
                    ]);
                }
            });

        $palette->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Paleta eliminada con éxito.',
                'fallbackPaletteId' => $nextPalette?->id,
            ]);
        }

        return back()->with('success', 'Paleta eliminada con éxito.');
    }

    /**
     * Reordena las paletas en masa.
     */
    public function reorder(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->isAdmin(), 403);

        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:color_palettes,id'],
        ]);

        foreach ($validated['order'] as $position => $id) {
            ColorPalette::where('id', $id)->update(['order' => $position + 1]);
        }

        return response()->json(['success' => true]);
    }
}
