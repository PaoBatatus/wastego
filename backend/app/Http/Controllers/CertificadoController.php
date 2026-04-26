<?php

namespace App\Http\Controllers;

use App\Models\Certificado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CertificadoController extends Controller
{
    public function index(Request $request)
    {
        $usuario = $request->user();
        if (! $usuario) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $query = Certificado::query()->with(['empresa', 'cooperativa']);

        if ($usuario->isPerfil('gestor')) {
            // Gestor visualiza todos os certificados.
        } elseif ($usuario->isPerfil('empresa')) {
            $query->where('empresa_id', $usuario->id);
        } else {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate(20),
            'message' => 'Certificados listados com sucesso.',
        ]);
    }

    public function show(Request $request, string $id)
    {
        $usuario = $request->user();
        if (! $usuario) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $certificado = Certificado::with(['empresa', 'cooperativa', 'anuncio'])->find($id);
        if (! $certificado) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Certificado não encontrado.',
            ], 404);
        }

        if (! $this->podeAcessarCertificado($usuario, $certificado)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este certificado.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $certificado,
            'message' => 'Detalhes do certificado retornados com sucesso.',
        ]);
    }

    public function download(Request $request, string $id)
    {
        $usuario = $request->user();
        if (! $usuario) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $certificado = Certificado::find($id);
        if (! $certificado) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Certificado não encontrado.',
            ], 404);
        }

        if (! $this->podeAcessarCertificado($usuario, $certificado)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este certificado.',
            ], 403);
        }

        if (! $certificado->pdf_url) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Arquivo PDF do certificado não disponível.',
            ], 404);
        }

        $caminhoArquivo = ltrim(str_replace('/storage/', '', $certificado->pdf_url), '/');

        if (! Storage::disk('public')->exists($caminhoArquivo)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Arquivo PDF do certificado não encontrado.',
            ], 404);
        }

        return Storage::disk('public')->download(
            $caminhoArquivo,
            'CDF-'.$certificado->numero_certificado.'.pdf'
        );
    }

    private function podeAcessarCertificado($usuario, Certificado $certificado): bool
    {
        if ($usuario->isPerfil('gestor')) {
            return true;
        }

        if ($usuario->isPerfil('empresa') && $certificado->empresa_id === $usuario->id) {
            return true;
        }

        if ($usuario->isPerfil('cooperativa') && $certificado->cooperativa_id === $usuario->id) {
            return true;
        }

        return false;
    }
}
