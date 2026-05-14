import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { Search, Plus, Edit, Trash2, Check, X, Loader2, Monitor } from 'lucide-react';

export default function PrebuiltPcsTable({
  prebuiltPcs,
  setPrebuiltPcs,
  loading,
  search, setSearch,
  categoryFilter, setCategoryFilter,
  page, setPage,
  perPage, setPerPage
}) {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ price: 0, is_active: false });
  const [saving, setSaving] = useState(false);

  // Фильтрация данных
  const filtered = useMemo(() => {
    return prebuiltPcs.filter(pc => {
      const matchSearch = pc.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || pc.tags?.some(t => t.name === categoryFilter);
      return matchSearch && matchCat;
    });
  }, [prebuiltPcs, search, categoryFilter]);

  // Сброс редактирования при смене фильтра/страницы
  useEffect(() => {
    if (editingId && !filtered.some(pc => pc.id === editingId)) setEditingId(null);
  }, [filtered, page]);

  const startEditing = (pc) => {
    setEditingId(pc.id);
    setEditValues({ price: pc.price, is_active: pc.is_active });
  };

  const cancelEditing = () => setEditingId(null);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Удалить готовый ПК "${name}"? Это действие нельзя отменить.`)) return;
    try {
      await api.delete(`/admin/prebuilt-pcs/${id}`);
      setPrebuiltPcs(prev => prev.filter(pc => pc.id !== id));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const saveEditing = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/admin/prebuilt-pcs/${editingId}`, {
        price: Number(editValues.price),
        is_active: editValues.is_active
      });
      setPrebuiltPcs(prev => prev.map(pc => pc.id === editingId ? { ...pc, ...res.data } : pc));
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
            <option value="all">Все теги</option>
            <option value="Игровой">Игровой</option>
            <option value="Для офиса">Для офиса</option>
            <option value="Бюджетный">Бюджетный</option>
            <option value="Топовый">Топовый</option>
          </select>
        </div>
        <button onClick={() => navigate('/admin/prebuilt-pcs/create')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Добавить ПК
        </button>
      </div>

      {/* Таблица */}
      <div className="bg-[#141416] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0a0a0c] text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Название</th>
                <th className="px-4 py-3">Теги</th>
                <th className="px-4 py-3">Компоненты</th>
                <th className="px-4 py-3">Цена</th>
                <th className="px-4 py-3 text-center">Статус</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.map(pc => {
                const isEditing = pc.id === editingId;
                return (
                  <tr key={pc.id} className={`hover:bg-white/[0.02] transition-colors ${isEditing ? 'bg-purple-500/5' : ''}`}>
                    <td className="px-4 py-3 text-gray-500">#{pc.id}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/admin/prebuilt-pcs/${pc.id}/edit`)} className="cursor-pointer text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        {pc.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {pc.tags?.slice(0, 3).map(tag => (
                          <span key={tag.id} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {tag.name}
                          </span>
                        ))}
                        {pc.tags?.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs">+{pc.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {pc.components?.length || 0} шт.
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input type="number" min="0" step="100" value={editValues.price} onChange={e => setEditValues({...editValues, price: e.target.value})} className="w-24 bg-[#0a0a0c] border border-purple-500/30 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" />
                      ) : (
                        <span className="text-purple-300">{pc.price?.toLocaleString('ru-RU')} ₽</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <select value={editValues.is_active ? 'active' : 'inactive'} onChange={e => setEditValues({...editValues, is_active: e.target.value === 'active'})} className="bg-[#0a0a0c] border border-purple-500/30 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
                          <option value="active">Активен</option>
                          <option value="inactive">Скрыт</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          pc.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {pc.is_active ? 'Активен' : 'Скрыт'}
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
                          <button onClick={() => startEditing(pc)} className="text-gray-400 hover:text-white transition-colors">
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button onClick={() => handleDelete(pc.id, pc.name)} className="text-gray-400 hover:text-red-400 transition-colors" title="Удалить">
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
