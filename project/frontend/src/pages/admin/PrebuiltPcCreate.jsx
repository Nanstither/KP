import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { parseApiError } from '@/lib/parseApiError';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';

const EXCLUSIVE_TAG_SLUG = 'ekskliuzivnyi';

const inputClass = (error) =>
  `w-full rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none transition-colors bg-white dark:bg-[#0a0a0c] text-gray-900 dark:text-white border ${
    error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-white/10 focus:border-purple-500'
  }`;

const selectClass = (error) => inputClass(error);

const chipClass = (selected) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all border cursor-pointer ${
    selected
      ? 'bg-purple-100 dark:bg-purple-600/20 border-purple-500 text-purple-700 dark:text-purple-300'
      : 'bg-gray-50 dark:bg-[#0a0a0c] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
  }`;

const Field = ({ label, type = 'text', val, set, error, placeholder }) => (
  <div className="space-y-1">
    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      value={val ?? ''}
      onChange={e => {
        const v = type === 'number' ? Number(e.target.value) : e.target.value;
        set(v);
      }}
      placeholder={placeholder || ''}
      className={inputClass(error)}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default function PrebuiltPcCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const canManageExclusive = isAdmin();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refs, setRefs] = useState({ categories: [], brands: [], tags: [] });
  const [components, setComponents] = useState([]);
  
  const [base, setBase] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    image: '', 
    is_active: true 
  });
  
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  
  const [errors, setErrors] = useState({});

  const roles = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooler', 'case'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [refsRes, componentsRes, tagsRes] = await Promise.all([
          api.get('/admin/components/create'),
          api.get('/components'),
          api.get('/tags')
        ]);
        setRefs(refsRes.data.refs);
        setComponents(componentsRes.data);
        setRefs(prev => ({ ...prev, tags: tagsRes.data }));
        
        // Инициализируем все роли с пустыми компонентами
        const initializedRoles = roles.map(role => ({ component_id: '', role }));
        setSelectedComponents(initializedRoles);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Проверяем, все ли компоненты заполнены
  const allComponentsFilled = selectedComponents.every(item => item.component_id);
  
  // Автоматически устанавливаем is_active в false, если есть незаполненные компоненты
  useEffect(() => {
    if (!allComponentsFilled && base.is_active) {
      setBase(prev => ({ ...prev, is_active: false }));
    }
  }, [allComponentsFilled]);

  const validate = () => {
    const newErrors = {};
    if (!base.name?.trim()) newErrors.name = 'Введите название';
    if (base.price === '' || Number(base.price) < 0) newErrors.price = 'Укажите цену (≥ 0)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setSaving(true);
    try {
      const payload = {
        ...base,
        price: Number(base.price),
        is_active: base.is_active && allComponentsFilled,
        components: selectedComponents.filter(c => c.component_id),
        tag_ids: selectedTagIds
      };
      
      await api.post('/admin/prebuilt-pcs', payload);
      toast.success('Готовый ПК успешно создан');
      navigate('/admin/prebuilt-pcs');
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      toast.error(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const updateComponent = (index, field, value) => {
    setSelectedComponents(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const toggleTag = (tagId, tagSlug) => {
    if (tagSlug === EXCLUSIVE_TAG_SLUG && !canManageExclusive) return;
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] flex items-center justify-center text-purple-600 dark:text-purple-400">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 p-6 pt-24 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Заголовок */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/prebuilt-pcs')} 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Создание готового ПК</h1>
        </div>

        {/* Основная форма */}
        <div className="border rounded-xl p-6 space-y-6 shadow-sm dark:shadow-none bg-white dark:bg-[#141416] border-gray-200 dark:border-white/10">
          
          {/* Название и цена */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Название *" val={base.name} set={v => setBase({...base, name: v})} error={errors.name} placeholder="Например: Gaming Pro X1" />
            <Field label="Цена *" type="number" val={base.price} set={v => setBase({...base, price: v})} error={errors.price} placeholder="99990" />
          </div>

          {/* Описание */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Описание</label>
            <textarea 
              value={base.description ?? ''} 
              onChange={e => setBase({...base, description: e.target.value})}
              placeholder="Описание компьютера..."
              rows={4}
              className={`${inputClass()} resize-none`}
            />
          </div>

          {/* Статус */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">Статус:</label>
            <button 
              onClick={() => allComponentsFilled && setBase({...base, is_active: !base.is_active})}
              disabled={!allComponentsFilled}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                base.is_active && allComponentsFilled 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/10 cursor-not-allowed'
              }`}
            >
              {base.is_active && allComponentsFilled ? 'Активен' : 'Скрыт'}
            </button>
            {!allComponentsFilled && <span className="text-xs text-orange-500 dark:text-orange-400">Заполните все компоненты для активации</span>}
          </div>

          {/* Теги */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Теги</label>
            <div className="flex flex-wrap gap-2">
              {refs.tags?.map(tag => {
                const isExclusiveLocked = tag.slug === EXCLUSIVE_TAG_SLUG && !canManageExclusive;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id, tag.slug)}
                    disabled={isExclusiveLocked}
                    title={isExclusiveLocked ? 'Только администратор' : undefined}
                    className={`${chipClass(selectedTagIds.includes(tag.id))}${isExclusiveLocked ? ' opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Компоненты */}
        <div className="border rounded-xl p-6 space-y-4 shadow-sm dark:shadow-none bg-white dark:bg-[#141416] border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Компоненты</h2>

          {/* Список выбранных компонентов */}
          <div className="space-y-3">
            {selectedComponents.map((item, index) => (
              <div key={index} className="flex items-center gap-3 border rounded-lg p-3 bg-gray-50 dark:bg-[#0a0a0c] border-gray-200 dark:border-white/10">
                <span className="text-xs uppercase w-20 text-gray-500 dark:text-gray-400">{item.role}</span>
                <select 
                  value={item.component_id || ''}
                  onChange={e => updateComponent(index, 'component_id', Number(e.target.value))}
                  className={`flex-1 ${selectClass()}`}
                >
                  <option value="">Выберите компонент...</option>
                  {components
                    .filter(c => c.category?.slug === item.role)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.model} — {c.price.toLocaleString('ru-RU')} ₽</option>
                    ))
                  }
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Сохранить
          </button>
          <button 
            onClick={() => navigate('/admin/prebuilt-pcs')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10"
          >
            <X className="w-5 h-5" />
            Отмена
          </button>
        </div>

      </div>
    </div>
  );
}
