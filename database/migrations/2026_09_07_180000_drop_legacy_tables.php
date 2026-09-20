<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('post_technology');
        Schema::dropIfExists('project_technology');
        Schema::dropIfExists('project_service');
        Schema::dropIfExists('services');
        Schema::dropIfExists('technologies');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('projects');
    }

    public function down(): void
    {
        // Tablas legacy obsoletas; no se restauran.
    }
};
