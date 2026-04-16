<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('case_specs', function (Blueprint $table) {
            $table->foreignId('component_id')->primary()->constrained('components')->cascadeOnDelete();
            
            $table->string('case_type'); // mid_tower, full_tower, mini_itx, open_frame

            $table->integer('top_fan_slots')->default(2); // сколько вентиляторов можно поставить сверху
            
            $table->integer('fans_included')->default(4); // вентиляторов в комплекте

            $table->integer('drive_bays_3_5')->default(2); // для HDD
            $table->integer('drive_bays_2_5')->default(4); // для SSD 2.5"

            // Порты на передней панели
            $table->integer('front_usb_a')->default(2);
            $table->integer('front_usb_c')->default(0);
            $table->boolean('front_audio_jack')->default(true);

            $table->string('material')->default('steel');
        });

        Schema::create('case_form_factor', function (Blueprint $table) {
            $table->foreignId('component_id')->constrained('components')->cascadeOnDelete();
            $table->foreignId('form_factor_id')->constrained('form_factors')->cascadeOnDelete();
            $table->primary(['component_id', 'form_factor_id']); // составной ключ
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('case_form_factor');
        Schema::dropIfExists('case_specs');
    }
};
