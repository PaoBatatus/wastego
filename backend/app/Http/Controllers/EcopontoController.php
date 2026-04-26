<?php

namespace App\Http\Controllers;

use App\Models\Ecoponto;
use Illuminate\Http\Request;

class EcopontoController extends Controller
{
    public function index(Request $request)
    {
        $filtros = $request->validate([
            'tipo_residuo' => ['nullable', 'string', 'max:100'],
        ]);

        $query = Ecoponto::query()
            ->where('ativo', true)
            ->select([
                'id',
                'nome',
                'endereco',
                'latitude',
                'longitude',
                'tipos_residuo',
                'horario_funcionamento',
            ]);

        if (! empty($filtros['tipo_residuo'])) {
            $query->whereJsonContains('tipos_residuo', $filtros['tipo_residuo']);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
            'message' => 'Ecopontos ativos listados com sucesso.',
        ]);
    }

    public function store(Request $request)
    {
        $usuario = $request->user();
        if (! $usuario || ! $usuario->isPerfil('gestor')) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        $dados = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'endereco' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'tipos_residuo' => ['required', 'array', 'min:1'],
            'tipos_residuo.*' => ['required', 'string', 'max:100'],
            'horario_funcionamento' => ['nullable', 'string', 'max:255'],
        ]);

        $ecoponto = new Ecoponto();
        $ecoponto->nome = $dados['nome'];
        $ecoponto->endereco = $dados['endereco'];
        $ecoponto->latitude = $dados['latitude'];
        $ecoponto->longitude = $dados['longitude'];
        $ecoponto->tipos_residuo = $dados['tipos_residuo'];
        $ecoponto->horario_funcionamento = $dados['horario_funcionamento'] ?? null;
        $ecoponto->ativo = true;
        $ecoponto->save();

        return response()->json([
            'success' => true,
            'data' => $ecoponto,
            'message' => 'Ecoponto criado com sucesso.',
        ], 201);
    }

    public function show(string $id)
    {
        $ecoponto = Ecoponto::find($id);
        if (! $ecoponto) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ecoponto não encontrado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ecoponto,
            'message' => 'Detalhes do ecoponto retornados com sucesso.',
        ]);
    }

    public function update(Request $request, string $id)
    {
        $usuario = $request->user();
        if (! $usuario || ! $usuario->isPerfil('gestor')) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        $ecoponto = Ecoponto::find($id);
        if (! $ecoponto) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ecoponto não encontrado.',
            ], 404);
        }

        $dados = $request->validate([
            'nome' => ['sometimes', 'string', 'max:255'],
            'endereco' => ['sometimes', 'string', 'max:255'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'tipos_residuo' => ['sometimes', 'array', 'min:1'],
            'tipos_residuo.*' => ['required_with:tipos_residuo', 'string', 'max:100'],
            'horario_funcionamento' => ['sometimes', 'nullable', 'string', 'max:255'],
            'ativo' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('nome', $dados)) {
            $ecoponto->nome = $dados['nome'];
        }
        if (array_key_exists('endereco', $dados)) {
            $ecoponto->endereco = $dados['endereco'];
        }
        if (array_key_exists('latitude', $dados)) {
            $ecoponto->latitude = $dados['latitude'];
        }
        if (array_key_exists('longitude', $dados)) {
            $ecoponto->longitude = $dados['longitude'];
        }
        if (array_key_exists('tipos_residuo', $dados)) {
            $ecoponto->tipos_residuo = $dados['tipos_residuo'];
        }
        if (array_key_exists('horario_funcionamento', $dados)) {
            $ecoponto->horario_funcionamento = $dados['horario_funcionamento'];
        }
        if (array_key_exists('ativo', $dados)) {
            $ecoponto->ativo = $dados['ativo'];
        }
        $ecoponto->save();

        return response()->json([
            'success' => true,
            'data' => $ecoponto,
            'message' => 'Ecoponto atualizado com sucesso.',
        ]);
    }

    public function destroy(string $id)
    {
        $usuario = request()->user();
        if (! $usuario || ! $usuario->isPerfil('gestor')) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        $ecoponto = Ecoponto::find($id);
        if (! $ecoponto) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ecoponto não encontrado.',
            ], 404);
        }

        $ecoponto->ativo = false;
        $ecoponto->save();

        return response()->json([
            'success' => true,
            'data' => $ecoponto,
            'message' => 'Ecoponto desativado com sucesso.',
        ]);
    }

    public function proximos(Request $request)
    {
        $dados = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $lat = (float) $dados['lat'];
        $lng = (float) $dados['lng'];
        $distanciaSql = '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))';

        $ecopontos = Ecoponto::query()
            ->where('ativo', true)
            ->select([
                'id',
                'nome',
                'endereco',
                'latitude',
                'longitude',
                'tipos_residuo',
                'horario_funcionamento',
            ])
            ->selectRaw("$distanciaSql as distancia_km", [$lat, $lng, $lat])
            ->orderBy('distancia_km')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $ecopontos,
            'message' => 'Ecopontos próximos listados com sucesso.',
        ]);
    }
}
