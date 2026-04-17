<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorageSpecs extends Model
{
    protected $table = 'storage_specs';
    protected $primaryKey = 'component_id';
    public $incrementing = false;

    protected $fillable = [
        'component_id', 'type', 'capacity_gb',
        'read_speed_mbps', 'write_speed_mbps', 'form_factor',
    ];

    protected $casts = [
        'component_id' => 'integer',
        'capacity_gb' => 'integer',
        'read_speed_mbps' => 'integer',
        'write_speed_mbps' => 'integer',
    ];

    public function component(): BelongsTo
    {
        return $this->belongsTo(Components::class, 'component_id');
    }
}