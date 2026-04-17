<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestPcSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Справочники
        $catCpu   = DB::table('component_categories')->insertGetId(['name' => 'Процессоры', 'slug' => 'cpu', 'created_at' => now(), 'updated_at' => now()]);
        $catGpu   = DB::table('component_categories')->insertGetId(['name' => 'Видеокарты', 'slug' => 'gpu', 'created_at' => now(), 'updated_at' => now()]);
        $catRam   = DB::table('component_categories')->insertGetId(['name' => 'ОЗУ', 'slug' => 'ram', 'created_at' => now(), 'updated_at' => now()]);
        $catMobo  = DB::table('component_categories')->insertGetId(['name' => 'Мат. платы', 'slug' => 'mobo', 'created_at' => now(), 'updated_at' => now()]);
        $catPsu   = DB::table('component_categories')->insertGetId(['name' => 'Блоки питания', 'slug' => 'psu', 'created_at' => now(), 'updated_at' => now()]);
        $catStore = DB::table('component_categories')->insertGetId(['name' => 'Накопители', 'slug' => 'storage', 'created_at' => now(), 'updated_at' => now()]);
        $catCool  = DB::table('component_categories')->insertGetId(['name' => 'Кулеры', 'slug' => 'cooler', 'created_at' => now(), 'updated_at' => now()]);
        $catCase  = DB::table('component_categories')->insertGetId(['name' => 'Корпуса', 'slug' => 'case', 'created_at' => now(), 'updated_at' => now()]);

        $bIntel   = DB::table('brands')->insertGetId(['name' => 'Intel', 'created_at' => now(), 'updated_at' => now()]);
        $bAmd     = DB::table('brands')->insertGetId(['name' => 'AMD', 'created_at' => now(), 'updated_at' => now()]);
        $bNvidia  = DB::table('brands')->insertGetId(['name' => 'NVIDIA', 'created_at' => now(), 'updated_at' => now()]);
        $bKing    = DB::table('brands')->insertGetId(['name' => 'Kingston', 'created_at' => now(), 'updated_at' => now()]);
        $bAsus    = DB::table('brands')->insertGetId(['name' => 'ASUS', 'created_at' => now(), 'updated_at' => now()]);
        $bCors    = DB::table('brands')->insertGetId(['name' => 'Corsair', 'created_at' => now(), 'updated_at' => now()]);
        $bSams    = DB::table('brands')->insertGetId(['name' => 'Samsung', 'created_at' => now(), 'updated_at' => now()]);
        $bDeep    = DB::table('brands')->insertGetId(['name' => 'DeepCool', 'created_at' => now(), 'updated_at' => now()]);
        $bNzxt    = DB::table('brands')->insertGetId(['name' => 'NZXT', 'created_at' => now(), 'updated_at' => now()]);

        $sLGA1700 = DB::table('sockets')->insertGetId(['name' => 'LGA1700', 'created_at' => now(), 'updated_at' => now()]);
        $sAM5     = DB::table('sockets')->insertGetId(['name' => 'AM5', 'created_at' => now(), 'updated_at' => now()]);
        $sAM4     = DB::table('sockets')->insertGetId(['name' => 'AM4', 'created_at' => now(), 'updated_at' => now()]);

        $ffATX    = DB::table('form_factors')->insertGetId(['name' => 'ATX', 'created_at' => now(), 'updated_at' => now()]);
        $ffMATX   = DB::table('form_factors')->insertGetId(['name' => 'mATX', 'created_at' => now(), 'updated_at' => now()]);

        // 2. Компоненты + Спецификации
        // CPU
        $cpu1 = DB::table('components')->insertGetId(['category_id' => $catCpu, 'brand_id' => $bIntel, 'model' => 'Core i5-13400F', 'price' => 18990.00, 'stock' => 15, 'image' => 'cpu_i5.jpg', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('cpu_specs')->insert(['component_id' => $cpu1, 'socket' => 'LGA1700', 'cores' => 10, 'threads' => 16, 'base_clock_mhz' => 2500.0, 'boost_clock_mhz' => 4600.0, 'tdp_watts' => 65, 'created_at' => now(), 'updated_at' => now()]);

        // GPU
        $gpu1 = DB::table('components')->insertGetId(['category_id' => $catGpu, 'brand_id' => $bNvidia, 'model' => 'GeForce RTX 4060', 'price' => 35000.00, 'stock' => 5, 'image' => 'gpu_4060.jpg', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('gpu_specs')->insert(['component_id' => $gpu1, 'vram_gb' => 8, 'vram_type' => 'GDDR6', 'memory_bus_bit' => 128, 'tdp_watts' => 115, 'length_mm' => 240, 'width_mm' => 115, 'pcie_slots_required' => 2, 'pcie_gen' => '4.0', 'power_requires' => '1x8', 'created_at' => now(), 'updated_at' => now()]);

        // RAM
        $ram1 = DB::table('components')->insertGetId(['category_id' => $catRam, 'brand_id' => $bKing, 'model' => 'Fury Beast 32GB DDR5', 'price' => 9500.00, 'stock' => 20, 'image' => 'ram_king.jpg', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('ram_specs')->insert(['component_id' => $ram1, 'total_capacity_gb' => 32, 'speed_mhz' => 5600, 'type' => 'DDR5', 'latency_cl' => 36, 'modules_count' => 2, 'created_at' => now(), 'updated_at' => now()]);

        // MOBO
        $mobo1 = DB::table('components')->insertGetId(['category_id' => $catMobo, 'brand_id' => $bAsus, 'model' => 'TUF GAMING B760M-PLUS', 'price' => 15500.00, 'stock' => 10, 'image' => 'mobo_tuf.jpg', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('motherboard_specs')->insert(['component_id' => $mobo1, 'socket_id' => $sLGA1700, 'chipset' => 'B760', 'ram_slots' => 4, 'ram_type' => 'DDR5', 'm2_slots' => 2, 'pcie_x16_slots' => 1, 'pcie_gen' => '4.0', 'sata_ports' => 4, 'form_factor' => 'mATX', 'created_at' => now(), 'updated_at' => now()]);

        // PSU
        $psu1 = DB::table('components')->insertGetId(['category_id' => $catPsu, 'brand_id' => $bCors, 'model' => 'RM750e', 'price' => 11000.00, 'stock' => 7, 'image' => 'psu_cors.jpg', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('psu_specs')->insert(['component_id' => $psu1, 'wattage' => 750, 'efficiency' => '80+ Gold', 'modularity' => 'full', 'pcie_cables_count' => 2, 'pcie_cable_type' => '6+2', 'created_at' => now(), 'updated_at' => now()]);

        // Storage
        $stor1 = DB::table('components')->insertGetId(['category_id' => $catStore, 'brand_id' => $bSams, 'model' => '980 PRO 1TB', 'price' => 8500.00, 'stock' => 12, 'image' => 'ssd_sams.jpg', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('storage_specs')->insert(['component_id' => $stor1, 'type' => 'nvme', 'capacity_gb' => 1000, 'read_speed_mbps' => 7000, 'write_speed_mbps' => 5000, 'form_factor' => 'm.2_2280', 'created_at' => now(), 'updated_at' => now()]);

        // Cooler
        $cool1 = DB::table('components')->insertGetId(['category_id' => $catCool, 'brand_id' => $bDeep, 'model' => 'AK400', 'price' => 3200.00, 'stock' => 25, 'image' => 'cooler_ak.jpg', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('cooler_specs')->insert(['component_id' => $cool1, 'tdp_rating_watts' => 220, 'type' => 'tower', 'fan_count' => 1, 'created_at' => now(), 'updated_at' => now()]);
        DB::table('cooler_socket')->insert([['component_id' => $cool1, 'socket_id' => $sLGA1700, 'created_at' => now(), 'updated_at' => now()], ['component_id' => $cool1, 'socket_id' => $sAM5, 'created_at' => now(), 'updated_at' => now()]]);

        // Case
        $case1 = DB::table('components')->insertGetId(['category_id' => $catCase, 'brand_id' => $bNzxt, 'model' => 'H5 Flow', 'price' => 8500.00, 'stock' => 6, 'image' => 'case_nzxt.jpg', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('case_specs')->insert(['component_id' => $case1, 'case_type' => 'mid_tower', 'top_fan_slots' => 2, 'fans_included' => 4, 'drive_bays_3_5' => 2, 'drive_bays_2_5' => 3, 'front_usb_a' => 2, 'front_usb_c' => 1, 'front_audio_jack' => true, 'material' => 'steel', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('case_form_factor')->insert([['component_id' => $case1, 'form_factor_id' => $ffATX, 'created_at' => now(), 'updated_at' => now()], ['component_id' => $case1, 'form_factor_id' => $ffMATX, 'created_at' => now(), 'updated_at' => now()]]);
    }
}