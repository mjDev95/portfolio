<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds virtual generated columns with B-Tree indexes on contents.custom_values
     * to eliminate Full Table Scans when filtering and querying dynamic custom fields.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        $clientExpr = match ($driver) {
            'sqlite' => "json_extract(custom_values, '$.client')",
            default => "json_unquote(json_extract(custom_values, '$.client'))",
        };

        $yearExpr = match ($driver) {
            'sqlite' => "json_extract(custom_values, '$.year')",
            default => "json_unquote(json_extract(custom_values, '$.year'))",
        };

        $readingTimeExpr = match ($driver) {
            'sqlite' => "json_extract(custom_values, '$.reading_time')",
            default => "json_unquote(json_extract(custom_values, '$.reading_time'))",
        };

        Schema::table('contents', function (Blueprint $table) use ($clientExpr, $yearExpr, $readingTimeExpr) {
            $table->string('custom_client')->nullable()->virtualAs($clientExpr)->index();
            $table->string('custom_year', 10)->nullable()->virtualAs($yearExpr)->index();
            $table->string('custom_reading_time', 10)->nullable()->virtualAs($readingTimeExpr)->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->dropIndex(['custom_client']);
            $table->dropIndex(['custom_year']);
            $table->dropIndex(['custom_reading_time']);
            $table->dropColumn(['custom_client', 'custom_year', 'custom_reading_time']);
        });
    }
};
