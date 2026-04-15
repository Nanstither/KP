<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('cpu_specs');
    }
};
