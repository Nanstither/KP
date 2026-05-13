<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FormFactor extends Model
{
    protected $table = 'form_factors';
    protected $fillable = ['name'];

    public function cases(): BelongsToMany
    {
        return $this->belongsToMany(Component::class, 'case_form_factor')
                    ->withPivot('component_id', 'form_factor_id');
    }
}