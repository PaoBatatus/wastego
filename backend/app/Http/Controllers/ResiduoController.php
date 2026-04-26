<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreResiduoRequest;
use App\Models\Residuo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ResiduoController extends Controller
{
    public function index(Request $request)
    {
        $filtros = $request->validate([
            'categoria' => [
                'nullable',
                Rule::in(['plastico', 'papel', 'vidro', 'metal', 'eletronico', 'organico', 'entulho']),
            ],
            'lat' => ['nullable', 'numeric', 'between:-90,90', 'required_with:lng'],
            'lng' => ['nullable', 'numeric', 'between:-180,180', 'required_with:lat'],
            'raio' => ['nullable', 'numeric', 'min:0.1'],
        ]);

        $query = Residuo::query()
            ->with('user')
            ->disponivel();

        if (! empty($filtros['categoria'])) {
            $query->porCategoria($filtros['categoria']);
        }

        if (isset($filtros['lat'], $filtros['lng'])) {
            $raio = (float) ($filtros['raio'] ?? 10);
            $lat = (float) $filtros['lat'];
            $lng = (float) $filtros['lng'];

            $distanciaSql = '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))';

            $query
                ->select('residuos.*')
                ->selectRaw("$distanciaSql as distancia_km", [$lat, $lng, $lat])
                ->having('distancia_km', '<=', $raio)
                ->orderBy('distancia_km');
        } else {
            $query->latest();
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(20),
            'message' => 'Resíduos disponíveis listados com sucesso.',
        ]);
    }

    public function store(StoreResiduoRequest $request)
    {
        $usuario = $request->user();

        if (! $usuario || (! $usuario->isPerfil('cidadao') && ! $usuario->isPerfil('empresa'))) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        $residuo = Residuo::create([
            ...$request->validated(),
            'user_id' => $usuario->id,
            'status' => 'disponivel',
        ]);

        return response()->json([
            'success' => true,
            'data' => $residuo->load('user'),
            'message' => 'Resíduo criado com sucesso.',
        ], 201);
    }

    public function show(string $id)
    {
        $residuo = Residuo::with('user')->find($id);

        if (! $residuo) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Resíduo não encontrado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $residuo,
            'message' => 'Detalhes do resíduo retornados com sucesso.',
        ]);
    }

    public function update(Request $request, string $id)
    {
        $residuo = Residuo::find($id);

        if (! $residuo) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Resíduo não encontrado.',
            ], 404);
        }

        if ((int) $residuo->user_id !== (int) $request->user()->id) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        $dados = $request->validate([
            'categoria' => ['sometimes', Rule::in(['plastico', 'papel', 'vidro', 'metal', 'eletronico', 'organico', 'entulho'])],
            'descricao' => ['sometimes', 'string', 'max:1000'],
            'foto_url' => ['sometimes', 'nullable', 'string', 'url'],
            'peso_estimado' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'janela_inicio' => ['sometimes', 'nullable', 'date', 'after:now'],
            'janela_fim' => ['sometimes', 'nullable', 'date', 'after:janela_inicio'],
            'status' => ['sometimes', 'string', 'max:50'],
        ]);

        $residuo->update($dados);

        return response()->json([
            'success' => true,
            'data' => $residuo->fresh()->load('user'),
            'message' => 'Resíduo atualizado com sucesso.',
        ]);
    }

    public function destroy(string $id)
    {
        $residuo = Residuo::find($id);

        if (! $residuo) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Resíduo não encontrado.',
            ], 404);
        }

        if ((int) $residuo->user_id !== (int) request()->user()->id) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        $residuo->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Resíduo removido com sucesso.',
        ]);
    }

    public function meus(Request $request)
    {
        $residuos = Residuo::query()
            ->with('user')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $residuos,
            'message' => 'Resíduos do usuário listados com sucesso.',
        ]);
    }
}
