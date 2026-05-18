<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'prebuilt_pc_id',
        'name',
        'quantity',
        'price',
        'status',
        'components',
    ];

    protected $casts = [
        'components' => 'array',
        'price' => 'decimal:2',
    ];

    // Убрали $appends чтобы избежать конфликта при сериализации
    // protected $appends = ['components_data'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function prebuiltPc()
    {
        return $this->belongsTo(PrebuiltPc::class);
    }

    public function components()
    {
        return $this->hasMany(OrderComponent::class);
    }

    public function getComponentsDataAttribute()
    {
        // Если отношение components еще не загружено, загружаем его
        if (!$this->relationLoaded('components')) {
            $this->load('components');
        }
        
        return $this->components->map(function($component) {
            return [
                'id' => $component->id,
                'component_id' => $component->component_id,
                'price_snapshot' => $component->price_snapshot,
                'quantity' => $component->quantity,
                'component' => $component->component ? [
                    'id' => $component->component->id,
                    'name' => $component->component->name,
                    'model' => $component->component->model,
                    'price' => $component->component->price,
                ] : null,
            ];
        });
    }
}
