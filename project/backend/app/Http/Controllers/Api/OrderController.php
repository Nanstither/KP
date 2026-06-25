<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderComponent;
use App\Models\Component;
use App\Models\PrebuiltPc;
use App\Models\CartItemComponent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ArchiveOrdersExport;

class OrderController extends Controller
{
    private const ARCHIVE_STATUSES = ['delivered', 'cancelled'];

    private function applyOrderScope($query, ?string $scope): void
    {
        if ($scope === 'active') {
            $query->whereNotIn('status', self::ARCHIVE_STATUSES);
        } elseif ($scope === 'archive') {
            $query->whereIn('status', self::ARCHIVE_STATUSES);
        }
    }

    /**
     * Get role name by ID
     */
    private function getRoleName($role)
    {
        $roles = [
            0 => 'Процессор',
            1 => 'Материнская плата',
            2 => 'Видеокарта',
            3 => 'Оперативная память',
            4 => 'Накопитель',
            5 => 'Блок питания',
            6 => 'Корпус',
            7 => 'Охлаждение',
        ];
        
        // Если роль передана как строка (cpu, gpu, etc.)
        if (is_string($role)) {
            $stringRoles = [
                'cpu' => 'Процессор',
                'motherboard' => 'Материнская плата',
                'gpu' => 'Видеокарта',
                'ram' => 'Оперативная память',
                'storage' => 'Накопитель',
                'psu' => 'Блок питания',
                'case' => 'Корпус',
                'cooler' => 'Охлаждение',
            ];
            return $stringRoles[$role] ?? 'Компонент';
        }
        
        return $roles[$role] ?? 'Компонент';
    }

    private function mapOrderItemComponents($components)
    {
        if (!$components || !is_object($components) || !method_exists($components, 'map')) {
            return [];
        }

        return $components->map(function ($oc) {
            return [
                'id' => $oc->id,
                'component_id' => $oc->component_id,
                'price_snapshot' => $oc->price_snapshot,
                'quantity' => $oc->quantity,
                'role' => $oc->role,
                'component' => $oc->component ? [
                    'id' => $oc->component->id,
                    'model' => $oc->component->model,
                    'price' => $oc->component->price,
                    'category' => $oc->component->category ? [
                        'slug' => $oc->component->category->slug,
                        'name' => $oc->component->category->name,
                    ] : null,
                ] : null,
            ];
        });
    }

    private function attachComponentsDataToItem($item): void
    {
        $components = $item->getRelation('components');
        $item->components_data = $this->mapOrderItemComponents($components);
    }

