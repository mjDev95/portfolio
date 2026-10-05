<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCustomFontRequest;
use App\Models\CustomFont;
use App\Services\PortfolioCacheService;
use App\Support\SecureFileUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class CustomFontController extends Controller
{
    /**
     * Store or replace an uploaded custom font for a specific typographic role.
     */
    public function store(StoreCustomFontRequest $request): RedirectResponse
    {
        $file = $request->file('font_file');
        $role = $request->validated('role');
        $ext = strtolower($file->getClientOriginalExtension());
        $format = CustomFont::formatFromExtension($ext);

        $familyName = $request->input('family_name');
        if (blank($familyName)) {
            $rawName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $familyName = Str::headline(str_replace(['_', '-'], ' ', $rawName));
        }

        // Check if an existing font for this role exists
        $existing = CustomFont::where('user_id', $request->user()->id)
            ->where('role', $role)
            ->first();

        if ($existing) {
            SecureFileUploader::delete($existing->file_path);
        }

        // Store safely using SecureFileUploader
        $path = SecureFileUploader::store($file, 'fonts');

        CustomFont::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'role' => $role,
            ],
            [
                'family_name' => $familyName,
                'file_path' => $path,
                'file_name' => SecureFileUploader::sanitizeOriginalFilename($file->getClientOriginalName()),
                'file_size' => (int) $file->getSize(),
                'format' => $format,
                'is_active' => true,
            ]
        );

        PortfolioCacheService::forgetCustomFonts();

        $roleLabels = [
            'heading' => 'Titulares',
            'sans' => 'Cuerpo & UI',
            'mono' => 'Monospaciada & Código',
        ];
        $label = $roleLabels[$role] ?? $role;

        return back()->with('success', "Tipografía para {$label} ({$familyName}) guardada y aplicada correctamente en el sitio público.");
    }

    /**
     * Delete a custom font and restore the default system font for that role.
     */
    public function destroy(CustomFont $font): RedirectResponse
    {
        abort_unless(auth()->user()?->isAdmin(), 403);

        $roleLabels = [
            'heading' => 'Titulares',
            'sans' => 'Cuerpo & UI',
            'mono' => 'Monospaciada & Código',
        ];
        $label = $roleLabels[$font->role] ?? $font->role;

        SecureFileUploader::delete($font->file_path);
        $font->delete();

        PortfolioCacheService::forgetCustomFonts();

        return back()->with('success', "Tipografía para {$label} eliminada. Se restauró la fuente por defecto del sistema.");
    }
}
