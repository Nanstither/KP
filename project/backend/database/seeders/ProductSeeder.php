<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::insert([
            [
                'name' => 'Nova Lite', 'price' => 1299.00, 'in_stock' => true,
                'cpu' => 'i5-13400F', 'gpu' => 'RTX 4060', 'ram' => '16GB DDR4', 'ssd' => '512GB NVMe',
                'image' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop',
            ],
            [
                'name' => 'Titan Pro', 'price' => 2499.00, 'in_stock' => true,
                'cpu' => 'i7-14700K', 'gpu' => 'RTX 4070 Ti', 'ram' => '32GB DDR5', 'ssd' => '1TB Gen4',
                'image' => 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop',
            ],
            [
                'name' => 'Apex Ultra', 'price' => 3899.00, 'in_stock' => false,
                'cpu' => 'i9-14900K', 'gpu' => 'RTX 4090', 'ram' => '64GB DDR5', 'ssd' => '2TB Gen5',
                'image' => 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&auto=format&fit=crop',
            ],
        ]);
    }
}
