<?php

use App\Models\PrebuiltPcComponent;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComponentController;
use App\Http\Controllers\Api\PrebuiltPcController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ContactController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

// Route::get('/products', [ProductController::class, 'index']);

// Публичные роуты
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1');

Route::get('/components', [ComponentController::class, 'index']);
Route::get('/components/{id}', [ComponentController::class, 'show']);

Route::get('/prebuilt-pcs', [PrebuiltPcController::class, 'index']);
Route::get('/prebuilt-pcs/exclusive', [PrebuiltPcController::class, 'exclusive']);
Route::get('/prebuilt-pcs/{slug}', [PrebuiltPcController::class, 'show']);

// Публичный роут для получения всех тегов
Route::get('/tags', function() {
    return response()->json(\App\Models\Tag::select('id', 'name', 'slug')->get());
});

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrderController;

// Защищённые роуты (только для авторизованных)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Заказы пользователя
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);

    // Управление пользователями (только admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::put('/users/{user}/role', [UserController::class, 'updateRole']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        
        // Route::get('/admin/dashboard', fn() => response()->json(['msg' => 'Admin panel']));
        // Здесь будут CRUD для компонентов, категорий и т.д.
        // Простой CRUD для справочников
        Route::get('/admin/refs/{type}', [ComponentController::class, 'getRefs']);
        Route::post('/admin/refs/{type}', [ComponentController::class, 'storeRef']);
        Route::put('/admin/refs/{type}/{id}', [ComponentController::class, 'updateRef']);
        Route::delete('/admin/refs/{type}/{id}', [ComponentController::class, 'deleteRef']);
    });

    // Менеджер + Админ
    Route::middleware('role:manager')->group(function () {
        // Заказы (админка)
        Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
        Route::get('/admin/orders/{id}', [OrderController::class, 'adminShow']);
        Route::patch('/admin/orders/{orderId}/status', [OrderController::class, 'updateStatus']);
        Route::patch('/admin/orders/{orderId}/items/{itemId}/status', [OrderController::class, 'updateItemStatus']);
        
        // ✅ Обновление и удаление компонентов
        Route::patch('admin/components/{component}', [ComponentController::class, 'update']);
        Route::delete('admin/components/{component}', [ComponentController::class, 'destroy']);

        // ✅ Экспорт компонентов в Excel
        Route::get('admin/components/export', [ComponentController::class, 'export']);

        Route::get('admin/components/{component}/edit', [ComponentController::class, 'edit']);
        Route::put('admin/components/{component}', [ComponentController::class, 'updateFull']);

        Route::get('admin/components/create', [ComponentController::class, 'createRefs']);
        Route::post('admin/components', [ComponentController::class, 'storeFull']);

        // ✅ CRUD для готовых ПК
        Route::get('admin/prebuilt-pcs', [PrebuiltPcController::class, 'adminIndex']);
        Route::post('admin/prebuilt-pcs', [PrebuiltPcController::class, 'store']);
        Route::get('admin/prebuilt-pcs/{id}/edit', [PrebuiltPcController::class, 'edit']);
        Route::put('admin/prebuilt-pcs/{id}', [PrebuiltPcController::class, 'update']);
        Route::delete('admin/prebuilt-pcs/{id}', [PrebuiltPcController::class, 'destroy']);
    });
});

// Публичные роуты корзины (доступны всем)
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart', [CartController::class, 'store']);
Route::put('/cart/{id}', [CartController::class, 'update']); // Редактирование сборки
Route::delete('/cart/{id}', [CartController::class, 'destroy']);