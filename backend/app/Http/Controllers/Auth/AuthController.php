<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $dados = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'senha' => ['required', 'string', 'min:8'],
            'perfil' => ['required', Rule::in(['cidadao', 'empresa', 'cooperativa', 'gestor'])],
            'nome_empresa' => ['nullable', 'string', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:30'],
        ]);

        $usuario = User::create([
            'name' => $dados['nome'],
            'email' => $dados['email'],
            'password' => $dados['senha'],
            'perfil' => $dados['perfil'],
            'nome_empresa' => $dados['nome_empresa'] ?? null,
            'telefone' => $dados['telefone'] ?? null,
            'ativo' => true,
        ]);

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'usuario' => $usuario,
                'token' => $token,
            ],
            'message' => 'Usuario registrado com sucesso.',
        ], 201);
    }

    public function login(Request $request)
    {
        $dados = $request->validate([
            'email' => ['required', 'string', 'email'],
            'senha' => ['required', 'string'],
        ]);

        $usuario = User::where('email', $dados['email'])->first();

        if (! $usuario || ! Hash::check($dados['senha'], $usuario->password)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Credenciais invalidas.',
            ], 401);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'usuario' => [
                    'id' => $usuario->id,
                    'name' => $usuario->name,
                    'email' => $usuario->email,
                    'perfil' => $usuario->perfil,
                    'nome_empresa' => $usuario->nome_empresa,
                    'telefone' => $usuario->telefone,
                    'ativo' => $usuario->ativo,
                ],
                'token' => $token,
            ],
            'message' => 'Login realizado com sucesso.',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Logout realizado com sucesso.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
            'message' => 'Dados do usuario autenticado.',
        ]);
    }
}
