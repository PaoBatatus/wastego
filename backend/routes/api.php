<?php

use App\Http\Controllers\Auth\AuthController;
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
        Route::get('/{id}', [ResiduoController::class, 'show']);
    });

    Route::prefix('residuos')->middleware('auth:sanctum')->group(function (): void {
        Route::post('/', [ResiduoController::class, 'store']);
        Route::put('/{id}', [ResiduoController::class, 'update']);
        Route::delete('/{id}', [ResiduoController::class, 'destroy']);
        Route::get('/meus', [ResiduoController::class, 'meus']);
    });
});
