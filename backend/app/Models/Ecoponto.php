<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ecoponto extends Model
{
    protected $fillable = [
        'nome',
        'endereco',
        'latitude',
        'longitude',
        'tipos_residuo',
        'horario_funcionamento',
        'ativo',
    ];

    protected $casts = [
        'tipos_residuo' => 'array',
        'ativo' => 'boolean',
    ];
}
