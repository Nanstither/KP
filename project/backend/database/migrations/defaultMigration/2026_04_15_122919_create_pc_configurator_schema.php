<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Категории компонентов
        Schema::create('component_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique(); // cpu, gpu, motherboard, ram, cooler, psu, storage, optional
            $table->timestamps();
        });

        // 2. Базовая таблица компонентов
        Schema::create('components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('component_categories')->cascadeOnDelete();
            $table->string('brand');
            $table->string('model');
            $table->decimal('price', 10, 2);
            $table->integer('stock')->default(0);
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
        });

        // 3. Спецификации (1:1 с components)
        Schema::create('cpu_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->string('socket');
            $table->integer('cores');
            $table->integer('threads');
            $table->decimal('base_clock_mhz', 5, 1);
            $table->decimal('boost_clock_mhz', 5, 1)->nullable();
            $table->integer('tdp_watts');
            $table->timestamps();
        });

        Schema::create('gpu_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->integer('vram_gb');
            $table->string('vram_type'); // GDDR6, GDDR6X и т.д.
            $table->integer('memory_bus_bit');
            $table->integer('tdp_watts');
            $table->integer('length_mm');
            $table->integer('pcie_slots_required')->default(2);
            $table->timestamps();
        });

        Schema::create('motherboard_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->string('socket');
            $table->string('chipset');
            $table->integer('ram_slots');
            $table->string('ram_type'); // DDR4, DDR5
            $table->integer('m2_slots');
            $table->integer('pcie_x16_slots');
            $table->string('pcie_gen'); // 3.0, 4.0, 5.0
            $table->integer('sata_ports');
            $table->string('form_factor'); // ATX, mATX, ITX
            $table->timestamps();
        });

        Schema::create('ram_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->integer('total_capacity_gb');
            $table->integer('speed_mhz');
            $table->string('type'); // DDR4, DDR5
            $table->integer('latency_cl');
            $table->integer('modules_count'); // 1, 2, 4
            $table->timestamps();
        });

        Schema::create('cooler_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->string('compatible_sockets'); // comma-separated или отдельная pivot-таблица если нужно строго
            $table->integer('tdp_rating_watts');
            $table->string('type'); // tower, aio, blower
            $table->integer('fan_count')->default(1);
            $table->timestamps();
        });

        Schema::create('psu_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->integer('wattage');
            $table->string('efficiency'); // 80+ Bronze, Gold, Platinum
            $table->string('modularity'); // non, semi, full
            $table->integer('pcie_power_connectors'); // 6+2 pin
            $table->timestamps();
        });

        Schema::create('storage_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            $table->string('type'); // nvme, sata
            $table->integer('capacity_gb');
            $table->integer('read_speed_mbps');
            $table->integer('write_speed_mbps');
            $table->string('form_factor'); // m.2_2280, 2.5_inch
            $table->timestamps();
        });

        // 4. Конфигурации (сборки пользователей)
        Schema::create('configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name')->default('Моя сборка');
            $table->timestamps();
        });

        Schema::create('configuration_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('configuration_id')->constrained('configurations')->cascadeOnDelete();
            $table->foreignId('component_id')->constrained('components')->cascadeOnDelete();
            $table->string('role'); // cpu, gpu, motherboard, ram, cooler, psu, storage_main, storage_extra_nvme, option_wifi...
            $table->timestamps();

            $table->unique(['configuration_id', 'role']); // Один компонент на роль
            $table->index(['configuration_id', 'role']);
        });

        // 5. Пребилды (готовые ПК)
        Schema::create('prebuilt_pcs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('prebuilt_pc_items', function (Blueprint $table) {
            $table->foreignId('prebuilt_pc_id')->constrained('prebuilt_pcs')->cascadeOnDelete();
            $table->foreignId('component_id')->constrained('components')->cascadeOnDelete();
            $table->string('role');
            $table->timestamps();
            $table->primary(['prebuilt_pc_id', 'component_id', 'role']);
        });
    }

    public function down(): void
    {
        // Обратный порядок удаления
        Schema::dropIfExists('prebuilt_pc_items');
        Schema::dropIfExists('prebuilt_pcs');
        Schema::dropIfExists('configuration_items');
        Schema::dropIfExists('configurations');
        Schema::dropIfExists('storage_specs');
        Schema::dropIfExists('psu_specs');
        Schema::dropIfExists('cooler_specs');
        Schema::dropIfExists('ram_specs');
        Schema::dropIfExists('motherboard_specs');
        Schema::dropIfExists('gpu_specs');
        Schema::dropIfExists('cpu_specs');
        Schema::dropIfExists('components');
        Schema::dropIfExists('component_categories');
    }
};
