<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ComponentImageService
{
    public function store(UploadedFile $file, string $categorySlug, string $model, ?string $oldPath = null): string
    {
        $this->delete($oldPath);

        $directory = "images/components/{$categorySlug}";

        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory);
        }

        $ext = $file->getClientOriginalExtension();
        $filename = (Str::slug($model) ?: 'component') . '.' . $ext;
        Storage::disk('public')->putFileAs($directory, $file, $filename);

        return "{$directory}/{$filename}";
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
