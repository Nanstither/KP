<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItemComponent extends Model
{
    use HasFactory;

    protected $fillable = ['cart_item_id', 'component_id', 'price_snapshot', 'quantity'];

    // Связь: Деталь принадлежит строке корзины
    public function cartItem(): BelongsTo
    {
        return $this->belongsTo(CartItem::class);
    }

    // Связь: Деталь ссылается на реальный компонент из каталога
    public function component(): BelongsTo
    {
        return $this->belongsTo(Component::class);
    }

    // Добавляем pivot данные для доступа к role (если используется через prebuilt_pc_component)
    // Для cart_item_components у нас нет role, но мы можем получить его через компонент
}