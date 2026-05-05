<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Component extends Model
{
    protected $fillable = [
        'category_id',
        'brand_id',
        'model',
        'price',
        'stock',
        'image',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    // Связи с категориями и брендом
    public function category(): BelongsTo
    {
        return $this->belongsTo(ComponentCategory::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    // Связи 1:1 со спецификациями (по типу компонента)
    public function cpuSpec(): HasOne
    {
        return $this->hasOne(CpuSpec::class, 'component_id');
    }

    public function gpuSpec(): HasOne
    {
        return $this->hasOne(GpuSpec::class, 'component_id');
    }

    public function ramSpec(): HasOne
    {
        return $this->hasOne(RamSpec::class, 'component_id');
    }

    public function motherboardSpec(): HasOne
    {
        return $this->hasOne(MotherboardSpec::class, 'component_id');
    }

    public function psuSpec(): HasOne
    {
        return $this->hasOne(PsuSpec::class, 'component_id');
    }

    public function storageSpec(): HasOne
    {
        return $this->hasOne(StorageSpec::class, 'component_id');
    }

    public function coolerSpec(): HasOne
    {
        return $this->hasOne(CoolerSpec::class, 'component_id');
    }

    public function caseSpec(): HasOne
    {
        return $this->hasOne(CaseSpec::class, 'component_id');
    }

    // Связь N:M: кулер ↔ сокеты (через pivot)
    public function compatibleSockets()
    {
        return $this->belongsToMany(
            \App\Models\Socket::class,
            'cooler_socket',
            'component_id',
            'socket_id'
        )->withTimestamps();
    }

    // Связь N:M: корпус ↔ форм-факторы (через pivot)
    public function supportedFormFactors()
    {
        return $this->belongsToMany(
            \App\Models\FormFactor::class,
            'case_form_factor',
            'component_id',
            'form_factor_id'
        )->withTimestamps();
    }

    // Связь N:M: готовый пк ↔ тег (через pivot)
    public function prebuiltPcs(): BelongsToMany
    {
        return $this->belongsToMany(PrebuiltPc::class, 'prebuilt_pc_component')
                    ->withPivot('role');
    }
}