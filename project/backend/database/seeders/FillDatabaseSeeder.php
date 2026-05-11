<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class FillDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ========== 0. ПОЛЬЗОВАТЕЛИ ==========
        DB::table('users');
        $users = [
            ['name' => 'Admin Test', 'email' => 'admin@test.com', 'role' => 'admin', 'password' => 'admin'],
            ['name' => 'Manager Test', 'email' => 'manager@test.com', 'password' => 'manager', 'role' => 'manager'],
        ];
        foreach ($users as $user) {
            DB::table('users')->insert([
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'password' => Hash::make($user['password']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ========== 1. КАТЕГОРИИ ==========
        DB::table('component_categories');
        $categories = [
            ['name' => 'Процессоры', 'slug' => 'cpu'],
            ['name' => 'Видеокарты', 'slug' => 'gpu'],
            ['name' => 'ОЗУ', 'slug' => 'ram'],
            ['name' => 'Материнские платы', 'slug' => 'motherboard'],
            ['name' => 'Блоки питания', 'slug' => 'psu'],
            ['name' => 'Накопители', 'slug' => 'storage'],
            ['name' => 'Кулеры', 'slug' => 'cooler'],
            ['name' => 'Корпуса', 'slug' => 'case'],
        ];
        foreach ($categories as $cat) {
            DB::table('component_categories')->insert([
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Получаем ID категорий для использования ниже
        $catCpu = DB::table('component_categories')->where('slug', 'cpu')->first()->id;
        $catGpu = DB::table('component_categories')->where('slug', 'gpu')->first()->id;
        $catRam = DB::table('component_categories')->where('slug', 'ram')->first()->id;
        $catMobo = DB::table('component_categories')->where('slug', 'motherboard')->first()->id;
        $catPsu = DB::table('component_categories')->where('slug', 'psu')->first()->id;
        $catStorage = DB::table('component_categories')->where('slug', 'storage')->first()->id;
        $catCooler = DB::table('component_categories')->where('slug', 'cooler')->first()->id;
        $catCase = DB::table('component_categories')->where('slug', 'case')->first()->id;

        // ========== 2. БРЕНДЫ ==========
        DB::table('brands');
        $brands = [
            'Intel', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'Gigabyte',
            'Corsair', 'Kingston', 'Samsung', 'DeepCool', 'Noctua',
            'NZXT', 'be quiet!', 'Seasonic', 'EVGA', 'Western Digital',
            'Crucial', 'G.Skill', 'Thermaltake', 'Cooler Master',
            'Thermalright', 'Arctic', 'Lian Li', 'Phanteks', 'Fractal Design',
            'Sabrent', 'ADATA', 'SK Hynix',
        ];
        foreach ($brands as $brand) {
            DB::table('brands')->insert(['name' => $brand, 'created_at' => now(), 'updated_at' => now()]);
        }

        $bIntel = DB::table('brands')->where('name', 'Intel')->first()->id;
        $bAmd = DB::table('brands')->where('name', 'AMD')->first()->id;
        $bNvidia = DB::table('brands')->where('name', 'NVIDIA')->first()->id;
        $bAsus = DB::table('brands')->where('name', 'ASUS')->first()->id;
        $bMsi = DB::table('brands')->where('name', 'MSI')->first()->id;
        $bGigabyte = DB::table('brands')->where('name', 'Gigabyte')->first()->id;
        $bCorsair = DB::table('brands')->where('name', 'Corsair')->first()->id;
        $bKingston = DB::table('brands')->where('name', 'Kingston')->first()->id;
        $bSamsung = DB::table('brands')->where('name', 'Samsung')->first()->id;
        $bDeepCool = DB::table('brands')->where('name', 'DeepCool')->first()->id;
        $bNoctua = DB::table('brands')->where('name', 'Noctua')->first()->id;
        $bNzxt = DB::table('brands')->where('name', 'NZXT')->first()->id;
        $bBequiet = DB::table('brands')->where('name', 'be quiet!')->first()->id;
        $bSeasonic = DB::table('brands')->where('name', 'Seasonic')->first()->id;
        $bCrucial = DB::table('brands')->where('name', 'Crucial')->first()->id;
        $bGSkill = DB::table('brands')->where('name', 'G.Skill')->first()->id;
        $bWesternDigital = DB::table('brands')->where('name', 'Western Digital')->first()->id;
        $bThermaltake = DB::table('brands')->where('name', 'Thermaltake')->first()->id;
        $bAdata = DB::table('brands')->where('name', 'ADATA')->first()->id;
        $bSKHynix = DB::table('brands')->where('name', 'SK Hynix')->first()->id;

        // ========== 3. СОКЕТЫ ==========
        DB::table('sockets');
        $sockets = ['LGA1700', 'LGA1851', 'AM5', 'AM4', 'LGA1200'];
        foreach ($sockets as $socket) {
            DB::table('sockets')->insert(['name' => $socket, 'created_at' => now(), 'updated_at' => now()]);
        }
        $sLGA1700 = DB::table('sockets')->where('name', 'LGA1700')->first()->id;
        $sAM5 = DB::table('sockets')->where('name', 'AM5')->first()->id;
        $sAM4 = DB::table('sockets')->where('name', 'AM4')->first()->id;

        // ========== 4. ФОРМ-ФАКТОРЫ ==========
        DB::table('form_factors');
        $formFactors = ['ATX', 'mATX', 'Mini-ITX', 'E-ATX'];
        foreach ($formFactors as $ff) {
            DB::table('form_factors')->insert(['name' => $ff, 'created_at' => now(), 'updated_at' => now()]);
        }
        $ffATX = DB::table('form_factors')->where('name', 'ATX')->first()->id;
        $ffMATX = DB::table('form_factors')->where('name', 'mATX')->first()->id;
        $ffITX = DB::table('form_factors')->where('name', 'Mini-ITX')->first()->id;
        $ffEATX = DB::table('form_factors')->where('name', 'E-ATX')->first()->id;

        // ========== 5. НОВЫЕ СПРАВОЧНИКИ (ID вместо строк) ==========
        
        // 5.1 Типы ОЗУ
        DB::table('ram_types');
        foreach (['DDR4', 'DDR5', 'LPDDR4', 'LPDDR5'] as $t) {
            DB::table('ram_types')->insert(['name' => $t, 'created_at' => now(), 'updated_at' => now()]);
        }
        $tDDR4 = DB::table('ram_types')->where('name', 'DDR4')->first()->id;
        $tDDR5 = DB::table('ram_types')->where('name', 'DDR5')->first()->id;

        // 5.2 Типы VRAM
        DB::table('vram_types');
        foreach (['GDDR5', 'GDDR5X', 'GDDR6', 'GDDR6X', 'HBM2', 'HBM2e'] as $v) {
            DB::table('vram_types')->insert(['name' => $v, 'created_at' => now(), 'updated_at' => now()]);
        }
        $vGDDR5 = DB::table('vram_types')->where('name', 'GDDR5')->first()->id;
        $vGDDR5X = DB::table('vram_types')->where('name', 'GDDR5X')->first()->id;
        $vGDDR6 = DB::table('vram_types')->where('name', 'GDDR6')->first()->id;
        $vGDDR6X = DB::table('vram_types')->where('name', 'GDDR6X')->first()->id;

        // 5.3 Типы корпусов
        DB::table('case_types');
        foreach (['Mini-ITX', 'Micro-ATX', 'Mid-Tower', 'Full-Tower', 'SFF', 'Open-Frame'] as $c) {
            DB::table('case_types')->insert(['name' => $c, 'created_at' => now(), 'updated_at' => now()]);
        }
        $cMidTower = DB::table('case_types')->where('name', 'Mid-Tower')->first()->id;
        $cFullTower = DB::table('case_types')->where('name', 'Full-Tower')->first()->id;
        $cMiniITX = DB::table('case_types')->where('name', 'Mini-ITX')->first()->id;
        $cMicroATX = DB::table('case_types')->where('name', 'Micro-ATX')->first()->id;
        $cSFF = DB::table('case_types')->where('name', 'SFF')->first()->id;

        // Маппинг для удобного поиска ID по строке из старых данных
        $caseTypeMap = [
            'mid_tower' => $cMidTower,
            'full_tower' => $cFullTower,
            'mini' => $cMicroATX,
            'sff' => $cSFF,
        ];

        // 5.4 Материалы
        DB::table('materials');
        foreach (['Steel', 'Aluminum', 'Tempered Glass', 'Acrylic', 'Steel + Glass'] as $m) {
            DB::table('materials')->insert(['name' => $m, 'created_at' => now(), 'updated_at' => now()]);
        }
        $mSteelGlass = DB::table('materials')->where('name', 'Steel + Glass')->first()->id;
        $mAluminum = DB::table('materials')->where('name', 'Aluminum')->first()->id;

        // Маппинг VRAM для GPU
        $vramMap = [
            'GDDR5' => $vGDDR5, 'GDDR5X' => $vGDDR5X,
            'GDDR6' => $vGDDR6, 'GDDR6X' => $vGDDR6X,
            'HBM2' => null, 'HBM2e' => null
        ];

        // ========== 6. КОМПОНЕНТЫ + СПЕЦИФИКАЦИИ ==========

        // 6.1 ПРОЦЕССОРЫ
        DB::table('cpu_specs'); // Сначала удаляем спеки, если есть
        DB::table('components')->where('category_id', $catCpu)->delete();

        $cpus = [
            ['brand' => $bIntel, 'model' => 'Core i9-14900K', 'price' => 58990, 'socket' => $sLGA1700, 'cores' => 24, 'threads' => 32, 'base' => 3200, 'boost' => 6000, 'tdp' => 253],
            ['brand' => $bIntel, 'model' => 'Core i5-14400F', 'price' => 18990, 'socket' => $sLGA1700, 'cores' => 10, 'threads' => 16, 'base' => 2500, 'boost' => 4700, 'tdp' => 65],
            ['brand' => $bAmd, 'model' => 'Ryzen 9 7950X', 'price' => 54990, 'socket' => $sAM5, 'cores' => 16, 'threads' => 32, 'base' => 4500, 'boost' => 5700, 'tdp' => 170],
            ['brand' => $bAmd, 'model' => 'Ryzen 7 7800X3D', 'price' => 42990, 'socket' => $sAM5, 'cores' => 8, 'threads' => 16, 'base' => 4200, 'boost' => 5000, 'tdp' => 120],
            ['brand' => $bAmd, 'model' => 'Ryzen 5 5600', 'price' => 11990, 'socket' => $sAM4, 'cores' => 6, 'threads' => 12, 'base' => 3500, 'boost' => 4400, 'tdp' => 65],
        ];
        foreach ($cpus as $cpu) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catCpu, 'brand_id' => $cpu['brand'], 'model' => $cpu['model'],
                'price' => $cpu['price'], 'stock' => rand(5, 50),
                'image' => 'images/components/cpu/' . Str::slug($cpu['model']) . '.jpg',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('cpu_specs')->insert([
                'component_id' => $id, 'socket_id' => $cpu['socket'],
                'cores' => $cpu['cores'], 'threads' => $cpu['threads'],
                'base_clock_mhz' => $cpu['base'], 'boost_clock_mhz' => $cpu['boost'],
                'tdp_watts' => $cpu['tdp'], 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // 6.2 ВИДЕОКАРТЫ
        DB::table('gpu_specs');
        DB::table('components')->where('category_id', $catGpu)->delete();

        $gpus = [
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4090', 'price' => 189990, 'vram' => 24, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 450],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4060', 'price' => 35000, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 115],
            ['brand' => $bAsus, 'model' => 'TUF RTX 4070', 'price' => 69990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 200],
        ];
        foreach ($gpus as $gpu) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catGpu, 'brand_id' => $gpu['brand'], 'model' => $gpu['model'],
                'price' => $gpu['price'], 'stock' => rand(3, 30),
                'image' => 'images/components/gpu/' . Str::slug($gpu['model']) . '.jpg',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            // ✅ Используем ID из справочника vram_types
            $vramTypeId = $vramMap[$gpu['vram_type']] ?? $vGDDR6; 
            
            DB::table('gpu_specs')->insert([
                'component_id' => $id,
                'vram_gb' => $gpu['vram'],
                'vram_type_id' => $vramTypeId, // FK
                'memory_bus_bit' => $gpu['bus'], 'tdp_watts' => $gpu['tdp'],
                'length_mm' => rand(240, 340), 'width_mm' => rand(110, 140),
                'pcie_slots_required' => rand(2, 3), 'pcie_gen' => '4.0',
                'power_requires' => rand(1, 2) . 'x8',
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // 6.3 ОЗУ
        DB::table('ram_specs');
        DB::table('components')->where('category_id', $catRam)->delete();

        $rams = [
            ['brand' => $bCorsair, 'model' => 'Vengeance LPX 16GB DDR4 3200', 'price' => 4500, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Trident Z5 RGB 32GB DDR5 6400', 'price' => 15500, 'cap' => 32, 'speed' => 6400, 'type' => 'DDR5', 'cl' => 32, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Beast 32GB DDR4 3200', 'price' => 8500, 'cap' => 32, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
        ];
        foreach ($rams as $ram) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catRam, 'brand_id' => $ram['brand'], 'model' => $ram['model'],
                'price' => $ram['price'], 'stock' => rand(10, 60),
                'image' => 'images/components/ram/' . Str::slug($ram['model']) . '.jpg',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            // ✅ Используем ID из справочника ram_types
            $ramTypeId = ($ram['type'] === 'DDR5') ? $tDDR5 : $tDDR4;

            DB::table('ram_specs')->insert([
                'component_id' => $id,
                'total_capacity_gb' => $ram['cap'], 'speed_mhz' => $ram['speed'],
                'ram_type_id' => $ramTypeId, // FK
                'latency_cl' => $ram['cl'], 'modules_count' => $ram['mod'],
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // 6.4 Материнские платы
        DB::table('motherboard_specs');
        DB::table('components')->where('category_id', $catMobo)->delete();

        $mobos = [
            ['brand' => $bAsus, 'model' => 'PRIME B760M-A', 'price' => 11500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bMsi, 'model' => 'MAG B650 TOMAHAWK', 'price' => 18500, 'socket' => $sAM5, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bAsus, 'model' => 'ROG STRIX Z790-A', 'price' => 28500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
        ];
        foreach ($mobos as $mobo) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catMobo, 'brand_id' => $mobo['brand'], 'model' => $mobo['model'],
                'price' => $mobo['price'], 'stock' => rand(5, 25),
                'image' => 'images/components/motherboard/' . Str::slug($mobo['model']) . '.jpg',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            // ✅ Используем ID из справочника ram_types
            $moboRamTypeId = ($mobo['ram_type'] === 'DDR5') ? $tDDR5 : $tDDR4;

            DB::table('motherboard_specs')->insert([
                'component_id' => $id,
                'socket_id' => $mobo['socket'],
                'form_factor_id' => $mobo['ff'],
                'ram_slots' => $mobo['ram_slots'],
                'ram_type_id' => $moboRamTypeId, // FK
                'm2_slots' => $mobo['m2'], 'pcie_x16_slots' => $mobo['pcie'],
                'pcie_gen' => $mobo['pcie_gen'], 'sata_ports' => $mobo['sata'],
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // 6.5 Блоки питания (без изменений)
        DB::table('psu_specs');
        DB::table('components')->where('category_id', $catPsu)->delete();
        $psus = [
            ['brand' => $bCorsair, 'model' => 'RM750x', 'price' => 10500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bDeepCool, 'model' => 'DQ750-M-V2L', 'price' => 7500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
        ];
        foreach ($psus as $psu) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catPsu, 'brand_id' => $psu['brand'], 'model' => $psu['model'],
                'price' => $psu['price'], 'stock' => rand(8, 40),
                'image' => 'images/components/psu/' . Str::slug($psu['model']) . '.jpg',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('psu_specs')->insert([
                'component_id' => $id, 'wattage' => $psu['watt'], 'efficiency' => $psu['eff'],
                'modularity' => $psu['mod'], 'pcie_cables_count' => $psu['pcie'],
                'pcie_cable_type' => $psu['type'], 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // 6.6 Накопители (без изменений)
        DB::table('storage_specs');
        DB::table('components')->where('category_id', $catStorage)->delete();
        $storages = [
            ['brand' => $bSamsung, 'model' => '990 PRO 1TB', 'price' => 9500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7450, 'write' => 6900, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'WD Blue SN580 1TB', 'price' => 5500, 'type' => 'nvme', 'cap' => 1000, 'read' => 4150, 'write' => 4150, 'ff' => 'm.2_2280'],
        ];
        foreach ($storages as $stor) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catStorage, 'brand_id' => $stor['brand'], 'model' => $stor['model'],
                'price' => $stor['price'], 'stock' => rand(10, 60),
                'image' => 'images/components/storage/' . Str::slug($stor['model']) . '.jpg',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('storage_specs')->insert([
                'component_id' => $id, 'type' => $stor['type'], 'capacity_gb' => $stor['cap'],
                'read_speed_mbps' => $stor['read'], 'write_speed_mbps' => $stor['write'],
                'form_factor' => $stor['ff'], 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // 6.7 Кулеры (связь Many-to-Many)
        DB::table('cooler_specs');
        DB::table('cooler_socket');
        DB::table('components')->where('category_id', $catCooler)->delete();
        $coolers = [
            ['brand' => 'DeepCool', 'model' => 'AK400', 'price' => 3200, 'tdp' => 220, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Noctua', 'model' => 'NH-D15', 'price' => 8500, 'tdp' => 250, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
        ];
        foreach ($coolers as $cool) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catCooler, 
                'brand_id' => DB::table('brands')->where('name', $cool['brand'])->first()->id,
                'model' => $cool['model'], 'price' => $cool['price'], 'stock' => rand(10, 50),
                'image' => 'images/components/cooler/' . Str::slug($cool['model']) . '.jpg',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('cooler_specs')->insert([
                'component_id' => $id, 'tdp_rating_watts' => $cool['tdp'],
                'type' => $cool['type'], 'fan_count' => $cool['fans'],
                'created_at' => now(), 'updated_at' => now(),
            ]);
            foreach ($cool['sockets'] as $sockId) {
                DB::table('cooler_socket')->insert(['component_id' => $id, 'socket_id' => $sockId, 'created_at' => now(), 'updated_at' => now()]);
            }
        }

        // 6.8 Корпуса (FK case_type и material)
        DB::table('case_specs');
        DB::table('case_form_factor');
        DB::table('components')->where('category_id', $catCase)->delete();
        $cases = [
            ['brand' => 'NZXT', 'model' => 'H5 Flow', 'price' => 8500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX]],
            ['brand' => 'Lian Li', 'model' => 'O11 Dynamic EVO', 'price' => 15500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 0, 'ffs' => [$ffATX, $ffEATX]],
        ];
        foreach ($cases as $case) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catCase, 
                'brand_id' => DB::table('brands')->where('name', $case['brand'])->first()->id,
                'model' => $case['model'], 'price' => $case['price'], 'stock' => rand(5, 25),
                'image' => 'images/components/case/' . Str::slug($case['model']) . '.jpg',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            
            // ✅ Получаем ID типа корпуса и материала
            $typeId = $caseTypeMap[$case['type']] ?? $cMidTower; 
            
            DB::table('case_specs')->insert([
                'component_id' => $id,
                'case_type_id' => $typeId,     // FK
                'material_id' => $mSteelGlass, // FK
                'top_fan_slots' => $case['top_slots'], 'fans_included' => $case['fans'],
                'drive_bays_3_5' => rand(2, 4), 'drive_bays_2_5' => rand(3, 6),
                'front_usb_a' => 2, 'front_usb_c' => 1, 'front_audio_jack' => true,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            
            foreach ($case['ffs'] as $ffId) {
                DB::table('case_form_factor')->insert([
                    'component_id' => $id, 'form_factor_id' => $ffId,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ========== 7. ГОТОВЫЕ СБОРКИ (без изменений) ==========
        DB::table('prebuilt_pcs');
        DB::table('prebuilt_pc_component');
        DB::table('prebuilt_pc_tag');
        
        $tagNames = ['Игровой', 'Для работы', 'Бюджетный', 'Топовый', 'RGB', 'Компактный', 'Мощный'];
        foreach ($tagNames as $name) {
            DB::table('tags')->updateOrInsert(['name' => $name], ['slug' => Str::slug($name), 'created_at' => now(), 'updated_at' => now()]);
        }
        $tagMap = DB::table('tags')->pluck('id', 'name')->toArray();
        
        $pools = [
            'cpu' => DB::table('components')->where('category_id', $catCpu)->pluck('id')->toArray(),
            'gpu' => DB::table('components')->where('category_id', $catGpu)->pluck('id')->toArray(),
            'ram' => DB::table('components')->where('category_id', $catRam)->pluck('id')->toArray(),
            'motherboard' => DB::table('components')->where('category_id', $catMobo)->pluck('id')->toArray(),
            'psu' => DB::table('components')->where('category_id', $catPsu)->pluck('id')->toArray(),
            'storage' => DB::table('components')->where('category_id', $catStorage)->pluck('id')->toArray(),
            'cooler' => DB::table('components')->where('category_id', $catCooler)->pluck('id')->toArray(),
            'case' => DB::table('components')->where('category_id', $catCase)->pluck('id')->toArray(),
        ];

        $bases = [
            ['name' => 'Storm', 'price' => 65000, 'tags' => ['Бюджетный', 'Игровой']],
            ['name' => 'Titan', 'price' => 105000, 'tags' => ['Игровой', 'Топовый']],
        ];
        
        for ($i = 1; $i <= 5; $i++) {
            $base = $bases[($i - 1) % count($bases)];
            $pcName = "{$base['name']} Build #{$i}";
            
            $pcId = DB::table('prebuilt_pcs')->insertGetId([
                'name' => $pcName, 'slug' => Str::slug($pcName),
                'description' => "Готовая сборка {$pcName}.",
                'price' => $base['price'] + rand(-2000, 5000),
                'image' => "pcs/pc_{$i}.jpg", 'is_active' => true,
                'created_at' => now(), 'updated_at' => now()
            ]);

            foreach ($pools as $role => $ids) {
                if(!empty($ids)) {
                    DB::table('prebuilt_pc_component')->insert([
                        'prebuilt_pc_id' => $pcId, 'component_id' => $ids[array_rand($ids)],
                        'role' => $role, 'created_at' => now(), 'updated_at' => now()
                    ]);
                }
            }

            foreach ($base['tags'] as $tName) {
                if(isset($tagMap[$tName])) {
                    DB::table('prebuilt_pc_tag')->insert([
                        'prebuilt_pc_id' => $pcId, 'tag_id' => $tagMap[$tName],
                        'created_at' => now(), 'updated_at' => now()
                    ]);
                }
            }
        }
        
        $this->command->info('✅ Готово! База успешно заполнена новыми справочниками и компонентами.');
    }
}