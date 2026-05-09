<?php

use App\Models\PrebuiltPcComponent;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComponentController;
use App\Http\Controllers\Api\PrebuiltPcController;
use App\Http\Controllers\Api\CartController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

// Route::get('/products', [ProductController::class, 'index']);

// Публичные роуты
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/components', [ComponentController::class, 'index']);
Route::get('/components/{id}', [ComponentController::class, 'show']);

Route::get('/prebuilt-pcs', [PrebuiltPcController::class, 'index']);
Route::get('/prebuilt-pcs/{slug}', [PrebuiltPcController::class, 'show']);

// Защищённые роуты
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']); // Редактирование сборки
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);

    // Админка (только admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', fn() => response()->json(['msg' => 'Admin panel']));
        // Здесь будут CRUD для компонентов, категорий и т.д.
        // Простой CRUD для справочников
        Route::get('/admin/refs/{type}', [ComponentController::class, 'getRefs']);
        Route::post('/admin/refs/{type}', [ComponentController::class, 'storeRef']);
        Route::put('/admin/refs/{type}/{id}', [ComponentController::class, 'updateRef']);
        Route::delete('/admin/refs/{type}/{id}', [ComponentController::class, 'deleteRef']);
    });

    // Менеджер + Админ
    Route::middleware('role:manager')->group(function () {
        Route::get('/manager/orders', fn() => response()->json(['msg' => 'Manager panel']));
        
        // ✅ Обновление и удаление компонентов
        Route::patch('admin/components/{component}', [ComponentController::class, 'update']);
        Route::delete('admin/components/{component}', [ComponentController::class, 'destroy']);

        Route::get('admin/components/{component}/edit', [ComponentController::class, 'edit']);
        Route::put('admin/components/{component}', [ComponentController::class, 'updateFull']);

        Route::get('admin/components/create', [ComponentController::class, 'createRefs']);
        Route::post('admin/components', [ComponentController::class, 'storeFull']);
    });
});