<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('prebuilt_pc_tag', function (Blueprint $table) {
            $table->foreignId('prebuilt_pc_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['prebuilt_pc_id', 'tag_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('prebuilt_pc_tag');
    }
};