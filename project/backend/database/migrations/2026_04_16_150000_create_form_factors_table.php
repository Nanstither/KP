<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_factors', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // ATX, mATX, ITX, E-ATX, Mini-DTX
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_factors');
    }
};
