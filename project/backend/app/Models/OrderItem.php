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

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function prebuiltPc()
    {
        return $this->belongsTo(PrebuiltPc::class);
    }
}
