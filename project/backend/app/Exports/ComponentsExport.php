<?php

namespace App\Exports;

use App\Models\Component;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ComponentsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Component::with(['category', 'brand'])->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Модель',
            'Категория',
            'Бренд',
            'Цена (₽)',
            'Наличие (шт.)',
            'Описание'
        ];
    }

    /**
     * @param mixed $component
     * @return array
     */
    public function map($component): array
    {
        return [
            $component->id,
            $component->model,
            $component->category?->name ?? '—',
            $component->brand?->name ?? '—',
            $component->price,
            $component->stock,
            $component->description ?? '',
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
