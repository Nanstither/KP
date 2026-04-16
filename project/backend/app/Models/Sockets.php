<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Socket extends Model
{
    protected $fillable = ['name'];

    // Кулеры, поддерживающие этот сокет
    public function coolers(): BelongsToMany
    {
        return $this->belongsToMany(Components::class, 'cooler_socket')
                    ->withPivot('component_id', 'socket_id');
    }

    // Материнские платы с этим сокетом
    public function motherboards(): HasMany
    {
        return $this->hasMany(Components::class)->whereHas('moboSpec');
    }
}