<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Component;
use App\Models\{ComponentCategory, Brand, Socket, FormFactor, CpuSpec, GpuSpec, RamSpec, MotherboardSpec, PsuSpec, StorageSpec, CoolerSpec, CaseSpec, RamType, VramType, CaseType, Material};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Str;

class ComponentController extends Controller
{
    public function index(Request $request) {
        $query = Component::with(['category', 'brand']);
        if ($request->has('category')) $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        if ($request->boolean('in_stock')) $query->where('stock', '>', 0);
        return $query->get();
    }

    public function show($id) {
        return Component::with(['brand','category','cpuSpec','gpuSpec','ramSpec','motherboardSpec','psuSpec','storageSpec','coolerSpec','caseSpec','compatibleSockets:id,name','supportedFormFactors:id,name'])->findOrFail($id);
    }

    public function update(Request $request, Component $component) {
        $validated = $request->validate(['price' => 'required|numeric|min:0', 'stock' => 'required|integer|min:0']);
        $component->update($validated);
        return response()->json($component);
    }

    public function destroy(Component $component) {
        try { $component->delete(); return response()->json(['message' => 'Компонент удалён'], 200); } 
        catch (\Exception $e) { return response()->json(['message' => 'Ошибка удаления'], 500); }
    }

    public function edit(Component $component)
    {
        $component->load([
            'category', 'brand', 'cpuSpec.socket', 'gpuSpec.vramType', 'ramSpec.ramType',
            'motherboardSpec.socket', 'motherboardSpec.ramType', 'motherboardSpec.formFactor',
            'psuSpec', 'storageSpec', 'coolerSpec', 'caseSpec.caseType', 'caseSpec.material',
            'compatibleSockets', 'supportedFormFactors'
        ]);

        return response()->json([
            'component' => $component,
            'refs' => [
                'categories'   => ComponentCategory::select('id','name','slug')->get(),
                'brands'       => Brand::select('id','name')->get(),
                'sockets'      => Socket::select('id','name')->get(),
                'form_factors' => FormFactor::select('id','name')->get(),
                'ram_types'    => RamType::select('id','name')->get(),
                'vram_types'   => VramType::select('id','name')->get(),
                'case_types'   => CaseType::select('id','name')->get(),
                'materials'    => Material::select('id','name')->get(),
            ]
        ]);
    }

        public function updateFull(Request $request, Component $component)
    {
        // Валидация: все поля 'sometimes' (обновляются только если переданы)
        $rules = [
            'category_id' => 'sometimes|exists:component_categories,id',
            'brand_id'    => 'sometimes|exists:brands,id',
            'model'       => 'sometimes|string|max:255',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'image'       => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'image_url'   => 'nullable|string',
        ];

        // Если specs приходит как JSON-строка (из FormData), декодируем
        if ($request->has('specs') && is_string($request->input('specs'))) {
            $request->merge(['specs' => json_decode($request->input('specs'), true)]);
        }
        $rules['specs'] = 'sometimes|array';

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:component_categories,id',
            'brand_id'    => 'sometimes|exists:brands,id',
            'model'       => 'sometimes|string|max:255',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'image'       => 'nullable|file|mimes:jpg,jpeg,png,webp,svg|max:2048', // ← обязательно nullable
            'image_url'   => 'nullable|string',
            'specs'       => 'sometimes|array',
        ]);

        DB::transaction(function () use ($component, $validated, $request) {
            // 1. Базовые поля (игнорируем пустые/отсутствующие)
            $baseData = array_filter($validated, fn($k) => !in_array($k, ['image', 'image_url', 'specs']), ARRAY_FILTER_USE_KEY);
            if (!empty($baseData)) {
                $component->update($baseData);
            }

            // 2. Изображение: файл или URL
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $catSlug = $component->category->slug;
                // Генерируем имя файла из модели (например: ryzen-7-7800x3d.jpg)
                $modelSlug = Str::slug($baseData['model'] ?? $component->model);
                $filename = $modelSlug . '.' . $file->getClientOriginalExtension();
                // Сохраняем в storage/app/public/components/{category}/
                $path = $file->storeAs("components/{$catSlug}", $filename, 'public');
                $component->update(['image' => $path]);
            } elseif (!empty($validated['image_url'])) {
                $component->update(['image' => $validated['image_url']]);
            }

            // 3. Спецификации (обновляем ТОЛЬКО переданные поля)
            $slug = $component->category->slug;
            $rawSpecs = $request->input('specs', []);
            $specData = $rawSpecs[$slug] ?? [];
            
            // Фильтруем пустые значения, чтобы не затирать существующие в БД
            $filteredSpec = array_filter($specData, fn($v) => $v !== '' && $v !== null);

            if (!empty($filteredSpec)) {
                $specModel = "App\\Models\\" . ucfirst($slug) . "Spec";
                if (class_exists($specModel)) {
                    $spec = $specModel::where('component_id', $component->id)->first();
                    if (!$spec) {
                        $spec = new $specModel(['component_id' => $component->id]);
                    }
                    // fill() обновит только dirty-атрибуты, save() сохранит
                    $spec->fill($filteredSpec)->save();
                }

                // Many-to-Many синхронизация (только если переданы массивы)
                if ($slug === 'cooler' && isset($filteredSpec['compatible_sockets'])) {
                    $component->compatibleSockets()->sync($filteredSpec['compatible_sockets']);
                }
                if ($slug === 'case' && isset($filteredSpec['supported_form_factors'])) {
                    $component->supportedFormFactors()->sync($filteredSpec['supported_form_factors']);
                }
            }
        });

        return response()->json(['message' => 'Компонент успешно обновлён']);
    }
}