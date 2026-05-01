<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Component;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{ComponentCategory, Brand, Socket, FormFactor, CpuSpec, GpuSpec, RamSpec, MotherboardSpec, PsuSpec, StorageSpec, CoolerSpec, CaseSpec};

class ComponentController extends Controller
{
    public function index(Request $request)
    {
        $query = Component::with(['category', 'brand']);

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
        $component = Component::with([
            'brand', 'category', 
            'cpuSpec', 'gpuSpec', 'ramSpec', 'motherboardSpec', 'psuSpec', 'storageSpec', 'coolerSpec', 'caseSpec',
            'compatibleSockets:id,name', 
            'supportedFormFactors:id,name'
        ])->findOrFail($id);

        return response()->json($component);
    }

    // Обновление в таблице админ-панели
    public function update(Request $request, Component $component) {
        $validated = $request->validate([
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);
        $component->update($validated);
        return response()->json($component);
    }

    public function destroy(Component $component)
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

    public function edit(Component $component)
    {
        $component->load([
            'category', 'brand',
            'cpuSpec.socket',
            'gpuSpec',
            'ramSpec',
            'motherboardSpec.socket', 'motherboardSpec.formFactor',
            'psuSpec',
            'storageSpec',
            'coolerSpec',
            'caseSpec',
            // Загружаем Many-to-Many связи НАПРЯМУЮ на компоненте:
            'compatibleSockets',      // для кулеров
            'supportedFormFactors'    // для корпусов
        ]);

        return response()->json([
            'component' => $component,
            'refs' => [
                'categories' => ComponentCategory::select('id', 'name', 'slug')->get(),
                'brands' => Brand::select('id', 'name')->get(),
                'sockets' => Socket::select('id', 'name')->get(),
                'form_factors' => FormFactor::select('id', 'name')->get(),
            ]
        ]);
    }

    public function updateFull(Request $request, Component $component)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:component_categories,id',
            'brand_id' => 'required|exists:brands,id',
            'model' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'specs' => 'nullable|array',
        ]);

        DB::transaction(function () use ($component, $data, $request) {
            $component->update($data);
            $slug = ComponentCategory::find($data['category_id'])?->slug;
            $spec = $request->specs ?? [];

            $sync = fn($model, $d) => $model::updateOrCreate(['component_id' => $component->id], $d);

            match ($slug) {
                'cpu' => $sync(CpuSpec::class, $spec['cpu'] ?? []),
                'gpu' => $sync(GpuSpec::class, $spec['gpu'] ?? []),
                'ram' => $sync(RamSpec::class, $spec['ram'] ?? []),
                'psu' => $sync(PsuSpec::class, $spec['psu'] ?? []),
                'storage' => $sync(StorageSpec::class, $spec['storage'] ?? []),
                'motherboard' => $sync(MotherboardSpec::class, array_map(fn($v) => is_numeric($v) ? (int)$v : $v, $spec['motherboard'] ?? [])),
                'cooler' => tap(CoolerSpec::updateOrCreate(['component_id' => $component->id], $spec['cooler'] ?? []), fn($c) => isset($spec['cooler']['compatible_sockets']) ? $c->compatibleSockets()->sync($spec['cooler']['compatible_sockets']) : null),
                'case' => tap(CaseSpec::updateOrCreate(['component_id' => $component->id], $spec['case'] ?? []), fn($c) => isset($spec['case']['supported_form_factors']) ? $c->supportedFormFactors()->sync($spec['case']['supported_form_factors']) : null),
                default => null,
            };
        });

        return response()->json(['message' => 'Обновлено']);
    }
}
