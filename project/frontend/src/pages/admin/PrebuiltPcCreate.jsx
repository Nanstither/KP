import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { ArrowLeft, Save, Loader2, X, Sun, Moon } from 'lucide-react';

const Field = ({ label, type = 'text', val, set, error, placeholder, isDark }) => (
  <div className="space-y-1">
    <label className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>
    <input 
      type={type} 
      value={val ?? ''} 
      onChange={e => {
        const v = type === 'number' ? Number(e.target.value) : e.target.value;
        set(v);
      }}
      placeholder={placeholder || ''} 
      className={`w-full border rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none transition-colors ${
        isDark 
          ? 'bg-[#1a1a1c] border-white/10 text-gray-100 focus:border-purple-500' 
          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
      } ${error ? 'border-red-500 focus:border-red-500' : ''}`} 
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default function PrebuiltPcCreate() {
  const navigate = useNavigate();
  
  // Состояние темы
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  
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
        const [refsRes, componentsRes] = await Promise.all([
          api.get('/admin/components/create'),
          api.get('/components')
        ]);
        setRefs(refsRes.data.refs);
        setComponents(componentsRes.data);
        
        // Инициализируем все роли с пустыми компонентами
        const initializedRoles = roles.map(role => ({ component_id: '', role }));
        setSelectedComponents(initializedRoles);
        
        // Загружаем теги из отдельного эндпоинта или используем из refs если есть
        try {
          const tagsRes = await api.get('/tags');
          setRefs(prev => ({ ...prev, tags: tagsRes.data }));
        } catch (e) {
          // Теги уже могут быть в refs
        }
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
      navigate('/admin/prebuilt-pcs');
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Не удалось создать ПК');
    } finally {
      setSaving(false);
    }
  };

  const updateComponent = (index, field, value) => {
    setSelectedComponents(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Загрузка...</div>;

  return (
    <div className={`min-h-screen p-6 pt-30 transition-colors duration-300 ${
      isDark 
        ? 'bg-[#0f0f10] text-gray-100' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Кнопка переключения темы */}
      <div className="max-w-5xl mx-auto mb-4 flex justify-end">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            isDark
              ? 'bg-[#1a1a1c] border-white/10 text-gray-300 hover:bg-[#252528]'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDark ? 'Светлая' : 'Тёмная'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Заголовок */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/prebuilt-pcs')} 
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Создание готового ПК</h1>
        </div>

        {/* Основная форма */}
        <div className={`border rounded-xl p-6 space-y-6 shadow-sm ${
          isDark 
            ? 'bg-[#141416] border-white/10' 
            : 'bg-white border-gray-200'
        }`}>
          
          {/* Название и цена */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Название *" val={base.name} set={v => setBase({...base, name: v})} error={errors.name} placeholder="Например: Gaming Pro X1" isDark={isDark} />
            <Field label="Цена *" type="number" val={base.price} set={v => setBase({...base, price: v})} error={errors.price} placeholder="99990" isDark={isDark} />
          </div>

          {/* Описание */}
          <div className="space-y-1">
            <label className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Описание</label>
            <textarea 
              value={base.description ?? ''} 
              onChange={e => setBase({...base, description: e.target.value})}
              placeholder="Описание компьютера..."
              rows={4}
              className={`w-full border rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none transition-colors resize-none ${
                isDark
                  ? 'bg-[#1a1a1c] border-white/10 text-gray-100 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
              }`}
            />
          </div>

          {/* Статус */}
          <div className="flex items-center gap-3">
            <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Статус:</label>
            <button 
              onClick={() => allComponentsFilled && setBase({...base, is_active: !base.is_active})}
              disabled={!allComponentsFilled}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                base.is_active && allComponentsFilled 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : isDark 
                    ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              {base.is_active && allComponentsFilled ? 'Активен' : 'Скрыт'}
            </button>
            {!allComponentsFilled && <span className="text-xs text-orange-500">Заполните все компоненты для активации</span>}
          </div>

          {/* Теги */}
          <div className="space-y-2">
            <label className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Теги</label>
            <div className="flex flex-wrap gap-2">
              {refs.tags?.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : isDark
                        ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Компоненты */}
        <div className={`border rounded-xl p-6 space-y-4 shadow-sm ${
          isDark 
            ? 'bg-[#141416] border-white/10' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Компоненты</h2>

          {/* Список выбранных компонентов */}
          <div className="space-y-3">
            {selectedComponents.map((item, index) => (
              <div key={index} className={`flex items-center gap-3 border rounded-lg p-3 ${
                isDark
                  ? 'bg-[#1a1a1c] border-white/10'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <span className={`text-xs uppercase w-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.role}</span>
                <select 
                  value={item.component_id || ''}
                  onChange={e => updateComponent(index, 'component_id', Number(e.target.value))}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 ${
                    isDark
                      ? 'bg-[#1a1a1c] border-white/10 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
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
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <X className="w-5 h-5" />
            Отмена
          </button>
        </div>

      </div>
    </div>
  );
}
