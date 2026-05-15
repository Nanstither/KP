<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Component;
use App\Models\{ComponentCategory, Brand, Socket, FormFactor, CpuSpec, GpuSpec, RamSpec, MotherboardSpec, PsuSpec, StorageSpec, CoolerSpec, CaseSpec, RamType, VramType, CaseType, Material};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
// ✅ Добавляем необходимые классы для работы с файлами и строками
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ComponentController extends Controller
{
    public function index(Request $request)
    {
        $query = Component::with([
            'category', 
            'brand',
            // ✅ ВСЕ спецификации — названия должны ТОЧНО совпадать с методами в модели
            'cpuSpec.socket', 
            'gpuSpec', 
            'ramSpec.ramType', 
            'motherboardSpec.socket', 
            'motherboardSpec.formFactor',
            'motherboardSpec.ramType',
            'psuSpec', 
            'storageSpec', 
            'coolerSpec', 
            'caseSpec',  // ← Вот это критично!
            'compatibleSockets:id,name',
            'supportedFormFactors:id,name'
        ]);
        
        if ($request->has('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }
        
        if ($request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
        }
        
        return $query->get(); // ← Вернёт компоненты со всеми spec
    }

    public function show($id)
    {
        $component = Component::with([
            'brand', 'category',
            'cpuSpec.socket', 'gpuSpec', 'ramSpec.ramType', 'motherboardSpec.socket', 'motherboardSpec.formFactor', 'motherboardSpec.ramType', 'psuSpec', 'storageSpec', 'coolerSpec', 'caseSpec',
            'compatibleSockets:id,name',
            'supportedFormFactors:id,name'
        ])->findOrFail($id);
        return response()->json($component);
    }

    public function update(Request $request, Component $component)
    {
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
            $component->delete();
            return response()->json(['message' => 'Компонент удалён'], 200);
        } catch (\Exception $e) {
            \Log::error('Delete error: ' . $e->getMessage());
            return response()->json(['message' => 'Ошибка удаления'], 500);
        }
    }

    /**
     * Загрузка данных для страницы редактирования
     */
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
            'compatibleSockets',
            'supportedFormFactors'
        ]);

        return response()->json([
            'component' => $component,
            'refs' => [
                'categories'   => ComponentCategory::select('id', 'name', 'slug')->get(),
                'brands'       => Brand::select('id', 'name')->get(),
                'sockets'      => Socket::select('id', 'name')->get(),
                'form_factors' => FormFactor::select('id', 'name')->get(),
                'ram_types'    => RamType::select('id', 'name')->get(),
                'vram_types'   => VramType::select('id', 'name')->get(),
                'case_types'   => CaseType::select('id', 'name')->get(),
                'materials'    => Material::select('id', 'name')->get(),
            ]
        ]);
    }

    /**
     * Полное обновление компонента + спецификации + ИЗОБРАЖЕНИЕ
     */
    public function updateFull(Request $request, Component $component)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:component_categories,id',
            'brand_id'    => 'sometimes|exists:brands,id',
            'model'       => 'sometimes|string|max:255',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'image'       => 'nullable|file|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'image_url'   => 'nullable|string',
            'specs'       => 'nullable|string', // FormData шлёт JSON как строку
        ]);

        DB::transaction(function () use ($component, $validated, $request) {
            // 1. Запоминаем старые данные ДО обновления
            $oldModel = $component->model;
            $oldImagePath = $component->image;
            $categorySlug = $component->category->slug;

            // Обновляем базовые поля (модель изменится здесь)
            $baseData = array_filter($validated, fn($k) => !in_array($k, ['image', 'image_url', 'specs']), ARRAY_FILTER_USE_KEY);
            if (!empty($baseData)) {
                $component->update($baseData);
            }

            // 2. Логика изображения
            $newModel = $component->model; // уже обновлённое название
            $safeModelName = Str::slug($newModel) ?: 'component';
            $directory = "images/components/{$categorySlug}";

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $ext = $file->getClientOriginalExtension();
                $newFilename = $safeModelName . '.' . $ext;

                // 🔒 БЕЗОПАСНОЕ УДАЛЕНИЕ СТАРОГО ФАЙЛА
                if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                    $oldFilename = basename($oldImagePath);
                    $oldNameWithoutExt = pathinfo($oldFilename, PATHINFO_FILENAME);
                    
                    // Удаляем ТОЛЬКО если имя файла совпадает со слагованным названием старой модели
                    // (это означает, что файл был загружен пользователем, а не является шаблоном)
                    if ($oldNameWithoutExt === Str::slug($oldModel)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                    // Иначе файл считается шаблоном/общим ассетом -> оставляем как есть
                }

                // Сохраняем новый файл
                Storage::disk('public')->putFileAs($directory, $file, $newFilename);
                $component->update(['image' => "{$directory}/{$newFilename}"]);

            } elseif (!empty($validated['image_url'])) {
                // Если передан внешний URL или ручной путь
                $component->update(['image' => $validated['image_url']]);
            }
            // Если ни файл, ни image_url не переданы -> старое изображение остаётся нетронутым

            // 3. Спецификации
            $rawSpecs = json_decode($validated['specs'] ?? '{}', true);
            $specPayload = $rawSpecs[$categorySlug] ?? [];
            $cleanSpec = array_filter($specPayload, fn($v) => $v !== '' && $v !== null && $v !== 'null');

            if (!empty($cleanSpec)) {
                $modelClass = "App\\Models\\" . ucfirst($categorySlug) . "Spec";
                if (class_exists($modelClass)) {
                    $spec = $modelClass::where('component_id', $component->id)->first();
                    if (!$spec) $spec = new $modelClass(['component_id' => $component->id]);
                    $spec->fill($cleanSpec)->save();
                }
                // Many-to-Many связи
                if ($categorySlug === 'cooler' && isset($cleanSpec['compatible_sockets'])) {
                    $component->compatibleSockets()->sync($cleanSpec['compatible_sockets']);
                }
                if ($categorySlug === 'case' && isset($cleanSpec['supported_form_factors'])) {
                    $component->supportedFormFactors()->sync($cleanSpec['supported_form_factors']);
                }
            }
        });

        return response()->json(['message' => 'Компонент успешно обновлён']);
    }

    /**
     * Получение справочников для страницы создания
     */
    public function createRefs()
    {
        return response()->json([
            'refs' => [
                'categories'   => ComponentCategory::select('id', 'name', 'slug')->get(),
                'brands'       => Brand::select('id', 'name')->get(),
                'sockets'      => Socket::select('id', 'name')->get(),
                'form_factors' => FormFactor::select('id', 'name')->get(),
                'ram_types'    => RamType::select('id', 'name')->get(),
                'vram_types'   => VramType::select('id', 'name')->get(),
                'case_types'   => CaseType::select('id', 'name')->get(),
                'materials'    => Material::select('id', 'name')->get(),
            ]
        ]);
    }

    /**
     * Создание нового компонента + спецификаций
     */
    public function storeFull(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:component_categories,id',
            'brand_id'    => 'required|exists:brands,id',
            'model'       => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'image'       => 'nullable|file|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'specs'       => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $request) {
            // 1. Создаём базовый компонент
            $baseData = array_filter($validated, fn($k) => !in_array($k, ['image', 'specs']), ARRAY_FILTER_USE_KEY);
            $component = Component::create($baseData);

            // 2. Обработка изображения
            $slug = ComponentCategory::find($validated['category_id'])->slug;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $ext = $file->getClientOriginalExtension();
                $safeName = Str::slug($validated['model']) ?: 'component';
                $filename = $safeName . '.' . $ext;
                $directory = "images/components/{$slug}";

                if (!Storage::disk('public')->exists($directory)) {
                    Storage::disk('public')->makeDirectory($directory);
                }
                Storage::disk('public')->putFileAs($directory, $file, $filename);
                $component->update(['image' => "{$directory}/{$filename}"]);
            }

            // 3. Сохранение спецификаций
            $rawSpecs = json_decode($validated['specs'] ?? '{}', true);
            $specPayload = $rawSpecs[$slug] ?? [];
            $cleanSpec = array_filter($specPayload, fn($v) => $v !== '' && $v !== null && $v !== 'null');
            $cleanSpec['component_id'] = $component->id;

            if (!empty($cleanSpec)) {
                $modelClass = "App\\Models\\" . ucfirst($slug) . "Spec";
                if (class_exists($modelClass)) {
                    $modelClass::create($cleanSpec);
                }
                // Many-to-Many
                if ($slug === 'cooler' && isset($cleanSpec['compatible_sockets'])) {
                    $component->compatibleSockets()->sync($cleanSpec['compatible_sockets']);
                }
                if ($slug === 'case' && isset($cleanSpec['supported_form_factors'])) {
                    $component->supportedFormFactors()->sync($cleanSpec['supported_form_factors']);
                }
            }
        });

        return response()->json(['message' => 'Компонент успешно создан']);
    }

    // ✅ Получение списка справочника
    public function getRefs($type)
    {
        // Используем ::class для получения полного имени класса
        $models = [
            'sockets' => Socket::class,
            'ram_types' => RamType::class,
            'form_factors' => FormFactor::class,
            'materials' => Material::class,
        ];
        
        if (!isset($models[$type])) {
            return response()->json([], 404);
        }
        
        // ✅ Используем ::select() (статический вызов) вместо ->select()
        return response()->json($models[$type]::select('id', 'name')->get());
    }

    // ✅ Создание записи
    public function storeRef(Request $request, $type)
    {
        $validated = $request->validate(['name' => 'required|string|max:50']);
        
        $models = [
            'sockets' => Socket::class,
            'ram_types' => RamType::class,
            'form_factors' => FormFactor::class,
            'materials' => Material::class,
        ];
        
        if (!isset($models[$type])) {
            return response()->json(['message' => 'Invalid type'], 404);
        }
        
        // ✅ Создаем через ::create()
        $item = $models[$type]::create(['name' => $validated['name']]);
        return response()->json($item, 201);
    }

    // ✅ Обновление записи
    public function updateRef(Request $request, $type, $id)
    {
        $validated = $request->validate(['name' => 'required|string|max:50']);
        
        $models = [
            'sockets' => Socket::class,
            'ram_types' => RamType::class,
            'form_factors' => FormFactor::class,
            'materials' => Material::class,
        ];
        
        if (!isset($models[$type])) {
            return response()->json(['message' => 'Invalid type'], 404);
        }
        
        // ✅ Находим и обновляем
        $item = $models[$type]::findOrFail($id);
        $item->update(['name' => $validated['name']]);
        return response()->json($item);
    }

    // ✅ Удаление записи
    public function deleteRef($type, $id)
    {
        $models = [
            'sockets' => Socket::class,
            'ram_types' => RamType::class,
            'form_factors' => FormFactor::class,
            'materials' => Material::class,
        ];
        
        if (!isset($models[$type])) {
            return response()->json(['message' => 'Invalid type'], 404);
        }
        
        $models[$type]::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}