<?php

namespace App\Services;

use App\Models\PontoVerde;
use App\Models\Residuo;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use RuntimeException;

class MoedaVerdeService
{
    public function creditarPontos(User $user, Residuo $residuo): int
    {
        $pontos = $this->getPontosPorCategoria($residuo->categoria);

        PontoVerde::create([
            'user_id' => $user->id,
            'residuo_id' => $residuo->id,
            'pontos' => $pontos,
            'tipo' => 'ganho',
            'descricao' => sprintf(
                'Crédito por descarte de resíduo da categoria %s',
                $residuo->categoria
            ),
        ]);

        return $this->getSaldo($user);
    }

    public function resgatarPontos(User $user, int $pontos, string $descricao): int
    {
        if ($pontos <= 0) {
            throw new RuntimeException('A quantidade de pontos para resgate deve ser maior que zero.');
        }

        $saldoAtual = $this->getSaldo($user);

        if ($saldoAtual < $pontos) {
            throw new RuntimeException('Saldo insuficiente para realizar o resgate.');
        }

        PontoVerde::create([
            'user_id' => $user->id,
            'residuo_id' => null,
            'pontos' => $pontos,
            'tipo' => 'resgate',
            'descricao' => $descricao,
        ]);

        return $saldoAtual - $pontos;
    }

    public function getSaldo(User $user): int
    {
        $ganhos = (int) PontoVerde::query()
            ->where('user_id', $user->id)
            ->where('tipo', 'ganho')
            ->sum('pontos');

        $resgates = (int) PontoVerde::query()
            ->where('user_id', $user->id)
            ->where('tipo', 'resgate')
            ->sum('pontos');

        return $ganhos - $resgates;
    }

    public function getHistorico(User $user): Collection
    {
        return PontoVerde::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(20)
            ->get();
    }

    private function getPontosPorCategoria(?string $categoria): int
    {
        return match (strtolower((string) $categoria)) {
            'eletronico' => 50,
            'metal' => 30,
            'vidro' => 20,
            default => 10,
        };
    }
}
