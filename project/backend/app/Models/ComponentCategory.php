<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComponentCategory extends Model
{
    protected $fillable = ['name', 'slug'];

    public function components(): HasMany
    {
        return $this->hasMany(Components::class);
    }
}