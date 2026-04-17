<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Components;
use Illuminate\Http\Request;

class ComponentController extends Controller
{
    public function index(Request $request)
    {
        $query = Components::with(['category', 'brand']);

        if ($request->has('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }
        if ($request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
        }

        // return $request->boolean('paginate', true) 
        //     ? $query->paginate(20) 
        //     : $query->get();

        return $query->get();
    }

    public function show($id)
    {
        return Components::with(['category', 'brand'])->findOrFail($id);
    }
}