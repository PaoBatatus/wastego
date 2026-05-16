<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Denuncia extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'categoria',
        'descricao',
        'foto_url',
        'latitude',
        'longitude',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
