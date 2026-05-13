<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Relations\Pivot;

class PrebuiltPcComponent extends Pivot
{
    protected $table = 'prebuilt_pc_component';
    public $incrementing = false;
    protected $fillable = ['prebuilt_pc_id', 'component_id', 'role'];
}