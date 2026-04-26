<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificarPerfil
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $perfilPermitido): Response
    {
        $usuario = $request->user();

        if (! $usuario || ! $usuario->isPerfil($perfilPermitido)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Acesso não autorizado para este perfil',
            ], 403);
        }

        return $next($request);
    }
}
