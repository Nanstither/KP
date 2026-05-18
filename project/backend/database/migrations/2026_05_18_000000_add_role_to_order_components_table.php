<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_components', function (Blueprint $table) {
            $table->string('role')->nullable()->after('component_id')->comment('cpu, gpu, ram, motherboard, psu, storage, cooler, case');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_components', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
