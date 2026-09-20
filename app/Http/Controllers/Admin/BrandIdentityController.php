<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ColorPalette;
use Database\Seeders\ColorPaletteSeeder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandIdentityController extends Controller
{
    /**
     * Muestra la vista maestra y escalable de Identidad Corporativa.
     */
    public function index(Request $request): Response
    {
        if (ColorPalette::count() === 0) {
            (new ColorPaletteSeeder)->run();
        }

        $palettes = ColorPalette::orderBy('order')
            ->orderBy('id')
            ->get();

        $activePaletteId = auth()->user()?->preference?->color_palette_id;

        return Inertia::render('Admin/Brand/Index', [
            'palettes' => $palettes,
            'activePaletteId' => $activePaletteId,
        ]);
    }
}
