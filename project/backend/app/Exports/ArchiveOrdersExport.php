<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ArchiveOrdersExport implements FromCollection, WithHeadings, WithStyles
{
    public function __construct(private Collection $orders)
    {
    }

    public function collection(): Collection
    {
        $rows = collect();
        $totalRevenue = 0;

        foreach ($this->orders as $order) {
            if ($order->status !== 'delivered') {
                continue;
            }

            $totalRevenue += (float) $order->total_amount;

            foreach ($order->items as $item) {
                $componentCount = $item->components?->count() ?? 0;
                $type = $item->prebuilt_pc_id
                    ? 'Готовый ПК'
                    : ($componentCount > 1 ? 'Сборка' : ($componentCount === 1 ? 'Компонент' : 'Товар'));

                $rows->push([
                    $order->id,
                    $order->created_at?->format('d.m.Y H:i'),
                    $order->recipient_name,
                    $item->name,
                    $type,
                    $item->quantity,
                    $item->price,
                    round((float) $item->price * (int) $item->quantity, 2),
                    $order->total_amount,
                    'Доставлен',
                ]);
            }
        }

        $rows->push([]);
        $rows->push([
            '', '', '', '', '', '', 'Итого выручка (доставлено):', round($totalRevenue, 2), '', '',
        ]);

        return $rows;
    }

    public function headings(): array
    {
        return [
            'ID заказа',
            'Дата',
            'Получатель',
            'Позиция',
            'Тип',
            'Кол-во',
            'Цена (₽)',
            'Сумма строки (₽)',
            'Сумма заказа (₽)',
            'Статус',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
