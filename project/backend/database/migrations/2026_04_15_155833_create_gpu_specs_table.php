<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gpu_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->integer('vram_gb');
            $table->string('vram_type'); // GDDR6, GDDR6X ...
            $table->integer('memory_bus_bit');
            $table->integer('tdp_watts');
            $table->integer('length_mm');
            $table->integer('width_mm');
            $table->integer('pcie_slots_required')->default(2);
            $table->string('pcie_gen'); // 3.0, 4.0, 5.0
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gpu_specs');
    }
};
