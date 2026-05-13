<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    protected $fillable = ['name'];

    public function components(): HasMany
    {
        return $this->hasMany(Component::class);
    }
}