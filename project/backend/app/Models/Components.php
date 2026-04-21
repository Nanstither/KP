<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Components extends Model
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
        return $this->belongsTo(Brands::class);
    }

    // Связи 1:1 со спецификациями (по типу компонента)
    public function cpuSpec(): HasOne
    {
        return $this->hasOne(CpuSpecs::class, 'component_id');
    }

    public function gpuSpec(): HasOne
    {
        return $this->hasOne(GpuSpecs::class, 'component_id');
    }

    public function ramSpec(): HasOne
    {
        return $this->hasOne(RamSpecs::class, 'component_id');
    }

    public function motherboardSpec(): HasOne
    {
        return $this->hasOne(MotherboardSpecs::class, 'component_id');
    }

    public function psuSpec(): HasOne
    {
        return $this->hasOne(PsuSpecs::class, 'component_id');
    }

    public function storageSpec(): HasOne
    {
        return $this->hasOne(StorageSpecs::class, 'component_id');
    }

    public function coolerSpec(): HasOne
    {
        return $this->hasOne(CoolerSpecs::class, 'component_id');
    }

    public function caseSpec(): HasOne
    {
        return $this->hasOne(CaseSpecs::class, 'component_id');
    }

    // Связь N:M: кулер ↔ сокеты (через pivot)
    public function compatibleSockets(): BelongsToMany
    {
        return $this->belongsToMany(Socket::class, 'cooler_socket', 'component_id', 'socket_id');
    }

    // Связь N:M: корпус ↔ форм-факторы (через pivot)
    public function supportedFormFactors(): BelongsToMany
    {
        return $this->belongsToMany(FormFactors::class, 'case_form_factor', 'component_id', 'form_factor_id');
    }

    // Связь N:M: готовый пк ↔ тег (через pivot)
    public function prebuiltPcs(): BelongsToMany
    {
        return $this->belongsToMany(PrebuiltPc::class, 'prebuilt_pc_component')
                    ->withPivot('role');
    }
}