<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabla pivot content_type_user para permitir CPTs multi-cliente
        Schema::create('content_type_user', function (Blueprint $table) {
            $table->foreignId('content_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['content_type_id', 'user_id']);
            $table->timestamps();
        });

        // 2. Columna user_id en custom_fields para soportar campos dinámicos específicos por cliente
        // null = Campo Global (para todos los clientes asignados)
        // int  = Campo Específico (solo para el cliente indicado)
        Schema::table('custom_fields', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('content_type_id')->constrained()->nullOnDelete();
        });

        // 3. Poblar retroactivamente la tabla pivot con los propietarios actuales de cada CPT
        if (Schema::hasTable('content_types')) {
            $existingCpts = DB::table('content_types')->select(['id', 'user_id'])->get();
            foreach ($existingCpts as $cpt) {
                if (! empty($cpt->user_id)) {
                    DB::table('content_type_user')->insertOrIgnore([
                        'content_type_id' => $cpt->id,
                        'user_id' => $cpt->user_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_type_user');

        Schema::table('custom_fields', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
