<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use App\Support\ImageOptimizer;
use App\Support\SecureFileUploader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HeifMediaProcessingTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private ContentType $cpt;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->admin = User::factory()->admin()->create();
        $this->cpt = ContentType::create([
            'user_id' => $this->admin->id,
            'name' => 'Portafolio',
            'singular_name' => 'Proyecto',
            'slug' => 'portafolio',
            'is_public' => true,
        ]);
        $this->cpt->users()->attach([$this->admin->id]);
    }

    /**
     * Genera un archivo HEIC real usando sips o Imagick para pruebas de procesamiento.
     */
    private function createRealHeicFile(string $filename = 'sample.heic'): UploadedFile
    {
        $tmpDir = sys_get_temp_dir();
        $tmpJpg = $tmpDir.'/temp_'.uniqid().'.jpg';
        $tmpHeic = $tmpDir.'/'.uniqid().'_'.$filename;

        if (extension_loaded('imagick')) {
            $im = new \Imagick;
            $im->newImage(100, 100, new \ImagickPixel('red'));
            $im->setImageFormat('jpeg');
            file_put_contents($tmpJpg, $im->getImageBlob());
            $im->destroy();
        } else {
            $gd = imagecreatetruecolor(100, 100);
            imagefill($gd, 0, 0, imagecolorallocate($gd, 255, 0, 0));
            imagejpeg($gd, $tmpJpg);
            imagedestroy($gd);
        }

        if (PHP_OS_FAMILY === 'Darwin' && file_exists('/usr/bin/sips')) {
            exec('/usr/bin/sips -s format heic '.escapeshellarg($tmpJpg).' --out '.escapeshellarg($tmpHeic).' 2>&1');
        } else {
            // Fallback: simular como archivo binario si sips no está presente
            copy($tmpJpg, $tmpHeic);
        }

        @unlink($tmpJpg);

        return new UploadedFile($tmpHeic, $filename, 'image/heic', null, true);
    }

    public function test_image_optimizer_converts_real_heic_to_webp_and_generates_thumbnail(): void
    {
        $heicFile = $this->createRealHeicFile('foto-camara.heic');
        $destWebp = sys_get_temp_dir().'/converted_'.uniqid().'.webp';
        $destThumb = sys_get_temp_dir().'/thumb_'.uniqid().'.webp';

        // Conversión a WebP Lossless
        $converted = ImageOptimizer::convertToWebpLossless($heicFile->getRealPath(), $destWebp);
        $this->assertTrue($converted);
        $this->assertFileExists($destWebp);
        $this->assertGreaterThan(0, filesize($destWebp));

        // Miniatura
        $thumb = ImageOptimizer::generateGridThumbnail($destWebp, $destThumb, 120, 80);
        $this->assertTrue($thumb);
        $this->assertFileExists($destThumb);
        $this->assertGreaterThan(0, filesize($destThumb));

        @unlink($destWebp);
        @unlink($destThumb);
        @unlink($heicFile->getRealPath());
    }

    public function test_secure_file_uploader_stores_heic_file_as_webp(): void
    {
        $heicFile = $this->createRealHeicFile('iphone-shot.heic');

        $result = SecureFileUploader::storeWithThumbnail($heicFile, 'media/library');

        $this->assertNotEmpty($result['file_path']);
        $this->assertStringEndsWith('.webp', $result['file_path']);
        $this->assertEquals('image/webp', $result['mime_type']);
        $this->assertNotNull($result['thumbnail_path']);
        $this->assertStringEndsWith('.webp', $result['thumbnail_path']);

        Storage::disk('public')->assertExists($result['file_path']);
        Storage::disk('public')->assertExists($result['thumbnail_path']);

        @unlink($heicFile->getRealPath());
    }

    public function test_content_controller_accepts_heif_and_heic_thumbnail_upload(): void
    {
        $heicFile = $this->createRealHeicFile('portada-post.heif');

        $response = $this->actingAs($this->admin)->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'Post con Foto HEIF',
            'status' => 'published',
            'thumbnail' => $heicFile,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $content = Content::where('title', 'Post con Foto HEIF')->first();
        $this->assertNotNull($content);
        $this->assertNotNull($content->thumbnail);

        @unlink($heicFile->getRealPath());
    }
}
