import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';

export default function SettingsTab() {
  // Состояние для списков справочников
  const [refs, setRefs] = useState({ sockets: [], ram_types: [], form_factors: [], materials: [] });
  const [loading, setLoading] = useState(true);

  // Состояние модального окна
  const [modal, setModal] = useState({ isOpen: false, type: null, editId: null, name: '' });
  const [saving, setSaving] = useState(false);

  // Загрузка данных при открытии
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const types = ['sockets', 'ram_types', 'form_factors', 'materials'];
        const results = {};
        for (const type of types) {
          const res = await api.get(`/admin/refs/${type}`);
          results[type] = res.data;
        }
        setRefs(results);
      } catch (err) {
        console.error('Ошибка загрузки справочников:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Открытие модалки
  const openModal = (type, item = null) => {
    setModal({
      isOpen: true,
      type,
      editId: item?.id || null,
      name: item?.name || ''
    });
  };

  // Сохранение (создание или обновление)
  const handleSave = async () => {
    if (!modal.name.trim()) return;
    setSaving(true);
    try {
      if (modal.editId) {
        await api.put(`/admin/refs/${modal.type}/${modal.editId}`, { name: modal.name });
      } else {
        await api.post(`/admin/refs/${modal.type}`, { name: modal.name });
      }
      // Перезагружаем список после сохранения
      const res = await api.get(`/admin/refs/${modal.type}`);
      setRefs(prev => ({ ...prev, [modal.type]: res.data }));
      setModal({ ...modal, isOpen: false, name: '' });
    } catch (err) {
      alert('Ошибка: ' + (err.response?.data?.message || 'Не удалось сохранить'));
    } finally {
      setSaving(false);
    }
  };

  // Удаление
  const handleDelete = async (type, id) => {
    if (!window.confirm('Удалить запись? Это может повлиять на существующие компоненты.')) return;
    try {
      await api.delete(`/admin/refs/${type}/${id}`);
      setRefs(prev => ({ ...prev, [type]: prev[type].filter(i => i.id !== id) }));
    } catch (err) {
      alert('Ошибка удаления: ' + (err.response?.data?.message || 'Возможно, запись используется'));
    }
  };

  // Конфигурация карточек
  const cards = [
    { key: 'sockets', label: 'Сокеты процессоров', desc: 'LGA1700, AM5, AM4...' },
    { key: 'ram_types', label: 'Типы ОЗУ (DDR)', desc: 'DDR4, DDR5, LPDDR5...' },
    { key: 'form_factors', label: 'Форм-факторы плат', desc: 'ATX, mATX, ITX, E-ATX...' },
    { key: 'materials', label: 'Материалы корпусов', desc: 'steel_glass, aluminum...' },
  ];

  if (loading) return <div className="text-center py-10 text-gray-400">Загрузка справочников...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(card => (
          <div key={card.key} className="bg-[#141416] border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{card.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
              </div>
              <button onClick={() => openModal(card.key)} className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {refs[card.key]?.length > 0 ? refs[card.key].map(item => (
                <div key={item.id} className="flex items-center justify-between bg-[#0a0a0c] border border-white/5 rounded-lg px-3 py-2 group">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(card.key, item)} className="p-1.5 text-gray-400 hover:text-purple-300 hover:bg-white/5 rounded">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(card.key, item.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-600 py-2 text-center">Список пуст</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#141416] border border-white/10 rounded-xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {modal.editId ? 'Редактировать' : 'Добавить'} запись
              </h3>
              <input
                type="text"
                value={modal.name}
                onChange={e => setModal(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Название (например, AM5)"
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none mb-4"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={!modal.name.trim() || saving}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PlaceholderComponent({ title, icon: Icon }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#141416] border border-white/10 rounded-xl p-12 text-center">
      <Icon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">Раздел в разработке</p>
    </motion.div>
  );
}