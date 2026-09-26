<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaBulkDownloadTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->admin = User::factory()->admin()->create();
    }

    public function test_user_can_download_single_media_as_webp(): void
    {
        Storage::disk('public')->put('media/library/test-image.webp', 'fake webp content');

        $media = Media::create([
            'user_id' => $this->admin->id,
            'disk' => 'public',
            'file_path' => 'media/library/test-image.webp',
            'file_name' => 'test-image.png',
            'mime_type' => 'image/webp',
            'file_size' => 1234,
            'collection' => 'library',
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.media.download', $media));

        $response->assertOk();
        $response->assertHeader('content-type', 'image/webp');
    }

    public function test_user_can_download_bulk_media_as_zip(): void
    {
        Storage::disk('public')->put('media/library/image-1.webp', 'webp 1 binary');
        Storage::disk('public')->put('media/library/image-2.webp', 'webp 2 binary');

        $m1 = Media::create([
            'user_id' => $this->admin->id,
            'disk' => 'public',
            'file_path' => 'media/library/image-1.webp',
            'file_name' => 'Photo Alpha.jpg',
            'mime_type' => 'image/webp',
            'file_size' => 1000,
            'collection' => 'library',
        ]);

        $m2 = Media::create([
            'user_id' => $this->admin->id,
            'disk' => 'public',
            'file_path' => 'media/library/image-2.webp',
            'file_name' => 'Photo Beta.png',
            'mime_type' => 'image/webp',
            'file_size' => 2000,
            'collection' => 'library',
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.media.download-bulk'), [
                'ids' => [$m1->id, $m2->id],
            ]);

        $response->assertOk();
        $response->assertHeader('content-type', 'application/zip');
    }

    public function test_single_item_bulk_request_returns_single_webp(): void
    {
        Storage::disk('public')->put('media/library/solo.webp', 'solo webp binary');

        $media = Media::create([
            'user_id' => $this->admin->id,
            'disk' => 'public',
            'file_path' => 'media/library/solo.webp',
            'file_name' => 'Solo Photo.heif',
            'mime_type' => 'image/webp',
            'file_size' => 1500,
            'collection' => 'library',
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.media.download-bulk'), [
                'ids' => [$media->id],
            ]);

        $response->assertOk();
        $response->assertHeader('content-type', 'image/webp');
    }

    public function test_unauthorized_user_cannot_download_other_users_media(): void
    {
        $otherUser = User::factory()->create();
        Storage::disk('public')->put('media/library/private.webp', 'private');

        $media = Media::create([
            'user_id' => $otherUser->id,
            'disk' => 'public',
            'file_path' => 'media/library/private.webp',
            'file_name' => 'private.webp',
            'mime_type' => 'image/webp',
            'file_size' => 500,
            'collection' => 'library',
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.media.download', $media));

        $response->assertForbidden();
    }
}
