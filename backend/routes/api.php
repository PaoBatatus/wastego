<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CertificadoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DenunciaController;
use App\Http\Controllers\EcopontoController;
use App\Http\Controllers\PontoVerdeController;
use App\Http\Controllers\ResiduoController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::prefix('auth')->middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    Route::prefix('residuos')->group(function (): void {
        Route::get('/', [ResiduoController::class, 'index']);

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::get('/meus', [ResiduoController::class, 'meus']);
            Route::post('/', [ResiduoController::class, 'store']);
            Route::put('/{id}', [ResiduoController::class, 'update']);
            Route::delete('/{id}', [ResiduoController::class, 'destroy']);
        });

        Route::get('/{id}', [ResiduoController::class, 'show']);
    });

    Route::prefix('denuncias')->middleware('auth:sanctum')->group(function (): void {
        Route::get('/', [DenunciaController::class, 'index']);
        Route::post('/', [DenunciaController::class, 'store']);
        Route::get('/{id}', [DenunciaController::class, 'show']);
        Route::put('/{id}/status', [DenunciaController::class, 'updateStatus']);
    });

    Route::prefix('ecopontos')->group(function (): void {
        Route::get('/', [EcopontoController::class, 'index']);
        Route::get('/proximos', [EcopontoController::class, 'proximos']);
        Route::get('/{id}', [EcopontoController::class, 'show']);
    });

    Route::prefix('ecopontos')->middleware('auth:sanctum')->group(function (): void {
        Route::post('/', [EcopontoController::class, 'store']);
        Route::put('/{id}', [EcopontoController::class, 'update']);
        Route::delete('/{id}', [EcopontoController::class, 'destroy']);
    });

    Route::prefix('pontos')->middleware('auth:sanctum')->group(function (): void {
        Route::get('/', [PontoVerdeController::class, 'saldo']);
        Route::get('/historico', [PontoVerdeController::class, 'historico']);
        Route::post('/resgatar', [PontoVerdeController::class, 'resgatar']);
    });

    Route::prefix('certificados')->middleware('auth:sanctum')->group(function (): void {
        Route::get('/', [CertificadoController::class, 'index']);
        Route::get('/{id}', [CertificadoController::class, 'show']);
        Route::get('/{id}/download', [CertificadoController::class, 'download']);
    });

    Route::prefix('dashboard')->middleware('auth:sanctum')->group(function (): void {
        Route::get('/resumo', [DashboardController::class, 'resumo']);
        Route::get('/residuos-categoria', [DashboardController::class, 'residuosPorCategoria']);
        Route::get('/denuncias-localizacao', [DashboardController::class, 'denunciasPorLocalizacao']);
        Route::get('/volume-mensal', [DashboardController::class, 'volumeMensal']);
    });
});
