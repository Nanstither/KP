<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItemComponent extends Model
{
    use HasFactory;

    protected $fillable = ['cart_item_id', 'component_id', 'price_snapshot', 'quantity'];

    // Связь: Деталь принадлежит строке корзины
    public function cartItem()
    {
        return $this->belongsTo(CartItem::class);
    }

    // Связь: Деталь ссылается на реальный компонент из каталога
    public function component()
    {
        return $this->belongsTo(Component::class);
    }
}