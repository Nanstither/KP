<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete(); // К какой корзине относится
            
            // Тип товара: 'component' (обычный товар) или 'build' (сборка из конфигуратора)
            $table->enum('type', ['component', 'prebuilt', 'custom'])->default('component');
            
            $table->string('name'); // Название (напр. "Intel Core i5" или "Мой игровой ПК")
            $table->decimal('total_price', 10, 2); // Фиксированная цена на момент добавления
            
            // Если это сборка, здесь может быть ссылка на шаблон (если есть), но пока nullable
            $table->unsignedBigInteger('prebuilt_id')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
