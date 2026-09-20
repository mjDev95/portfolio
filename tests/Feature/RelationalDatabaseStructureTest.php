<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\Media;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RelationalDatabaseStructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_table_contains_standard_roles(): void
    {
        $adminRole = Role::where('slug', 'admin')->first();
        $userRole = Role::where('slug', 'user')->first();

        $this->assertNotNull($adminRole);
        $this->assertSame('Super Administrador', $adminRole->name);

        $this->assertNotNull($userRole);
        $this->assertSame('Cliente', $userRole->name);
    }

    public function test_user_belongs_to_role_and_helpers_work(): void
    {
        $adminRole = Role::where('slug', 'admin')->first();
        $userRole = Role::where('slug', 'user')->first();

        $adminUser = User::factory()->admin()->create();
        $clientUser = User::factory()->create();

        $this->assertSame($adminRole->id, $adminUser->role_id);
        $this->assertInstanceOf(Role::class, $adminUser->role);
        $this->assertTrue($adminUser->isAdmin());
        $this->assertTrue($adminUser->hasRole('admin'));
        $this->assertFalse($adminUser->hasRole('user'));

        $this->assertSame($userRole->id, $clientUser->role_id);
        $this->assertInstanceOf(Role::class, $clientUser->role);
        $this->assertFalse($clientUser->isAdmin());
        $this->assertTrue($clientUser->hasRole('user'));
    }

    public function test_media_has_direct_content_id_foreign_relationship(): void
    {
        $user = User::factory()->create();
        $type = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'is_public' => true,
        ]);

        $content = Content::create([
            'user_id' => $user->id,
            'content_type_id' => $type->id,
            'title' => 'Proyecto con Imagen',
            'slug' => 'proyecto-con-imagen',
            'status' => 'published',
        ]);

        $media = Media::create([
            'user_id' => $user->id,
            'content_id' => $content->id,
            'disk' => 'public',
            'file_path' => 'media/thumbnail/test.jpg',
            'file_name' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 1024,
            'collection' => 'thumbnail',
            'mediable_type' => Content::class,
            'mediable_id' => $content->id,
        ]);

        $this->assertSame($content->id, $media->content_id);
        $this->assertInstanceOf(Content::class, $media->content);
        $this->assertSame('Proyecto con Imagen', $media->content->title);
    }

    public function test_deleting_content_deletes_associated_media_via_foreign_key_cascade(): void
    {
        $user = User::factory()->create();
        $type = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Proyectos',
            'singular_name' => 'Proyecto',
            'slug' => 'proyectos',
            'is_public' => true,
        ]);

        $content = Content::create([
            'user_id' => $user->id,
            'content_type_id' => $type->id,
            'title' => 'Proyecto a Eliminar',
            'slug' => 'proyecto-a-eliminar',
            'status' => 'published',
        ]);

        $media = Media::create([
            'user_id' => $user->id,
            'content_id' => $content->id,
            'disk' => 'public',
            'file_path' => 'media/thumbnail/cascade.jpg',
            'file_name' => 'cascade.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 2048,
            'collection' => 'thumbnail',
            'mediable_type' => Content::class,
            'mediable_id' => $content->id,
        ]);

        $this->assertDatabaseHas('media', ['id' => $media->id]);

        // Force delete content to trigger DB-level cascade
        $content->forceDelete();

        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }
}
