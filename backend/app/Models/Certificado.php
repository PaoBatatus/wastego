<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificado extends Model
{
    protected $fillable = [
        'anuncio_id',
        'empresa_id',
        'cooperativa_id',
        'numero_certificado',
        'tipo_residuo',
        'peso_coletado',
        'data_coleta',
        'pdf_url',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'empresa_id');
    }

    public function cooperativa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cooperativa_id');
    }
}
