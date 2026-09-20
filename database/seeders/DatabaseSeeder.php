<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── 1. Roles Fundamentales ─────────────────────────────────────────
        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Super Administrador',
                'description' => 'Control total del sistema, creación y configuración de CPTs y telemetría.',
            ]
        );

        $userRole = Role::firstOrCreate(
            ['slug' => 'user'],
            [
                'name' => 'Cliente',
                'description' => 'Gestión de contenidos y visualización de módulos asignados.',
            ]
        );

        // ── 2. Super Administrador (admin@admin.com) ──────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('admin'),
                'role_id' => $adminRole->id,
                'has_telemetry' => true,
                'email_verified_at' => now(),
            ]
        );

        $admin->update([
            'role_id' => $adminRole->id,
            'has_telemetry' => true,
        ]);

        UserPreference::firstOrCreate(
            ['user_id' => $admin->id],
            [
                'theme' => 'dark',
                'table_density' => 'comfortable',
            ]
        );

        // ── 3. Sembrar Paletas Maestras de Marca ──────────────────────────
        $this->call(ColorPaletteSeeder::class);

        // ── 4. Sembrar CPTs, Taxonomías y Publicaciones para el cliente ────
        $this->call(UserCptSeeder::class);
    }
}
