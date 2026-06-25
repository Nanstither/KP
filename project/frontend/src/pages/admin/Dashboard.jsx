import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Banknote, Package, ShoppingBag } from 'lucide-react';
import api from '@/services/api';

const CATEGORY_LABELS = {
  cpu: 'CPU',
  gpu: 'GPU',
  ram: 'RAM',
  motherboard: 'Мат. плата',
  psu: 'БП',
  storage: 'SSD/HDD',
  cooler: 'Охлаждение',
  case: 'Корпус',
};

const ORDER_STATUS = {
  pending: { label: 'Ожидает оплаты', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400' },
  paid: { label: 'Оплачен', className: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' },
  preparing: { label: 'Готовится', className: 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400' },
  shipped: { label: 'Отправлен', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400' },
};

export default function Dashboard({
  components,
  onNavigateToLowStock,
  onNavigateToOutOfStock,
  onNavigateToOrders,
}) {
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const lowStockItems = components.filter(c => c.stock > 0 && c.stock <= 5).slice(0, 5);
  const outOfStockItems = components.filter(c => c.stock === 0).slice(0, 5);

  const inventoryValue = useMemo(() => {
    return components.reduce((sum, c) => sum + (Number(c.price) || 0) * (c.stock || 0), 0);
  }, [components]);

  const inventoryByCategory = useMemo(() => {
    const map = {};
    components.forEach(c => {
      const slug = c.category?.slug || 'other';
      const value = (Number(c.price) || 0) * (c.stock || 0);
      map[slug] = (map[slug] || 0) + value;
    });
    return Object.entries(map)
      .map(([slug, value]) => ({
        slug,
        label: CATEGORY_LABELS[slug] || slug,
        value,
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [components]);

  const maxCategoryValue = Math.max(...inventoryByCategory.map(d => d.value), 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setOrdersLoading(true);
      try {
        const res = await api.get('/admin/orders', { params: { scope: 'active', per_page: 5, page: 1 } });
        if (!cancelled) setActiveOrders(res.data.data || []);
      } catch (err) {
        console.error('Ошибка загрузки заказов:', err);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 shadow-sm rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Аналитика склада</h3>
        </div>
        <WarehouseChart components={components} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Banknote className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Стоимость склада</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {inventoryValue.toLocaleString('ru-RU')} ₽
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Сумма: цена × остаток по всем позициям</p>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {inventoryByCategory.length > 0 ? inventoryByCategory.map(item => (
              <div key={item.slug} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className="text-gray-500 font-mono">{item.value.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / maxCategoryValue) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  />
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">Нет данных</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 shadow-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Заказы в работе</h3>
            </div>
            <button
              type="button"
              onClick={onNavigateToOrders}
              className="px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              Смотреть все <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : activeOrders.length > 0 ? (
            <div className="space-y-3">
              {activeOrders.map(order => {
                const status = ORDER_STATUS[order.status] || { label: order.status, className: 'bg-gray-100 text-gray-800' };
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                        #{order.id} · {order.recipient_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')} · {Number(order.total_amount).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <span className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">Нет заказов в работе</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <StockAlertTable
          title="Требуют пополнения (< 5 шт)"
          items={lowStockItems}
          onViewAll={onNavigateToLowStock}
          emptyMessage="Все в порядке!"
          badgeClass="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
          borderClass="border-red-200 dark:border-red-500/20"
          buttonClass="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
        />
        <StockAlertTable
          title="Нет в наличии"
          items={outOfStockItems}
          onViewAll={onNavigateToOutOfStock}
          emptyMessage="Все позиции в наличии"
          badgeClass="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300"
          borderClass="border-gray-300 dark:border-white/20"
          buttonClass="bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
          icon={Package}
          iconClassName="text-gray-500 dark:text-gray-400"
        />
      </div>
    </motion.div>
  );
}

function StockAlertTable({ title, items, onViewAll, emptyMessage, badgeClass, borderClass, buttonClass, icon: Icon = AlertTriangle, iconClassName = 'text-red-500 dark:text-red-400' }) {
  return (
    <div className={`bg-white dark:bg-[#141416] border ${borderClass} rounded-xl p-5 shadow-sm`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconClassName}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${buttonClass}`}
        >
          Смотреть все <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase border-b border-gray-200 dark:border-white/10">
            <tr>
              <th className="pb-2">Модель</th>
              <th className="pb-2">Категория</th>
              <th className="pb-2 text-right">Остаток</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {items.length > 0 ? items.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/2">
                <td className="py-3 font-medium text-gray-700 dark:text-gray-200">{c.model}</td>
                <td className="py-3 text-gray-600 dark:text-gray-400">{c.category?.name || '—'}</td>
                <td className="py-3 text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeClass}`}>
                    {c.stock} шт.
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WarehouseChart({ components }) {
  const [selectedCat, setSelectedCat] = useState('cpu');

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
  const categories = Object.entries(CATEGORY_LABELS).map(([slug, label]) => ({ slug, label }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setSelectedCat(cat.slug)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedCat === cat.slug
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="space-y-3 h-48 overflow-y-auto pr-2 custom-scrollbar">
        {chartData.length > 0 ? chartData.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
              <span className="text-gray-500 font-mono">{item.value} шт.</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
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
