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
        Schema::create('anuncios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('residuo_id')->constrained('residuos')->cascadeOnDelete();
            $table->foreignId('cooperativa_id')->nullable()->constrained('users');
            $table->enum('status', ['aberto', 'reservado', 'concluido', 'cancelado'])->default('aberto');
            $table->text('observacoes')->nullable();
            $table->dateTime('data_coleta')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anuncios');
    }
};
