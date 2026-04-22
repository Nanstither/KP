<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrebuiltPcSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Создаём теги (характеристики сборок)
        $tags = [
            ['name' => 'Игровой', 'slug' => 'gaming'],
            ['name' => 'Для работы', 'slug' => 'work'],
            ['name' => 'Бюджетный', 'slug' => 'budget'],
            ['name' => 'Топовый', 'slug' => 'flagship'],
            ['name' => 'Сезонный', 'slug' => 'seasonal'],
            ['name' => 'Лучший в цене', 'slug' => 'best-value'],
            ['name' => 'Компактный', 'slug' => 'compact'],
            ['name' => 'RGB', 'slug' => 'rgb'],
        ];

        $tagMap = [];
        foreach ($tags as $tag) {
            $id = DB::table('tags')->insertGetId($tag + ['created_at' => now(), 'updated_at' => now()]);
            $tagMap[$tag['slug']] = $id;
        }

        // 2. Получаем ID компонентов из существующих записей
        // (предполагаем, что TestPcSeeder уже отработал)
        $cpu = DB::table('components')->where('model', 'Core i5-13400F')->first();
        $gpu = DB::table('components')->where('model', 'GeForce RTX 4060')->first();
        $ram = DB::table('components')->where('model', 'Fury Beast 32GB DDR5')->first();
        $mobo = DB::table('components')->where('model', 'TUF GAMING B760M-PLUS')->first();
        $psu = DB::table('components')->where('model', 'RM750e')->first();
        $storage = DB::table('components')->where('model', '980 PRO 1TB')->first();
        $cooler = DB::table('components')->where('model', 'AK400')->first();
        $case = DB::table('components')->where('model', 'H5 Flow')->first();

        if (!$cpu || !$gpu) {
            $this->command->warn('⚠️ Компоненты не найдены. Запустите сначала: php artisan db:seed --class=TestPcSeeder');
            return;
        }

        // 3. Создаём готовые сборки
        $pcs = [
            [
                'name' => 'Gaming Starter',
                'slug' => 'gaming-starter',
                'description' => 'Идеальный вход в мир ПК-гейминга. Тянет все современные игры на высоких настройках в 1080p.',
                'price' => 89990.00,
                'image' => '/store/pngwing.com.png',
                'is_active' => true,
                'tags' => ['gaming', 'budget', 'best-value'],
                'components' => [
                    'cpu' => $cpu->id,
                    'gpu' => $gpu->id,
                    'ram' => $ram->id,
                    'motherboard' => $mobo->id,
                    'psu' => $psu->id,
                    'storage' => $storage->id,
                    'cooler' => $cooler->id,
                    'case' => $case->id,
                ]
            ],
            [
                'name' => 'Work Pro',
                'slug' => 'work-pro',
                'description' => 'Мощная рабочая станция для монтажа, 3D-рендеринга и программирования.',
                'price' => 125000.00,
                'image' => 'store/pngwing.com (1).png',
                'is_active' => true,
                'tags' => ['work', 'flagship'],
                'components' => [
                    'cpu' => $cpu->id,
                    'gpu' => $gpu->id,
                    'ram' => $ram->id,
                    'motherboard' => $mobo->id,
                    'psu' => $psu->id,
                    'storage' => $storage->id,
                    'cooler' => $cooler->id,
                    'case' => $case->id,
                ]
            ],
            [
                'name' => 'Seasonal RGB',
                'slug' => 'seasonal-rgb',
                'image' => 'store/pngwing.com (2).png',
                'description' => 'Яркая сборка с подсветкой — идеальный подарок или акцент в интерьере.',
                'price' => 95000.00,
                'is_active' => true,
                'tags' => ['seasonal', 'rgb', 'gaming'],
                'components' => [
                    'cpu' => $cpu->id,
                    'gpu' => $gpu->id,
                    'ram' => $ram->id,
                    'motherboard' => $mobo->id,
                    'psu' => $psu->id,
                    'storage' => $storage->id,
                    'cooler' => $cooler->id,
                    'case' => $case->id,
                ]
            ],
        ];

        foreach ($pcs as $pcData) {
            $pcTags = $pcData['tags'] ?? [];
            $pcComponents = $pcData['components'] ?? [];
            unset($pcData['tags'], $pcData['components']);

            // Создаём сборку
            $pcId = DB::table('prebuilt_pcs')->insertGetId($pcData + ['created_at' => now(), 'updated_at' => now()]);

            // Привязываем теги
            foreach ($pcTags as $tagSlug) {
                if (isset($tagMap[$tagSlug])) {
                    DB::table('prebuilt_pc_tag')->insert([
                        'prebuilt_pc_id' => $pcId,
                        'tag_id' => $tagMap[$tagSlug],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Привязываем компоненты с ролями
            foreach ($pcComponents as $role => $componentId) {
                DB::table('prebuilt_pc_component')->insert([
                    'prebuilt_pc_id' => $pcId,
                    'component_id' => $componentId,
                    'role' => $role, // 'cpu', 'gpu', 'ram' и т.д.
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}