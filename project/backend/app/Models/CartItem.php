<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = ['cart_id', 'type', 'name', 'total_price', 'prebuilt_id'];

    // Связь: Запись принадлежит корзине
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    // Связь: У записи (особенно если это сборка) есть список комплектующих
    public function components()
    {
        return $this->hasMany(CartItemComponent::class);
    }
}