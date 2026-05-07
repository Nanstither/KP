import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Monitor, Package } from 'lucide-react';

export default function Dashboard({ components, onNavigateToLowStock }) {
  // Берем последние 5 добавленных
  const recentComponents = components.slice(0, 5);
  // Товары, которых мало (от 1 до 5)
  const lowStockItems = components.filter(c => c.stock > 0 && c.stock <= 5).slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="space-y-6"
    >
      {/* --- БЛОК 1: Аналитика склада (График) --- */}
      <div className="bg-[#141416] border border-white/10 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Аналитика склада</h3>
        </div>
        <WarehouseChart components={components} />
      </div>

      {/* --- БЛОК 2: Последние поступления --- */}
      <div className="bg-[#141416] border border-white/10 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Новые поступления</h3>
          {/* Кнопка "Все компоненты" - пока просто заглушка или можно передать пропс */}
        </div>
        <div className="space-y-3">
          {recentComponents.length > 0 ? recentComponents.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-200">{c.model}</p>
                <p className="text-xs text-gray-500">{c.category?.name || 'Без категории'}</p>
              </div>
              <span className="text-sm font-mono text-purple-300">{c.price?.toLocaleString()} ₽</span>
            </div>
          )) : <p className="text-gray-500 text-sm text-center py-4">Список пуст</p>}
        </div>
      </div>

      {/* --- БЛОК 3: Мало на складе (Alert) --- */}
      <div className="bg-[#141416] border border-red-500/20 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Требуют пополнения (&lt; 5 шт)</h3>
          </div>
          <button 
            onClick={onNavigateToLowStock}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
          >
            Смотреть все <ArrowRight className="w-3 h-3" />
          </button>
        </div>
       
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase border-b border-white/10">
              <tr>
                <th className="pb-2">Модель</th>
                <th className="pb-2">Категория</th>
                <th className="pb-2 text-right">Остаток</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lowStockItems.length > 0 ? lowStockItems.map(c => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-medium text-gray-200">{c.model}</td>
                  <td className="py-3 text-gray-400">{c.category?.name || '—'}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400">
                      {c.stock} шт.
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">Все в порядке! 🎉</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// --- Вспомогательный компонент графика (внутри того же файла для удобства) ---
function WarehouseChart({ components }) {
  const [selectedCat, setSelectedCat] = useState('cpu');

  // Собираем данные для графика
  const chartData = useMemo(() => {
    const filtered = components.filter(c => c.category?.slug === selectedCat);
    const counts = {};
    filtered.forEach(c => {
      const brand = c.brand?.name || 'Неизвестно';
      counts[brand] = (counts[brand] || 0) + c.stock;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [components, selectedCat]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const categories = [
    { slug: 'cpu', label: 'CPU' },
    { slug: 'gpu', label: 'GPU' },
    { slug: 'ram', label: 'RAM' },
    { slug: 'motherboard', label: 'Мат. плата' },
    { slug: 'psu', label: 'БП' },
    { slug: 'storage', label: 'SSD/HDD' },
    { slug: 'cooler', label: 'Охлаждение' },
    { slug: 'case', label: 'Корпус' },
  ];

  return (
    <div className="space-y-4">
      {/* Переключатель категорий */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCat(cat.slug)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedCat === cat.slug
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Бары графика */}
      <div className="space-y-3 h-48 overflow-y-auto pr-2 custom-scrollbar">
        {chartData.length > 0 ? chartData.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">{item.name}</span>
              <span className="text-gray-500 font-mono">{item.value} шт.</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
        )) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Нет данных
          </div>
        )}
      </div>
    </div>
  );
}