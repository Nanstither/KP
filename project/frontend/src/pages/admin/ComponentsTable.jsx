import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { Search, Plus, Edit, Trash2, Check, X, Loader2 } from 'lucide-react';

export default function ComponentsTable({
  components,
  setComponents,
  loading,
  search, setSearch,
  categoryFilter, setCategoryFilter,
  stockFilter, setStockFilter,
  page, setPage,
  perPage, setPerPage
}) {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ price: 0, stock: 0 });
  const [saving, setSaving] = useState(false);

  // Фильтрация данных
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

  const cancelEditing = () => setEditingId(null);

  const handleDelete = async (id, model) => {
    if (!window.confirm(`Удалить компонент "${model}"? Это действие нельзя отменить.`)) return;
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
      setComponents(prev => prev.map(c => c.id === editingId ? { ...c, ...res.data } : c));
      setEditingId(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Не удалось сохранить изменения.');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <div className="text-center py-10 text-gray-400">Загрузка...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Панель управления */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-[#141416] border border-white/10 rounded-xl p-3">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Поиск..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
              className="w-full bg-black/[0.30] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:border-purple-500/50 focus:outline-none" 
            />
          </div>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="bg-[#1b1b1d] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none">
            <option value="all">Все типы</option>
            <option value="cpu">Процессоры</option>
            <option value="gpu">Видеокарты</option>
            <option value="ram">ОЗУ</option>
            <option value="motherboard">Платы</option>
            <option value="storage">Накопители</option>
            <option value="psu">БП</option>
            <option value="cooler">Кулеры</option>
            <option value="case">Корпуса</option>
          </select>
          <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }} className={`border rounded-lg px-3 py-2 text-sm focus:outline-none ${stockFilter === 'low' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#1b1b1d] border-white/10 text-gray-200'}`}>
            <option value="all">Наличие</option>
            <option value="low">Заканчивается (≤5)</option>
            <option value="out">Нет в наличии</option>
          </select>
        </div>
        <button onClick={() => navigate('/admin/components/create')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/admin/components/${c.id}/edit`)} className="cursor-pointer text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        {c.model}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{c.category?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input type="number" min="0" step="100" value={editValues.price} onChange={e => setEditValues({...editValues, price: e.target.value})} className="w-24 bg-[#0a0a0c] border border-purple-500/30 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" />
                      ) : (
                        <span className="text-purple-300">{c.price?.toLocaleString('ru-RU')} ₽</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input type="number" min="0" value={editValues.stock} onChange={e => setEditValues({...editValues, stock: e.target.value})} className="w-16 bg-[#0a0a0c] border border-purple-500/30 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors text-center" />
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
                          <button onClick={() => handleDelete(c.id, c.model)} className="text-gray-400 hover:text-red-400 transition-colors" title="Удалить">
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

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#0a0a0c]">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              Показывать по: {[10, 25, 50].map(n => (
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