<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GpuSpec extends Model
{
    protected $table = 'gpu_specs';
    protected $primaryKey = 'component_id';
    public $incrementing = false;

    protected $fillable = [
        'component_id', 'vram_gb', 'vram_type', 'memory_bus_bit',
        'tdp_watts', 'length_mm', 'width_mm',
        'pcie_slots_required', 'pcie_gen', 'power_requires',
    ];

    protected $casts = [
        'component_id' => 'integer',
        'vram_gb' => 'integer',
        'memory_bus_bit' => 'integer',
        'tdp_watts' => 'integer',
        'length_mm' => 'integer',
        'width_mm' => 'integer',
        'pcie_slots_required' => 'integer',
    ];

    public function component(): BelongsTo
    {
        return $this->belongsTo(Component::class, 'component_id');
    }
}