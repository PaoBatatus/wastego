<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDenunciaRequest;
use App\Models\Denuncia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DenunciaController extends Controller
{
    public function index(Request $request)
    {
        $filtros = $request->validate([
            'status' => ['nullable', Rule::in(['recebida', 'em_analise', 'resolvida', 'cancelada'])],
            'categoria' => ['nullable', 'string', 'max:100'],
        ]);

        $usuario = $request->user();
        $query = Denuncia::query()->with('user');

        if ($usuario->isPerfil('gestor')) {
            if (! empty($filtros['status'])) {
                $query->where('status', $filtros['status']);
            }

            if (! empty($filtros['categoria'])) {
                $query->where('categoria', $filtros['categoria']);
            }
        } else {
            $query->where('user_id', $usuario->id);
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate(20),
            'message' => 'Denúncias listadas com sucesso.',
        ]);
    }

    public function store(StoreDenunciaRequest $request)
    {
        $dados = $request->validated();
        $denuncia = new Denuncia();
        $denuncia->user_id = $request->user()->id;
        $denuncia->categoria = $dados['categoria'];
        $denuncia->descricao = $dados['descricao'];
        $path = $request->file('foto')->store('denuncias', 'public');
        $denuncia->foto_url = '/storage/' . $path;
        $denuncia->latitude = $dados['latitude'];
        $denuncia->longitude = $dados['longitude'];
        $denuncia->status = 'recebida';
        $denuncia->save();

        return response()->json([
            'success' => true,
            'data' => $denuncia->load('user'),
            'message' => 'Denúncia criada com sucesso.',
        ], 201);
    }

    public function show(string $id)
    {
        $denuncia = Denuncia::with('user')->find($id);

        if (! $denuncia) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Denúncia não encontrada.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $denuncia,
            'message' => 'Detalhes da denúncia retornados com sucesso.',
        ]);
    }

    public function updateStatus(Request $request, string $id)
    {
        $usuario = $request->user();
        if (! $usuario->isPerfil('gestor')) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        $dados = $request->validate([
            'status' => ['required', Rule::in(['recebida', 'em_analise', 'resolvida', 'cancelada'])],
        ]);

        $denuncia = Denuncia::find($id);
        if (! $denuncia) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Denúncia não encontrada.',
            ], 404);
        }

        $denuncia->status = $dados['status'];
        $denuncia->save();

        return response()->json([
            'success' => true,
            'data' => $denuncia->load('user'),
            'message' => 'Status da denúncia atualizado com sucesso.',
        ]);
    }
}
