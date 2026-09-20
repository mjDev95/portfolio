<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelemetryTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_track_visits_helper_respects_flag(): void
    {
        $userWithTelemetry = User::factory()->create(['has_telemetry' => true]);
        $userWithoutTelemetry = User::factory()->create(['has_telemetry' => false]);

        $this->assertTrue($userWithTelemetry->canTrackVisits());
        $this->assertFalse($userWithoutTelemetry->canTrackVisits());
    }

    public function test_visit_tracking_records_visit_when_user_has_telemetry_enabled(): void
    {
        $user = User::factory()->create(['has_telemetry' => true]);
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
            'title' => 'Proyecto Alpha',
            'slug' => 'proyecto-alpha',
            'status' => 'published',
        ]);

        $response = $this->postJson('/api/track-visit', [
            'path' => '/proyectos/'.$content->slug,
            'content_id' => $content->id,
        ]);

        $response->assertNoContent();
        $this->assertDatabaseHas('visits', [
            'user_id' => $user->id,
            'path' => '/proyectos/'.$content->slug,
        ]);
    }

    public function test_visit_tracking_silently_ignores_when_user_has_telemetry_disabled(): void
    {
        $user = User::factory()->create(['has_telemetry' => false]);
        $type = ContentType::create([
            'user_id' => $user->id,
            'name' => 'Blog',
            'singular_name' => 'Artículo',
            'slug' => 'blog',
            'is_public' => true,
        ]);
        $content = Content::create([
            'user_id' => $user->id,
            'content_type_id' => $type->id,
            'title' => 'Post de Prueba',
            'slug' => 'post-de-prueba',
            'status' => 'published',
        ]);

        $response = $this->postJson('/api/track-visit', [
            'path' => '/blog/'.$content->slug,
            'content_id' => $content->id,
        ]);

        $response->assertNoContent();
        $this->assertDatabaseMissing('visits', [
            'user_id' => $user->id,
        ]);
    }

    public function test_visit_tracking_resolves_owner_from_cpt_path_and_honors_flag(): void
    {
        $user = User::factory()->create(['has_telemetry' => false]);
        ContentType::create([
            'user_id' => $user->id,
            'name' => 'Artículos',
            'singular_name' => 'Artículo',
            'slug' => 'articulos',
            'is_public' => true,
        ]);

        $response = $this->postJson('/api/track-visit', [
            'path' => '/articulos',
        ]);

        $response->assertNoContent();
        $this->assertDatabaseMissing('visits', [
            'user_id' => $user->id,
        ]);
    }
}
