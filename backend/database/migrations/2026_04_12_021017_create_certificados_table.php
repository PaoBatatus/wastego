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
        Schema::create('certificados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anuncio_id')->constrained('anuncios')->cascadeOnDelete();
            $table->foreignId('empresa_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('cooperativa_id')->constrained('users')->cascadeOnDelete();
            $table->string('numero_certificado')->unique();
            $table->string('tipo_residuo');
            $table->decimal('peso_coletado', 8, 2);
            $table->dateTime('data_coleta');
            $table->string('pdf_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificados');
    }
};
