<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('case_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // mid_tower, full_tower, mini_itx, sff...
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('case_types');
    }
};