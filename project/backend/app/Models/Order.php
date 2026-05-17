<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'status',
        'recipient_name',
        'recipient_phone',
        'recipient_email',
        'delivery_address',
        'delivery_type',
        'cdek_code',
        'total_amount',
        'payment_info',
        'paid_at',
    ];

    protected $casts = [
        'payment_info' => 'array',
        'paid_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
