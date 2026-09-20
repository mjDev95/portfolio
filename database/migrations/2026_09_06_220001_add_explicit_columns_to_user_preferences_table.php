<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->unsignedInteger('items_per_page')->default(10)->after('theme');
            $table->string('table_density', 20)->default('comfortable')->after('items_per_page');
            $table->string('editor_mode', 20)->default('markdown')->after('table_density');
            $table->boolean('email_notifications')->default(true)->after('editor_mode');
            $table->json('color_palette')->nullable()->after('email_notifications');
        });

        // Migrate existing settings data from JSON to new typed columns
        $records = DB::table('user_preferences')->get();
        foreach ($records as $record) {
            $settings = json_decode($record->settings ?? '{}', true) ?: [];
            DB::table('user_preferences')
                ->where('id', $record->id)
                ->update([
                    'items_per_page' => $settings['items_per_page'] ?? 10,
                    'table_density' => $settings['table_density'] ?? 'comfortable',
                    'editor_mode' => $settings['editor_mode'] ?? 'markdown',
                    'email_notifications' => $settings['email_notifications'] ?? true,
                    'color_palette' => isset($settings['color_palette']) ? json_encode($settings['color_palette']) : null,
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropColumn([
                'items_per_page',
                'table_density',
                'editor_mode',
                'email_notifications',
                'color_palette',
            ]);
        });
    }
};
