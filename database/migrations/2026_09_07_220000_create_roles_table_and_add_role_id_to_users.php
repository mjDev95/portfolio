<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crear tabla roles
        if (! Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 2. Insertar roles fundamentales
        $now = now();
        DB::table('roles')->insertOrIgnore([
            [
                'id' => 1,
                'name' => 'Super Administrador',
                'slug' => 'admin',
                'description' => 'Control total del sistema, creación y configuración de CPTs y telemetría.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'name' => 'Cliente',
                'slug' => 'user',
                'description' => 'Gestión de contenidos y visualización de módulos asignados.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 3. Modificar tabla users
        if (! Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('role_id')
                    ->nullable()
                    ->after('email')
                    ->constrained('roles')
                    ->onDelete('restrict');
            });
        }

        // 4. Migrar los datos existentes de users.role a users.role_id
        if (Schema::hasColumn('users', 'role')) {
            DB::table('users')->where('role', 'admin')->update(['role_id' => 1]);
            DB::table('users')->whereNull('role_id')->update(['role_id' => 2]);

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        } else {
            DB::table('users')->whereNull('role_id')->update(['role_id' => 2]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('user')->after('email');
            });

            DB::table('users')->where('role_id', 1)->update(['role' => 'admin']);
            DB::table('users')->where('role_id', 2)->update(['role' => 'user']);
        }

        if (Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['role_id']);
                $table->dropColumn('role_id');
            });
        }

        Schema::dropIfExists('roles');
    }
};
