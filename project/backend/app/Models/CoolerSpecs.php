<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoolerSpecs extends Model
{
    protected $table = 'cooler_specs';
    protected $primaryKey = 'component_id';
    public $incrementing = false;

    protected $fillable = [
        'component_id', 'tdp_rating_watts', 'type', 'fan_count',
    ];

    protected $casts = [
        'component_id' => 'integer',
        'tdp_rating_watts' => 'integer',
        'fan_count' => 'integer',
    ];

    public function component(): BelongsTo
    {
        return $this->belongsTo(Components::class, 'component_id');
    }
}