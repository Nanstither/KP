<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RamType extends Model
{
    protected $fillable = ['name'];

    public function ramSpecs(): HasMany
    {
        return $this->hasMany(RamSpec::class, 'ram_type_id');
    }

    public function motherboardSpecs(): HasMany
    {
        return $this->hasMany(MotherboardSpec::class, 'ram_type_id');
    }
}