<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentSlugDeduplicationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private ContentType $cpt;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->cpt = ContentType::create([
            'user_id' => $this->admin->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'is_public' => true,
        ]);
        $this->cpt->users()->attach([$this->admin->id]);
    }

    public function test_creating_content_with_same_title_assigns_sequential_slugs(): void
    {
        // 1st post: 'mi-post'
        $response1 = $this->actingAs($this->admin)->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'Mi Post',
            'status' => 'published',
        ]);
        $response1->assertRedirect();
        $post1 = Content::where('title', 'Mi Post')->latest('id')->first();
        $this->assertEquals('mi-post', $post1->slug);

        // 2nd post with same title: 'mi-post-1'
        $response2 = $this->actingAs($this->admin)->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'Mi Post',
            'status' => 'published',
        ]);
        $response2->assertRedirect();
        $post2 = Content::where('title', 'Mi Post')->latest('id')->first();
        $this->assertEquals('mi-post-1', $post2->slug);

        // 3rd post with same title: 'mi-post-2'
        $response3 = $this->actingAs($this->admin)->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'Mi Post',
            'status' => 'published',
        ]);
        $response3->assertRedirect();
        $post3 = Content::where('title', 'Mi Post')->latest('id')->first();
        $this->assertEquals('mi-post-2', $post3->slug);
    }

    public function test_submitting_explicit_duplicate_slug_auto_increments(): void
    {
        // 1st post with explicit slug 'custom-slug'
        $this->actingAs($this->admin)->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'First Post',
            'slug' => 'custom-slug',
            'status' => 'published',
        ]);

        // 2nd post explicitly requesting 'custom-slug'
        $response = $this->actingAs($this->admin)->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'Second Post',
            'slug' => 'custom-slug',
            'status' => 'published',
        ]);

        $response->assertSessionHasNoErrors();
        $post2 = Content::where('title', 'Second Post')->first();
        $this->assertEquals('custom-slug-1', $post2->slug);

        // 3rd post explicitly requesting 'custom-slug-1' should resolve to 'custom-slug-2'
        $response3 = $this->actingAs($this->admin)->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'Third Post',
            'slug' => 'custom-slug-1',
            'status' => 'published',
        ]);

        $response3->assertSessionHasNoErrors();
        $post3 = Content::where('title', 'Third Post')->first();
        $this->assertEquals('custom-slug-2', $post3->slug);
    }

    public function test_updating_post_keeps_own_slug_if_unchanged(): void
    {
        $post = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Original Post',
            'slug' => 'original-post',
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.content.update', [$this->cpt->slug, $post->id]), [
            'title' => 'Original Post Updated',
            'slug' => 'original-post',
            'status' => 'published',
        ]);

        $response->assertSessionHasNoErrors();
        $post->refresh();
        $this->assertEquals('original-post', $post->slug);
    }

    public function test_updating_post_to_existing_slug_auto_increments(): void
    {
        Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Target Post',
            'slug' => 'target-post',
            'status' => 'published',
        ]);

        $post2 = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Another Post',
            'slug' => 'another-post',
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.content.update', [$this->cpt->slug, $post2->id]), [
            'title' => 'Another Post',
            'slug' => 'target-post',
            'status' => 'published',
        ]);

        $response->assertSessionHasNoErrors();
        $post2->refresh();
        $this->assertEquals('target-post-1', $post2->slug);
    }

    public function test_soft_deleted_slugs_are_respected_and_do_not_throw_mysql_unique_violation(): void
    {
        $post1 = Content::create([
            'user_id' => $this->admin->id,
            'content_type_id' => $this->cpt->id,
            'title' => 'Trashed Post',
            'slug' => 'trashed-post',
            'status' => 'published',
        ]);

        $post1->delete(); // Soft delete

        // Creating a new post with same slug shouldn't collide on DB unique constraint
        $response = $this->actingAs($this->admin)->post(route('admin.content.store', $this->cpt->slug), [
            'title' => 'New Trashed Post',
            'slug' => 'trashed-post',
            'status' => 'published',
        ]);

        $response->assertSessionHasNoErrors();
        $newPost = Content::where('title', 'New Trashed Post')->first();
        $this->assertEquals('trashed-post-1', $newPost->slug);
    }
}
