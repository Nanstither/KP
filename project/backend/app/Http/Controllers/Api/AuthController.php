<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // Регистрация
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_USER, // По умолчанию — пользователь
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        // Слияние корзин после регистрации
        $this->mergeGuestCart($request, $user);

        return response()->json(['user' => $user], 201);
    }

    // Вход
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Неверный email или пароль'], 401);
        }

        $request->session()->regenerate();
        
        // Слияние корзин после входа
        $this->mergeGuestCart($request, Auth::user());

        return response()->json(['user' => Auth::user()]);
    }

    /**
     * Переносит товары из гостевой корзины (по session_id) в корзину пользователя.
     */
    private function mergeGuestCart(Request $request, User $user)
    {
        $sessionId = $request->header('X-Session-ID');
        
        if (!$sessionId) {
            return; // Нет гостевой корзины для переноса
        }

        // Находим гостевую корзину
        $guestCart = Cart::where('session_id', $sessionId)->first();
        
        if (!$guestCart) {
            return; // Гостевая корзина не найдена
        }

        // Находим или создаем корзину пользователя
        $userCart = Cart::firstOrCreate(['user_id' => $user->id]);

        // Переносим товары
        DB::transaction(function () use ($guestCart, $userCart) {
            foreach ($guestCart->items as $item) {
                // Создаем копию товара в корзине пользователя
                $newItem = CartItem::create([
                    'cart_id'     => $userCart->id,
                    'type'        => $item->type,
                    'name'        => $item->name,
                    'total_price' => $item->total_price,
                    'prebuilt_id' => $item->prebuilt_id,
                ]);

                // Если это сборка (custom), переносим компоненты
                if ($item->type === 'custom') {
                    foreach ($item->components as $component) {
                        $newItem->components()->create([
                            'component_id'   => $component->component_id,
                            'price_snapshot' => $component->price_snapshot,
                            'quantity'       => $component->quantity,
                        ]);
                    }
                }
                
                // Удаляем старый товар из гостевой корзины (опционально, можно удалять всю корзину в конце)
                $item->delete(); 
            }
            
            // Удаляем пустую гостевую корзину
            $guestCart->delete();
        });
    }

    // Выход
    public function logout(Request $request){
        // Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Выход выполнен']);
    }

    // Текущий пользователь
    public function me(Request $request){
        return response()->json(['user' => $request->user()]);
    }

    // Обновление профиля
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json(['user' => $user, 'message' => 'Профиль обновлен']);
    }
}