<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tipos de Contenido Personalizados (CPTs)
        Schema::create('content_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('singular_name');
            $table->string('slug');
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->boolean('has_categories')->default(true);
            $table->boolean('has_tags')->default(true);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'slug']);
        });

        // 2. Metadatos de Campos Personalizados por CPT
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_type_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('name');
            $table->string('type'); // text, textarea, number, date, url, boolean, select
            $table->json('options')->nullable();
            $table->string('placeholder')->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['content_type_id', 'name']);
        });

        // 3. Tabla Unificada de Contenidos
        Schema::create('contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('content_type_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('excerpt')->nullable();
            $table->longText('body')->nullable();
            $table->json('custom_values')->nullable();
            $table->string('status')->default('draft'); // draft, published, archived
            $table->timestamp('published_at')->nullable();
            $table->boolean('featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->string('meta_title', 70)->nullable();
            $table->string('meta_description', 160)->nullable();
            $table->string('meta_keywords', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'slug']);
            $table->index(['user_id', 'content_type_id', 'status', 'published_at']);
        });

        // 4. Tabla de Etiquetas (Tags) Universales
        if (! Schema::hasTable('tags')) {
            Schema::create('tags', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->string('name');
                $table->string('slug');
                $table->timestamps();

                $table->unique(['user_id', 'slug']);
            });
        }

        // 5. Vincular Categorías con CPT si la columna no existe
        if (Schema::hasTable('categories')) {
            if (! Schema::hasColumn('categories', 'content_type_id')) {
                Schema::table('categories', function (Blueprint $table) {
                    $table->foreignId('content_type_id')->nullable()->after('user_id')->constrained('content_types')->nullOnDelete();
                });
            }
        }

        // 6. Tablas Pivote
        Schema::create('content_category', function (Blueprint $table) {
            $table->foreignId('content_id')->constrained('contents')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->primary(['content_id', 'category_id']);
        });

        Schema::create('content_tag', function (Blueprint $table) {
            $table->foreignId('content_id')->constrained('contents')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->primary(['content_id', 'tag_id']);
        });

        // 7. Migración de datos existentes y creación de CPTs iniciales
        $this->seedInitialCPTsAndMigrateData();
    }

    protected function seedInitialCPTsAndMigrateData(): void
    {
        // Migrar tecnologías a tags si la tabla existe
        if (Schema::hasTable('technologies')) {
            $techs = DB::table('technologies')->get();
            foreach ($techs as $tech) {
                if (! DB::table('tags')->where('user_id', $tech->user_id)->where('slug', $tech->slug)->exists()) {
                    DB::table('tags')->insert([
                        'id' => $tech->id,
                        'user_id' => $tech->user_id,
                        'name' => $tech->name,
                        'slug' => $tech->slug,
                        'created_at' => $tech->created_at ?? now(),
                        'updated_at' => $tech->updated_at ?? now(),
                    ]);
                }
            }
        }

        // Para cada usuario existente, crear los CPTs predeterminados
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            // CPT Proyectos
            $proyectosCptId = DB::table('content_types')->insertGetId([
                'user_id' => $user->id,
                'name' => 'Proyectos',
                'singular_name' => 'Proyecto',
                'slug' => 'proyectos',
                'icon' => 'Briefcase',
                'description' => 'Portafolio de proyectos y casos de éxito',
                'has_categories' => true,
                'has_tags' => true,
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('custom_fields')->insert([
                [
                    'content_type_id' => $proyectosCptId,
                    'label' => 'Cliente',
                    'name' => 'client',
                    'type' => 'text',
                    'options' => null,
                    'placeholder' => 'Nombre del cliente o empresa',
                    'is_required' => false,
                    'sort_order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'content_type_id' => $proyectosCptId,
                    'label' => 'Año',
                    'name' => 'year',
                    'type' => 'number',
                    'options' => null,
                    'placeholder' => 'Ej: 2026',
                    'is_required' => false,
                    'sort_order' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'content_type_id' => $proyectosCptId,
                    'label' => 'URL en Vivo',
                    'name' => 'external_url',
                    'type' => 'url',
                    'options' => null,
                    'placeholder' => 'https://ejemplo.com',
                    'is_required' => false,
                    'sort_order' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'content_type_id' => $proyectosCptId,
                    'label' => 'Repositorio GitHub',
                    'name' => 'github_url',
                    'type' => 'url',
                    'options' => null,
                    'placeholder' => 'https://github.com/...',
                    'is_required' => false,
                    'sort_order' => 4,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'content_type_id' => $proyectosCptId,
                    'label' => 'Video Demostrativo URL',
                    'name' => 'video_facade_url',
                    'type' => 'url',
                    'options' => null,
                    'placeholder' => 'https://vimeo.com/...',
                    'is_required' => false,
                    'sort_order' => 5,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // CPT Blog
            $blogCptId = DB::table('content_types')->insertGetId([
                'user_id' => $user->id,
                'name' => 'Blog',
                'singular_name' => 'Artículo',
                'slug' => 'blog',
                'icon' => 'BookOpen',
                'description' => 'Artículos, publicaciones y notas técnicas',
                'has_categories' => true,
                'has_tags' => true,
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('custom_fields')->insert([
                [
                    'content_type_id' => $blogCptId,
                    'label' => 'Tiempo de Lectura (min)',
                    'name' => 'reading_time',
                    'type' => 'number',
                    'options' => null,
                    'placeholder' => '5',
                    'is_required' => false,
                    'sort_order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // Migrar proyectos de este usuario
            if (Schema::hasTable('projects')) {
                $projects = DB::table('projects')->where('user_id', $user->id)->get();
                foreach ($projects as $project) {
                    $customValues = [
                        'client' => $project->client ?? null,
                        'year' => $project->year ?? null,
                        'external_url' => $project->external_url ?? null,
                        'github_url' => $project->github_url ?? null,
                        'video_facade_url' => $project->video_facade_url ?? null,
                    ];

                    $contentId = DB::table('contents')->insertGetId([
                        'user_id' => $user->id,
                        'content_type_id' => $proyectosCptId,
                        'title' => $project->title,
                        'slug' => $project->slug,
                        'excerpt' => $project->subtitle ?? null,
                        'body' => $project->description ?? null,
                        'custom_values' => json_encode($customValues),
                        'status' => 'published',
                        'published_at' => $project->created_at,
                        'featured' => (bool) $project->featured,
                        'sort_order' => (int) $project->order,
                        'created_at' => $project->created_at,
                        'updated_at' => $project->updated_at,
                    ]);

                    // Actualizar media polimórfica si existe
                    if (Schema::hasTable('media')) {
                        DB::table('media')
                            ->where('mediable_type', 'App\\Models\\Project')
                            ->where('mediable_id', $project->id)
                            ->update([
                                'mediable_type' => 'App\\Models\\Content',
                                'mediable_id' => $contentId,
                            ]);
                    }

                    // Migrar tecnologías asignadas
                    if (Schema::hasTable('project_technology')) {
                        $techIds = DB::table('project_technology')->where('project_id', $project->id)->pluck('technology_id');
                        foreach ($techIds as $tId) {
                            DB::table('content_tag')->insertOrIgnore([
                                'content_id' => $contentId,
                                'tag_id' => $tId,
                            ]);
                        }
                    }
                }
            }

            // Migrar posts de este usuario
            if (Schema::hasTable('posts')) {
                $posts = DB::table('posts')->where('user_id', $user->id)->get();
                foreach ($posts as $post) {
                    $customValues = [
                        'reading_time' => $post->reading_time ?? 1,
                    ];

                    $contentId = DB::table('contents')->insertGetId([
                        'user_id' => $user->id,
                        'content_type_id' => $blogCptId,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'excerpt' => $post->excerpt ?? null,
                        'body' => $post->content ?? null,
                        'custom_values' => json_encode($customValues),
                        'status' => $post->is_published ? 'published' : 'draft',
                        'published_at' => $post->published_at ?? ($post->is_published ? $post->created_at : null),
                        'featured' => false,
                        'sort_order' => 0,
                        'created_at' => $post->created_at,
                        'updated_at' => $post->updated_at,
                    ]);

                    if ($post->category_id) {
                        DB::table('content_category')->insertOrIgnore([
                            'content_id' => $contentId,
                            'category_id' => $post->category_id,
                        ]);
                    }

                    // Actualizar media polimórfica si existe
                    if (Schema::hasTable('media')) {
                        DB::table('media')
                            ->where('mediable_type', 'App\\Models\\Post')
                            ->where('mediable_id', $post->id)
                            ->update([
                                'mediable_type' => 'App\\Models\\Content',
                                'mediable_id' => $contentId,
                            ]);
                    }

                    // Migrar tecnologías asignadas
                    if (Schema::hasTable('post_technology')) {
                        $techIds = DB::table('post_technology')->where('post_id', $post->id)->pluck('technology_id');
                        foreach ($techIds as $tId) {
                            DB::table('content_tag')->insertOrIgnore([
                                'content_id' => $contentId,
                                'tag_id' => $tId,
                            ]);
                        }
                    }
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('content_tag');
        Schema::dropIfExists('content_category');
        Schema::dropIfExists('contents');
        Schema::dropIfExists('custom_fields');
        Schema::dropIfExists('content_types');
        Schema::dropIfExists('tags');

        if (Schema::hasTable('categories') && Schema::hasColumn('categories', 'content_type_id')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->dropConstrainedForeignId('content_type_id');
            });
        }
    }
};
