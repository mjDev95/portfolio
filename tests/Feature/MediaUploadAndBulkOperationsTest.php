<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use App\Support\SecureFileUploader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaUploadAndBulkOperationsTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->user = User::factory()->create();
    }

    public function test_image_upload_generates_semantic_slug_and_wp_style_directory(): void
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->image('Mi Increible Foto de Proyecto.png', 400, 300);

        $response = $this->postJson(route('admin.media.store'), [
            'file' => $file,
            'collection' => 'library',
        ]);

        $response->assertSuccessful();

        $year = date('Y');
        $month = date('m');

        $this->assertDatabaseHas('media', [
            'user_id' => $this->user->id,
            'file_name' => 'Mi Increible Foto de Proyecto.png',
            'collection' => 'library',
        ]);

        $media = Media::where('user_id', $this->user->id)->first();
        $this->assertNotNull($media);

        // Verifica estructura YYYY/MM y slug semántico
        $expectedPrefix = "media/library/{$year}/{$month}/mi-increible-foto-de-proyecto";
        $this->assertStringStartsWith($expectedPrefix, $media->file_path);
        $this->assertStringEndsWith('.webp', $media->file_path);

        // Verifica miniatura en YYYY/MM/thumbs/
        $expectedThumbPrefix = "media/library/{$year}/{$month}/thumbs/mi-increible-foto-de-proyecto";
        $this->assertStringStartsWith($expectedThumbPrefix, $media->thumbnail_path);

        // Archivos físicos deben existir en el disco simulado
        Storage::disk('public')->assertExists($media->file_path);
        Storage::disk('public')->assertExists($media->thumbnail_path);
    }

    public function test_image_upload_resolves_slug_collisions_with_numeric_suffix(): void
    {
        $this->actingAs($this->user);

        $file1 = UploadedFile::fake()->image('banner-design.jpg', 300, 200);
        $res1 = $this->postJson(route('admin.media.store'), [
            'file' => $file1,
            'collection' => 'library',
        ]);
        $res1->assertSuccessful();

        $file2 = UploadedFile::fake()->image('banner-design.jpg', 300, 200);
        $res2 = $this->postJson(route('admin.media.store'), [
            'file' => $file2,
            'collection' => 'library',
        ]);
        $res2->assertSuccessful();

        $year = date('Y');
        $month = date('m');

        $media1 = Media::find($res1->json('id'));
        $media2 = Media::find($res2->json('id'));

        $this->assertEquals("media/library/{$year}/{$month}/banner-design.webp", $media1->file_path);
        $this->assertEquals("media/library/{$year}/{$month}/banner-design-1.webp", $media2->file_path);

        Storage::disk('public')->assertExists($media1->file_path);
        Storage::disk('public')->assertExists($media2->file_path);
    }

    public function test_user_preference_image_compression_can_be_updated(): void
    {
        $this->actingAs($this->user);

        // Actualizar a lossy90
        $response = $this->putJson(route('admin.preferences.update'), [
            'image_compression' => 'lossy90',
        ]);

        $response->assertSuccessful();
        $response->assertJsonPath('preference.image_compression', 'lossy90');

        $this->user->refresh();
        $this->assertEquals('lossy90', $this->user->preference->image_compression);

        // Actualizar a lossless
        $response = $this->putJson(route('admin.preferences.update'), [
            'image_compression' => 'lossless',
        ]);

        $response->assertSuccessful();
        $response->assertJsonPath('preference.image_compression', 'lossless');

        $this->user->refresh();
        $this->assertEquals('lossless', $this->user->preference->image_compression);
    }

    public function test_secure_file_uploader_respects_user_compression_preference(): void
    {
        $this->actingAs($this->user);

        // Caso 1: Lossless por defecto
        $fileLossless = UploadedFile::fake()->image('test-lossless.png', 200, 200);
        $resultLossless = SecureFileUploader::storeWithThumbnail($fileLossless, 'media/library');
        $this->assertNotEmpty($resultLossless['file_path']);
        Storage::disk('public')->assertExists($resultLossless['file_path']);

        // Caso 2: Lossy 90%
        $this->user->preference()->updateOrCreate(
            ['user_id' => $this->user->id],
            ['image_compression' => 'lossy90']
        );

        $fileLossy = UploadedFile::fake()->image('test-lossy.png', 200, 200);
        $resultLossy = SecureFileUploader::storeWithThumbnail($fileLossy, 'media/library');
        $this->assertNotEmpty($resultLossy['file_path']);
        Storage::disk('public')->assertExists($resultLossy['file_path']);
    }

    public function test_bulk_destroy_deletes_selected_media_and_their_files(): void
    {
        $this->actingAs($this->user);

        // Subir 3 archivos
        $f1 = UploadedFile::fake()->image('foto-alpha.png', 200, 200);
        $f2 = UploadedFile::fake()->image('foto-beta.png', 200, 200);
        $f3 = UploadedFile::fake()->image('foto-gamma.png', 200, 200);

        $r1 = $this->postJson(route('admin.media.store'), ['file' => $f1, 'collection' => 'library'])->json('id');
        $r2 = $this->postJson(route('admin.media.store'), ['file' => $f2, 'collection' => 'library'])->json('id');
        $r3 = $this->postJson(route('admin.media.store'), ['file' => $f3, 'collection' => 'library'])->json('id');

        $m1 = Media::find($r1);
        $m2 = Media::find($r2);
        $m3 = Media::find($r3);

        Storage::disk('public')->assertExists($m1->file_path);
        Storage::disk('public')->assertExists($m2->file_path);
        Storage::disk('public')->assertExists($m3->file_path);

        // Eliminar masivamente m1 y m2
        $response = $this->postJson(route('admin.media.bulk-destroy'), [
            'ids' => [$m1->id, $m2->id],
        ]);

        $response->assertSuccessful();
        $response->assertJson([
            'success' => true,
            'deletedCount' => 2,
        ]);

        // m1 y m2 eliminados de la BD
        $this->assertDatabaseMissing('media', ['id' => $m1->id]);
        $this->assertDatabaseMissing('media', ['id' => $m2->id]);
        $this->assertDatabaseHas('media', ['id' => $m3->id]);

        // Archivos físicos de m1 y m2 eliminados del disco
        Storage::disk('public')->assertMissing($m1->file_path);
        Storage::disk('public')->assertMissing($m1->thumbnail_path);
        Storage::disk('public')->assertMissing($m2->file_path);
        Storage::disk('public')->assertMissing($m2->thumbnail_path);

        // m3 sigue existiendo
        Storage::disk('public')->assertExists($m3->file_path);
        Storage::disk('public')->assertExists($m3->thumbnail_path);
    }

    public function test_user_cannot_bulk_destroy_media_owned_by_another_user(): void
    {
        $otherUser = User::factory()->create();

        $this->actingAs($otherUser);
        $file = UploadedFile::fake()->image('other-user-image.png', 200, 200);
        $otherMediaId = $this->postJson(route('admin.media.store'), [
            'file' => $file,
            'collection' => 'library',
        ])->json('id');

        $otherMedia = Media::find($otherMediaId);

        // Usuario autenticado intenta borrar el archivo del otro usuario
        $this->actingAs($this->user);
        $response = $this->postJson(route('admin.media.bulk-destroy'), [
            'ids' => [$otherMedia->id],
        ]);

        $response->assertSuccessful();
        // deletedCount debe ser 0 porque no le pertenece
        $response->assertJsonPath('deletedCount', 0);

        // El archivo debe seguir existiendo intacto
        $this->assertDatabaseHas('media', ['id' => $otherMedia->id]);
        Storage::disk('public')->assertExists($otherMedia->file_path);
    }

    public function test_internal_database_fields_are_hidden_from_media_serialization(): void
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->image('privacy-test.png', 100, 100);
        $storeResponse = $this->postJson(route('admin.media.store'), [
            'file' => $file,
            'collection' => 'library',
        ]);

        $storeResponse->assertSuccessful();

        // 1. Verificar respuesta de subida (JSON)
        $storeResponse->assertJsonMissing([
            'disk',
            'file_path',
            'thumbnail_path',
            'mediable_id',
            'mediable_type',
            'user_id',
        ]);
        $storeResponse->assertJsonStructure([
            'id',
            'file_name',
            'mime_type',
            'file_size',
            'url',
            'thumbnail_url',
        ]);

        // 2. Verificar listado de medios (JSON / Inertia)
        $indexResponse = $this->getJson(route('admin.media.index'));
        $indexResponse->assertSuccessful();

        $data = $indexResponse->json('data.0');
        $this->assertArrayNotHasKey('disk', $data);
        $this->assertArrayNotHasKey('file_path', $data);
        $this->assertArrayNotHasKey('thumbnail_path', $data);
        $this->assertArrayNotHasKey('mediable_id', $data);
        $this->assertArrayNotHasKey('mediable_type', $data);
        $this->assertArrayNotHasKey('user_id', $data);

        // Campos públicos y amigables accesibles
        $this->assertArrayHasKey('url', $data);
        $this->assertArrayHasKey('thumbnail_url', $data);
        $this->assertArrayHasKey('file_name', $data);
    }

    public function test_file_upload_sanitizes_xss_and_path_traversal_filenames(): void
    {
        $this->actingAs($this->user);

        // Intento de inyección XSS en nombre de archivo
        $xssFile = UploadedFile::fake()->image("<script>alert('xss')</script>.png", 200, 200);

        $response = $this->postJson(route('admin.media.store'), [
            'file' => $xssFile,
            'collection' => 'library',
        ]);

        $response->assertSuccessful();
        $media = Media::find($response->json('id'));

        $this->assertStringNotContainsString('<script>', $media->file_name);
        $this->assertStringNotContainsString('</script>', $media->file_name);
        $this->assertStringNotContainsString("'", $media->file_name);
        $this->assertMatchesRegularExpression('/^[a-zA-Z0-9_\-\. ]+$/', $media->file_name);

        // Intento de path traversal
        $traversalFile = UploadedFile::fake()->image('../../../etc/passwd.png', 200, 200);

        $response2 = $this->postJson(route('admin.media.store'), [
            'file' => $traversalFile,
            'collection' => 'library',
        ]);

        $response2->assertSuccessful();
        $media2 = Media::find($response2->json('id'));

        $this->assertStringNotContainsString('..', $media2->file_name);
        $this->assertEquals('passwd.png', $media2->file_name);
    }

    public function test_media_metadata_update_strips_html_tags(): void
    {
        $this->actingAs($this->user);

        $media = Media::create([
            'user_id' => $this->user->id,
            'file_name' => 'safe.png',
            'file_path' => 'media/library/safe.webp',
            'thumbnail_path' => 'media/library/thumbs/safe.webp',
            'mime_type' => 'image/webp',
            'file_size' => 12345,
            'collection' => 'library',
        ]);

        $response = $this->putJson(route('admin.media.update', $media), [
            'title' => '<b>Negrita</b><script>alert(1)</script>',
            'alt' => '<img src=x onerror=alert(1)>Texto Alt',
            'caption' => '<i>Pie de foto</i>',
            'description' => '<a href="javascript:alert(1)">Enlace</a> Descripción',
        ]);

        $response->assertSuccessful();
        $media->refresh();

        $this->assertEquals('Negrita', $media->title);
        $this->assertEquals('Texto Alt', $media->alt);
        $this->assertEquals('Pie de foto', $media->caption);
        $this->assertEquals('Enlace Descripción', $media->description);
    }
}
