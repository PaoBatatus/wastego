<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PontoVerde extends Model
{
    protected $table = 'pontos_verde';

    protected $fillable = [
        'user_id',
        'residuo_id',
        'pontos',
        'tipo',
        'descricao',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function residuo(): BelongsTo
    {
        return $this->belongsTo(Residuo::class);
    }
}
