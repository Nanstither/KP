<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cooler_socket', function (Blueprint $table) {
            $table->foreignId('component_id')->constrained('components')->cascadeOnDelete();
            $table->foreignId('socket_id')->constrained('sockets')->cascadeOnDelete();
            $table->primary(['component_id', 'socket_id']); // Составной первичный ключ
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cooler_sockets');
    }
};
