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
        Schema::create('custom_fonts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role', 30); // 'heading' | 'sans' | 'mono'
            $table->string('family_name'); // 'Manrope', 'Aileron', etc.
            $table->string('file_path'); // 'fonts/Manrope-Bold.ttf' relative to storage/app/public
            $table->string('file_name'); // 'Manrope-Bold.ttf'
            $table->unsignedInteger('file_size'); // Size in bytes
            $table->string('format', 15); // 'woff2', 'woff', 'truetype', 'opentype'
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_fonts');
    }
};
