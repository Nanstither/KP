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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('prebuilt_pc_id')->nullable()->constrained('prebuilt_pcs')->nullOnDelete();
            $table->string('name'); // Название ПК или компонента
            $table->integer('quantity')->default(1);
            $table->decimal('price', 10, 2);
            $table->string('status')->default('pending'); // pending, ready, shipped, delivered
            $table->json('components')->nullable(); // JSON с комплектующими для кастомных сборок
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
