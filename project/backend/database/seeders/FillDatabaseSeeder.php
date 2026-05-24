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
        // ========== 0. ПОЛЬЗОВАТЕЛИ (30 шт) ==========
        DB::table('users');
        $users = [
            ['name' => 'Admin Test', 'email' => 'admin@test.com', 'role' => 'admin', 'password' => 'admin'],
            ['name' => 'Manager Test', 'email' => 'manager@test.com', 'password' => 'manager', 'role' => 'manager'],
        ];
        
        // Добавляем 28 обычных пользователей
        for ($i = 1; $i <= 28; $i++) {
            $users[] = [
                'name' => "User {$i}",
                'email' => "user{$i}@test.com",
                'role' => 'user',
                'password' => "user{$i}",
            ];
        }
        
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
            'Sabrent', 'ADATA', 'SK Hynix', 'Seagate',
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
        $bSeagate = DB::table('brands')->where('name', 'Seagate')->first()->id;
        $bEVGA = DB::table('brands')->where('name', 'EVGA')->first()->id;
        $bSabrent = DB::table('brands')->where('name', 'Sabrent')->first()->id;

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

        // ========== 6. КОМПОНЕНТЫ + СПЕЦИФИКАЦИИ (30 шт в каждой категории = 240 шт) ==========

        // 6.1 ПРОЦЕССОРЫ (30 шт)
        DB::table('cpu_specs');
        DB::table('components')->where('category_id', $catCpu)->delete();

        $cpuModels = [
            ['brand' => $bIntel, 'socket' => $sLGA1700, 'models' => [
                ['model' => 'Core i9-14900K', 'price' => 58990, 'cores' => 24, 'threads' => 32, 'base' => 3200, 'boost' => 6000, 'tdp' => 253],
                ['model' => 'Core i9-14900KF', 'price' => 56990, 'cores' => 24, 'threads' => 32, 'base' => 3200, 'boost' => 6000, 'tdp' => 253],
                ['model' => 'Core i9-14900', 'price' => 54990, 'cores' => 24, 'threads' => 32, 'base' => 2000, 'boost' => 5800, 'tdp' => 65],
                ['model' => 'Core i7-14700K', 'price' => 42990, 'cores' => 20, 'threads' => 28, 'base' => 3400, 'boost' => 5600, 'tdp' => 253],
                ['model' => 'Core i7-14700', 'price' => 40990, 'cores' => 20, 'threads' => 28, 'base' => 2100, 'boost' => 5400, 'tdp' => 65],
                ['model' => 'Core i5-14600K', 'price' => 32990, 'cores' => 14, 'threads' => 20, 'base' => 3500, 'boost' => 5300, 'tdp' => 125],
                ['model' => 'Core i5-14600', 'price' => 30990, 'cores' => 14, 'threads' => 20, 'base' => 2700, 'boost' => 5200, 'tdp' => 65],
                ['model' => 'Core i5-14500', 'price' => 24990, 'cores' => 14, 'threads' => 20, 'base' => 2600, 'boost' => 5000, 'tdp' => 65],
                ['model' => 'Core i5-14400F', 'price' => 18990, 'cores' => 10, 'threads' => 16, 'base' => 2500, 'boost' => 4700, 'tdp' => 65],
                ['model' => 'Core i5-14400', 'price' => 19990, 'cores' => 10, 'threads' => 16, 'base' => 2500, 'boost' => 4700, 'tdp' => 65],
                ['model' => 'Core i3-14100F', 'price' => 11990, 'cores' => 4, 'threads' => 8, 'base' => 3500, 'boost' => 4700, 'tdp' => 58],
                ['model' => 'Core i3-14100', 'price' => 12990, 'cores' => 4, 'threads' => 8, 'base' => 3500, 'boost' => 4700, 'tdp' => 58],
            ]],
            ['brand' => $bAmd, 'socket' => $sAM5, 'models' => [
                ['model' => 'Ryzen 9 7950X', 'price' => 54990, 'cores' => 16, 'threads' => 32, 'base' => 4500, 'boost' => 5700, 'tdp' => 170],
                ['model' => 'Ryzen 9 7950X3D', 'price' => 59990, 'cores' => 16, 'threads' => 32, 'base' => 4200, 'boost' => 5700, 'tdp' => 120],
                ['model' => 'Ryzen 9 7900X', 'price' => 42990, 'cores' => 12, 'threads' => 24, 'base' => 4700, 'boost' => 5600, 'tdp' => 170],
                ['model' => 'Ryzen 7 7800X3D', 'price' => 42990, 'cores' => 8, 'threads' => 16, 'base' => 4200, 'boost' => 5000, 'tdp' => 120],
                ['model' => 'Ryzen 7 7700X', 'price' => 32990, 'cores' => 8, 'threads' => 16, 'base' => 4500, 'boost' => 5400, 'tdp' => 105],
                ['model' => 'Ryzen 7 7700', 'price' => 30990, 'cores' => 8, 'threads' => 16, 'base' => 3800, 'boost' => 5300, 'tdp' => 65],
                ['model' => 'Ryzen 5 7600X', 'price' => 24990, 'cores' => 6, 'threads' => 12, 'base' => 4700, 'boost' => 5300, 'tdp' => 105],
                ['model' => 'Ryzen 5 7600', 'price' => 22990, 'cores' => 6, 'threads' => 12, 'base' => 3800, 'boost' => 5100, 'tdp' => 65],
                ['model' => 'Ryzen 5 7500F', 'price' => 17990, 'cores' => 6, 'threads' => 12, 'base' => 3700, 'boost' => 5000, 'tdp' => 65],
            ]],
            ['brand' => $bAmd, 'socket' => $sAM4, 'models' => [
                ['model' => 'Ryzen 7 5800X3D', 'price' => 32990, 'cores' => 8, 'threads' => 16, 'base' => 3400, 'boost' => 4500, 'tdp' => 105],
                ['model' => 'Ryzen 7 5800X', 'price' => 24990, 'cores' => 8, 'threads' => 16, 'base' => 3800, 'boost' => 4700, 'tdp' => 105],
                ['model' => 'Ryzen 7 5700X', 'price' => 19990, 'cores' => 8, 'threads' => 16, 'base' => 3400, 'boost' => 4600, 'tdp' => 65],
                ['model' => 'Ryzen 5 5600X', 'price' => 14990, 'cores' => 6, 'threads' => 12, 'base' => 3700, 'boost' => 4600, 'tdp' => 65],
                ['model' => 'Ryzen 5 5600', 'price' => 11990, 'cores' => 6, 'threads' => 12, 'base' => 3500, 'boost' => 4400, 'tdp' => 65],
                ['model' => 'Ryzen 5 5500', 'price' => 9990, 'cores' => 6, 'threads' => 12, 'base' => 3600, 'boost' => 4200, 'tdp' => 65],
            ]],
        ];

        $cpuCount = 0;
        foreach ($cpuModels as $group) {
            foreach ($group['models'] as $cpu) {
                if ($cpuCount >= 30) break;
                $id = DB::table('components')->insertGetId([
                    'category_id' => $catCpu, 'brand_id' => $group['brand'], 'model' => $cpu['model'],
                    'price' => $cpu['price'], 'stock' => rand(5, 50),
                    'image' => 'images/components/cpu/' . Str::slug($cpu['model']) . '.jpg',
                    'created_at' => now(), 'updated_at' => now(),
                ]);
                DB::table('cpu_specs')->insert([
                    'component_id' => $id, 'socket_id' => $group['socket'],
                    'cores' => $cpu['cores'], 'threads' => $cpu['threads'],
                    'base_clock_mhz' => $cpu['base'], 'boost_clock_mhz' => $cpu['boost'],
                    'tdp_watts' => $cpu['tdp'], 'created_at' => now(), 'updated_at' => now(),
                ]);
                $cpuCount++;
            }
        }

        // 6.2 ВИДЕОКАРТЫ (30 шт)
        DB::table('gpu_specs');
        DB::table('components')->where('category_id', $catGpu)->delete();

        $gpuModels = [
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4090', 'price' => 189990, 'vram' => 24, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 450],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4080 Super', 'price' => 129990, 'vram' => 16, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 320],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4070 Ti Super', 'price' => 89990, 'vram' => 16, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 285],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4070 Super', 'price' => 69990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 220],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4070', 'price' => 59990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 200],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4060 Ti 16GB', 'price' => 49990, 'vram' => 16, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 165],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4060 Ti', 'price' => 42990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 160],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4060', 'price' => 35000, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 115],
            ['brand' => $bAsus, 'model' => 'TUF RTX 4090', 'price' => 199990, 'vram' => 24, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 450],
            ['brand' => $bAsus, 'model' => 'ROG Strix RTX 4080', 'price' => 139990, 'vram' => 16, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 320],
            ['brand' => $bAsus, 'model' => 'TUF RTX 4070', 'price' => 69990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 200],
            ['brand' => $bAsus, 'model' => 'Dual RTX 4060', 'price' => 34990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 115],
            ['brand' => $bMsi, 'model' => 'RTX 4090 Gaming X Trio', 'price' => 194990, 'vram' => 24, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 450],
            ['brand' => $bMsi, 'model' => 'RTX 4070 Ti Gaming X', 'price' => 84990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 285],
            ['brand' => $bMsi, 'model' => 'RTX 4060 Ventus', 'price' => 33990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 115],
            ['brand' => $bGigabyte, 'model' => 'RTX 4090 Gaming OC', 'price' => 192990, 'vram' => 24, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 450],
            ['brand' => $bGigabyte, 'model' => 'RTX 4070 Eagle', 'price' => 64990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 200],
            ['brand' => $bGigabyte, 'model' => 'RTX 4060 OC', 'price' => 34490, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 115],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 3060 12GB', 'price' => 28990, 'vram' => 12, 'vram_type' => 'GDDR6', 'bus' => 192, 'tdp' => 170],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 3050', 'price' => 22990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 130],
            ['brand' => $bAsus, 'model' => 'TUF RTX 3060', 'price' => 29990, 'vram' => 12, 'vram_type' => 'GDDR6', 'bus' => 192, 'tdp' => 170],
            ['brand' => $bMsi, 'model' => 'RTX 3060 Ventus', 'price' => 28490, 'vram' => 12, 'vram_type' => 'GDDR6', 'bus' => 192, 'tdp' => 170],
            ['brand' => $bGigabyte, 'model' => 'RTX 3060 OC', 'price' => 29490, 'vram' => 12, 'vram_type' => 'GDDR6', 'bus' => 192, 'tdp' => 170],
            ['brand' => $bAsus, 'model' => 'Dual RTX 3050', 'price' => 23990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 130],
            ['brand' => $bMsi, 'model' => 'RTX 3050 Ventus', 'price' => 22490, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 130],
            ['brand' => $bGigabyte, 'model' => 'RTX 3050 OC', 'price' => 23490, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 130],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4070 Ti', 'price' => 79990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 285],
            ['brand' => $bAsus, 'model' => 'ROG Strix RTX 4070', 'price' => 74990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 200],
            ['brand' => $bMsi, 'model' => 'RTX 4080 Gaming X Trio', 'price' => 134990, 'vram' => 16, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 320],
            ['brand' => $bGigabyte, 'model' => 'RTX 4080 Gaming OC', 'price' => 132990, 'vram' => 16, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 320],
        ];

        foreach ($gpuModels as $gpu) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catGpu, 'brand_id' => $gpu['brand'], 'model' => $gpu['model'],
                'price' => $gpu['price'], 'stock' => rand(3, 30),
                'image' => 'images/components/gpu/' . Str::slug($gpu['model']) . '.jpg',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $vramTypeId = $vramMap[$gpu['vram_type']] ?? $vGDDR6; 
            
            DB::table('gpu_specs')->insert([
                'component_id' => $id,
                'vram_gb' => $gpu['vram'],
                'vram_type_id' => $vramTypeId,
                'memory_bus_bit' => $gpu['bus'], 'tdp_watts' => $gpu['tdp'],
                'length_mm' => rand(240, 340), 'width_mm' => rand(110, 140),
                'pcie_slots_required' => rand(2, 3), 'pcie_gen' => '4.0',
                'power_requires' => rand(1, 2) . 'x8',
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // 6.3 ОЗУ (30 шт)
        DB::table('ram_specs');
        DB::table('components')->where('category_id', $catRam)->delete();

        $rams = [
            ['brand' => $bCorsair, 'model' => 'Vengeance LPX 16GB DDR4 3200', 'price' => 4500, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 1],
            ['brand' => $bGSkill, 'model' => 'Trident Z5 RGB 32GB DDR5 6400', 'price' => 15500, 'cap' => 32, 'speed' => 6400, 'type' => 'DDR5', 'cl' => 32, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Beast 32GB DDR4 3200', 'price' => 8500, 'cap' => 32, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bCorsair, 'model' => 'Vengeance RGB Pro 16GB DDR4 3600', 'price' => 5500, 'cap' => 16, 'speed' => 3600, 'type' => 'DDR4', 'cl' => 18, 'mod' => 1],
            ['brand' => $bGSkill, 'model' => 'Ripjaws V 16GB DDR4 3200', 'price' => 4200, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 1],
            ['brand' => $bKingston, 'model' => 'Fury Renegade 32GB DDR5 6000', 'price' => 14500, 'cap' => 32, 'speed' => 6000, 'type' => 'DDR5', 'cl' => 30, 'mod' => 2],
            ['brand' => $bCorsair, 'model' => 'Dominator Platinum 32GB DDR5 6800', 'price' => 18900, 'cap' => 32, 'speed' => 6800, 'type' => 'DDR5', 'cl' => 34, 'mod' => 2],
            ['brand' => $bCrucial, 'model' => 'Pro 16GB DDR4 3200', 'price' => 3900, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 22, 'mod' => 1],
            ['brand' => $bCrucial, 'model' => 'Pro 32GB DDR5 5600', 'price' => 11500, 'cap' => 32, 'speed' => 5600, 'type' => 'DDR5', 'cl' => 46, 'mod' => 2],
            ['brand' => $bAdata, 'model' => 'XPG Spectrix D60G 16GB DDR4 3600', 'price' => 5200, 'cap' => 16, 'speed' => 3600, 'type' => 'DDR4', 'cl' => 17, 'mod' => 1],
            ['brand' => $bAdata, 'model' => 'XPG Lancer 32GB DDR5 6000', 'price' => 13500, 'cap' => 32, 'speed' => 6000, 'type' => 'DDR5', 'cl' => 30, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Trident Z5 16GB DDR5 6000', 'price' => 8500, 'cap' => 16, 'speed' => 6000, 'type' => 'DDR5', 'cl' => 30, 'mod' => 1],
            ['brand' => $bKingston, 'model' => 'Fury Beast 16GB DDR4 2666', 'price' => 3500, 'cap' => 16, 'speed' => 2666, 'type' => 'DDR4', 'cl' => 16, 'mod' => 1],
            ['brand' => $bCorsair, 'model' => 'Vengeance LPX 32GB DDR4 2400', 'price' => 7500, 'cap' => 32, 'speed' => 2400, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Aegis 8GB DDR4 3200', 'price' => 2200, 'cap' => 8, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 1],
            ['brand' => $bKingston, 'model' => 'ValueRAM 8GB DDR4 2666', 'price' => 2000, 'cap' => 8, 'speed' => 2666, 'type' => 'DDR4', 'cl' => 19, 'mod' => 1],
            ['brand' => $bCorsair, 'model' => 'Vengeance RGB SL 16GB DDR5 5200', 'price' => 7500, 'cap' => 16, 'speed' => 5200, 'type' => 'DDR5', 'cl' => 40, 'mod' => 1],
            ['brand' => $bCrucial, 'model' => 'Basic 8GB DDR4 2400', 'price' => 1800, 'cap' => 8, 'speed' => 2400, 'type' => 'DDR4', 'cl' => 17, 'mod' => 1],
            ['brand' => $bAdata, 'model' => 'Premier 16GB DDR4 3200', 'price' => 3800, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 22, 'mod' => 1],
            ['brand' => $bGSkill, 'model' => 'Flare X5 32GB DDR5 6000', 'price' => 13900, 'cap' => 32, 'speed' => 6000, 'type' => 'DDR5', 'cl' => 30, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Impact 16GB DDR4 3200 SO-DIMM', 'price' => 4500, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 20, 'mod' => 1],
            ['brand' => $bCorsair, 'model' => 'Select 4GB DDR4 2400', 'price' => 1200, 'cap' => 4, 'speed' => 2400, 'type' => 'DDR4', 'cl' => 17, 'mod' => 1],
            ['brand' => $bCrucial, 'model' => 'Pro 64GB DDR5 5600', 'price' => 24500, 'cap' => 64, 'speed' => 5600, 'type' => 'DDR5', 'cl' => 46, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Zeta R5 16GB DDR5 5600', 'price' => 7200, 'cap' => 16, 'speed' => 5600, 'type' => 'DDR5', 'cl' => 36, 'mod' => 1],
            ['brand' => $bAdata, 'model' => 'XPG Caster 32GB DDR5 6400', 'price' => 15200, 'cap' => 32, 'speed' => 6400, 'type' => 'DDR5', 'cl' => 32, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Beast 64GB DDR4 3200', 'price' => 18500, 'cap' => 64, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bCorsair, 'model' => 'Vengeance 48GB DDR5 6000', 'price' => 16500, 'cap' => 48, 'speed' => 6000, 'type' => 'DDR5', 'cl' => 30, 'mod' => 2],
            ['brand' => $bCrucial, 'model' => 'Pro 16GB DDR5 4800', 'price' => 6500, 'cap' => 16, 'speed' => 4800, 'type' => 'DDR5', 'cl' => 40, 'mod' => 1],
            ['brand' => $bGSkill, 'model' => 'Ripjaws S5 32GB DDR5 6400', 'price' => 14200, 'cap' => 32, 'speed' => 6400, 'type' => 'DDR5', 'cl' => 32, 'mod' => 2],
            ['brand' => $bAdata, 'model' => 'Premier 32GB DDR5 5200', 'price' => 10500, 'cap' => 32, 'speed' => 5200, 'type' => 'DDR5', 'cl' => 40, 'mod' => 2],
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

        // 6.4 Материнские платы (30 шт)
        DB::table('motherboard_specs');
        DB::table('components')->where('category_id', $catMobo)->delete();

        $mobos = [
            ['brand' => $bAsus, 'model' => 'PRIME B760M-A', 'price' => 11500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bMsi, 'model' => 'MAG B650 TOMAHAWK', 'price' => 18500, 'socket' => $sAM5, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bAsus, 'model' => 'ROG STRIX Z790-A', 'price' => 28500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'B550 AORUS ELITE', 'price' => 12500, 'socket' => $sAM4, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'PRO Z790-A WIFI', 'price' => 24500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bAsus, 'model' => 'TUF GAMING B550-PLUS', 'price' => 10500, 'socket' => $sAM4, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'Z790 GAMING X', 'price' => 19500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'MPG B760M EDGE WIFI', 'price' => 17500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'PRIME A620M-K', 'price' => 8500, 'socket' => $sAM5, 'ram_slots' => 2, 'ram_type' => 'DDR5', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bGigabyte, 'model' => 'B650M AORUS PRO AX', 'price' => 16500, 'socket' => $sAM5, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bMsi, 'model' => 'MEG Z790 ACE', 'price' => 42500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 5, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffEATX],
            ['brand' => $bAsus, 'model' => 'ROG MAXIMUS Z790 HERO', 'price' => 52500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 5, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'X670E AORUS MASTER', 'price' => 38500, 'socket' => $sAM5, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 5, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffEATX],
            ['brand' => $bMsi, 'model' => 'MAG B550M MORTAR', 'price' => 9500, 'socket' => $sAM4, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'PRIME H610M-K', 'price' => 6500, 'socket' => $sLGA1700, 'ram_slots' => 2, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bGigabyte, 'model' => 'H610M S2H', 'price' => 6000, 'socket' => $sLGA1700, 'ram_slots' => 2, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bMsi, 'model' => 'PRO B760M-A WIFI', 'price' => 14500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'TUF GAMING X670E PLUS', 'price' => 26500, 'socket' => $sAM5, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'B760M DS3H', 'price' => 9500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffMATX],
            ['brand' => $bMsi, 'model' => 'PRO A620M-E', 'price' => 7500, 'socket' => $sAM5, 'ram_slots' => 2, 'ram_type' => 'DDR5', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'ROG STRIX B650-A GAMING WIFI', 'price' => 22500, 'socket' => $sAM5, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'Z690 GAMING X DDR4', 'price' => 16500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'MAG B660M MORTAR', 'price' => 12500, 'socket' => $sLGA1700, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'PRIME B450M-A II', 'price' => 5500, 'socket' => $sAM4, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '3.0', 'sata' => 6, 'ff' => $ffMATX],
            ['brand' => $bGigabyte, 'model' => 'B450M DS3H', 'price' => 5000, 'socket' => $sAM4, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '3.0', 'sata' => 6, 'ff' => $ffMATX],
            ['brand' => $bMsi, 'model' => 'B450M PRO-VDH MAX', 'price' => 6500, 'socket' => $sAM4, 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '3.0', 'sata' => 6, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'ROG STRIX B760-I GAMING WIFI', 'price' => 24500, 'socket' => $sLGA1700, 'ram_slots' => 2, 'ram_type' => 'DDR5', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '5.0', 'sata' => 4, 'ff' => $ffITX],
            ['brand' => $bGigabyte, 'model' => 'B650I AORUS ULTRA', 'price' => 23500, 'socket' => $sAM5, 'ram_slots' => 2, 'ram_type' => 'DDR5', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffITX],
            ['brand' => $bMsi, 'model' => 'MEG X670E GODLIKE', 'price' => 89500, 'socket' => $sAM5, 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 5, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffEATX],
            ['brand' => $bAsus, 'model' => 'WS Z790 REPUBLIC', 'price' => 62500, 'socket' => $sLGA1700, 'ram_slots' => 8, 'ram_type' => 'DDR5', 'm2' => 5, 'pcie' => 4, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffEATX],
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

        // 6.5 Блоки питания (30 шт)
        DB::table('psu_specs');
        DB::table('components')->where('category_id', $catPsu)->delete();
        $psus = [
            ['brand' => $bCorsair, 'model' => 'RM750x', 'price' => 10500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bDeepCool, 'model' => 'DQ750-M-V2L', 'price' => 7500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bSeasonic, 'model' => 'FOCUS GX-850', 'price' => 12500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bBequiet, 'model' => 'Straight Power 11 750W', 'price' => 9500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'RM850x', 'price' => 11500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bEVGA, 'model' => 'SuperNOVA 750 G5', 'price' => 9000, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bThermaltake, 'model' => 'Toughpower GF1 850W', 'price' => 10000, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bMsi, 'model' => 'MPG A850GF', 'price' => 11000, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bAsus, 'model' => 'ROG STRIX 850W Gold', 'price' => 13500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bGigabyte, 'model' => 'P850GM', 'price' => 9500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'RM1000x', 'price' => 14500, 'watt' => 1000, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 4, 'type' => '6+2'],
            ['brand' => $bSeasonic, 'model' => 'PRIME TX-1000', 'price' => 18500, 'watt' => 1000, 'eff' => '80+ Titanium', 'mod' => 'Full', 'pcie' => 4, 'type' => '6+2'],
            ['brand' => $bBequiet, 'model' => 'Dark Power 13 1000W', 'price' => 19500, 'watt' => 1000, 'eff' => '80+ Titanium', 'mod' => 'Full', 'pcie' => 4, 'type' => '6+2'],
            ['brand' => $bDeepCool, 'model' => 'PX1000G', 'price' => 13500, 'watt' => 1000, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 4, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'CX650', 'price' => 5500, 'watt' => 650, 'eff' => '80+ Bronze', 'mod' => 'Non', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bDeepCool, 'model' => 'PK650D', 'price' => 4500, 'watt' => 650, 'eff' => '80+ Bronze', 'mod' => 'Non', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bThermaltake, 'model' => 'Smart 600W', 'price' => 4000, 'watt' => 600, 'eff' => '80+', 'mod' => 'Non', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bAdata, 'model' => 'CORE REACTOR 750W', 'price' => 8500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'SF750', 'price' => 13000, 'watt' => 750, 'eff' => '80+ Platinum', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bSeasonic, 'model' => 'FOCUS GX-650', 'price' => 8500, 'watt' => 650, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bBequiet, 'model' => 'Pure Power 12 M 750W', 'price' => 8000, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Semi', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bEVGA, 'model' => '600 W1', 'price' => 3500, 'watt' => 600, 'eff' => '80+', 'mod' => 'Non', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bMsi, 'model' => 'MAG A650BN', 'price' => 5000, 'watt' => 650, 'eff' => '80+ Bronze', 'mod' => 'Non', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bAsus, 'model' => 'TUF GAMING 750W', 'price' => 8500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bGigabyte, 'model' => 'UD750GM', 'price' => 8000, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'HX1200i', 'price' => 21500, 'watt' => 1200, 'eff' => '80+ Platinum', 'mod' => 'Full', 'pcie' => 4, 'type' => '6+2'],
            ['brand' => $bSeasonic, 'model' => 'VERTEX GX-1200', 'price' => 22500, 'watt' => 1200, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 4, 'type' => '6+2'],
            ['brand' => $bDeepCool, 'model' => 'EM1200', 'price' => 16500, 'watt' => 1200, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 4, 'type' => '6+2'],
            ['brand' => $bBequiet, 'model' => 'Straight Power 12 850W', 'price' => 11500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bThermaltake, 'model' => 'Ramses 1050W', 'price' => 14000, 'watt' => 1050, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 4, 'type' => '6+2'],
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

        // 6.6 Накопители (30 шт)
        DB::table('storage_specs');
        DB::table('components')->where('category_id', $catStorage)->delete();
        $storages = [
            ['brand' => $bSamsung, 'model' => '990 PRO 1TB', 'price' => 9500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7450, 'write' => 6900, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'WD Blue SN580 1TB', 'price' => 5500, 'type' => 'nvme', 'cap' => 1000, 'read' => 4150, 'write' => 4150, 'ff' => 'm.2_2280'],
            ['brand' => $bSamsung, 'model' => '870 EVO 1TB', 'price' => 7500, 'type' => 'sata', 'cap' => 1000, 'read' => 560, 'write' => 530, 'ff' => '2.5'],
            ['brand' => $bSeagate, 'model' => 'Barracuda 2TB', 'price' => 4500, 'type' => 'sata', 'cap' => 2000, 'read' => 190, 'write' => 190, 'ff' => '3.5'],
            ['brand' => $bSamsung, 'model' => '980 PRO 2TB', 'price' => 16500, 'type' => 'nvme', 'cap' => 2000, 'read' => 7000, 'write' => 5100, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'WD Black SN850X 2TB', 'price' => 15500, 'type' => 'nvme', 'cap' => 2000, 'read' => 7300, 'write' => 6600, 'ff' => 'm.2_2280'],
            ['brand' => $bCrucial, 'model' => 'P5 Plus 1TB', 'price' => 7500, 'type' => 'nvme', 'cap' => 1000, 'read' => 6600, 'write' => 5000, 'ff' => 'm.2_2280'],
            ['brand' => $bSKHynix, 'model' => 'Platinum P41 1TB', 'price' => 9000, 'type' => 'nvme', 'cap' => 1000, 'read' => 7000, 'write' => 6500, 'ff' => 'm.2_2280'],
            ['brand' => $bSabrent, 'model' => 'Rocket 4 Plus 1TB', 'price' => 8500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7100, 'write' => 6600, 'ff' => 'm.2_2280'],
            ['brand' => $bAdata, 'model' => 'XPG GAMMIX S70 BLADE 1TB', 'price' => 7000, 'type' => 'nvme', 'cap' => 1000, 'read' => 7400, 'write' => 6400, 'ff' => 'm.2_2280'],
            ['brand' => $bSamsung, 'model' => '970 EVO Plus 500GB', 'price' => 5500, 'type' => 'nvme', 'cap' => 500, 'read' => 3500, 'write' => 3300, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'WD Green 240GB', 'price' => 2500, 'type' => 'sata', 'cap' => 240, 'read' => 545, 'write' => 465, 'ff' => '2.5'],
            ['brand' => $bCrucial, 'model' => 'MX500 1TB', 'price' => 7000, 'type' => 'sata', 'cap' => 1000, 'read' => 560, 'write' => 510, 'ff' => '2.5'],
            ['brand' => $bSeagate, 'model' => 'IronWolf 4TB', 'price' => 8500, 'type' => 'sata', 'cap' => 4000, 'read' => 210, 'write' => 210, 'ff' => '3.5'],
            ['brand' => $bSamsung, 'model' => '870 QVO 2TB', 'price' => 12500, 'type' => 'sata', 'cap' => 2000, 'read' => 560, 'write' => 530, 'ff' => '2.5'],
            ['brand' => $bSKHynix, 'model' => 'Gold S31 500GB', 'price' => 4000, 'type' => 'sata', 'cap' => 500, 'read' => 560, 'write' => 520, 'ff' => '2.5'],
            ['brand' => $bWesternDigital, 'model' => 'WD Red Plus 4TB', 'price' => 9000, 'type' => 'sata', 'cap' => 4000, 'read' => 210, 'write' => 210, 'ff' => '3.5'],
            ['brand' => $bAdata, 'model' => 'Ultimate SU650 480GB', 'price' => 3000, 'type' => 'sata', 'cap' => 480, 'read' => 520, 'write' => 450, 'ff' => '2.5'],
            ['brand' => $bCrucial, 'model' => 'T500 1TB', 'price' => 8500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7300, 'write' => 6800, 'ff' => 'm.2_2280'],
            ['brand' => $bSabrent, 'model' => 'Rocket Q4 2TB', 'price' => 13500, 'type' => 'nvme', 'cap' => 2000, 'read' => 5000, 'write' => 4400, 'ff' => 'm.2_2280'],
            ['brand' => $bSamsung, 'model' => 'PM9A1 1TB OEM', 'price' => 7500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7000, 'write' => 5200, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'SN770 1TB', 'price' => 6500, 'type' => 'nvme', 'cap' => 1000, 'read' => 5150, 'write' => 4900, 'ff' => 'm.2_2280'],
            ['brand' => $bSeagate, 'model' => 'FireCuda 520 1TB', 'price' => 8000, 'type' => 'nvme', 'cap' => 1000, 'read' => 7000, 'write' => 6200, 'ff' => 'm.2_2280'],
            ['brand' => $bAdata, 'model' => 'Legend 960 MAX 1TB', 'price' => 6500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7400, 'write' => 6800, 'ff' => 'm.2_2280'],
            ['brand' => $bCrucial, 'model' => 'P3 1TB', 'price' => 5500, 'type' => 'nvme', 'cap' => 1000, 'read' => 3500, 'write' => 3000, 'ff' => 'm.2_2280'],
            ['brand' => $bSKHynix, 'model' => 'BC711 500GB', 'price' => 4500, 'type' => 'nvme', 'cap' => 500, 'read' => 5000, 'write' => 4200, 'ff' => 'm.2_2280'],
            ['brand' => $bSamsung, 'model' => '990 PRO 4TB', 'price' => 32500, 'type' => 'nvme', 'cap' => 4000, 'read' => 7450, 'write' => 6900, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'WD Black 8TB', 'price' => 14500, 'type' => 'sata', 'cap' => 8000, 'read' => 210, 'write' => 210, 'ff' => '3.5'],
            ['brand' => $bSeagate, 'model' => 'Exos X18 18TB', 'price' => 32500, 'type' => 'sata', 'cap' => 18000, 'read' => 260, 'write' => 260, 'ff' => '3.5'],
            ['brand' => $bCrucial, 'model' => 'P3 Plus 2TB', 'price' => 10500, 'type' => 'nvme', 'cap' => 2000, 'read' => 5000, 'write' => 4200, 'ff' => 'm.2_2280'],
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

        // 6.7 Кулеры (30 шт, связь Many-to-Many)
        DB::table('cooler_specs');
        DB::table('cooler_socket');
        DB::table('components')->where('category_id', $catCooler)->delete();
        $coolers = [
            ['brand' => 'DeepCool', 'model' => 'AK400', 'price' => 3200, 'tdp' => 220, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Noctua', 'model' => 'NH-D15', 'price' => 8500, 'tdp' => 250, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Arctic', 'model' => 'Freezer 34 eSports DUO', 'price' => 3500, 'tdp' => 200, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'be quiet!', 'model' => 'Pure Rock 2', 'price' => 3000, 'tdp' => 150, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Thermalright', 'model' => 'Peerless Assassin 120', 'price' => 4500, 'tdp' => 260, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'NZXT', 'model' => 'Kraken X63', 'price' => 12500, 'tdp' => 250, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Corsair', 'model' => 'H100i RGB PRO XT', 'price' => 11500, 'tdp' => 240, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'DeepCool', 'model' => 'Gammaxx 400 V2', 'price' => 2500, 'tdp' => 180, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Noctua', 'model' => 'NH-U12S redux', 'price' => 5500, 'tdp' => 160, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Arctic', 'model' => 'Freezer 7 X', 'price' => 2800, 'tdp' => 200, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Corsair', 'model' => 'A500', 'price' => 9500, 'tdp' => 250, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'be quiet!', 'model' => 'Dark Rock Pro 4', 'price' => 8000, 'tdp' => 250, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Thermaltake', 'model' => 'Frio 3', 'price' => 4000, 'tdp' => 220, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'MSI', 'model' => 'MAG CORELIQUID 240R', 'price' => 9000, 'tdp' => 250, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'ASUS', 'model' => 'ROG Ryujin II 360', 'price' => 28500, 'tdp' => 300, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Gigabyte', 'model' => 'AORUS WATERFORCE X 360', 'price' => 16500, 'tdp' => 280, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'DeepCool', 'model' => 'LS520', 'price' => 10500, 'tdp' => 250, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Thermalright', 'model' => 'Aqua Elite 360', 'price' => 7500, 'tdp' => 240, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'NZXT', 'model' => 'Kraken Z73', 'price' => 24500, 'tdp' => 280, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Corsair', 'model' => 'H150i ELITE CAPELLIX', 'price' => 17500, 'tdp' => 280, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Arctic', 'model' => 'Liquid Freezer II 280', 'price' => 9500, 'tdp' => 250, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'be quiet!', 'model' => 'Silent Wings 4 PWM', 'price' => 2000, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => []],
            ['brand' => 'Noctua', 'model' => 'NF-A12x25 PWM', 'price' => 2500, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => []],
            ['brand' => 'DeepCool', 'model' => 'FK120', 'price' => 1200, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => []],
            ['brand' => 'Thermaltake', 'model' => 'Riing Quad 12', 'price' => 3500, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => []],
            ['brand' => 'Corsair', 'model' => 'QL120 RGB', 'price' => 4000, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => []],
            ['brand' => 'Lian Li', 'model' => 'UNI FAN SL120', 'price' => 4500, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => []],
            ['brand' => 'Phanteks', 'model' => 'T30-120', 'price' => 3000, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => []],
            ['brand' => 'Fractal Design', 'model' => 'Prism Slim', 'price' => 2200, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => []],
            ['brand' => 'Cooler Master', 'model' => 'MasterFan MF120 Halo', 'price' => 3200, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => []],
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

        // 6.8 Корпуса (30 шт, FK case_type и material)
        DB::table('case_specs');
        DB::table('case_form_factor');
        DB::table('components')->where('category_id', $catCase)->delete();
        $cases = [
            ['brand' => 'NZXT', 'model' => 'H5 Flow', 'price' => 8500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 385, 'height' => 450, 'width' => 210, 'length' => 460],
            ['brand' => 'Lian Li', 'model' => 'O11 Dynamic EVO', 'price' => 15500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 0, 'ffs' => [$ffATX, $ffEATX], 'max_length_gpu' => 422, 'height' => 459, 'width' => 285, 'length' => 472],
            ['brand' => 'Corsair', 'model' => '4000D Airflow', 'price' => 9500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 360, 'height' => 453, 'width' => 230, 'length' => 466],
            ['brand' => 'Fractal Design', 'model' => 'Meshify 2', 'price' => 12500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 442, 'height' => 475, 'width' => 240, 'length' => 540],
            ['brand' => 'be quiet!', 'model' => 'Silent Base 802', 'price' => 14500, 'type' => 'mid_tower', 'top_slots' => 3, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 491, 'height' => 539, 'width' => 247, 'length' => 547],
            ['brand' => 'Phanteks', 'model' => 'P400A Digital', 'price' => 8000, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 430, 'height' => 492, 'width' => 230, 'length' => 503],
            ['brand' => 'Cooler Master', 'model' => 'MasterBox TD500 Mesh', 'price' => 7500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 400, 'height' => 454, 'width' => 223, 'length' => 500],
            ['brand' => 'Thermaltake', 'model' => 'Versa H18', 'price' => 4500, 'type' => 'mini', 'top_slots' => 1, 'fans' => 1, 'ffs' => [$ffMATX, $ffITX], 'max_length_gpu' => 310, 'height' => 410, 'width' => 190, 'length' => 365],
            ['brand' => 'DeepCool', 'model' => 'Matrexx 55 Mesh', 'price' => 6000, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 370, 'height' => 465, 'width' => 220, 'length' => 485],
            ['brand' => 'MSI', 'model' => 'MAG FORGE 100M', 'price' => 5500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 360, 'height' => 432, 'width' => 210, 'length' => 441],
            ['brand' => 'ASUS', 'model' => 'TUF Gaming GT501', 'price' => 13500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 400, 'height' => 495, 'width' => 243, 'length' => 546],
            ['brand' => 'Gigabyte', 'model' => 'AORUS C700 Glass', 'price' => 18500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 4, 'ffs' => [$ffATX, $ffEATX, $ffMATX], 'max_length_gpu' => 450, 'height' => 580, 'width' => 280, 'length' => 560],
            ['brand' => 'NZXT', 'model' => 'H7 Elite', 'price' => 16500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 420, 'height' => 485, 'width' => 235, 'length' => 515],
            ['brand' => 'Corsair', 'model' => '5000D Airflow', 'price' => 14500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 400, 'height' => 530, 'width' => 245, 'length' => 540],
            ['brand' => 'Lian Li', 'model' => 'PC-O11 Mini', 'price' => 12500, 'type' => 'sff', 'top_slots' => 2, 'fans' => 0, 'ffs' => [$ffMATX, $ffITX], 'max_length_gpu' => 330, 'height' => 420, 'width' => 265, 'length' => 385],
            ['brand' => 'Fractal Design', 'model' => 'Define 7 XL', 'price' => 22500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 3, 'ffs' => [$ffATX, $ffEATX, $ffMATX], 'max_length_gpu' => 545, 'height' => 647, 'width' => 290, 'length' => 645],
            ['brand' => 'be quiet!', 'model' => 'Dark Base Pro 901', 'price' => 24500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 3, 'ffs' => [$ffATX, $ffEATX, $ffMATX], 'max_length_gpu' => 497, 'height' => 577, 'width' => 285, 'length' => 577],
            ['brand' => 'Phanteks', 'model' => 'Eclipse P600S', 'price' => 13500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 435, 'height' => 535, 'width' => 245, 'length' => 545],
            ['brand' => 'Cooler Master', 'model' => 'NR200P', 'price' => 7000, 'type' => 'sff', 'top_slots' => 1, 'fans' => 1, 'ffs' => [$ffMATX, $ffITX], 'max_length_gpu' => 330, 'height' => 343, 'width' => 187, 'length' => 376],
            ['brand' => 'Thermaltake', 'model' => 'Core P8 TG', 'price' => 19500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 0, 'ffs' => [$ffATX, $ffEATX, $ffMATX], 'max_length_gpu' => 500, 'height' => 670, 'width' => 320, 'length' => 690],
            ['brand' => 'DeepCool', 'model' => 'CL500', 'price' => 5000, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 370, 'height' => 470, 'width' => 220, 'length' => 480],
            ['brand' => 'MSI', 'model' => 'MPG Velox 100P', 'price' => 8500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 4, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 400, 'height' => 480, 'width' => 235, 'length' => 500],
            ['brand' => 'ASUS', 'model' => 'ROG Strix Helios', 'price' => 22500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 4, 'ffs' => [$ffATX, $ffEATX, $ffMATX], 'max_length_gpu' => 450, 'height' => 575, 'width' => 280, 'length' => 565],
            ['brand' => 'Gigabyte', 'model' => 'C200 Glass', 'price' => 6500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 360, 'height' => 440, 'width' => 210, 'length' => 450],
            ['brand' => 'NZXT', 'model' => 'H1 V2', 'price' => 14500, 'type' => 'sff', 'top_slots' => 1, 'fans' => 1, 'ffs' => [$ffITX], 'max_length_gpu' => 304, 'height' => 387, 'width' => 187, 'length' => 392],
            ['brand' => 'Corsair', 'model' => '275R Airflow', 'price' => 7500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 400, 'height' => 455, 'width' => 225, 'length' => 465],
            ['brand' => 'Lian Li', 'model' => 'LANCOOL III', 'price' => 16500, 'type' => 'mid_tower', 'top_slots' => 3, 'fans' => 3, 'ffs' => [$ffATX, $ffEATX, $ffMATX], 'max_length_gpu' => 450, 'height' => 550, 'width' => 255, 'length' => 550],
            ['brand' => 'Fractal Design', 'model' => 'Torrent', 'price' => 17500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 5, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 425, 'height' => 530, 'width' => 255, 'length' => 545],
            ['brand' => 'be quiet!', 'model' => 'Pure Base 500DX', 'price' => 9000, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX], 'max_length_gpu' => 400, 'height' => 485, 'width' => 230, 'length' => 505],
            ['brand' => 'Phanteks', 'model' => 'NV7', 'price' => 21500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 4, 'ffs' => [$ffATX, $ffEATX, $ffMATX], 'max_length_gpu' => 500, 'height' => 600, 'width' => 295, 'length' => 580],
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
                'max_length_gpu' => $case['max_length_gpu'] ?? null,
                'height' => $case['height'] ?? null,
                'width' => $case['width'] ?? null,
                'length' => $case['length'] ?? null,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            
            foreach ($case['ffs'] as $ffId) {
                DB::table('case_form_factor')->insert([
                    'component_id' => $id, 'form_factor_id' => $ffId,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ========== 7. ГОТОВЫЕ СБОРКИ (30 шт) ==========
        DB::table('prebuilt_pcs');
        DB::table('prebuilt_pc_component');
        DB::table('prebuilt_pc_tag');
        
        $tagNames = ['Игровой', 'Для работы', 'Бюджетный', 'Топовый', 'RGB', 'Компактный', 'Мощный', 'Офисный', 'Стриминг', 'Эксклюзивный'];
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

        $pcConfigs = [
            ['name' => 'Storm Basic', 'price' => 45000, 'tags' => ['Бюджетный', 'Офисный']],
            ['name' => 'Storm Lite', 'price' => 55000, 'tags' => ['Бюджетный', 'Игровой']],
            ['name' => 'Storm Pro', 'price' => 65000, 'tags' => ['Игровой', 'RGB']],
            ['name' => 'Storm Ultra', 'price' => 75000, 'tags' => ['Игровой', 'Мощный']],
            ['name' => 'Storm RGB', 'price' => 85000, 'tags' => ['RGB', 'Игровой']],
            ['name' => 'Titan Entry', 'price' => 95000, 'tags' => ['Игровой', 'Топовый']],
            ['name' => 'Titan Gaming', 'price' => 105000, 'tags' => ['Игровой', 'Мощный']],
            ['name' => 'Titan Pro', 'price' => 125000, 'tags' => ['Топовый', 'RGB']],
            ['name' => 'Titan Ultra', 'price' => 145000, 'tags' => ['Топовый', 'Мощный']],
            ['name' => 'Titan Extreme', 'price' => 165000, 'tags' => ['Топовый', 'RGB', 'Мощный']],
            ['name' => 'Work Station', 'price' => 85000, 'tags' => ['Для работы', 'Мощный']],
            ['name' => 'Work Pro', 'price' => 115000, 'tags' => ['Для работы', 'Топовый']],
            ['name' => 'Stream Master', 'price' => 135000, 'tags' => ['Стриминг', 'RGB']],
            ['name' => 'Stream Pro', 'price' => 155000, 'tags' => ['Стриминг', 'Топовый']],
            ['name' => 'Compact Mini', 'price' => 65000, 'tags' => ['Компактный', 'Игровой']],
            ['name' => 'Compact Pro', 'price' => 95000, 'tags' => ['Компактный', 'Топовый']],
            ['name' => 'RGB Gamer', 'price' => 75000, 'tags' => ['RGB', 'Игровой']],
            ['name' => 'RGB Master', 'price' => 105000, 'tags' => ['RGB', 'Мощный']],
            ['name' => 'Budget King', 'price' => 40000, 'tags' => ['Бюджетный']],
            ['name' => 'Budget Plus', 'price' => 50000, 'tags' => ['Бюджетный', 'Офисный']],
            ['name' => 'Office Basic', 'price' => 35000, 'tags' => ['Офисный', 'Бюджетный']],
            ['name' => 'Office Pro', 'price' => 55000, 'tags' => ['Офисный', 'Для работы']],
            ['name' => 'Power Beast', 'price' => 175000, 'tags' => ['Мощный', 'Топовый']],
            ['name' => 'Power Ultimate', 'price' => 195000, 'tags' => ['Мощный', 'RGB', 'Топовый']],
            ['name' => 'Top Tier', 'price' => 215000, 'tags' => ['Топовый', 'Мощный']],
            ['name' => 'Top Elite', 'price' => 235000, 'tags' => ['Топовый', 'RGB']],
            ['name' => 'Game Master', 'price' => 125000, 'tags' => ['Игровой', 'Топовый', 'RGB']],
            ['name' => 'Game Legend', 'price' => 185000, 'tags' => ['Игровой', 'Мощный', 'RGB']],
            ['name' => 'Creator PC', 'price' => 145000, 'tags' => ['Для работы', 'Мощный', 'RGB']],
            ['name' => 'Creator Pro', 'price' => 175000, 'tags' => ['Для работы', 'Топовый', 'Мощный']],
            ['name' => 'Exclusive Titan', 'price' => 350000, 'tags' => ['Эксклюзивный', 'Топовый', 'Мощный', 'RGB']],
        ];
        
        foreach ($pcConfigs as $index => $config) {
            $pcName = $config['name'];
            
            $pcId = DB::table('prebuilt_pcs')->insertGetId([
                'name' => $pcName, 'slug' => Str::slug($pcName),
                'description' => "Готовая сборка {$pcName}.",
                'price' => $config['price'] + rand(-2000, 5000),
                'image' => "pcs/pc_" . ($index + 1) . ".jpg", 'is_active' => true,
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

            foreach ($config['tags'] as $tName) {
                if(isset($tagMap[$tName])) {
                    DB::table('prebuilt_pc_tag')->insert([
                        'prebuilt_pc_id' => $pcId, 'tag_id' => $tagMap[$tName],
                        'created_at' => now(), 'updated_at' => now()
                    ]);
                }
            }
        }
        
        $this->command->info('✅ Готово! База успешно заполнена: 30 пользователей, 240 компонентов, 30 готовых сборок.');
    }
}