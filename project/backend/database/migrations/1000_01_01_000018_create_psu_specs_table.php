<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('psu_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->integer('wattage');
            $table->string('efficiency'); // 80+ Bronze, Gold, Platinum
            $table->string('modularity'); // non, semi, full
            // $table->integer('pcie_power_connectors'); // 6+2 pin
            $table->integer('pcie_cables_count')->default(0); // количество кабелей PCIe
            $table->string('pcie_cable_type')->default('6+2'); // "6+2" || "16pin"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('psu_specs');
    }
};
