<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Residuo extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'categoria',
        'descricao',
        'foto_url',
        'peso_estimado',
        'latitude',
        'longitude',
        'status',
        'janela_inicio',
        'janela_fim',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeDisponivel(Builder $query): Builder
    {
        return $query->where('status', 'disponivel');
    }

    public function scopePorCategoria(Builder $query, string $categoria): Builder
    {
        return $query->where('categoria', $categoria);
    }
}
