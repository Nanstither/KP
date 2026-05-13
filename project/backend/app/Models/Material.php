<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    protected $fillable = ['name'];

    public function caseSpecs(): HasMany
    {
        return $this->hasMany(CaseSpec::class, 'material_id');
    }
}