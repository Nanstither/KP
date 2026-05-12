<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseSpec extends Model
{
    protected $table = 'case_specs';
    protected $primaryKey = 'component_id';
    public $incrementing = false;

    protected $fillable = [
        'component_id', 'case_type_id', 'top_fan_slots',
        'fans_included', 'drive_bays_3_5', 'drive_bays_2_5',
        'front_usb_a', 'front_usb_c', 'front_audio_jack', 'material_id',
        'max_length_gpu', 'height', 'width', 'length'
    ];

    protected $casts = [
        'component_id' => 'integer',
        'top_fan_slots' => 'integer',
        'fans_included' => 'integer',
        'drive_bays_3_5' => 'integer',
        'drive_bays_2_5' => 'integer',
        'front_usb_a' => 'integer',
        'front_usb_c' => 'integer',
        'front_audio_jack' => 'boolean',
        'max_length_gpu' => 'integer',
        'height' => 'integer',
        'width' => 'integer',
        'length' => 'integer',
    ];

    public function component(): BelongsTo
    {
        return $this->belongsTo(Component::class, 'component_id');
    }
    public function caseType() { return $this->belongsTo(CaseType::class); }
    public function material() { return $this->belongsTo(Material::class); }
}