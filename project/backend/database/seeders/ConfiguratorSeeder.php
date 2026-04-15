<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ComponentCategory;
use App\Models\Component;
use App\Models\CpuSpec;
use App\Models\GpuSpec;
use App\Models\MotherboardSpec;
use App\Models\RamSpec;
use App\Models\CoolerSpec;
use App\Models\PsuSpec;
use App\Models\StorageSpec;
use App\Models\Configuration;
use App\Models\ConfigurationItem;

class ConfiguratorSeeder extends Seeder
{
    public function run(): void
    {
        // 🟢 1. КАТЕГОРИИ (Справочник типов деталей)
        $catCpu    = ComponentCategory::create(['name' => 'Процессоры', 'slug' => 'cpu']);
        $catGpu    = ComponentCategory::create(['name' => 'Видеокарты', 'slug' => 'gpu']);
        $catMobo   = ComponentCategory::create(['name' => 'Материнские платы', 'slug' => 'motherboard']);
        $catRam    = ComponentCategory::create(['name' => 'Оперативная память', 'slug' => 'ram']);
        $catCooler = ComponentCategory::create(['name' => 'Охлаждение CPU', 'slug' => 'cooler']);
        $catPsu    = ComponentCategory::create(['name' => 'Блоки питания', 'slug' => 'psu']);
        $catStorage= ComponentCategory::create(['name' => 'Накопители', 'slug' => 'storage']);

        // 🟢 2. КОМПОНЕНТЫ + 3. СПЕЦИФИКАЦИИ (1:1 связь)
        // Каждый компонент создаётся ОДИН РАЗ, его характеристики падают в ОТДЕЛЬНУЮ таблицу

        // --- ПРОЦЕССОР ---
        $cpu = Component::create([
            'category_id' => $catCpu->id,
            'brand' => 'Intel', 'model' => 'Core i5-13400F', 
            'price' => 180.00, 'stock' => 10, 'is_active' => true,
        ]);
        // Связь 1:1 → component_id = ID компонента
        CpuSpec::create([
            'component_id' => $cpu->id,
            'socket' => 'LGA1700', 'cores' => 10, 'threads' => 16,
            'base_clock_mhz' => 2500.0, 'boost_clock_mhz' => 4600.0, 'tdp_watts' => 65,
        ]);

        // --- ВИДЕОКАРТА ---
        $gpu = Component::create([
            'category_id' => $catGpu->id,
            'brand' => 'NVIDIA', 'model' => 'GeForce RTX 4060', 
            'price' => 320.00, 'stock' => 5, 'is_active' => true,
        ]);
        GpuSpec::create([
            'component_id' => $gpu->id,
            'vram_gb' => 8, 'vram_type' => 'GDDR6', 'memory_bus_bit' => 128, 
            'tdp_watts' => 115, 'length_mm' => 240, 'pcie_slots_required' => 2,
        ]);

        // --- МАТЕРИНСКАЯ ПЛАТА ---
        $mobo = Component::create([
            'category_id' => $catMobo->id,
            'brand' => 'ASUS', 'model' => 'PRIME B760M-K D4', 
            'price' => 120.00, 'stock' => 15, 'is_active' => true,
        ]);
        MotherboardSpec::create([
            'component_id' => $mobo->id,
            'socket' => 'LGA1700', 'chipset' => 'B760', 'ram_slots' => 4, 'ram_type' => 'DDR4',
            'm2_slots' => 2, 'pcie_x16_slots' => 1, 'pcie_gen' => '4.0', 'sata_ports' => 4, 'form_factor' => 'mATX',
        ]);

        // --- ОЗУ ---
        $ram = Component::create([
            'category_id' => $catRam->id,
            'brand' => 'Kingston', 'model' => 'FURY Beast 32GB', 
            'price' => 95.00, 'stock' => 20, 'is_active' => true,
        ]);
        RamSpec::create([
            'component_id' => $ram->id,
            'total_capacity_gb' => 32, 'speed_mhz' => 3200, 'type' => 'DDR4', 
            'latency_cl' => 16, 'modules_count' => 2,
        ]);

        // --- ОХЛАЖДЕНИЕ ---
        $cooler = Component::create([
            'category_id' => $catCooler->id,
            'brand' => 'DeepCool', 'model' => 'AK400', 
            'price' => 35.00, 'stock' => 25, 'is_active' => true,
        ]);
        CoolerSpec::create([
            'component_id' => $cooler->id,
            'compatible_sockets' => 'LGA1700,AM5', 'tdp_rating_watts' => 220, 'type' => 'tower', 'fan_count' => 1,
        ]);

        // --- БЛОК ПИТАНИЯ ---
        $psu = Component::create([
            'category_id' => $catPsu->id,
            'brand' => 'Corsair', 'model' => 'RM750e', 
            'price' => 110.00, 'stock' => 12, 'is_active' => true,
        ]);
        PsuSpec::create([
            'component_id' => $psu->id,
            'wattage' => 750, 'efficiency' => '80+ Gold', 'modularity' => 'full', 'pcie_power_connectors' => 4,
        ]);

        // --- НАКОПИТЕЛЬ ---
        $ssd = Component::create([
            'category_id' => $catStorage->id,
            'brand' => 'Samsung', 'model' => '980 Pro 1TB', 
            'price' => 85.00, 'stock' => 18, 'is_active' => true,
        ]);
        StorageSpec::create([
            'component_id' => $ssd->id,
            'type' => 'nvme', 'capacity_gb' => 1000, 'read_speed_mbps' => 7000, 
            'write_speed_mbps' => 5000, 'form_factor' => 'm.2_2280',
        ]);

        // 🟢 4. КОНФИГУРАЦИЯ (Пользовательская сборка)
        $config = Configuration::create(['name' => 'Игровой ПК v1']);

        // 🟢 5. СВЯЗЬ ДЕТАЛЕЙ СО СБОРКОЙ (Many-to-Many + role)
        // Здесь мы "раскладываем" компоненты по своим местам в сборке
        ConfigurationItem::create(['configuration_id' => $config->id, 'component_id' => $cpu->id,     'role' => 'cpu']);
        ConfigurationItem::create(['configuration_id' => $config->id, 'component_id' => $gpu->id,     'role' => 'gpu']);
        ConfigurationItem::create(['configuration_id' => $config->id, 'component_id' => $mobo->id,    'role' => 'motherboard']);
        ConfigurationItem::create(['configuration_id' => $config->id, 'component_id' => $ram->id,     'role' => 'ram']);
        ConfigurationItem::create(['configuration_id' => $config->id, 'component_id' => $cooler->id,  'role' => 'cooler']);
        ConfigurationItem::create(['configuration_id' => $config->id, 'component_id' => $psu->id,     'role' => 'psu']);
        ConfigurationItem::create(['configuration_id' => $config->id, 'component_id' => $ssd->id,     'role' => 'storage_main']);

        echo "✅ Сидер завершён. Итоговая цена сборки: $" . $config->total_price . "\n";
    }
}