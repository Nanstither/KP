<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cooler_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            // $table->string('compatible_sockets'); // comma-separated | pivot-таблица

            $table->integer('tdp_rating_watts');
            $table->string('type'); // tower, aio, blower
            $table->integer('fan_count')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cooler_specs');
    }
};
