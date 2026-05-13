<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['name', 'slug'];

    public function prebuiltPcs(): BelongsToMany
    {
        return $this->belongsToMany(PrebuiltPc::class, 'prebuilt_pc_tag');
    }
}