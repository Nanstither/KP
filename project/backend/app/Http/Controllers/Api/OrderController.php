<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderComponent;
use App\Models\PrebuiltPc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
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
        
        return $roles[$role] ?? 'Компонент';
    }

    /**
     * Display a listing of user's orders.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Order::with('items.prebuiltPc.components', 'items.components.component');
        
        if ($user) {
            $query->where('user_id', $user->id);
        } else {
            $query->where('session_id', $request->session_id);
        }
        
        $orders = $query->orderBy('created_at', 'desc')->get();
        
        // Добавляем components_data вручную
        $orders->transform(function($order) {
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
                            'name' => $oc->component->name,
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
            'items.*.prebuilt_pc_id' => 'nullable|exists:prebuilt_pcs,id',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.components' => 'nullable|array',
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
                
                // Преобразуем компоненты в формат для отображения: ['Процессор' => 'Model Name', ...]
                $componentsFormatted = [];
                $componentsForDb = []; // Для сохранения в таблицу order_components
                
                if (is_array($components) && count($components) > 0) {
                    foreach ($components as $compData) {
                        // Формат данных с фронта: { component_id, price, quantity }
                        if (isset($compData['component_id'])) {
                            $componentId = $compData['component_id'];
                            $price = $compData['price'] ?? $compData['price_snapshot'] ?? 0;
                            $quantity = $compData['quantity'] ?? 1;
                            
                            // Загружаем компонент из БД
                            $component = \App\Models\Component::find($componentId);
                            if ($component) {
                                // Пытаемся определить роль из данных компонента или из prebuilt_pc
                                $role = $compData['role'] ?? 0;
                                
                                // Если роль не передана и есть prebuilt_pc_id, пытаемся получить роль из связи
                                if ($role === 0 && !empty($itemData['prebuilt_pc_id'])) {
                                    $pc = PrebuiltPc::with('components')->find($itemData['prebuilt_pc_id']);
                                    if ($pc) {
                                        $pcComponent = $pc->components->firstWhere('id', $componentId);
                                        if ($pcComponent) {
                                            $role = $pcComponent->pivot->role ?? 0;
                                        }
                                    }
                                }
                                
                                $roleName = $this->getRoleName($role);
                                $componentsFormatted[$roleName] = $component->model ?? 'Не указано';
                                
                                $componentsForDb[] = [
                                    'component_id' => $componentId,
                                    'price_snapshot' => $price,
                                    'quantity' => $quantity,
                                ];
                            }
                        }
                        // Старый формат данных из корзины: {component: {...}, role: 0, ...}
                        elseif (isset($compData['component'])) {
                            $componentId = $compData['component']['id'];
                            $modelName = $compData['component']['model'] ?? 'Не указано';
                            $price = $compData['price_snapshot'] ?? $compData['component']['price'] ?? 0;
                            $role = $compData['role'] ?? 0;
                            
                            $roleName = $this->getRoleName($role);
                            $componentsFormatted[$roleName] = $modelName;
                            
                            $componentsForDb[] = [
                                'component_id' => $componentId,
                                'price_snapshot' => $price,
                                'quantity' => 1,
                            ];
                        }
                    }
                }
                
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'prebuilt_pc_id' => $itemData['prebuilt_pc_id'] ?? null,
                    'name' => $itemData['name'],
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                    'status' => 'pending',
                    'components' => $componentsFormatted,
                ]);
                
                // Сохраняем компоненты в отдельную таблицу
                foreach ($componentsForDb as $compDb) {
                    OrderComponent::create([
                        'order_item_id' => $orderItem->id,
                        'component_id' => $compDb['component_id'],
                        'price_snapshot' => $compDb['price_snapshot'],
                        'quantity' => $compDb['quantity'],
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
                if (!$components) {
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
                            'name' => $oc->component->name,
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
                        'name' => $oc->component->name,
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

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);

        if ($validated['status'] === 'paid' && !$order->paid_at) {
            $order->update(['paid_at' => now()]);
        }

        // Загружаем и добавляем components_data
        $order->load('items.components.component');
        $order->items->transform(function($item) {
            $components = $item->components;
            if (!$components) {
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
                        'name' => $oc->component->name,
                        'model' => $oc->component->model,
                        'price' => $oc->component->price,
                    ] : null,
                ];
            });
            return $item;
        });

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order,
        ]);
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
                            'name' => $oc->component->name,
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
        $order = Order::with('items.components.component', 'items.prebuiltPc.components', 'user')->findOrFail($id);
        
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
                        'name' => $oc->component->name,
                        'model' => $oc->component->model,
                        'price' => $oc->component->price,
                    ] : null,
                ];
            });
            return $item;
        });
        
        return response()->json($order);
    }
}
