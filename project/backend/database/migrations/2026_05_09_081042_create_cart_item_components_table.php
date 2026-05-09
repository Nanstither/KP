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
        Schema::create('cart_item_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_item_id')->constrained('cart_items')->cascadeOnDelete();
            
            // Ссылка на реальный компонент из каталога
            $table->foreignId('component_id')->constrained('components')->cascadeOnDelete();
            
            // Важно: сохраняем цену компонента на момент создания сборки.
            // Если в админке цену поменяют, цена в корзине не должна измениться.
            $table->decimal('price_snapshot', 10, 2); 
            
            $table->integer('quantity')->default(1); // Обычно 1, но для вентиляторов может быть 3
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_item_components');
    }
};
