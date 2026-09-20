<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('content_types', function (Blueprint $table) {
            $table->boolean('is_public')->default(true)->after('description');
            $table->string('public_slug')->nullable()->after('is_public');
        });
    }

    public function down(): void
    {
        Schema::table('content_types', function (Blueprint $table) {
            $table->dropColumn(['is_public', 'public_slug']);
        });
    }
};
