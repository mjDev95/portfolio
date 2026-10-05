<?php

namespace Tests\Feature;

use App\Models\CustomFont;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCustomFontUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_admin_can_view_brand_page_with_custom_fonts(): void
    {
        $admin = User::factory()->admin()->create();

        CustomFont::create([
            'user_id' => $admin->id,
            'role' => 'heading',
            'family_name' => 'Manrope',
            'file_path' => 'fonts/Manrope-Bold.ttf',
            'file_name' => 'Manrope-Bold.ttf',
            'file_size' => 12345,
            'format' => 'truetype',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.brand.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Brand/Index')
            ->has('customFonts.heading')
        );
    }

    public function test_admin_can_upload_custom_font_for_heading(): void
    {
        $admin = User::factory()->admin()->create();

        $file = UploadedFile::fake()->create('CustomHeader.woff2', 500, 'font/woff2');

        $response = $this->actingAs($admin)
            ->post(route('admin.brand.fonts.store'), [
                'role' => 'heading',
                'family_name' => 'Custom Header',
                'font_file' => $file,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('custom_fonts', [
            'user_id' => $admin->id,
            'role' => 'heading',
            'family_name' => 'Custom Header',
            'format' => 'woff2',
            'is_active' => true,
        ]);

        $font = CustomFont::where('role', 'heading')->first();
        $this->assertNotNull($font);
        Storage::disk('public')->assertExists($font->file_path);
    }

    public function test_uploading_new_font_replaces_old_file(): void
    {
        $admin = User::factory()->admin()->create();

        $file1 = UploadedFile::fake()->create('OldFont.woff2', 300, 'font/woff2');
        $this->actingAs($admin)->post(route('admin.brand.fonts.store'), [
            'role' => 'heading',
            'family_name' => 'Old Font',
            'font_file' => $file1,
        ]);

        $oldFont = CustomFont::where('role', 'heading')->first();
        $oldPath = $oldFont->file_path;
        Storage::disk('public')->assertExists($oldPath);

        $file2 = UploadedFile::fake()->create('NewFont.woff2', 400, 'font/woff2');
        $this->actingAs($admin)->post(route('admin.brand.fonts.store'), [
            'role' => 'heading',
            'family_name' => 'New Font',
            'font_file' => $file2,
        ]);

        $this->assertDatabaseCount('custom_fonts', 1);
        $this->assertDatabaseHas('custom_fonts', [
            'role' => 'heading',
            'family_name' => 'New Font',
        ]);

        // Old file must be deleted
        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_non_font_file_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $fakePdf = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

        $response = $this->actingAs($admin)
            ->post(route('admin.brand.fonts.store'), [
                'role' => 'heading',
                'font_file' => $fakePdf,
            ]);

        $response->assertSessionHasErrors('font_file');
        $this->assertDatabaseEmpty('custom_fonts');
    }

    public function test_non_admin_cannot_upload_fonts(): void
    {
        $regularUser = User::factory()->create();

        $file = UploadedFile::fake()->create('HackerFont.woff2', 100, 'font/woff2');

        $response = $this->actingAs($regularUser)
            ->post(route('admin.brand.fonts.store'), [
                'role' => 'heading',
                'font_file' => $file,
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_delete_custom_font(): void
    {
        $admin = User::factory()->admin()->create();

        $file = UploadedFile::fake()->create('TestFont.woff2', 200, 'font/woff2');
        $this->actingAs($admin)->post(route('admin.brand.fonts.store'), [
            'role' => 'sans',
            'font_file' => $file,
        ]);

        $font = CustomFont::where('role', 'sans')->first();
        Storage::disk('public')->assertExists($font->file_path);

        $response = $this->actingAs($admin)->delete(route('admin.brand.fonts.destroy', $font));

        $response->assertRedirect();
        $this->assertDatabaseMissing('custom_fonts', ['id' => $font->id]);
        Storage::disk('public')->assertMissing($font->file_path);
    }
}
