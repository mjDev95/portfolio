<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('color_palettes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('priority', 20)->nullable();
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('theory_title')->nullable();
            $table->text('theory_text')->nullable();
            $table->string('primary_color', 9);
            $table->string('secondary_color', 9);
            $table->string('tertiary_color', 9)->nullable();
            $table->string('accent_color', 9)->nullable();
            $table->string('dark_neutral', 9)->nullable()->default('#0B0D0E');
            $table->string('light_neutral', 9)->nullable()->default('#F8F9FA');
            $table->json('colors')->nullable();
            $table->boolean('is_master')->default(false);
            $table->boolean('is_system')->default(false);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['is_master', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('color_palettes');
    }
};
