<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ComponentCategory;
use App\Models\Brands;
use App\Models\Components;
use App\Models\CpuSpecs;

class TestComponentsSeeder extends Seeder
{
    public function run(): void
    {
        $catCpu = ComponentCategory::create(['name' => 'Процессоры', 'slug' => 'cpu']);
        $brandIntel = Brands::create(['name' => 'Intel']);

        $cpu = Components::create([
            'category_id' => $catCpu->id,
            'brand_id' => $brandIntel->id,
            'model' => 'Core i5-13400F',
            'price' => 18990,
            'stock' => 15,
            'image' => 'cpu_i5.jpg',
        ]);

        \App\Models\CpuSpecs::create([
            'component_id' => $cpu->id,
            'socket' => 'LGA1700',
            'cores' => 10,
            'threads' => 16,
            'base_clock_mhz' => 2500,
            'boost_clock_mhz' => 4600,
            'tdp_watts' => 65,
        ]);
    }
}