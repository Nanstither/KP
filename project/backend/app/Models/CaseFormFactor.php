<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CaseFormFactor extends Pivot
{
    protected $table = 'case_form_factor';
    public $incrementing = false;
    public $timestamps = true;

    protected $fillable = ['component_id', 'form_factor_id'];
}