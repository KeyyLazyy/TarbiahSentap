<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Public routes (no authentication required)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify-totp', [AuthController::class, 'verifyTotp']);
Route::get('/auth/activate/{id}/{hash}', [AuthController::class, 'activate'])->name('activate');
Route::post('/auth/verify-device', [AuthController::class, 'verifyDevice']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'getCurrentUser']);
    
    // TOTP routes (admin only)
    Route::post('/auth/totp/setup', [AuthController::class, 'setupTotp']);
    Route::post('/auth/totp/confirm', [AuthController::class, 'confirmTotp']);
    Route::post('/auth/totp/disable', [AuthController::class, 'disableTotp']);
});
