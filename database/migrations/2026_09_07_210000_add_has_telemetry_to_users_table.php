<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'has_telemetry')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('has_telemetry')->default(false)->after('role');
            });
        }

        // Activar telemetría por defecto para la cuenta mjgaliciab@gmail.com
        User::where('email', 'mjgaliciab@gmail.com')->update([
            'has_telemetry' => true,
        ]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'has_telemetry')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('has_telemetry');
            });
        }
    }
};
