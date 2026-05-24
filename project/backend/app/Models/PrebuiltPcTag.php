<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class PrebuiltPcTag extends Pivot
{
    protected $table = 'prebuilt_pc_tag';
    
    public $incrementing = false;
    
    protected $fillable = ['prebuilt_pc_id', 'tag_id'];
}