    /**
     * Display a listing of user's orders.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Order::with([
            'items.prebuiltPc',
            'items.components.component.category',
        ]);
        
        if ($user) {
            $query->where('user_id', $user->id);
        } else {
            $query->where('session_id', $request->session_id);
        }

        $this->applyOrderScope($query, $request->query('scope'));
        
        $orders = $query->orderBy('created_at', 'desc')->get();
        
        // Добавляем components_data вручную
        $orders->transform(function($order) {
            $order->items->transform(function($item) {
                $this->attachComponentsDataToItem($item);
                return $item;
            });
            return $order;
        });
        
        return response()->json($orders);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:20',
            'recipient_email' => 'nullable|email|max:255',
            'delivery_address' => 'required|string',
            'delivery_type' => 'required|in:pickup,courier',
            'cdek_code' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.cart_item_id' => 'nullable|integer|exists:cart_items,id',
            'items.*.prebuilt_pc_id' => 'nullable|exists:prebuilt_pcs,id',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();
        $totalAmount = collect($validated['items'])->sum(fn($item) => $item['price'] * $item['quantity']);

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id' => $user?->id,
                'session_id' => $request->session_id,
                'status' => 'paid', // Сразу оплачен
                'recipient_name' => $validated['recipient_name'],
                'recipient_phone' => $validated['recipient_phone'],
                'recipient_email' => $validated['recipient_email'],
                'delivery_address' => $validated['delivery_address'],
                'delivery_type' => $validated['delivery_type'],
                'cdek_code' => $validated['cdek_code'],
                'total_amount' => $totalAmount,
                'paid_at' => now(), // Время оплаты
            ]);

            foreach ($validated['items'] as $itemData) {
                $components = $itemData['components'] ?? null;
                $cartItemId = $itemData['cart_item_id'] ?? null;
                
                // Отладка: логируем данные компонентов
                \Log::info('Order item components:', ['item' => $itemData['name'], 'components' => $components, 'cart_item_id' => $cartItemId]);
                
                // Если компоненты не переданы явно, но есть cart_item_id, загружаем из cart_item_components
                if ((!$components || (is_array($components) && count($components) === 0)) && $cartItemId) {
                    $cartItemComponents = CartItemComponent::with('component.category')
                        ->where('cart_item_id', $cartItemId)
                        ->get();
                    
                    if ($cartItemComponents->isNotEmpty()) {
                        $components = [];
                        foreach ($cartItemComponents as $cic) {
                            $role = $cic->component?->category?->slug ?? $cic->role;
                            $components[] = [
                                'component_id' => $cic->component_id,
                                'price_snapshot' => $cic->price_snapshot,
                                'quantity' => $cic->quantity ?? 1,
                                'role' => $role,
                                'model' => $cic->component?->model,
                            ];
                        }
                        \Log::info('Loaded components from cart_item_components:', ['components' => $components]);
                    }
                }
                
                // Если указан prebuilt_pc_id и компоненты не переданы явно, загружаем их из БД
                if ((!$components || (is_array($components) && count($components) === 0)) && !empty($itemData['prebuilt_pc_id'])) {
                    $pc = PrebuiltPc::with('components')->find($itemData['prebuilt_pc_id']);
                    if ($pc) {
                        $components = [];
                        foreach ($pc->components as $component) {
                            $role = $component->pivot->role;
                            $components[] = [
                                'component_id' => $component->id,
                                'price_snapshot' => $component->price,
                                'quantity' => 1,
                                'role' => $role,
                                'model' => $component->model,
                            ];
                        }
                    }
                }
                
                $componentsForDb = []; // Для сохранения в таблицу order_components
                
                if (is_array($components) && count($components) > 0) {
                    foreach ($components as $compData) {
                        \Log::info('Processing component:', ['compData' => $compData]);
                        
                        // Формат данных с фронта: { component_id, price, quantity, role }
                        if (isset($compData['component_id'])) {
                            $componentId = $compData['component_id'];
                            $price = $compData['price'] ?? $compData['price_snapshot'] ?? 0;
                            $quantity = $compData['quantity'] ?? 1;

                            $component = \App\Models\Component::with('category')->find($componentId);
                            if ($component) {
                                $role = $component->category?->slug;

                                $componentsForDb[] = [
                                    'component_id' => $componentId,
                                    'price_snapshot' => $price,
                                    'quantity' => $quantity,
                                    'role' => $role,
                                ];
                            }
                        }
                        // Старый формат данных из корзины: { component: {...}, role: 0, ...}
                        elseif (isset($compData['component'])) {
                            $componentId = $compData['component']['id'];
                            $price = $compData['price_snapshot'] ?? $compData['component']['price'] ?? 0;

                            $component = \App\Models\Component::with('category')->find($componentId);
                            if ($component) {
                                $role = $component->category?->slug;

                                $componentsForDb[] = [
                                    'component_id' => $componentId,
                                    'price_snapshot' => $price,
                                    'quantity' => 1,
                                    'role' => $role,
                                ];
                            }
                        }
                    }
                }
                
                \Log::info('Components for DB:', ['componentsForDb' => $componentsForDb]);
                
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'prebuilt_pc_id' => $itemData['prebuilt_pc_id'] ?? null,
                    'name' => $itemData['name'],
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                    'status' => 'pending',
                ]);
                
                // Сохраняем компоненты в отдельную таблицу
                foreach ($componentsForDb as $compDb) {
                    OrderComponent::create([
                        'order_item_id' => $orderItem->id,
                        'component_id' => $compDb['component_id'],
                        'price_snapshot' => $compDb['price_snapshot'],
                        'quantity' => $compDb['quantity'],
                        'role' => $compDb['role'] ?? null,
                    ]);
                }
            }

            DB::commit();

            // Загружаем заказ с данными о компонентах
            $order->load('items.components.component');
            
            // Добавляем components_data вручную для ответа
            $order->items->transform(function($item) {
                // Проверяем, что relation загружен и это коллекция
                $components = $item->components;
                
                // Если components null или не коллекция, возвращаем пустой массив
                if (!$components || !($components instanceof \Illuminate\Support\Collection)) {
                    $item->components_data = [];
                    return $item;
                }
                
                $item->components_data = $components->map(function($oc) {
                    return [
                        'id' => $oc->id,
                        'component_id' => $oc->component_id,
                        'price_snapshot' => $oc->price_snapshot,
                        'quantity' => $oc->quantity,
                        'component' => $oc->component ? [
                            'id' => $oc->component->id,
                            
                            'model' => $oc->component->model,
                            'price' => $oc->component->price,
                        ] : null,
                    ];
                });
                return $item;
            });

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show($id)
    {
        $user = Auth::user();
        
        $order = Order::with('items.components.component', 'items.prebuiltPc.components')->findOrFail($id);
        
        // Проверка прав доступа
        if ($user && $order->user_id !== $user->id && !$user->hasRole(['admin', 'manager'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        if (!$user && $order->session_id !== request()->session_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Добавляем components_data вручную
        $order->items->transform(function($item) {
            $components = $item->getRelation('components');
            if (!$components || !is_object($components) || !method_exists($components, 'map')) {
                $item->components_data = [];
                return $item;
            }
            
            $item->components_data = $components->map(function($oc) {
                return [
                    'id' => $oc->id,
                    'component_id' => $oc->component_id,
                    'price_snapshot' => $oc->price_snapshot,
                    'quantity' => $oc->quantity,
                    'component' => $oc->component ? [
                        'id' => $oc->component->id,
                        
                        'model' => $oc->component->model,
                        'price' => $oc->component->price,
                    ] : null,
                ];
            });
            return $item;
        });
        
        return response()->json($order);
    }

    /**
     * Update order item status (for admin/manager).
     */
    public function updateItemStatus(Request $request, $orderId, $itemId)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole(['admin', 'manager'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,ready,shipped,delivered',
        ]);

