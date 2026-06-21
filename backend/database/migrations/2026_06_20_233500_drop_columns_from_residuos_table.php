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
        Schema::table('residuos', function (Blueprint $table) {
            $table->dropColumn(['peso_estimado', 'janela_inicio', 'janela_fim']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residuos', function (Blueprint $table) {
            $table->decimal('peso_estimado', 8, 2)->nullable();
            $table->dateTime('janela_inicio')->nullable();
            $table->dateTime('janela_fim')->nullable();
        });
    }
};
