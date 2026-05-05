<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CpuSpec extends Model
{
    protected $table = 'cpu_specs';
    protected $primaryKey = 'component_id';
    public $incrementing = false;

    protected $fillable = [
        'component_id', 'socket_id', 'cores', 'threads',
        'base_clock_mhz', 'boost_clock_mhz', 'tdp_watts',
    ];

    protected $casts = [
        'component_id' => 'integer',
        'cores' => 'integer',
        'threads' => 'integer',
        'base_clock_mhz' => 'decimal:1',
        'boost_clock_mhz' => 'decimal:1',
        'tdp_watts' => 'integer',
    ];

    public function component(): BelongsTo
    {
        return $this->belongsTo(Component::class, 'component_id');
    }

    public function socket()    
    { 
        return $this->belongsTo(Socket::class); 
    }
}