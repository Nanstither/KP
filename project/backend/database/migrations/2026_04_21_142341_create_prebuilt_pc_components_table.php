<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('prebuilt_pc_component', function (Blueprint $table) {
            $table->foreignId('prebuilt_pc_id')->constrained()->cascadeOnDelete();
            $table->foreignId('component_id')->constrained()->cascadeOnDelete();
            $table->string('role')->comment('cpu, gpu, ram, motherboard, psu, storage, cooler, case');
            $table->primary(['prebuilt_pc_id', 'role']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('prebuilt_pc_component');
    }
};