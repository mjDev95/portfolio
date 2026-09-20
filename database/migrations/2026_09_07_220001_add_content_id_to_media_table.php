<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('media', 'content_id')) {
            Schema::table('media', function (Blueprint $table) {
                $table->foreignId('content_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('contents')
                    ->onDelete('cascade');
            });

            // Sincronizar registros existentes donde mediable_type sea Content
            if (Schema::hasTable('contents')) {
                DB::table('media')
                    ->where('mediable_type', 'App\\Models\\Content')
                    ->whereNull('content_id')
                    ->update(['content_id' => DB::raw('mediable_id')]);
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('media', 'content_id')) {
            Schema::table('media', function (Blueprint $table) {
                $table->dropForeign(['content_id']);
                $table->dropColumn('content_id');
            });
        }
    }
};
