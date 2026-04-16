<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PsuSpecs extends Model
{
    protected $table = 'psu_specs';
    protected $primaryKey = 'component_id';
    public $incrementing = false;

    protected $fillable = [
        'component_id', 'wattage', 'efficiency', 'modularity',
        'pcie_cables_count', 'pcie_cable_type',
    ];

    protected $casts = [
        'component_id' => 'integer',
        'wattage' => 'integer',
        'pcie_cables_count' => 'integer',
    ];

    public function component(): BelongsTo
    {
        return $this->belongsTo(Components::class, 'component_id');
    }
}