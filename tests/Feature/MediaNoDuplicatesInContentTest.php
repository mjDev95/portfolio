<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaNoDuplicatesInContentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected ContentType $cpt;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->user = User::factory()->create();

        $this->cpt = ContentType::create([
            'user_id' => $this->user->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'is_public' => true,
        ]);
    }

    public function test_attaching_library_media_to_content_as_thumbnail_does_not_duplicate_media_row(): void
    {
        $this->actingAs($this->user);

        // 1. Subir imagen a la biblioteca de medios
        $file = UploadedFile::fake()->image('mi-foto-original.png', 800, 600);
        $res = $this->postJson(route('admin.media.store'), [
            'file' => $file,
            'collection' => 'library',
        ]);
        $res->assertSuccessful();
        $mediaId = $res->json('id');

        $this->assertSame(1, Media::where('user_id', $this->user->id)->count());

        // 2. Crear una publicación usando esa imagen como miniatura desde la biblioteca
        $contentRes = $this->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'Primer Post con Imagen',
            'status' => 'published',
            'thumbnail_media_id' => $mediaId,
        ]);
        $contentRes->assertRedirect();

        // Verificar que NO se haya duplicado el registro en la tabla media
        $this->assertSame(1, Media::where('user_id', $this->user->id)->count());

        $content = Content::where('title', 'Primer Post con Imagen')->firstOrFail();
        $this->assertNotNull($content->thumbnail);
        $this->assertSame($mediaId, $content->thumbnail->id);
        $this->assertSame('thumbnail', $content->thumbnail->collection);
    }

    public function test_same_media_can_be_shared_by_multiple_contents_without_duplication(): void
    {
        $this->actingAs($this->user);

        // Subir imagen base
        $file = UploadedFile::fake()->image('branding-asset.webp', 1200, 800);
        $media = Media::create([
            'user_id' => $this->user->id,
            'disk' => 'public',
            'file_path' => 'media/library/2026/09/branding-asset.webp',
            'file_name' => 'branding-asset.webp',
            'mime_type' => 'image/webp',
            'file_size' => 54321,
            'collection' => 'library',
        ]);

        $this->assertSame(1, Media::count());

        // Crear Post 1 con esta imagen como miniatura
        $post1 = Content::create([
            'user_id' => $this->user->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Post Uno',
            'slug' => 'post-uno',
            'status' => 'published',
        ]);
        $res1 = $this->put(route('admin.content.update', [$this->cpt->slug, $post1->id]), [
            'title' => 'Post Uno Actualizado',
            'status' => 'published',
            'thumbnail_media_id' => $media->id,
        ]);
        $res1->assertSessionHasNoErrors();

        // Crear Post 2 con la misma imagen como hero
        $post2 = Content::create([
            'user_id' => $this->user->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Post Dos',
            'slug' => 'post-dos',
            'status' => 'published',
        ]);
        $res2 = $this->put(route('admin.content.update', [$this->cpt->slug, $post2->id]), [
            'title' => 'Post Dos Actualizado',
            'status' => 'published',
            'hero_media_id' => $media->id,
        ]);
        $res2->assertSessionHasNoErrors();

        // Debe seguir existiendo exactamente UN solo registro en la tabla media
        $this->assertSame(1, Media::count());

        // Ambos posts deben tener acceso a la imagen en sus respectivas colecciones
        $post1->refresh()->load('media');
        $post2->refresh()->load('media');

        $this->assertSame($media->id, $post1->thumbnail->id);
        $this->assertSame($media->id, $post2->hero_image->id);
    }

    public function test_attaching_media_via_api_attach_does_not_duplicate_media(): void
    {
        $this->actingAs($this->user);

        $media = Media::create([
            'user_id' => $this->user->id,
            'disk' => 'public',
            'file_path' => 'media/library/gallery-pic.webp',
            'file_name' => 'gallery-pic.webp',
            'mime_type' => 'image/webp',
            'file_size' => 12345,
            'collection' => 'library',
        ]);

        $content = Content::create([
            'user_id' => $this->user->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Proyecto con Galería',
            'slug' => 'proyecto-galeria',
            'status' => 'published',
        ]);

        $res = $this->postJson(route('admin.media.attach'), [
            'media_id' => $media->id,
            'content_id' => $content->id,
            'collection' => 'gallery',
        ]);

        $res->assertSuccessful();
        $this->assertSame(1, Media::count());

        $content->refresh()->load('media');
        $this->assertCount(1, $content->gallery);
        $this->assertSame($media->id, $content->gallery->first()->id);
        $this->assertSame('gallery', $content->gallery->first()->collection);
    }

    public function test_direct_file_upload_in_content_stores_single_media_asset(): void
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->image('nueva-portada.jpg', 600, 400);

        $response = $this->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'Post con Subida Directa',
            'status' => 'published',
            'thumbnail' => $file,
        ]);

        $response->assertRedirect();

        // Debe haberse creado un único registro en la tabla media
        $this->assertSame(1, Media::count());

        $content = Content::where('title', 'Post con Subida Directa')->firstOrFail();
        $this->assertNotNull($content->thumbnail);
        $this->assertSame('thumbnail', $content->thumbnail->collection);
    }
}
