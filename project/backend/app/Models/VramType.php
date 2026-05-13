<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VramType extends Model
{
    protected $fillable = ['name'];

    public function gpuSpecs(): HasMany
    {
        return $this->hasMany(GpuSpec::class, 'vram_type_id');
    }
}