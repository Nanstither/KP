<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ram_scecs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->integer('total_capacity_gb');
            $table->integer('speed_mhz');
            $table->string('type'); // DDR4, DDR5
            $table->integer('latency_cl');
            $table->integer('modules_count')->default(2); // 1, 2, 4
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ram_scecs');
    }
};
