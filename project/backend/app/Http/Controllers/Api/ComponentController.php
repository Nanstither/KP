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
        $component = Components::with([
            'brand', 'category',
            'cpuSpec', 'gpuSpec', 'ramSpec', 'motherboardSpec', 'psuSpec', 'storageSpec', 'coolerSpec', 'caseSpec',
            'compatibleSockets:id,name', 
            'supportedFormFactors:id,name'
        ])->findOrFail($id);

        return response()->json($component);
    }

    // Обновление в таблице админ-панели
    public function update(Request $request, Components $component) {
        $validated = $request->validate([
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);
        $component->update($validated);
        return response()->json($component);
    }

    public function destroy(Components $component)
    {
        try {
            // Благодаря cascadeOnDelete() в миграциях, 
            // связанные записи удалятся автоматически
            $component->delete();
            
            return response()->json(['message' => 'Компонент удалён'], 200);
        } catch (\Exception $e) {
            \Log::error('Delete error: ' . $e->getMessage());
            return response()->json(['message' => 'Ошибка удаления'], 500);
        }
    }
}
