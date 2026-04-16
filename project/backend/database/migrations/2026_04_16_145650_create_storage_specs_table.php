<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storage_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->string('type'); // nvme, sata
            $table->integer('capacity_gb');
            $table->integer('read_speed_mbps');
            $table->integer('write_speed_mbps');
            $table->string('form_factor'); // m.2_2280, 2.5_inch
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storage_specs');
    }
};
