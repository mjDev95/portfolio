<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('path', 255);
            $table->string('visitor_hash', 64);
            $table->string('referer', 255)->nullable();
            $table->timestamps();

            // Performance and deduplication indexes
            $table->index(['user_id', 'created_at']);
            $table->unique(['user_id', 'path', 'visitor_hash'], 'visits_user_path_hash_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
