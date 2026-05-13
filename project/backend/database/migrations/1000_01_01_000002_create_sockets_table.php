<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sockets', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // LGA1700, AM5, AM4
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sockets');
    }
};
