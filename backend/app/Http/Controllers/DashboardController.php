<?php

namespace App\Http\Controllers;

use App\Models\Certificado;
use App\Models\Denuncia;
use App\Models\Residuo;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function resumo(Request $request): JsonResponse
    {
        if ($authError = $this->validarGestor($request)) {
            return $authError;
        }

        $denunciasPorStatus = Denuncia::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $usuariosPorPerfil = User::query()
            ->select('perfil', DB::raw('COUNT(*) as total'))
            ->groupBy('perfil')
            ->pluck('total', 'perfil');

        $data = [
            'total_residuos_anunciados' => DB::table('residuos')->count(),
            'total_coletado' => DB::table('residuos')->where('status', 'coletado')->count(),
            'denuncias_por_status' => $denunciasPorStatus,
            'usuarios_por_perfil' => $usuariosPorPerfil,
            'total_certificados_emitidos' => Certificado::query()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Resumo do dashboard retornado com sucesso.',
        ]);
    }

    public function residuosPorCategoria(Request $request): JsonResponse
    {
        if ($authError = $this->validarGestor($request)) {
            return $authError;
        }

        $filtros = $request->validate([
            'data_inicio' => ['nullable', 'date'],
            'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
        ]);

        $query = Residuo::query()
            ->select('categoria', DB::raw('COUNT(*) as total'))
            ->groupBy('categoria');

        if (! empty($filtros['data_inicio'])) {
            $query->whereDate('created_at', '>=', $filtros['data_inicio']);
        }

        if (! empty($filtros['data_fim'])) {
            $query->whereDate('created_at', '<=', $filtros['data_fim']);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
            'message' => 'Resíduos por categoria retornados com sucesso.',
        ]);
    }

    public function denunciasPorLocalizacao(Request $request): JsonResponse
    {
        if ($authError = $this->validarGestor($request)) {
            return $authError;
        }

        $denuncias = Denuncia::query()
            ->select(['id', 'latitude', 'longitude', 'categoria', 'status', 'created_at'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $denuncias,
            'message' => 'Denúncias por localização retornadas com sucesso.',
        ]);
    }

    public function volumeMensal(Request $request): JsonResponse
    {
        if ($authError = $this->validarGestor($request)) {
            return $authError;
        }

        $inicioPeriodo = Carbon::now()->startOfMonth()->subMonths(11);

        $dadosDb = Certificado::query()
            ->selectRaw("DATE_FORMAT(data_coleta, '%Y-%m') as mes, SUM(peso_coletado) as total_peso")
            ->where('data_coleta', '>=', $inicioPeriodo)
            ->groupBy('mes')
            ->orderBy('mes')
            ->pluck('total_peso', 'mes');

        $volumeMensal = [];
        for ($i = 0; $i < 12; $i++) {
            $mes = $inicioPeriodo->copy()->addMonths($i)->format('Y-m');
            $volumeMensal[] = [
                'mes' => $mes,
                'total_peso' => (float) ($dadosDb[$mes] ?? 0),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $volumeMensal,
            'message' => 'Volume mensal de resíduos coletados retornado com sucesso.',
        ]);
    }

    private function validarGestor(Request $request): ?JsonResponse
    {
        $usuario = $request->user();

        if (! $usuario || ! $usuario->isPerfil('gestor')) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        return null;
    }
}
