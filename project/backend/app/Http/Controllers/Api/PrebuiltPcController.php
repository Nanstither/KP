<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrebuiltPc;
use App\Models\Component;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PrebuiltPcController extends Controller
{
    private const EXCLUSIVE_TAG_SLUG = 'ekskliuzivnyi';

    // Публичные методы (уже существуют)
    public function index(Request $request)
    {
        $query = PrebuiltPc::query()
            ->where('is_active', true)
            ->with(['tags:id,name,slug'])
            ->with(['components' => function ($q) {
                $q->with(['brand:id,name', 'category:id,name'])
                  ->with(['cpuSpec', 'gpuSpec', 'ramSpec', 'motherboardSpec', 'psuSpec', 'storageSpec', 'coolerSpec', 'caseSpec']);
            }]);

        // Фильтрация по тегу (например, ?tag=gaming)
        if ($request->filled('tag')) {
            $query->whereHas('tags', fn($q) => $q->where('slug', $request->tag));
        }

        $pcs = $query->get();

        return response()->json($pcs->map(fn($pc) => $this->formatPc($pc)));
    }

    // Получение ПК с тегом "Эксклюзивный" для PremiumPCHero
    public function exclusive()
    {
        $pc = PrebuiltPc::query()
            ->where('is_active', true)
            ->whereHas('tags', fn($q) => $q->where('slug', self::EXCLUSIVE_TAG_SLUG))
            ->with(['tags:id,name,slug'])
            ->with(['components' => function ($q) {
                $q->with(['brand:id,name', 'category:id,name'])
                  ->with(['cpuSpec', 'gpuSpec', 'ramSpec', 'motherboardSpec', 'psuSpec', 'storageSpec', 'coolerSpec', 'caseSpec']);
            }])
            ->first();

        if (!$pc) {
            return response()->json(null);
        }

        return response()->json($this->formatPc($pc));
    }

    public function show($slug)
    {
        $pc = PrebuiltPc::where('slug', $slug)
            ->where('is_active', true)
            ->with(['tags:id,name,slug', 'components' => fn($q) => $q->with(['brand:id,name', 'category:id,name', 'cpuSpec', 'gpuSpec', 'ramSpec', 'motherboardSpec', 'psuSpec', 'storageSpec', 'coolerSpec', 'caseSpec'])])
            ->firstOrFail();

        return response()->json($this->formatPc($pc));
    }

    // ✅ Админские методы для CRUD
    
    // Список всех ПК (включая неактивные) для админки
    public function adminIndex()
    {
        $pcs = PrebuiltPc::with(['tags', 'components'])->orderByDesc('id')->get();
        return response()->json([
            'pcs' => $pcs,
            'refs' => [
                'tags' => Tag::select('id', 'name', 'slug')->get()
            ]
        ]);
    }

    // Создание нового ПК
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'components' => 'array', // [{ component_id: 1, role: 'cpu' }, ...]
            'tag_ids' => 'array' // [1, 2, 3]
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = $validated['is_active'] ?? false;

        $pc = PrebuiltPc::create($validated);

        // Привязываем компоненты
        if (!empty($validated['components'])) {
            foreach ($validated['components'] as $comp) {
                $pc->components()->attach($comp['component_id'], ['role' => $comp['role']]);
            }
        }

        // Привязываем теги
        $tagIds = $this->resolveTagIds($request);
        if ($tagIds !== null) {
            $pc->tags()->sync($tagIds);
        }

        return response()->json($pc->load(['tags', 'components']), 201);
    }

    // Получение данных для редактирования
    public function edit($id)
    {
        $pc = PrebuiltPc::with(['tags', 'components'])->findOrFail($id);
        $refs = [
            'tags' => Tag::select('id', 'name', 'slug')->get()
        ];
        return response()->json([
            'pc' => $pc,
            'refs' => $refs
        ]);
    }

    // Обновление ПК
    public function update(Request $request, $id)
    {
        $pc = PrebuiltPc::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'components' => 'array',
            'tag_ids' => 'array'
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = $validated['is_active'] ?? false;

        $pc->update($validated);

        // Синхронизация компонентов
        if (isset($validated['components'])) {
            $pc->components()->detach();
            foreach ($validated['components'] as $comp) {
                $pc->components()->attach($comp['component_id'], ['role' => $comp['role']]);
            }
        }

        // Синхронизация тегов
        $tagIds = $this->resolveTagIds($request, $pc);
        if ($tagIds !== null) {
            $pc->tags()->sync($tagIds);
        }

        return response()->json($pc->load(['tags', 'components']));
    }

    // Удаление ПК
    public function destroy($id)
    {
        $pc = PrebuiltPc::findOrFail($id);
        $pc->components()->detach();
        $pc->tags()->detach();
        $pc->delete();

        return response()->json(['message' => 'Готовый ПК удалён']);
    }

    private function resolveTagIds(Request $request, ?PrebuiltPc $pc = null): ?array
    {
        if (!$request->has('tag_ids')) {
            return null;
        }

        $tagIds = $request->input('tag_ids', []);

        if ($request->user()->isAdmin()) {
            return $tagIds;
        }

        $exclusiveTagId = Tag::where('slug', self::EXCLUSIVE_TAG_SLUG)->value('id');
        if (!$exclusiveTagId) {
            return $tagIds;
        }

        $tagIds = array_values(array_filter(
            $tagIds,
            fn($id) => (int) $id !== (int) $exclusiveTagId
        ));

        if ($pc && $pc->tags()->where('tags.id', $exclusiveTagId)->exists()) {
            $tagIds[] = $exclusiveTagId;
            $tagIds = array_values(array_unique($tagIds));
        }

        return $tagIds;
    }

    // Вспомогательные методы
    private function formatPc($pc)
    {
        $componentsByRole = [];
        foreach ($pc->components as $comp) {
            $role = $comp->pivot->role ?? 'unknown';
            $componentsByRole[$role] = [
                'id' => $comp->id,
                'model' => $comp->model,
                'brand' => $comp->brand?->name,
                'category' => $comp->category?->name,
                'image' => $comp->image,
                'specs' => $this->getSpecsForRole($comp, $role),
            ];
        }

        return [
            'id' => $pc->id,
            'name' => $pc->name,
            'slug' => $pc->slug,
            'description' => $pc->description,
            'price' => $pc->price,
            'image' => $pc->image,
            'tags' => $pc->tags->map(fn($t) => ['name' => $t->name, 'slug' => $t->slug]),
            'components' => $componentsByRole,
        ];
    }

    private function getSpecsForRole($component, $role)
    {
        $relation = match($role) {
            'cpu' => 'cpuSpec',
            'gpu' => 'gpuSpec',
            'ram' => 'ramSpec',
            'motherboard' => 'motherboardSpec',
            'psu' => 'psuSpec',
            'storage' => 'storageSpec',
            'cooler' => 'coolerSpec',
            'case' => 'caseSpec',
            default => null
        };

        if (!$relation) return null;
        return $component->{$relation}?->toArray();
    }
}