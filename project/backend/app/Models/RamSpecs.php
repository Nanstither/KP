<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RamSpecs extends Model
{
    protected $table = 'ram_scecs';
    protected $primaryKey = 'component_id';
    public $incrementing = false;

    protected $fillable = [
        'component_id', 'total_capacity_gb', 'speed_mhz',
        'type', 'latency_cl', 'modules_count',
    ];

    protected $casts = [
        'component_id' => 'integer',
        'total_capacity_gb' => 'integer',
        'speed_mhz' => 'integer',
        'latency_cl' => 'integer',
        'modules_count' => 'integer',
    ];

    public function component(): BelongsTo
    {
        return $this->belongsTo(Components::class, 'component_id');
    }
}