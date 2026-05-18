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
}
