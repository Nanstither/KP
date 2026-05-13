<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Cart, CartItem, CartItemComponent, Component, PrebuiltPc}; // Убедись, что PrebuiltPc модель существует
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Получить корзину текущего пользователя или гостя
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $sessionId = $request->header('X-Session-ID');
        
        if ($user) {
            // Авторизованный пользователь: ищем корзину по user_id
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        } else {
            // Гость: ищем корзину по session_id или создаем новую
            if (!$sessionId) {
                return response()->json(['message' => 'Session ID required for guest'], 400);
            }
            $cart = Cart::firstOrCreate(['session_id' => $sessionId]);
        }

        // Загружаем элементы корзины + компоненты внутри них (для сборок)
        // Связь component нужна, чтобы на фронте показать картинку и название детали
        $cart->load([
            'items' => function ($query) {
                $query->with([
                    'components' => function ($q) {
                        $q->with('component:id,model,image,price');
                    }
                ]);
            }
        ]);

        return response()->json($cart);
    }

    /**
     * Добавить товар в корзину
     * Поддерживает: Одиночный компонент, Готовый ПК, Сборку из конфигуратора
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:component,prebuilt,custom',
            'component_id' => 'required_if:type,component|exists:components,id',
            'prebuilt_id'  => 'required_if:type,prebuilt|exists:prebuilt_pcs,id',
            'name'         => 'nullable|string',
            'components'   => 'required_if:type,custom|array',
        ]);

        $user = auth()->user();
        $sessionId = $request->header('X-Session-ID');
        
        if ($user) {
            // Авторизованный пользователь
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        } else {
            // Гость
            if (!$sessionId) {
                return response()->json(['message' => 'Session ID required for guest'], 400);
            }
            $cart = Cart::firstOrCreate(['session_id' => $sessionId]);
        }
        
        $type = $request->input('type');

        return DB::transaction(function () use ($request, $cart, $type) {
            
            // 🔵 Обычный компонент (если вдруг пригодится)
            if ($type === 'component') {
                $comp = Component::findOrFail($request->component_id);
                return CartItem::create([
                    'cart_id' => $cart->id,
                    'type'    => 'component',
                    'name'    => $comp->model,
                    'total_price' => $comp->price,
                ]);
            }

            // 🟢 Готовый ПК (нельзя редактировать, фиксированная цена)
            if ($type === 'prebuilt') {
                $pc = PrebuiltPc::findOrFail($request->prebuilt_id);
                if (!$pc->is_active) {
                    throw new \Exception("Данный ПК временно недоступен для заказа");
                }

                return CartItem::create([
                    'cart_id'     => $cart->id,
                    'type'        => 'prebuilt',
                    'name'        => $pc->name,
                    'total_price' => $pc->price, // Цена фиксируется из БД
                    'prebuilt_id' => $pc->id,
                ]);
            }

            // 🟡 Сборка из конфигуратора (можно редактировать)
            if ($type === 'custom') {
                $ids = $request->input('components', []);
                $components = Component::whereIn('id', $ids)->get();
                
                $totalPrice = 0;
                foreach ($components as $c) {
                    $totalPrice += $c->price;
                }

                $cartItem = CartItem::create([
                    'cart_id'     => $cart->id,
                    'type'        => 'custom',
                    'name'        => $request->input('name', 'Моя сборка'),
                    'total_price' => $totalPrice,
                ]);

                foreach ($components as $c) {
                    $cartItem->components()->create([
                        'component_id'   => $c->id,
                        'price_snapshot' => $c->price,
                        'quantity'       => 1
                    ]);
                }
                return $cartItem;
            }
        });
    }

    /**
     * Редактирование сборки из конфигуратора (добавить/убрать деталь)
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $sessionId = $request->header('X-Session-ID');
        
        $query = CartItem::where('id', $id);
        
        if ($user) {
            $query->whereHas('cart', fn($q) => $q->where('user_id', $user->id));
        } else {
            if (!$sessionId) {
                return response()->json(['message' => 'Session ID required'], 400);
            }
            $query->whereHas('cart', fn($q) => $q->where('session_id', $sessionId));
        }
        
        $cartItem = $query->firstOrFail();

        // Разрешаем редактировать ТОЛЬКО кастомные сборки
        if ($cartItem->type !== 'custom') {
            return response()->json(['message' => 'Этот товар нельзя редактировать'], 403);
        }

        $request->validate([
            'components' => 'required|array', // Новый список ID компонентов
        ]);

        return DB::transaction(function () use ($request, $cartItem) {
            $newComponentIds = $request->input('components');
            
            // Получаем новые компоненты и считаем цену
            $components = Component::whereIn('id', $newComponentIds)->get();
            $newTotalPrice = 0;
            $dataToSync = [];

            foreach ($components as $comp) {
                $newTotalPrice += $comp->price;
                // Если компонента еще нет в связях, добавим snapshot
                // Если он уже есть, Eloquent сам обновит quantity, но цену лучше перепроверить
                $dataToSync[$comp->id] = [
                    'price_snapshot' => $comp->price, 
                    'quantity' => 1
                ];
            }

            // sync обновит связи: удалит лишние, добавит новые, обновит pivot данные
            $cartItem->components()->sync($dataToSync);

            // Обновляем общую цену и имя (если нужно)
            $cartItem->update([
                'total_price' => $newTotalPrice,
                'name'        => $request->input('name', $cartItem->name)
            ]);

            return response()->json($cartItem);
        });
    }

    /**
     * Удаление товара из корзины
     */
    public function destroy($id, Request $request)
    {
        $user = auth()->user();
        $sessionId = $request->header('X-Session-ID');
        
        $query = CartItem::where('id', $id);
        
        if ($user) {
            $query->whereHas('cart', fn($q) => $q->where('user_id', $user->id));
        } else {
            if (!$sessionId) {
                return response()->json(['message' => 'Session ID required'], 400);
            }
            $query->whereHas('cart', fn($q) => $q->where('session_id', $sessionId));
        }
        
        $cartItem = $query->firstOrFail();

        $cartItem->delete(); // Каскадное удаление удалит и компоненты сборки
        
        return response()->json(['message' => 'Товар удален']);
    }
}