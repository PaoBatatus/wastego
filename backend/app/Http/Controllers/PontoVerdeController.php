<?php

namespace App\Http\Controllers;

use App\Services\MoedaVerdeService;
use Illuminate\Http\Request;
use RuntimeException;

class PontoVerdeController extends Controller
{
    public function __construct(private readonly MoedaVerdeService $moedaVerdeService) {}

    public function saldo(Request $request)
    {
        $usuario = $request->user();
        if (! $usuario) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $saldo = $this->moedaVerdeService->getSaldo($usuario);

        return response()->json([
            'success' => true,
            'data' => ['saldo' => $saldo],
            'message' => 'Saldo de pontos retornado com sucesso.',
        ]);
    }

    public function historico(Request $request)
    {
        $usuario = $request->user();
        if (! $usuario) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $historico = $this->moedaVerdeService->getHistorico($usuario);

        return response()->json([
            'success' => true,
            'data' => $historico,
            'message' => 'Histórico de pontos retornado com sucesso.',
        ]);
    }

    public function resgatar(Request $request)
    {
        $usuario = $request->user();
        if (! $usuario) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $dados = $request->validate([
            'pontos' => ['required', 'integer', 'min:1'],
            'descricao' => ['required', 'string'],
        ]);

        try {
            $novoSaldo = $this->moedaVerdeService->resgatarPontos(
                $usuario,
                (int) $dados['pontos'],
                $dados['descricao']
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => $exception->getMessage(),
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => ['saldo' => $novoSaldo],
            'message' => 'Resgate de pontos realizado com sucesso.',
        ]);
    }
}
