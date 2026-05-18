<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'component_id',
        'price_snapshot',
        'quantity',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function component()
    {
        return $this->belongsTo(Component::class);
    }
}
