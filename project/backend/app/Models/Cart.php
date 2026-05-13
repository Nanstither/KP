<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'session_id'];

    // Связь: У одной корзины много записей (товаров/сборок)
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    // Связь: Корзина принадлежит пользователю
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}