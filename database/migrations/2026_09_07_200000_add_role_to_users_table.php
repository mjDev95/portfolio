<?php

use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('user')->after('email');
            });
        }

        // 1. Crear o actualizar usuario admin@admin.com con rol admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('admin'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $admin->update([
            'role' => 'admin',
            'password' => Hash::make('admin'),
        ]);

        UserPreference::firstOrCreate(
            ['user_id' => $admin->id],
            [
                'theme' => 'dark',
                'table_density' => 'comfortable',
            ]
        );

        // 2. Crear o actualizar usuario mjgaliciab@gmail.com con rol user (no admin)
        $user = User::firstOrCreate(
            ['email' => 'mjgaliciab@gmail.com'],
            [
                'name' => 'Mario Galicia',
                'password' => Hash::make('admin'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        $user->update([
            'role' => 'user',
        ]);

        UserPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'theme' => 'dark',
                'table_density' => 'comfortable',
            ]
        );

        // 3. Vincular los CPTs existentes al administrador para su gestión
        if (Schema::hasTable('content_types')) {
            DB::table('content_types')->update(['user_id' => $admin->id]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
    }
};
