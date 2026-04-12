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
        Schema::create('residuos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('categoria', [
                'plastico',
                'papel',
                'vidro',
                'metal',
                'eletronico',
                'organico',
                'entulho',
            ]);
            $table->text('descricao');
            $table->string('foto_url')->nullable();
            $table->decimal('peso_estimado', 8, 2)->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->enum('status', ['disponivel', 'reservado', 'coletado'])->default('disponivel');
            $table->dateTime('janela_inicio')->nullable();
            $table->dateTime('janela_fim')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residuos');
    }
};
