<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FormFactors extends Model
{
    protected $fillable = ['name'];

    public function cases(): BelongsToMany
    {
        return $this->belongsToMany(Components::class, 'case_form_factor')
                    ->withPivot('component_id', 'form_factor_id');
    }
}