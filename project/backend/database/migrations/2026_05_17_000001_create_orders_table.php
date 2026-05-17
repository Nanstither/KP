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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable(); // Для гостей
            $table->string('status')->default('pending'); // pending, paid, preparing, shipped, delivered, cancelled
            $table->string('recipient_name');
            $table->string('recipient_phone');
            $table->string('recipient_email')->nullable();
            $table->text('delivery_address'); // Адрес ПВЗ или полный адрес доставки
            $table->string('delivery_type')->default('pickup'); // pickup, courier
            $table->string('cdek_code')->nullable(); // Код ПВЗ СДЭК
            $table->decimal('total_amount', 10, 2);
            $table->json('payment_info')->nullable(); // Информация об оплате
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
