<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MotherboardSpec extends Model
{
    protected $table = 'motherboard_specs';
    protected $primaryKey = 'component_id';
    public $incrementing = false;

    protected $fillable = [
        'component_id', 'socket_id', 'chipset', 'ram_slots',
        'ram_type', 'm2_slots', 'pcie_x16_slots',
        'pcie_gen', 'sata_ports', 'form_factor',
    ];

    protected $casts = [
        'component_id' => 'integer',
        'socket_id' => 'integer',
        'ram_slots' => 'integer',
        'm2_slots' => 'integer',
        'pcie_x16_slots' => 'integer',
        'sata_ports' => 'integer',
    ];

    public function component(): BelongsTo
    {
        return $this->belongsTo(Component::class, 'component_id');
    }

    public function socket(): BelongsTo
    {
        return $this->belongsTo(Socket::class);
    }

    public function formFactor(): BelongsTo
    {
        return $this->belongsTo(FormFactor::class, 'form_factor_id');
    }
}