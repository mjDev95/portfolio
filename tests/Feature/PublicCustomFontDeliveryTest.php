<?php

namespace Tests\Feature;

use App\Models\CustomFont;
use App\Models\User;
use App\Services\PortfolioCacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCustomFontDeliveryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        PortfolioCacheService::forgetCustomFonts();
    }

    public function test_public_site_renders_local_font_face_and_css_variables_when_custom_fonts_exist(): void
    {
        $admin = User::factory()->admin()->create();

        CustomFont::create([
            'user_id' => $admin->id,
            'role' => 'heading',
            'family_name' => 'Manrope',
            'file_path' => 'fonts/Manrope-Bold.ttf',
            'file_name' => 'Manrope-Bold.ttf',
            'file_size' => 164700,
            'format' => 'truetype',
            'is_active' => true,
        ]);

        CustomFont::create([
            'user_id' => $admin->id,
            'role' => 'sans',
            'family_name' => 'Aileron',
            'file_path' => 'fonts/Aileron-Regular.otf',
            'file_name' => 'Aileron-Regular.otf',
            'file_size' => 27644,
            'format' => 'opentype',
            'is_active' => true,
        ]);

        PortfolioCacheService::forgetCustomFonts();

        $response = $this->get(route('home'));

        $response->assertOk();

        // Must inject @font-face for LocalCustomHeading and LocalCustomSans
        $response->assertSee('LocalCustomHeading');
        $response->assertSee('LocalCustomSans');
        $response->assertSee('fonts/Manrope-Bold.ttf');
        $response->assertSee('fonts/Aileron-Regular.otf');

        // Must bind CSS variables
        $response->assertSee("--font-heading: 'LocalCustomHeading', sans-serif !important;", false);
        $response->assertSee("--font-sans: 'LocalCustomSans', sans-serif !important;", false);

        // Must have font preloads
        $response->assertSee('rel="preload"', false);
    }

    public function test_public_site_falls_back_cleanly_when_no_custom_fonts(): void
    {
        PortfolioCacheService::forgetCustomFonts();

        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertDontSee('LocalCustomHeading');
        $response->assertSee('fonts.bunny.net');
    }
}
