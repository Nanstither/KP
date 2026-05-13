<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('motherboard_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            // $table->string('socket');
            $table->foreignId('socket_id')->constrained('sockets')->cascadeOnDelete();            
            // $table->string('chipset');
            $table->integer('ram_slots');
            // $table->string('ram_type'); // DDR4, DDR5
            $table->foreignId('ram_type_id')->constrained('ram_types')->cascadeOnDelete(); 
            $table->integer('m2_slots');
            $table->integer('pcie_x16_slots');
            $table->string('pcie_gen'); // 3.0, 4.0, 5.0
            $table->integer('sata_ports');
            // $table->string('form_factor'); // ATX, mATX, ITX
            $table->foreignId('form_factor_id')->constrained('form_factors')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('motherboard_specs');
    }
};
