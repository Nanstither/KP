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

        // ========== 2. БРЕНДЫ ==========
        $brands = [
            'Intel', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'Gigabyte', 
            'Corsair', 'Kingston', 'Samsung', 'DeepCool', 'Noctua', 
            'NZXT', 'be quiet!', 'Seasonic', 'EVGA', 'Western Digital',
            'Crucial', 'G.Skill', 'Thermaltake', 'Cooler Master',
            'Thermalright', 'Arctic', 'Lian Li', 'Phanteks', 'Fractal Design', 
            'Sabrent', 'ADATA', 'SK Hynix',
        ];

        foreach ($brands as $brand) {
            DB::table('brands')->insert([
                'name' => $brand,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ID для связей
        $catIds = DB::table('component_categories')->pluck('id')->toArray();
        $brandIds = DB::table('brands')->pluck('id')->toArray();
        
        $catCpu = DB::table('component_categories')->where('slug', 'cpu')->first()->id;
        $catGpu = DB::table('component_categories')->where('slug', 'gpu')->first()->id;
        $catRam = DB::table('component_categories')->where('slug', 'ram')->first()->id;
        $catMobo = DB::table('component_categories')->where('slug', 'motherboard')->first()->id;
        $catPsu = DB::table('component_categories')->where('slug', 'psu')->first()->id;
        $catStorage = DB::table('component_categories')->where('slug', 'storage')->first()->id;
        $catCooler = DB::table('component_categories')->where('slug', 'cooler')->first()->id;
        $catCase = DB::table('component_categories')->where('slug', 'case')->first()->id;

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
        $bEvga = DB::table('brands')->where('name', 'EVGA')->first()->id;
        $bWesternDigital = DB::table('brands')->where('name', 'Western Digital')->first()->id;
        $bCrucial = DB::table('brands')->where('name', 'Crucial')->first()->id;
        $bGSkill = DB::table('brands')->where('name', 'G.Skill')->first()->id;
        $bThermaltake = DB::table('brands')->where('name', 'Thermaltake')->first()->id;
        $bCoolerMaster = DB::table('brands')->where('name', 'Cooler Master')->first()->id;
        $bSabrent = DB::table('brands')->where('name', 'Sabrent')->first()->id;
        $bAdata = DB::table('brands')->where('name', 'ADATA')->first()->id;
        $bSKHynix = DB::table('brands')->where('name', 'SK Hynix')->first()->id;

        // ========== 3. СОКЕТЫ ==========
        $sockets = ['LGA1700', 'LGA1851', 'AM5', 'AM4', 'LGA1200'];
        foreach ($sockets as $socket) {
            DB::table('sockets')->insert(['name' => $socket, 'created_at' => now(), 'updated_at' => now()]);
        }
        $sLGA1700 = DB::table('sockets')->where('name', 'LGA1700')->first()->id;
        $sAM5 = DB::table('sockets')->where('name', 'AM5')->first()->id;
        $sAM4 = DB::table('sockets')->where('name', 'AM4')->first()->id;

        // ========== 4. ФОРМ-ФАКТОРЫ ==========
        $formFactors = ['ATX', 'mATX', 'Mini-ITX', 'E-ATX'];
        foreach ($formFactors as $ff) {
            DB::table('form_factors')->insert(['name' => $ff, 'created_at' => now(), 'updated_at' => now()]);
        }
        $ffATX = DB::table('form_factors')->where('name', 'ATX')->first()->id;
        $ffMATX = DB::table('form_factors')->where('name', 'mATX')->first()->id;
        $ffITX = DB::table('form_factors')->where('name', 'Mini-ITX')->first()->id;
        $ffEATX = DB::table('form_factors')->where('name', 'E-ATX')->first()->id;

        // ========== 5. КОМПОНЕНТЫ + СПЕЦИФИКАЦИИ ==========
        
        // 5.1 ПРОЦЕССОРЫ (35 шт)
        $cpus = [
            ['brand' => $bIntel, 'model' => 'Core i9-14900K', 'price' => 58990, 'socket' => $sLGA1700, 'cores' => 24, 'threads' => 32, 'base' => 3200, 'boost' => 6000, 'tdp' => 253],
            ['brand' => $bIntel, 'model' => 'Core i7-14700K', 'price' => 42990, 'socket' => $sLGA1700, 'cores' => 20, 'threads' => 28, 'base' => 3400, 'boost' => 5600, 'tdp' => 253],
            ['brand' => $bIntel, 'model' => 'Core i5-14600K', 'price' => 32990, 'socket' => $sLGA1700, 'cores' => 14, 'threads' => 20, 'base' => 3500, 'boost' => 5300, 'tdp' => 181],
            ['brand' => $bIntel, 'model' => 'Core i5-13400F', 'price' => 18990, 'socket' => $sLGA1700, 'cores' => 10, 'threads' => 16, 'base' => 2500, 'boost' => 4600, 'tdp' => 65],
            ['brand' => $bIntel, 'model' => 'Core i3-13100F', 'price' => 9990, 'socket' => $sLGA1700, 'cores' => 4, 'threads' => 8, 'base' => 3400, 'boost' => 4500, 'tdp' => 58],
            ['brand' => $bAmd, 'model' => 'Ryzen 9 7950X', 'price' => 54990, 'socket' => $sAM5, 'cores' => 16, 'threads' => 32, 'base' => 4500, 'boost' => 5700, 'tdp' => 170],
            ['brand' => $bAmd, 'model' => 'Ryzen 7 7800X3D', 'price' => 42990, 'socket' => $sAM5, 'cores' => 8, 'threads' => 16, 'base' => 4200, 'boost' => 5000, 'tdp' => 120],
            ['brand' => $bAmd, 'model' => 'Ryzen 7 7700X', 'price' => 32990, 'socket' => $sAM5, 'cores' => 8, 'threads' => 16, 'base' => 4500, 'boost' => 5400, 'tdp' => 105],
            ['brand' => $bAmd, 'model' => 'Ryzen 5 7600X', 'price' => 22990, 'socket' => $sAM5, 'cores' => 6, 'threads' => 12, 'base' => 4700, 'boost' => 5300, 'tdp' => 105],
            ['brand' => $bAmd, 'model' => 'Ryzen 5 5600', 'price' => 11990, 'socket' => $sAM4, 'cores' => 6, 'threads' => 12, 'base' => 3500, 'boost' => 4400, 'tdp' => 65],
            ['brand' => $bIntel, 'model' => 'Core i9-13900K', 'price' => 56990, 'socket' => $sLGA1700, 'cores' => 24, 'threads' => 32, 'base' => 3000, 'boost' => 5800, 'tdp' => 253],
            ['brand' => $bIntel, 'model' => 'Core i7-13700K', 'price' => 39990, 'socket' => $sLGA1700, 'cores' => 16, 'threads' => 24, 'base' => 3400, 'boost' => 5400, 'tdp' => 253],
            ['brand' => $bIntel, 'model' => 'Core i5-13600K', 'price' => 29990, 'socket' => $sLGA1700, 'cores' => 14, 'threads' => 20, 'base' => 3500, 'boost' => 5100, 'tdp' => 181],
            ['brand' => $bAmd, 'model' => 'Ryzen 9 5950X', 'price' => 49990, 'socket' => $sAM4, 'cores' => 16, 'threads' => 32, 'base' => 3400, 'boost' => 4900, 'tdp' => 105],
            ['brand' => $bAmd, 'model' => 'Ryzen 7 5800X3D', 'price' => 38990, 'socket' => $sAM4, 'cores' => 8, 'threads' => 16, 'base' => 3400, 'boost' => 4500, 'tdp' => 105],
            ['brand' => $bAmd, 'model' => 'Ryzen 7 5700X', 'price' => 21990, 'socket' => $sAM4, 'cores' => 8, 'threads' => 16, 'base' => 3400, 'boost' => 4600, 'tdp' => 65],
            ['brand' => $bAmd, 'model' => 'Ryzen 5 5600X', 'price' => 14990, 'socket' => $sAM4, 'cores' => 6, 'threads' => 12, 'base' => 3700, 'boost' => 4600, 'tdp' => 65],
            ['brand' => $bIntel, 'model' => 'Core i9-12900K', 'price' => 52990, 'socket' => $sLGA1700, 'cores' => 16, 'threads' => 24, 'base' => 3200, 'boost' => 5200, 'tdp' => 241],
            ['brand' => $bIntel, 'model' => 'Core i7-12700K', 'price' => 36990, 'socket' => $sLGA1700, 'cores' => 12, 'threads' => 20, 'base' => 3600, 'boost' => 5000, 'tdp' => 190],
            ['brand' => $bIntel, 'model' => 'Core i5-12600K', 'price' => 24990, 'socket' => $sLGA1700, 'cores' => 10, 'threads' => 16, 'base' => 3700, 'boost' => 4900, 'tdp' => 150],
            ['brand' => $bAmd, 'model' => 'Ryzen 9 7900X', 'price' => 44990, 'socket' => $sAM5, 'cores' => 12, 'threads' => 24, 'base' => 4700, 'boost' => 5600, 'tdp' => 170],
            ['brand' => $bAmd, 'model' => 'Ryzen 5 7500F', 'price' => 16990, 'socket' => $sAM5, 'cores' => 6, 'threads' => 12, 'base' => 3700, 'boost' => 5000, 'tdp' => 65],
            ['brand' => $bIntel, 'model' => 'Core i3-12100F', 'price' => 8990, 'socket' => $sLGA1700, 'cores' => 4, 'threads' => 8, 'base' => 3300, 'boost' => 4300, 'tdp' => 58],
            ['brand' => $bAmd, 'model' => 'Ryzen 3 3300X', 'price' => 7990, 'socket' => $sAM4, 'cores' => 4, 'threads' => 8, 'base' => 3800, 'boost' => 4300, 'tdp' => 65],
            ['brand' => $bIntel, 'model' => 'Pentium Gold G7400', 'price' => 6990, 'socket' => $sLGA1700, 'cores' => 2, 'threads' => 4, 'base' => 3700, 'boost' => 3700, 'tdp' => 46],
            ['brand' => $bAmd, 'model' => 'Athlon Gold 3150G', 'price' => 5990, 'socket' => $sAM4, 'cores' => 4, 'threads' => 4, 'base' => 3500, 'boost' => 3900, 'tdp' => 65],
            ['brand' => $bIntel, 'model' => 'Core i9-14900KF', 'price' => 55990, 'socket' => $sLGA1700, 'cores' => 24, 'threads' => 32, 'base' => 3200, 'boost' => 6000, 'tdp' => 253],
            ['brand' => $bIntel, 'model' => 'Core i7-14700KF', 'price' => 39990, 'socket' => $sLGA1700, 'cores' => 20, 'threads' => 28, 'base' => 3400, 'boost' => 5600, 'tdp' => 253],
            ['brand' => $bIntel, 'model' => 'Core i5-14400F', 'price' => 21990, 'socket' => $sLGA1700, 'cores' => 10, 'threads' => 16, 'base' => 2500, 'boost' => 4700, 'tdp' => 65],
            ['brand' => $bAmd, 'model' => 'Ryzen 7 7700', 'price' => 29990, 'socket' => $sAM5, 'cores' => 8, 'threads' => 16, 'base' => 3800, 'boost' => 5300, 'tdp' => 65],
            ['brand' => $bAmd, 'model' => 'Ryzen 5 7600', 'price' => 19990, 'socket' => $sAM5, 'cores' => 6, 'threads' => 12, 'base' => 3800, 'boost' => 5100, 'tdp' => 65],
            ['brand' => $bIntel, 'model' => 'Core i7-13700', 'price' => 34990, 'socket' => $sLGA1700, 'cores' => 16, 'threads' => 24, 'base' => 2100, 'boost' => 5200, 'tdp' => 65],
            ['brand' => $bIntel, 'model' => 'Core i5-13500', 'price' => 24990, 'socket' => $sLGA1700, 'cores' => 14, 'threads' => 20, 'base' => 2500, 'boost' => 4800, 'tdp' => 65],
            ['brand' => $bAmd, 'model' => 'Ryzen 5 5500', 'price' => 9990, 'socket' => $sAM4, 'cores' => 6, 'threads' => 12, 'base' => 3600, 'boost' => 4200, 'tdp' => 65],
            ['brand' => $bAmd, 'model' => 'Ryzen 3 4100', 'price' => 6990, 'socket' => $sAM4, 'cores' => 4, 'threads' => 8, 'base' => 3800, 'boost' => 4000, 'tdp' => 65],
        ];

        $cpuIds = [];
        foreach ($cpus as $cpu) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catCpu,
                'brand_id' => $cpu['brand'],
                'model' => $cpu['model'],
                'price' => $cpu['price'],
                'stock' => rand(5, 50),
                'image' => 'components/cpu_' . Str::slug($cpu['model']) . '.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $cpuIds[] = $id;

            DB::table('cpu_specs')->insert([
                'component_id' => $id,
                'socket_id' => $cpu['socket'],
                'cores' => $cpu['cores'],
                'threads' => $cpu['threads'],
                'base_clock_mhz' => $cpu['base'],
                'boost_clock_mhz' => $cpu['boost'],
                'tdp_watts' => $cpu['tdp'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5.2 ВИДЕОКАРТЫ (35 шт)
        $gpus = [
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4090', 'price' => 189990, 'vram' => 24, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 450],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4080', 'price' => 119990, 'vram' => 16, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 320],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4070 Ti', 'price' => 89990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 285],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4070', 'price' => 64990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 200],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4060 Ti', 'price' => 44990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 160],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4060', 'price' => 35000, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 115],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 3080 Ti', 'price' => 99990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 350],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 3070 Ti', 'price' => 64990, 'vram' => 8, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 290],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 3060 Ti', 'price' => 44990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 256, 'tdp' => 200],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 3060', 'price' => 32990, 'vram' => 12, 'vram_type' => 'GDDR6', 'bus' => 192, 'tdp' => 170],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 3050', 'price' => 24990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 130],
            ['brand' => $bAsus, 'model' => 'TUF RTX 4090 OC', 'price' => 199990, 'vram' => 24, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 450],
            ['brand' => $bMsi, 'model' => 'Gaming X Trio RTX 4080', 'price' => 129990, 'vram' => 16, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 320],
            ['brand' => $bAsus, 'model' => 'ROG Strix RTX 4070 Ti', 'price' => 99990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 285],
            ['brand' => $bMsi, 'model' => 'Ventus 3X RTX 4070', 'price' => 69990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 200],
            ['brand' => $bAsus, 'model' => 'Dual RTX 4060 Ti', 'price' => 49990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 160],
            ['brand' => $bMsi, 'model' => 'Gaming X RTX 4060', 'price' => 39990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 115],
            ['brand' => $bAsus, 'model' => 'TUF RTX 3080', 'price' => 89990, 'vram' => 10, 'vram_type' => 'GDDR6X', 'bus' => 320, 'tdp' => 320],
            ['brand' => $bMsi, 'model' => 'Gaming X Trio RTX 3070', 'price' => 64990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 256, 'tdp' => 220],
            ['brand' => $bAsus, 'model' => 'Dual RTX 3060', 'price' => 34990, 'vram' => 12, 'vram_type' => 'GDDR6', 'bus' => 192, 'tdp' => 170],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4070 Super', 'price' => 74990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 220],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4060 Ti 16GB', 'price' => 54990, 'vram' => 16, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 160],
            ['brand' => $bNvidia, 'model' => 'GeForce GTX 1660 Super', 'price' => 19990, 'vram' => 6, 'vram_type' => 'GDDR6', 'bus' => 192, 'tdp' => 125],
            ['brand' => $bNvidia, 'model' => 'GeForce GTX 1650', 'price' => 14990, 'vram' => 4, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 75],
            ['brand' => $bAsus, 'model' => 'Phoenix RTX 3050', 'price' => 26990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 130],
            ['brand' => $bMsi, 'model' => 'Aero ITX RTX 3060', 'price' => 36990, 'vram' => 12, 'vram_type' => 'GDDR6', 'bus' => 192, 'tdp' => 170],
            ['brand' => $bAsus, 'model' => 'ROG Strix RTX 4090', 'price' => 219990, 'vram' => 24, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 450],
            ['brand' => $bMsi, 'model' => 'Suprim X RTX 4080', 'price' => 139990, 'vram' => 16, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 320],
            ['brand' => $bAsus, 'model' => 'TUF RTX 4070', 'price' => 69990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 192, 'tdp' => 200],
            ['brand' => $bMsi, 'model' => 'Gaming X Trio RTX 3080 Ti', 'price' => 109990, 'vram' => 12, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 350],
            ['brand' => $bAsus, 'model' => 'Dual RTX 3070', 'price' => 59990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 256, 'tdp' => 220],
            ['brand' => $bMsi, 'model' => 'Ventus 2X RTX 3060 Ti', 'price' => 49990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 256, 'tdp' => 200],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 4080 Super', 'price' => 109990, 'vram' => 16, 'vram_type' => 'GDDR6X', 'bus' => 256, 'tdp' => 320],
            ['brand' => $bNvidia, 'model' => 'GeForce RTX 3090 Ti', 'price' => 149990, 'vram' => 24, 'vram_type' => 'GDDR6X', 'bus' => 384, 'tdp' => 450],
            ['brand' => $bAsus, 'model' => 'Prime RTX 4060', 'price' => 37990, 'vram' => 8, 'vram_type' => 'GDDR6', 'bus' => 128, 'tdp' => 115],
        ];

        $gpuIds = [];
        foreach ($gpus as $gpu) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catGpu,
                'brand_id' => $gpu['brand'],
                'model' => $gpu['model'],
                'price' => $gpu['price'],
                'stock' => rand(3, 30),
                'image' => 'components/gpu_' . Str::slug($gpu['model']) . '.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $gpuIds[] = $id;

            DB::table('gpu_specs')->insert([
                'component_id' => $id,
                'vram_gb' => $gpu['vram'],
                'vram_type' => $gpu['vram_type'],
                'memory_bus_bit' => $gpu['bus'],
                'tdp_watts' => $gpu['tdp'],
                'length_mm' => rand(240, 340),
                'width_mm' => rand(110, 140),
                'pcie_slots_required' => rand(2, 3),
                'pcie_gen' => '4.0',
                'power_requires' => rand(1, 2) . 'x8',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

                // ========== 5.3 ОЗУ (30 шт) ==========
        $this->command->info('🔨 Создаем ОЗУ...');

        $rams = [
            ['brand' => $bCorsair, 'model' => 'Vengeance LPX 16GB DDR4 3200', 'price' => 4500, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bCorsair, 'model' => 'Vengeance LPX 16GB DDR4 3600', 'price' => 5200, 'cap' => 16, 'speed' => 3600, 'type' => 'DDR4', 'cl' => 18, 'mod' => 2],
            ['brand' => $bCorsair, 'model' => 'Dominator Platinum 32GB DDR5 6000', 'price' => 14000, 'cap' => 32, 'speed' => 6000, 'type' => 'DDR5', 'cl' => 36, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Ripjaws V 16GB DDR4 3200', 'price' => 4200, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Trident Z5 RGB 32GB DDR5 6400', 'price' => 15500, 'cap' => 32, 'speed' => 6400, 'type' => 'DDR5', 'cl' => 32, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Ripjaws S5 16GB DDR5 5600', 'price' => 6500, 'cap' => 16, 'speed' => 5600, 'type' => 'DDR5', 'cl' => 36, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Trident Z Neo 32GB DDR4 3600', 'price' => 9200, 'cap' => 32, 'speed' => 3600, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Beast 16GB DDR4 3200', 'price' => 4800, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Beast 32GB DDR4 3200', 'price' => 8500, 'cap' => 32, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Beast 16GB DDR5 5200', 'price' => 5500, 'cap' => 16, 'speed' => 5200, 'type' => 'DDR5', 'cl' => 40, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Renegade 32GB DDR5 6000', 'price' => 12500, 'cap' => 32, 'speed' => 6000, 'type' => 'DDR5', 'cl' => 36, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Renegade 64GB DDR5 6400', 'price' => 29000, 'cap' => 64, 'speed' => 6400, 'type' => 'DDR5', 'cl' => 32, 'mod' => 2],
            ['brand' => $bCrucial, 'model' => 'Ballistix 16GB DDR4 3600', 'price' => 5800, 'cap' => 16, 'speed' => 3600, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bCrucial, 'model' => 'Ballistix 32GB DDR4 3600', 'price' => 9500, 'cap' => 32, 'speed' => 3600, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bCrucial, 'model' => 'Pro 16GB DDR5 4800', 'price' => 4800, 'cap' => 16, 'speed' => 4800, 'type' => 'DDR5', 'cl' => 40, 'mod' => 2],
            ['brand' => $bCrucial, 'model' => 'Pro 32GB DDR4 3200', 'price' => 7500, 'cap' => 32, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 22, 'mod' => 2],
            ['brand' => $bCorsair, 'model' => 'Vengeance RGB 32GB DDR4 3200', 'price' => 7800, 'cap' => 32, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bCorsair, 'model' => 'Vengeance RGB 16GB DDR4 3000', 'price' => 4800, 'cap' => 16, 'speed' => 3000, 'type' => 'DDR4', 'cl' => 15, 'mod' => 2],
            ['brand' => $bCorsair, 'model' => 'Dominator Titanium 32GB DDR5 6600', 'price' => 16500, 'cap' => 32, 'speed' => 6600, 'type' => 'DDR5', 'cl' => 34, 'mod' => 2],
            ['brand' => $bCorsair, 'model' => 'Dominator Titanium 64GB DDR5 7200', 'price' => 28000, 'cap' => 64, 'speed' => 7200, 'type' => 'DDR5', 'cl' => 34, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Ripjaws V 32GB DDR4 3200', 'price' => 8500, 'cap' => 32, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Ripjaws V 16GB DDR4 3000', 'price' => 4200, 'cap' => 16, 'speed' => 3000, 'type' => 'DDR4', 'cl' => 15, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Trident Z5 64GB DDR5 6000', 'price' => 24500, 'cap' => 64, 'speed' => 6000, 'type' => 'DDR5', 'cl' => 36, 'mod' => 2],
            ['brand' => $bGSkill, 'model' => 'Ripjaws S5 32GB DDR5 6000', 'price' => 11500, 'cap' => 32, 'speed' => 6000, 'type' => 'DDR5', 'cl' => 36, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Impact 32GB DDR5 5200', 'price' => 9500, 'cap' => 32, 'speed' => 5200, 'type' => 'DDR5', 'cl' => 42, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Impact 16GB DDR4 3200', 'price' => 4200, 'cap' => 16, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 22, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Beast 64GB DDR4 3200', 'price' => 16500, 'cap' => 64, 'speed' => 3200, 'type' => 'DDR4', 'cl' => 16, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Beast 32GB DDR4 3600', 'price' => 8800, 'cap' => 32, 'speed' => 3600, 'type' => 'DDR4', 'cl' => 18, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Renegade 16GB DDR5 7200', 'price' => 8500, 'cap' => 16, 'speed' => 7200, 'type' => 'DDR5', 'cl' => 36, 'mod' => 2],
            ['brand' => $bKingston, 'model' => 'Fury Renegade 64GB DDR5 6400', 'price' => 29000, 'cap' => 64, 'speed' => 6400, 'type' => 'DDR5', 'cl' => 32, 'mod' => 2],
        ];

        foreach ($rams as $ram) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catRam, // Убедись, что есть
                'brand_id'    => is_numeric($ram['brand']) ? $ram['brand'] : DB::table('brands')->where('name', $ram['brand'])->first()->id,
                'model'       => $ram['model'],
                'price'       => $ram['price'],
                'stock'       => rand(10, 60),
                'image'       => 'components/ram_' . Str::slug($ram['model']) . '.jpg',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            DB::table('ram_specs')->insert([
                'component_id'    => $id,
                'total_capacity_gb' => $ram['cap'],
                'speed_mhz'       => $ram['speed'],
                'type'            => $ram['type'],
                'latency_cl'      => $ram['cl'],
                'modules_count'   => $ram['mod'],
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }

        // ========== 5.4 Материнские платы (30 шт) ==========
        $this->command->info('🔨 Создаем Материнские платы...');

        // Массив данных с ИМЕНОВАННЫМИ ключами (как в GPU)
        $mobos = [
            ['brand' => $bAsus, 'model' => 'PRIME B760M-A', 'price' => 11500, 'socket_id' => $sLGA1700, 'chipset' => 'B760', 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'ROG STRIX Z790-A', 'price' => 28500, 'socket_id' => $sLGA1700, 'chipset' => 'Z790', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bAsus, 'model' => 'TUF GAMING B550-PLUS', 'price' => 15500, 'socket_id' => $sAM4, 'chipset' => 'B550', 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '3.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'MAG B650 TOMAHAWK', 'price' => 18500, 'socket_id' => $sAM5, 'chipset' => 'B650', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'PRO B660M-A', 'price' => 12500, 'socket_id' => $sLGA1700, 'chipset' => 'B660', 'ram_slots' => 2, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bGigabyte, 'model' => 'Z690 AORUS ELITE', 'price' => 24500, 'socket_id' => $sLGA1700, 'chipset' => 'Z690', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'B550 AORUS ELITE V2', 'price' => 14500, 'socket_id' => $sAM4, 'chipset' => 'B550', 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '3.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'B650M AORUS ELITE', 'price' => 16500, 'socket_id' => $sAM5, 'chipset' => 'B650', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'PRIME A520M-K', 'price' => 7500, 'socket_id' => $sAM4, 'chipset' => 'A520', 'ram_slots' => 2, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '3.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'PRIME H610M-K', 'price' => 8500, 'socket_id' => $sLGA1700, 'chipset' => 'H610', 'ram_slots' => 2, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '3.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'ROG MAXIMUS Z790 HERO', 'price' => 52000, 'socket_id' => $sLGA1700, 'chipset' => 'Z790', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffATX],
            ['brand' => $bAsus, 'model' => 'ROG STRIX B650E-F', 'price' => 26500, 'socket_id' => $sAM5, 'chipset' => 'B650E', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 1, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'MEG Z790 ACE', 'price' => 45000, 'socket_id' => $sLGA1700, 'chipset' => 'Z790', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'MAG B760M MORTAR', 'price' => 16500, 'socket_id' => $sLGA1700, 'chipset' => 'B760', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffMATX],
            ['brand' => $bMsi, 'model' => 'MPG B650 EDGE', 'price' => 22500, 'socket_id' => $sAM5, 'chipset' => 'B650', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'PRO Z790-A WIFI', 'price' => 24500, 'socket_id' => $sLGA1700, 'chipset' => 'Z790', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'MAG B550 TOMAHAWK', 'price' => 13500, 'socket_id' => $sAM4, 'chipset' => 'B550', 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '3.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'B450 TOMAHAWK MAX', 'price' => 9500, 'socket_id' => $sAM4, 'chipset' => 'B450', 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '3.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'X570 AORUS PRO', 'price' => 21500, 'socket_id' => $sAM4, 'chipset' => 'X570', 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 3, 'pcie' => 2, 'pcie_gen' => '4.0', 'sata' => 8, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'Z790 AORUS MASTER', 'price' => 38500, 'socket_id' => $sLGA1700, 'chipset' => 'Z790', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 5, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'B760M DS3H', 'price' => 12500, 'socket_id' => $sLGA1700, 'chipset' => 'B760', 'ram_slots' => 2, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'TUF GAMING B650-PLUS', 'price' => 19500, 'socket_id' => $sAM5, 'chipset' => 'B650', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bAsus, 'model' => 'PRIME B650M-A', 'price' => 13500, 'socket_id' => $sAM5, 'chipset' => 'B650', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 2, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bGigabyte, 'model' => 'B660M DS3H', 'price' => 11500, 'socket_id' => $sLGA1700, 'chipset' => 'B660', 'ram_slots' => 4, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bMsi, 'model' => 'PRO B660M-C', 'price' => 10500, 'socket_id' => $sLGA1700, 'chipset' => 'B660', 'ram_slots' => 2, 'ram_type' => 'DDR4', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
            ['brand' => $bAsus, 'model' => 'ROG CROSSHAIR X670E', 'price' => 65000, 'socket_id' => $sAM5, 'chipset' => 'X670E', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 5, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 8, 'ff' => $ffATX],
            ['brand' => $bGigabyte, 'model' => 'X670 AORUS ELITE', 'price' => 28500, 'socket_id' => $sAM5, 'chipset' => 'X670', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 2, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'MAG X670E TOMAHAWK', 'price' => 32500, 'socket_id' => $sAM5, 'chipset' => 'X670E', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 4, 'pcie' => 1, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bAsus, 'model' => 'PRIME Z690-A', 'price' => 19500, 'socket_id' => $sLGA1700, 'chipset' => 'Z690', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2' => 3, 'pcie' => 1, 'pcie_gen' => '5.0', 'sata' => 6, 'ff' => $ffATX],
            ['brand' => $bMsi, 'model' => 'PRO A620M-E', 'price' => 8500, 'socket_id' => $sAM5, 'chipset' => 'A620', 'ram_slots' => 2, 'ram_type' => 'DDR5', 'm2' => 1, 'pcie' => 1, 'pcie_gen' => '4.0', 'sata' => 4, 'ff' => $ffMATX],
        ];

        foreach ($mobos as $mobo) {
            // 1. Добавляем компонент
            $id = DB::table('components')->insertGetId([
                'category_id' => $catMobo, // Убедись, что эта переменная есть
                'brand_id'    => is_numeric($mobo['brand']) ? $mobo['brand'] : DB::table('brands')->where('name', $mobo['brand'])->first()->id,
                'model'       => $mobo['model'],
                'price'       => $mobo['price'],
                'stock'       => rand(5, 25),
                'image'       => 'components/mobo_' . Str::slug($mobo['model']) . '.jpg',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            // 2. Добавляем характеристики
            DB::table('motherboard_specs')->insert([
                'component_id'    => $id,
                'socket_id'       => $mobo['socket_id'],
                'chipset'         => $mobo['chipset'],
                'ram_slots'       => $mobo['ram_slots'],
                'ram_type'        => $mobo['ram_type'],
                'm2_slots'        => $mobo['m2'],
                'pcie_x16_slots'  => $mobo['pcie'],
                'pcie_gen'        => $mobo['pcie_gen'],
                'sata_ports'      => $mobo['sata'],
                'form_factor_id'  => $mobo['ff'],
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }

        // ========== 5.5 Блоки питания (30 шт) ==========
        $this->command->info('🔨 Создаем Блоки питания...');

        $psus = [
            ['brand' => $bCorsair, 'model' => 'RM750x', 'price' => 10500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'RM850x', 'price' => 12500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'HX1200i', 'price' => 22000, 'watt' => 1200, 'eff' => '80+ Platinum', 'mod' => 'Full', 'pcie' => 4, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'CV550', 'price' => 4500, 'watt' => 550, 'eff' => '80+ Bronze', 'mod' => 'Non', 'pcie' => 1, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'SF750', 'price' => 14500, 'watt' => 750, 'eff' => '80+ Platinum', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'RM1000x', 'price' => 16500, 'watt' => 1000, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 3, 'type' => '12VHPWR'],
            ['brand' => $bCorsair, 'model' => 'CV650', 'price' => 5200, 'watt' => 650, 'eff' => '80+ Bronze', 'mod' => 'Non', 'pcie' => 1, 'type' => '6+2'],
            ['brand' => $bCorsair, 'model' => 'RM650', 'price' => 8500, 'watt' => 650, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bSeasonic, 'model' => 'Focus GX-750', 'price' => 11500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bSeasonic, 'model' => 'Focus GX-850', 'price' => 13500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bSeasonic, 'model' => 'Prime TX-1000', 'price' => 24500, 'watt' => 1000, 'eff' => '80+ Titanium', 'mod' => 'Full', 'pcie' => 4, 'type' => '12VHPWR'],
            ['brand' => $bSeasonic, 'model' => 'Core GM-550', 'price' => 6500, 'watt' => 550, 'eff' => '80+ Gold', 'mod' => 'Semi', 'pcie' => 1, 'type' => '6+2'],
            ['brand' => $bSeasonic, 'model' => 'Focus PX-650', 'price' => 9500, 'watt' => 650, 'eff' => '80+ Platinum', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bSeasonic, 'model' => 'Prime Ultra Gold 750', 'price' => 15500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '12VHPWR'],
            ['brand' => $bBequiet, 'model' => 'Straight Power 12 750W', 'price' => 13500, 'watt' => 750, 'eff' => '80+ Platinum', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bBequiet, 'model' => 'Straight Power 12 850W', 'price' => 15500, 'watt' => 850, 'eff' => '80+ Platinum', 'mod' => 'Full', 'pcie' => 3, 'type' => '12VHPWR'],
            ['brand' => $bBequiet, 'model' => 'Pure Power 12 M 650W', 'price' => 9500, 'watt' => 650, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bBequiet, 'model' => 'System Power 10 550W', 'price' => 4500, 'watt' => 550, 'eff' => '80+ Bronze', 'mod' => 'Non', 'pcie' => 1, 'type' => '6+2'],
            ['brand' => $bBequiet, 'model' => 'Dark Power 13 1000W', 'price' => 26500, 'watt' => 1000, 'eff' => '80+ Titanium', 'mod' => 'Full', 'pcie' => 4, 'type' => '12VHPWR'],
            ['brand' => $bDeepCool, 'model' => 'DQ750-M-V2L', 'price' => 7500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bDeepCool, 'model' => 'PK600D', 'price' => 4200, 'watt' => 600, 'eff' => '80+ Bronze', 'mod' => 'Non', 'pcie' => 1, 'type' => '6+2'],
            ['brand' => $bDeepCool, 'model' => 'PQ750M', 'price' => 8500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bDeepCool, 'model' => 'DQ850-M-V2L', 'price' => 9500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bEvga, 'model' => 'SuperNOVA 750 G6', 'price' => 10500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bEvga, 'model' => 'SuperNOVA 850 G7', 'price' => 12500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 3, 'type' => '6+2'],
            ['brand' => $bEvga, 'model' => 'SuperNOVA 1000 P6', 'price' => 18500, 'watt' => 1000, 'eff' => '80+ Platinum', 'mod' => 'Full', 'pcie' => 4, 'type' => '12VHPWR'],
            ['brand' => $bThermaltake, 'model' => 'Toughpower GF3 750W', 'price' => 11500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '12VHPWR'],
            ['brand' => $bThermaltake, 'model' => 'Toughpower GF A3 850W', 'price' => 13500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 3, 'type' => '12VHPWR'],
            ['brand' => $bAsus, 'model' => 'ROG Strix 750W', 'price' => 12500, 'watt' => 750, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '6+2'],
            ['brand' => $bMsi, 'model' => 'MAG A850GL PCIE5', 'price' => 11500, 'watt' => 850, 'eff' => '80+ Gold', 'mod' => 'Full', 'pcie' => 2, 'type' => '12VHPWR'],
        ];

        foreach ($psus as $psu) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catPsu,
                'brand_id'    => is_numeric($psu['brand']) ? $psu['brand'] : DB::table('brands')->where('name', $psu['brand'])->first()->id,
                'model'       => $psu['model'],
                'price'       => $psu['price'],
                'stock'       => rand(8, 40),
                'image'       => 'components/psu_' . Str::slug($psu['model']) . '.jpg',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            DB::table('psu_specs')->insert([
                'component_id'      => $id,
                'wattage'           => $psu['watt'],
                'efficiency'        => $psu['eff'],
                'modularity'        => $psu['mod'],
                'pcie_cables_count' => $psu['pcie'],
                'pcie_cable_type'   => $psu['type'],
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }

        // ========== 5.6 Накопители (30 шт) ==========
        $this->command->info('🔨 Создаем Накопители...');

        $storages = [
            ['brand' => $bSamsung, 'model' => '990 PRO 1TB', 'price' => 9500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7450, 'write' => 6900, 'ff' => 'm.2_2280'],
            ['brand' => $bSamsung, 'model' => '990 PRO 2TB', 'price' => 16500, 'type' => 'nvme', 'cap' => 2000, 'read' => 7450, 'write' => 6900, 'ff' => 'm.2_2280'],
            ['brand' => $bSamsung, 'model' => '980 PRO 1TB', 'price' => 7500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7000, 'write' => 5000, 'ff' => 'm.2_2280'],
            ['brand' => $bSamsung, 'model' => '980 PRO 500GB', 'price' => 4500, 'type' => 'nvme', 'cap' => 500, 'read' => 6900, 'write' => 5000, 'ff' => 'm.2_2280'],
            ['brand' => $bSamsung, 'model' => '870 EVO 1TB', 'price' => 8500, 'type' => 'sata', 'cap' => 1000, 'read' => 560, 'write' => 530, 'ff' => '2.5_inch'],
            ['brand' => $bSamsung, 'model' => '870 EVO 2TB', 'price' => 15500, 'type' => 'sata', 'cap' => 2000, 'read' => 560, 'write' => 530, 'ff' => '2.5_inch'],
            ['brand' => $bWesternDigital, 'model' => 'WD Black SN850X 1TB', 'price' => 8500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7300, 'write' => 6300, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'WD Black SN850X 2TB', 'price' => 14500, 'type' => 'nvme', 'cap' => 2000, 'read' => 7300, 'write' => 6300, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'WD Blue SN580 1TB', 'price' => 5500, 'type' => 'nvme', 'cap' => 1000, 'read' => 4150, 'write' => 4150, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'WD Blue SN580 2TB', 'price' => 9500, 'type' => 'nvme', 'cap' => 2000, 'read' => 4150, 'write' => 4150, 'ff' => 'm.2_2280'],
            ['brand' => $bCrucial, 'model' => 'P5 Plus 1TB', 'price' => 7500, 'type' => 'nvme', 'cap' => 1000, 'read' => 6600, 'write' => 5000, 'ff' => 'm.2_2280'],
            ['brand' => $bCrucial, 'model' => 'P5 Plus 2TB', 'price' => 12500, 'type' => 'nvme', 'cap' => 2000, 'read' => 6600, 'write' => 5000, 'ff' => 'm.2_2280'],
            ['brand' => $bCrucial, 'model' => 'T500 1TB', 'price' => 8500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7300, 'write' => 6800, 'ff' => 'm.2_2280'],
            ['brand' => $bCrucial, 'model' => 'T500 2TB', 'price' => 14500, 'type' => 'nvme', 'cap' => 2000, 'read' => 7300, 'write' => 6800, 'ff' => 'm.2_2280'],
            ['brand' => $bKingston, 'model' => 'Fury Renegade 1TB', 'price' => 8500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7300, 'write' => 6000, 'ff' => 'm.2_2280'],
            ['brand' => $bKingston, 'model' => 'Fury Renegade 2TB', 'price' => 14500, 'type' => 'nvme', 'cap' => 2000, 'read' => 7300, 'write' => 6000, 'ff' => 'm.2_2280'],
            ['brand' => $bKingston, 'model' => 'NV2 1TB', 'price' => 4500, 'type' => 'nvme', 'cap' => 1000, 'read' => 3500, 'write' => 2100, 'ff' => 'm.2_2280'],
            ['brand' => $bKingston, 'model' => 'NV2 2TB', 'price' => 7500, 'type' => 'nvme', 'cap' => 2000, 'read' => 3500, 'write' => 2100, 'ff' => 'm.2_2280'],
            ['brand' => $bSabrent, 'model' => 'Rocket 4 Plus 1TB', 'price' => 9500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7100, 'write' => 6600, 'ff' => 'm.2_2280'],
            ['brand' => $bSabrent, 'model' => 'Rocket 4 Plus 2TB', 'price' => 16500, 'type' => 'nvme', 'cap' => 2000, 'read' => 7100, 'write' => 6600, 'ff' => 'm.2_2280'],
            ['brand' => $bAdata, 'model' => 'XPG Gammix S70 Blade 1TB', 'price' => 7500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7400, 'write' => 6400, 'ff' => 'm.2_2280'],
            ['brand' => $bAdata, 'model' => 'XPG Gammix S70 Blade 2TB', 'price' => 12500, 'type' => 'nvme', 'cap' => 2000, 'read' => 7400, 'write' => 6400, 'ff' => 'm.2_2280'],
            ['brand' => $bSKHynix, 'model' => 'Platinum P41 1TB', 'price' => 9500, 'type' => 'nvme', 'cap' => 1000, 'read' => 7000, 'write' => 6500, 'ff' => 'm.2_2280'],
            ['brand' => $bSKHynix, 'model' => 'Platinum P41 2TB', 'price' => 15500, 'type' => 'nvme', 'cap' => 2000, 'read' => 7000, 'write' => 6500, 'ff' => 'm.2_2280'],
            ['brand' => $bSamsung, 'model' => '970 EVO Plus 1TB', 'price' => 6500, 'type' => 'nvme', 'cap' => 1000, 'read' => 3500, 'write' => 3300, 'ff' => 'm.2_2280'],
            ['brand' => $bWesternDigital, 'model' => 'WD Green SN350 1TB', 'price' => 4500, 'type' => 'nvme', 'cap' => 1000, 'read' => 3200, 'write' => 1300, 'ff' => 'm.2_2280'],
            ['brand' => $bCrucial, 'model' => 'BX500 1TB', 'price' => 5500, 'type' => 'sata', 'cap' => 1000, 'read' => 540, 'write' => 500, 'ff' => '2.5_inch'],
            ['brand' => $bKingston, 'model' => 'A400 1TB', 'price' => 4500, 'type' => 'sata', 'cap' => 1000, 'read' => 500, 'write' => 450, 'ff' => '2.5_inch'],
            ['brand' => $bAdata, 'model' => 'SU650 1TB', 'price' => 4500, 'type' => 'sata', 'cap' => 1000, 'read' => 520, 'write' => 450, 'ff' => '2.5_inch'],
            ['brand' => $bSamsung, 'model' => '870 QVO 4TB', 'price' => 28500, 'type' => 'sata', 'cap' => 4000, 'read' => 560, 'write' => 530, 'ff' => '2.5_inch'],
        ];

        foreach ($storages as $stor) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catStorage,
                'brand_id'    => is_numeric($stor['brand']) ? $stor['brand'] : DB::table('brands')->where('name', $stor['brand'])->first()->id,
                'model'       => $stor['model'],
                'price'       => $stor['price'],
                'stock'       => rand(10, 60),
                'image'       => 'components/storage_' . Str::slug($stor['model']) . '.jpg',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            DB::table('storage_specs')->insert([
                'component_id'     => $id,
                'type'             => $stor['type'],
                'capacity_gb'      => $stor['cap'],
                'read_speed_mbps'  => $stor['read'],
                'write_speed_mbps' => $stor['write'],
                'form_factor'      => $stor['ff'],
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);
        }

        // ========== 5.7 Кулеры (30 шт) + Связь с сокетами ==========
        $this->command->info('🔨 Создаем Кулеры...');

        $coolers = [
            ['brand' => 'DeepCool', 'model' => 'AK400', 'price' => 3200, 'tdp' => 220, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'DeepCool', 'model' => 'AK620', 'price' => 5200, 'tdp' => 260, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'DeepCool', 'model' => 'AK400 Digital', 'price' => 4200, 'tdp' => 220, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5]],
            ['brand' => 'DeepCool', 'model' => 'LS520', 'price' => 9500, 'tdp' => 250, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'DeepCool', 'model' => 'LT720', 'price' => 13500, 'tdp' => 300, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Noctua', 'model' => 'NH-D15', 'price' => 8500, 'tdp' => 250, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Noctua', 'model' => 'NH-U12S', 'price' => 6500, 'tdp' => 200, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Noctua', 'model' => 'NH-L9i', 'price' => 4500, 'tdp' => 95, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5]],
            ['brand' => 'Noctua', 'model' => 'NH-A14', 'price' => 3200, 'tdp' => 180, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Noctua', 'model' => 'D15 G2', 'price' => 11500, 'tdp' => 280, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Thermalright', 'model' => 'Peerless Assassin 120', 'price' => 2800, 'tdp' => 260, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Thermalright', 'model' => 'Phantom Spirit 120', 'price' => 3200, 'tdp' => 280, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Thermalright', 'model' => 'Frozen Magic 360', 'price' => 7500, 'tdp' => 320, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Thermalright', 'model' => 'Assassin X 120', 'price' => 1800, 'tdp' => 180, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Thermalright', 'model' => 'Aqua Elite 240', 'price' => 5500, 'tdp' => 250, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Arctic', 'model' => 'Freezer 36', 'price' => 3500, 'tdp' => 250, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Arctic', 'model' => 'Freezer III 36', 'price' => 4200, 'tdp' => 280, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Arctic', 'model' => 'Liquid Freezer III 360', 'price' => 12500, 'tdp' => 350, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Arctic', 'model' => 'Liquid Freezer III 240', 'price' => 8500, 'tdp' => 300, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Arctic', 'model' => 'P12 Max', 'price' => 1200, 'tdp' => 100, 'type' => 'fan', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'ASUS', 'model' => 'ROG RYUJIN III 360', 'price' => 24500, 'tdp' => 400, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'ASUS', 'model' => 'TUF GAMING LC II 240', 'price' => 7500, 'tdp' => 250, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'MSI', 'model' => 'MAG CORELIQUID E360', 'price' => 11500, 'tdp' => 280, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'MSI', 'model' => 'MAG FORGE M100A', 'price' => 3200, 'tdp' => 200, 'type' => 'tower', 'fans' => 1, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Corsair', 'model' => 'iCUE H150i Elite LCD', 'price' => 22500, 'tdp' => 350, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Corsair', 'model' => 'iCUE H100i Elite', 'price' => 14500, 'tdp' => 300, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Corsair', 'model' => 'Nautilus 240', 'price' => 6500, 'tdp' => 220, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'Corsair', 'model' => 'A500 Digital', 'price' => 10500, 'tdp' => 280, 'type' => 'tower', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'NZXT', 'model' => 'Kraken 360', 'price' => 18500, 'tdp' => 350, 'type' => 'aio', 'fans' => 3, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
            ['brand' => 'NZXT', 'model' => 'Kraken 240', 'price' => 12500, 'tdp' => 280, 'type' => 'aio', 'fans' => 2, 'sockets' => [$sLGA1700, $sAM5, $sAM4]],
        ];

        foreach ($coolers as $cool) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catCooler,
                'brand_id'    => DB::table('brands')->where('name', $cool['brand'])->first()->id,
                'model'       => $cool['model'],
                'price'       => $cool['price'],
                'stock'       => rand(10, 50),
                'image'       => 'components/cooler_' . Str::slug($cool['model']) . '.jpg',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            // 1. Добавляем спецификации
            DB::table('cooler_specs')->insert([
                'component_id'     => $id,
                'tdp_rating_watts' => $cool['tdp'],
                'type'             => $cool['type'],
                'fan_count'        => $cool['fans'],
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            // 2. Вставляем связи с сокетами (Many-to-Many)
            foreach ($cool['sockets'] as $sockId) {
                DB::table('cooler_socket')->insert([
                    'component_id' => $id,
                    'socket_id'    => $sockId,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }
        }

        // ========== 5.8 Корпуса (30 шт) + Связь с форм-факторами ==========
        $this->command->info('🔨 Создаем Корпуса...');

        $cases = [
            ['brand' => 'NZXT', 'model' => 'H5 Flow', 'price' => 8500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX]],
            ['brand' => 'NZXT', 'model' => 'H7 Flow', 'price' => 12500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 3, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'NZXT', 'model' => 'H1 Flow Mini', 'price' => 16500, 'type' => 'sff', 'top_slots' => 0, 'fans' => 0, 'ffs' => [$ffITX]],
            ['brand' => 'NZXT', 'model' => 'H9 Elite', 'price' => 18500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 5, 'ffs' => [$ffATX, $ffMATX, $ffITX]],
            ['brand' => 'NZXT', 'model' => 'H6 Flow', 'price' => 10500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX]],
            ['brand' => 'Corsair', 'model' => '4000D Airflow', 'price' => 9500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX, $ffITX]],
            ['brand' => 'Corsair', 'model' => '3000D Airflow', 'price' => 7500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffMATX, $ffITX]],
            ['brand' => 'Corsair', 'model' => '5000D Airflow', 'price' => 14500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 3, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'Corsair', 'model' => '2000D Airflow', 'price' => 6500, 'type' => 'mini', 'top_slots' => 1, 'fans' => 1, 'ffs' => [$ffMATX, $ffITX]],
            ['brand' => 'Corsair', 'model' => '470T RGB', 'price' => 13500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 4, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'Lian Li', 'model' => 'O11 Dynamic EVO', 'price' => 15500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 0, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'Lian Li', 'model' => 'Lancool II Mesh', 'price' => 10500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX, $ffITX]],
            ['brand' => 'Lian Li', 'model' => 'Lancool III', 'price' => 12500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 4, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'Lian Li', 'model' => 'A4-H2O', 'price' => 16500, 'type' => 'sff', 'top_slots' => 0, 'fans' => 0, 'ffs' => [$ffITX]],
            ['brand' => 'Lian Li', 'model' => 'Lancool 216', 'price' => 9500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX]],
            ['brand' => 'Phanteks', 'model' => 'Eclipse G360A', 'price' => 7500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX, $ffITX]],
            ['brand' => 'Phanteks', 'model' => 'NV5', 'price' => 13500, 'type' => 'mid_tower', 'top_slots' => 3, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX]],
            ['brand' => 'Phanteks', 'model' => 'NV7', 'price' => 18500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 2, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'Phanteks', 'model' => 'Eclipse P400A', 'price' => 6500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX]],
            ['brand' => 'Phanteks', 'model' => 'NV9', 'price' => 24500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 0, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'be quiet!', 'model' => 'Silent Base 802', 'price' => 14500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 2, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'be quiet!', 'model' => 'Pure Base 500DX', 'price' => 9500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 3, 'ffs' => [$ffATX, $ffMATX]],
            ['brand' => 'be quiet!', 'model' => 'Silent Base 603', 'price' => 11500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 1, 'ffs' => [$ffATX, $ffMATX]],
            ['brand' => 'be quiet!', 'model' => 'Dark Base 901', 'price' => 28500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 3, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'Fractal Design', 'model' => 'Pop Air', 'price' => 8500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX]],
            ['brand' => 'Fractal Design', 'model' => 'North', 'price' => 12500, 'type' => 'mid_tower', 'top_slots' => 2, 'fans' => 2, 'ffs' => [$ffATX, $ffMATX]],
            ['brand' => 'Fractal Design', 'model' => 'Meshify 2', 'price' => 14500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 3, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'Fractal Design', 'model' => 'Torrent', 'price' => 18500, 'type' => 'full_tower', 'top_slots' => 3, 'fans' => 5, 'ffs' => [$ffATX, $ffEATX]],
            ['brand' => 'Fractal Design', 'model' => 'Ridge', 'price' => 16500, 'type' => 'sff', 'top_slots' => 0, 'fans' => 0, 'ffs' => [$ffITX]],
            ['brand' => 'Thermaltake', 'model' => 'View 380', 'price' => 16500, 'type' => 'full_tower', 'top_slots' => 4, 'fans' => 4, 'ffs' => [$ffATX, $ffEATX]],
        ];

        foreach ($cases as $case) {
            $id = DB::table('components')->insertGetId([
                'category_id' => $catCase,
                'brand_id'    => DB::table('brands')->where('name', $case['brand'])->first()->id,
                'model'       => $case['model'],
                'price'       => $case['price'],
                'stock'       => rand(5, 25),
                'image'       => 'components/case_' . Str::slug($case['model']) . '.jpg',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            // 1. Добавляем спецификации
            DB::table('case_specs')->insert([
                'component_id'    => $id,
                'case_type'       => $case['type'],
                'top_fan_slots'   => $case['top_slots'],
                'fans_included'   => $case['fans'],
                'drive_bays_3_5'  => rand(2, 4),
                'drive_bays_2_5'  => rand(3, 6),
                'front_usb_a'     => 2,
                'front_usb_c'     => 1,
                'front_audio_jack' => true,
                'material'        => 'steel_glass',
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            // 2. Вставляем связи с форм-факторами (Many-to-Many)
            foreach ($case['ffs'] as $ffId) {
                DB::table('case_form_factor')->insert([
                    'component_id'   => $id,
                    'form_factor_id' => $ffId,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);
            }
        }

        // ========== 6. ГОТОВЫЕ СБОРКИ (30 шт) ==========
        $this->command->info('🔨 Подготавливаем теги...');
        $tagNames = ['Игровой', 'Для работы', 'Бюджетный', 'Топовый', 'RGB', 'Компактный', 'Мощный'];
        $tagMap = [];

        foreach ($tagNames as $name) {
            // Проверяем, существует ли тег
            $tag = DB::table('tags')->where('name', $name)->first();
            
            if ($tag) {
                // Если есть — берём его ID
                $tagMap[$name] = $tag->id;
            } else {
                // Если нет — создаём и получаем новый ID
                $tagMap[$name] = DB::table('tags')->insertGetId([
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
        $allTagIds = array_values($tagMap);

        $this->command->info('🔨 Создаем Готовые ПК...');

        // Собираем ID компонентов по категориям (быстрый доступ)
        $pools = [
            'cpu'         => DB::table('components')->where('category_id', $catCpu)->pluck('id')->toArray(),
            'gpu'         => DB::table('components')->where('category_id', $catGpu)->pluck('id')->toArray(),
            'ram'         => DB::table('components')->where('category_id', $catRam)->pluck('id')->toArray(),
            'motherboard' => DB::table('components')->where('category_id', $catMobo)->pluck('id')->toArray(),
            'storage'     => DB::table('components')->where('category_id', $catStorage)->pluck('id')->toArray(),
            'psu'         => DB::table('components')->where('category_id', $catPsu)->pluck('id')->toArray(),
            'cooler'      => DB::table('components')->where('category_id', $catCooler)->pluck('id')->toArray(),
            'case'        => DB::table('components')->where('category_id', $catCase)->pluck('id')->toArray(),
        ];

        // Карта тегов (имя => ID)
        $tagMap = DB::table('tags')->pluck('id', 'name')->toArray();
        $allTagIds = array_values($tagMap);

        // Базовые профили для генерации названий и цен
        $bases = [
            ['name' => 'Storm',   'price' => 65000,  'tags' => ['Бюджетный', 'Игровой']],
            ['name' => 'Nova',    'price' => 72000,  'tags' => ['Бюджетный', 'Для работы']],
            ['name' => 'Titan',   'price' => 95000,  'tags' => ['Игровой', 'RGB']],
            ['name' => 'Vortex',  'price' => 105000, 'tags' => ['Игровой', 'Топовый']],
            ['name' => 'Phantom', 'price' => 145000, 'tags' => ['Топовый', 'Мощный', 'RGB']],
            ['name' => 'Apex',    'price' => 165000, 'tags' => ['Топовый', 'Для работы']],
            ['name' => 'Rogue',   'price' => 185000, 'tags' => ['Топовый', 'Компактный']],
            ['name' => 'Stealth', 'price' => 220000, 'tags' => ['Для работы', 'Компактный', 'RGB']],
        ];

        for ($i = 1; $i <= 30; $i++) {
            $base = $bases[($i - 1) % count($bases)];
            $pcName = "{$base['name']} Build #{$i}";

            // 1. Создаём сам ПК
            $pcId = DB::table('prebuilt_pcs')->insertGetId([
                'name'        => $pcName,
                'slug'        => Str::slug($pcName),
                'description' => "Готовая сборка {$pcName}. Оптимизирована под {$base['tags'][0]} задачи.",
                'price'       => $base['price'] + rand(-3000, 8000),
                'image'       => "pcs/pc_{$i}.jpg",
                'is_active'   => true,
                'created_at'  => now(),
                'updated_at'  => now()
            ]);

            // 2. Привязываем компоненты (по 1 на каждую роль)
            foreach ($pools as $role => $ids) {
                DB::table('prebuilt_pc_component')->insert([
                    'prebuilt_pc_id' => $pcId,
                    'component_id'   => $ids[array_rand($ids)],
                    'role'           => $role,
                    'created_at'     => now(),
                    'updated_at'     => now()
                ]);
            }

            // 3. Привязываем теги (2-3 шт)
            $selectedTags = [];
            foreach ($base['tags'] as $tName) {
                if (isset($tagMap[$tName])) $selectedTags[] = $tagMap[$tName];
            }
            // Добавляем 1 случайный тег для разнообразия
            $randTag = $allTagIds[array_rand($allTagIds)];
            if (!in_array($randTag, $selectedTags)) $selectedTags[] = $randTag;

            foreach ($selectedTags as $tId) {
                DB::table('prebuilt_pc_tag')->insert([
                    'prebuilt_pc_id' => $pcId,
                    'tag_id'         => $tId,
                    'created_at'     => now(),
                    'updated_at'     => now()
                ]);
            }
        }
        $this->command->info('✅ Готово! Создано 30 сборок с компонентами и тегами.');
    }
}