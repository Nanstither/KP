import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import {
  Cpu, Monitor, Zap, Package, Settings, Users, LogOut, Plus,
  Edit, Trash2, Search, Filter, ChevronRight, AlertTriangle, TrendingUp, ArrowRight,
  Check, X, Loader2
} from 'lucide-react';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Фильтры для таблицы компонентов
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low'
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const res = await api.get('/components');
      // Сортируем новые сверху
      setComponents(res.data.sort((a, b) => b.id - a.id)); 
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  // Логика переключения на вкладку с фильтром (для кнопки "Мало на складе")
  const navigateToLowStock = () => {
    setActiveTab('components');
    setStockFilter('low');
    setCategoryFilter('all');
    setSearch('');
    setPage(1);
  };

  // Сброс фильтров при ручном переходе во вкладку
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'components') {
      setStockFilter('all');
      setPage(1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-gray-200 p-6">
      {/* Ограничиваем ширину */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- ШАПКА ПАНЕЛИ --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Панель управления</h1>
            <p className="text-sm text-gray-400 mt-1">
              Добро пожаловать, {user?.name} ({user?.role === 'admin' ? 'Администратор' : 'Менеджер'})
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" /> Выйти
          </button>
        </div>

        {/* --- KPI BAR (Шапка статистики) --- */}
        {/* Фон bg-[#0a0a0c] соответствует заголовку таблицы */}
        <div className="grid grid-cols-3 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          {/* 1. Всего компонентов */}
          <div className="flex flex-col items-center justify-center py-5 border-r border-white/10 last:border-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Всего компонентов</p>
            <p className="text-2xl font-bold text-white">{components.length}</p>
            <Monitor className="w-4 h-4 text-purple-500 mt-2" />
          </div>

          {/* 2. Общий склад */}
          <div className="flex flex-col items-center justify-center py-5 border-r border-white/10 last:border-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Общий склад</p>
            <p className="text-2xl font-bold text-white">
              {components.reduce((acc, c) => acc + (c.stock || 0), 0)} шт.
            </p>
            <Package className="w-4 h-4 text-blue-500 mt-2" />
          </div>

          {/* 3. Заканчивается */}
          <div className="flex flex-col items-center justify-center py-5 border-r border-white/10 last:border-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Заканчивается</p>
            <p className="text-2xl font-bold text-red-400">
              {components.filter(c => c.stock > 0 && c.stock <= 5).length}
            </p>
            <AlertTriangle className="w-4 h-4 text-red-500 mt-2" />
          </div>
        </div>

        {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Сайдбар */}
          <motion.aside initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <nav className="sticky top-24 space-y-1 bg-[#141416] border border-white/10 rounded-xl p-2">
              {[
                { id: 'dashboard', label: 'Дашборд', icon: TrendingUp },
                { id: 'components', label: 'Компоненты', icon: Cpu },
                { id: 'orders', label: 'Заказы', icon: Package },
                ...(user?.role === 'admin' ? [{ id: 'settings', label: 'Настройки', icon: Settings }] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </motion.aside>

          {/* Область данных */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <DashboardContent 
                  key="dash" 
                  components={components} 
                  onNavigateToLowStock={navigateToLowStock}
                  onGoToComponents={() => handleTabChange('components')}
                />
              )}
              {activeTab === 'components' && (
                <ComponentsTab 
                  key="comp"
                  components={components} 
                  setComponents={setComponents}
                  loading={loading}
                  search={search} setSearch={setSearch}
                  categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                  stockFilter={stockFilter} setStockFilter={setStockFilter}
                  page={page} setPage={setPage}
                  perPage={perPage} setPerPage={setPerPage}
                />
              )}
              {activeTab === 'orders' && <PlaceholderComponent title="Заказы" icon={Package} />}
              {activeTab === 'settings' && <PlaceholderComponent title="Настройки" icon={Settings} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD COMPONENTS
// ==========================================

function DashboardContent({ components, onNavigateToLowStock, onGoToComponents }) {
  // Берем последние 5 добавленных
  const recentComponents = components.slice(0, 5);
  const lowStockItems = components.filter(c => c.stock > 0 && c.stock <= 5).slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      
      {/* Теперь блоки идут в один столбец (друг под другом) */}
      <div className="space-y-6">
        
        {/* 1. Виджет: Аналитика склада и График брендов */}
        <div className="bg-[#141416] border border-white/10 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Аналитика склада</h3>
          </div>
          <WarehouseChart components={components} />
        </div>

        {/* 2. Виджет: Последние добавленные */}
        <div className="bg-[#141416] border border-white/10 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Новые поступления</h3>
            <button onClick={onGoToComponents} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              Все компоненты <ArrowRight className="w-3 h-3" />
            </button>
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
      </div>

      {/* 3. Виджет: Мало на складе (Alert) */}
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
                <tr><td colSpan="3" className="py-4 text-center text-gray-500">Все в порядке! 🎉</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// График распределения брендов
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
    { slug: 'motherboard', label: 'Материнская плата' },
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
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">Нет данных</div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 📦 COMPONENTS TAB
// ==========================================

function ComponentsTab({ components, setComponents, loading, search, setSearch, categoryFilter, setCategoryFilter, stockFilter, setStockFilter, page, setPage, perPage, setPerPage }) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ price: 0, stock: 0 });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return components.filter(c => {
      const matchSearch = c.model?.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || c.category?.slug === categoryFilter;
      let matchStock = true;
      if (stockFilter === 'low') matchStock = c.stock > 0 && c.stock <= 5;
      if (stockFilter === 'out') matchStock = c.stock === 0;
      return matchSearch && matchCat && matchStock;
    });
  }, [components, search, categoryFilter, stockFilter]);

  // Сброс редактирования при смене фильтра/страницы
  useEffect(() => {
    if (editingId && !filtered.some(c => c.id === editingId)) setEditingId(null);
  }, [filtered, page]);

  const startEditing = (c) => {
    setEditingId(c.id);
    setEditValues({ price: c.price, stock: c.stock });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleDelete = async (id, model) => {
    if (!window.confirm(`Удалить компонент "${model}"? Это действие нельзя отменить.`)) {
      return;
    }
    
    try {
      await api.delete(`/admin/components/${id}`);
      setComponents(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const saveEditing = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/admin/components/${editingId}`, {
        price: Number(editValues.price),
        stock: Number(editValues.stock)
      });
      // Обновляем локальный стейт без перезагрузки страницы
      setComponents(prev => prev.map(c => c.id === editingId ? { ...c, ...res.data } : c));
      setEditingId(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Не удалось сохранить изменения. Проверьте консоль.');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <div className="text-center py-10 text-gray-400">Загрузка...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Панель управления (без изменений) */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-[#141416] border border-white/10 rounded-xl p-3">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Поиск..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:border-purple-500/50 focus:outline-none" />
          </div>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none">
            <option value="all">Все типы</option>
            <option value="cpu">Процессоры</option>
            <option value="gpu">Видеокарты</option>
            <option value="ram">ОЗУ</option>
            <option value="motherboard">Платы</option>
            <option value="storage">Накопители</option>
            <option value="psu">БП</option>
          </select>
          <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }} className={`border rounded-lg px-3 py-2 text-sm focus:outline-none ${stockFilter === 'low' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#0a0a0c] border-white/10 text-gray-200'}`}>
            <option value="all">Наличие</option>
            <option value="low">Заканчивается (≤5)</option>
            <option value="out">Нет в наличии</option>
          </select>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {/* Таблица */}
      <div className="bg-[#141416] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0a0a0c] text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Модель</th>
                <th className="px-4 py-3">Тип</th>
                <th className="px-4 py-3">Цена</th>
                <th className="px-4 py-3 text-center">Наличие</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.map(c => {
                const isEditing = c.id === editingId;
                return (
                  <tr key={c.id} className={`hover:bg-white/[0.02] transition-colors ${isEditing ? 'bg-purple-500/5' : ''}`}>
                    <td className="px-4 py-3 text-gray-500">#{c.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-200">{c.model}</td>
                    <td className="px-4 py-3 text-gray-400">{c.category?.name || '—'}</td>
                    
                    {/* ЦЕНА */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input 
                          type="number" min="0" step="100"
                          value={editValues.price}
                          onChange={e => setEditValues({...editValues, price: e.target.value})}
                          className="w-24 bg-[#0a0a0c] border border-purple-500/30 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      ) : (
                        <span className="text-purple-300">{c.price?.toLocaleString('ru-RU')} ₽</span>
                      )}
                    </td>

                    {/* НАЛИЧИЕ */}
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input 
                          type="number" min="0"
                          value={editValues.stock}
                          onChange={e => setEditValues({...editValues, stock: e.target.value})}
                          className="w-16 bg-[#0a0a0c] border border-purple-500/30 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors text-center"
                        />
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          c.stock === 0 ? 'bg-red-500/10 text-red-400' : 
                          c.stock <= 5 ? 'bg-orange-500/10 text-orange-400' : 
                          'bg-green-500/10 text-green-400'
                        }`}>
                          {c.stock} шт.
                        </span>
                      )}
                    </td>

                    {/* ДЕЙСТВИЯ */}
                    <td className="px-4 py-3 text-right space-x-2">
                      {isEditing ? (
                        <>
                          <button onClick={saveEditing} disabled={saving} className="text-green-400 hover:text-green-300 disabled:opacity-50 transition-colors">
                            {saving ? <Loader2 className="w-4 h-4 inline animate-spin" /> : <Check className="w-4 h-4 inline" />}
                          </button>
                          <button onClick={cancelEditing} disabled={saving} className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors">
                            <X className="w-4 h-4 inline" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(c)} className="text-gray-400 hover:text-white transition-colors">
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id, c.model)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Пагинация (без изменений) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#0a0a0c]">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              Показывать по:
              {[10, 25, 50].map(n => (
                <button key={n} onClick={() => { setPerPage(n); setPage(1); }} className={`px-2 py-1 rounded ${perPage === n ? 'bg-purple-600/30 text-white' : 'hover:bg-white/5'}`}>{n}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-white/10 disabled:opacity-30 hover:bg-white/5">&lt;</button>
              <span className="text-sm text-gray-300 px-2">Стр. {page} из {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-white/10 disabled:opacity-30 hover:bg-white/5">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PlaceholderComponent({ title, icon: Icon }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#141416] border border-white/10 rounded-xl p-12 text-center">
      <Icon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">Раздел в разработке</p>
    </motion.div>
  );
}