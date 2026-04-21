<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrebuiltPc;
use Illuminate\Http\Request;

class PrebuiltPcController extends Controller
{
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

    public function show($slug)
    {
        $pc = PrebuiltPc::where('slug', $slug)
            ->where('is_active', true)
            ->with(['tags:id,name,slug', 'components' => fn($q) => $q->with(['brand:id,name', 'category:id,name', 'cpuSpec', 'gpuSpec', 'ramSpec', 'motherboardSpec', 'psuSpec', 'storageSpec', 'coolerSpec', 'caseSpec'])])
            ->firstOrFail();

        return response()->json($this->formatPc($pc));
    }

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
            'ram' => 'ramSpec', // Если в БД опечатка ram_scecs, замени на 'ramScecs'
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