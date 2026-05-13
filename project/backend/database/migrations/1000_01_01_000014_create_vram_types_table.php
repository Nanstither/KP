<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vram_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // GDDR5, GDDR6, GDDR6X, HBM2...
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vram_types');
    }
};