<?php

namespace Database\Seeders;

use App\Models\CustomFont;
use App\Models\User;
use App\Services\PortfolioCacheService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

class CustomFontSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seeds initial local fonts: Manrope (Headings) and Aileron (Body/UI).
     */
    public function run(): void
    {
        $admin = User::whereHas('role', fn ($q) => $q->where('slug', 'admin'))->first()
            ?? User::first();

        if (! $admin) {
            return;
        }

        $fontsDir = storage_path('app/public/fonts');
        if (! File::isDirectory($fontsDir)) {
            File::makeDirectory($fontsDir, 0755, true);
        }

        // ── 1. Manrope for Headings ─────────────────────────────────────────
        $manropePath = $fontsDir.'/Manrope-Bold.ttf';
        if (! file_exists($manropePath)) {
            try {
                $response = Http::timeout(15)->get('https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/Manrope%5Bwght%5D.ttf');
                if ($response->successful()) {
                    file_put_contents($manropePath, $response->body());
                }
            } catch (\Throwable) {
                // If offline, continue if file already exists
            }
        }

        if (file_exists($manropePath)) {
            CustomFont::updateOrCreate(
                [
                    'user_id' => $admin->id,
                    'role' => 'heading',
                ],
                [
                    'family_name' => 'Manrope',
                    'file_path' => 'fonts/Manrope-Bold.ttf',
                    'file_name' => 'Manrope-Bold.ttf',
                    'file_size' => (int) filesize($manropePath),
                    'format' => 'truetype',
                    'is_active' => true,
                ]
            );
        }

        // ── 2. Aileron for Body / UI ────────────────────────────────────────
        $aileronPath = $fontsDir.'/Aileron-Regular.otf';
        if (! file_exists($aileronPath)) {
            try {
                $response = Http::timeout(15)->get('https://raw.githubusercontent.com/Nicholaiii/Aileron/master/Aileron-Regular.otf');
                if ($response->successful()) {
                    file_put_contents($aileronPath, $response->body());
                }
            } catch (\Throwable) {
                // If offline, continue if file already exists
            }
        }

        if (file_exists($aileronPath)) {
            CustomFont::updateOrCreate(
                [
                    'user_id' => $admin->id,
                    'role' => 'sans',
                ],
                [
                    'family_name' => 'Aileron',
                    'file_path' => 'fonts/Aileron-Regular.otf',
                    'file_name' => 'Aileron-Regular.otf',
                    'file_size' => (int) filesize($aileronPath),
                    'format' => 'opentype',
                    'is_active' => true,
                ]
            );
        }

        PortfolioCacheService::forgetCustomFonts();
    }
}
