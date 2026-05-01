<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class PrebuiltPc extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'image', 'is_active'
    ];

    // Связь с тегами (Игровой, Для офиса...)
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'prebuilt_pc_tag');
    }

    // Связь с компонентами. withPivot('role') позволит узнать, CPU это или GPU
    public function components(): BelongsToMany
    {
        return $this->belongsToMany(Component::class, 'prebuilt_pc_component', 'prebuilt_pc_id', 'component_id')
                    // ->using(PrebuiltPcComponent::class)
                    ->withPivot('role');
    }

    // Хелпер: получить только процессор
    public function getCpu()
    {
        return $this->components()->where('role', 'cpu')->first();
    }

    // Хелпер: получить только видеокарту
    public function getGpu()
    {
        return $this->components()->where('role', 'gpu')->first();
    }
    
}