        $orderItem = OrderItem::where('order_id', $orderId)->findOrFail($itemId);
        $orderItem->update(['status' => $validated['status']]);

        // Если все элементы готовы, обновляем статус заказа
        $order = Order::findOrFail($orderId);
        $allReady = $order->items()->where('status', '!=', 'ready')->count() === 0;
        
        if ($allReady && $order->status === 'paid') {
            $order->update(['status' => 'preparing']);
        }

        return response()->json([
            'message' => 'Status updated successfully',
            'item' => $orderItem->load('component'),
            'order' => $order->fresh(['items.components.component', 'items.prebuiltPc.components']),
        ]);
    }

    /**
     * Update order status (for admin/manager).
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user || !$user->hasRole(['admin', 'manager'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,paid,preparing,shipped,delivered,cancelled',
        ]);

        try {
            DB::transaction(function () use ($id, $validated) {
                $order = Order::lockForUpdate()->findOrFail($id);
                $order->update(['status' => $validated['status']]);

                if ($validated['status'] === 'paid' && !$order->paid_at) {
                    $order->update(['paid_at' => now()]);
                }

                if ($validated['status'] === 'delivered' && !$order->stock_deducted_at) {
                    $this->deductStockForOrder($order);
                }
            });
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $order = Order::with('items.components.component')->findOrFail($id);
        $order->items->transform(function ($item) {
            $this->attachComponentsDataToItem($item);
            return $item;
        });

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order,
        ]);
    }

    private function deductStockForOrder(Order $order): void
    {
        if ($order->stock_deducted_at) {
            return;
        }

        $order->load('items.components');
        $quantities = [];

        foreach ($order->items as $item) {
            foreach ($item->components as $orderComponent) {
                if (!$orderComponent->component_id) {
                    continue;
                }
                $qty = $orderComponent->quantity ?? 1;
                $quantities[$orderComponent->component_id] =
                    ($quantities[$orderComponent->component_id] ?? 0) + $qty;
            }
        }

        if (empty($quantities)) {
            $order->update(['stock_deducted_at' => now()]);
            return;
        }

        foreach ($quantities as $componentId => $qty) {
            $component = Component::lockForUpdate()->find($componentId);
            if (!$component) {
                throw new \RuntimeException("Компонент #{$componentId} не найден");
            }
            if ($component->stock < $qty) {
                throw new \RuntimeException(
                    "Недостаточно на складе: {$component->model} (нужно {$qty}, есть {$component->stock})"
                );
            }
        }

        foreach ($quantities as $componentId => $qty) {
            Component::where('id', $componentId)->decrement('stock', $qty);
        }

        $order->update(['stock_deducted_at' => now()]);
    }

    /**
     * Admin: Get all orders with pagination and filters.
     */
    public function adminIndex(Request $request)
    {
        $query = Order::with('items.components.component', 'items.prebuiltPc.components', 'user');
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $this->applyOrderScope($query, $request->query('scope'));
        
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('recipient_name', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function($uq) use ($request) {
                      $uq->where('name', 'like', "%{$request->search}%");
                  });
            });
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(20);
        
        // Добавляем components_data вручную
        $orders->getCollection()->transform(function($order) {
            $order->items->transform(function($item) {
                $components = $item->getRelation('components');
                if (!$components || !is_object($components) || !method_exists($components, 'map')) {
                    $item->components_data = [];
                    return $item;
                }
                
                $item->components_data = $components->map(function($oc) {
                    return [
                        'id' => $oc->id,
                        'component_id' => $oc->component_id,
                        'price_snapshot' => $oc->price_snapshot,
                        'quantity' => $oc->quantity,
                        'component' => $oc->component ? [
                            'id' => $oc->component->id,
                            
                            'model' => $oc->component->model,
                            'price' => $oc->component->price,
                        ] : null,
                    ];
                });
                return $item;
            });
            return $order;
        });
        
        return response()->json($orders);
    }

    /**
     * Admin: Show order details.
     */
    public function adminShow($id)
    {
        $order = Order::with('items.components.component.category', 'items.prebuiltPc.components', 'user')->findOrFail($id);
        
        // Добавляем components_data вручную
        $order->items->transform(function($item) {
            $components = $item->getRelation('components');
            if (!$components || !is_object($components) || !method_exists($components, 'map')) {
                $item->components_data = [];
                return $item;
            }
            
            $item->components_data = $components->map(function($oc) {
                return [
                    'id' => $oc->id,
                    'component_id' => $oc->component_id,
                    'price_snapshot' => $oc->price_snapshot,
                    'quantity' => $oc->quantity,
                    'role' => $oc->role,
                    'component' => $oc->component ? [
                        'id' => $oc->component->id,
                        'model' => $oc->component->model,
                        'price' => $oc->component->price,
                        'category' => $oc->component->category ? [
                            'slug' => $oc->component->category->slug,
                            'name' => $oc->component->category->name,
                        ] : null,
                    ] : null,
                ];
            });
            return $item;
        });
        
        return response()->json(['order' => $order]);
    }

    /**
     * Экспорт архива доставленных заказов в Excel.
     */
    public function exportArchive(Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->hasRole(['admin', 'manager'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = Order::with('items.components')
            ->where('status', 'delivered');

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return Excel::download(
            new ArchiveOrdersExport($orders),
            'archive-orders-' . date('Y-m-d') . '.xlsx'
        );
    }
}
