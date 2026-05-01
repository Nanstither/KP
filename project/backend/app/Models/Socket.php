<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Socket extends Model
{
    protected $table = 'sockets'; // можно убрать, если таблица называется ровно 'sockets'
    protected $fillable = ['name'];
    public $timestamps = false; // убери, если в таблице есть created_at/updated_at

    public function coolers(): BelongsToMany
    {
        return $this->belongsToMany(Component::class, 'cooler_socket', 'socket_id', 'component_id');
    }
    public function motherboards(): HasMany
    {
        return $this->hasMany(Component::class)->whereHas('moboSpec');
    }
}