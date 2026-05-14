import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';

const Field = ({ label, type = 'text', val, set, error, placeholder }) => (
  <div className="space-y-1">
    <label className="text-xs text-gray-400 uppercase">{label}</label>
    <input 
      type={type} 
      value={val ?? ''} 
      onChange={e => {
        const v = type === 'number' ? Number(e.target.value) : e.target.value;
        set(v);
      }}
      placeholder={placeholder || ''} 
      className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors ${
        error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500'
      }`} 
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

export default function PrebuiltPcEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refs, setRefs] = useState({ tags: [] });
  const [components, setComponents] = useState([]);
  
  const [base, setBase] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    image: '', 
    is_active: true 
  });
  
  const [selectedComponents, setSelectedComponents] = useState([]); // [{ component_id, role }]
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pcRes, refsRes, componentsRes] = await Promise.all([
          api.get(`/admin/prebuilt-pcs/${id}/edit`),
          api.get('/admin/components/create'),
          api.get('/components')
        ]);
        
        const pc = pcRes.data;
        setBase({
          name: pc.name || '',
          description: pc.description || '',
          price: pc.price || '',
          image: pc.image || '',
          is_active: pc.is_active ?? true
        });
        
        setRefs(refsRes.data.refs);
        setComponents(componentsRes.data);
        
        // Загружаем выбранные компоненты
        if (pc.components && Array.isArray(pc.components)) {
          const comps = pc.components.map(c => ({
            component_id: c.id,
            role: c.pivot?.role || c.category?.slug
          }));
          setSelectedComponents(comps);
        }
        
        // Загружаем теги
        if (pc.tags && Array.isArray(pc.tags)) {
          setSelectedTagIds(pc.tags.map(t => t.id));
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        alert('Не удалось загрузить данные ПК');
        navigate('/admin/prebuilt-pcs');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!base.name?.trim()) newErrors.name = 'Введите название';
    if (base.price === '' || Number(base.price) < 0) newErrors.price = 'Укажите цену (≥ 0)';
    if (selectedComponents.length === 0) newErrors.components = 'Добавьте хотя бы один компонент';
    
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
        is_active: base.is_active,
        components: selectedComponents.filter(c => c.component_id),
        tag_ids: selectedTagIds
      };
      
      await api.put(`/admin/prebuilt-pcs/${id}`, payload);
      navigate('/admin/prebuilt-pcs');
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Не удалось обновить ПК');
    } finally {
      setSaving(false);
    }
  };

  const addComponent = (role) => {
    if (!role) return;
    setSelectedComponents(prev => [...prev, { component_id: '', role }]);
  };

  const updateComponent = (index, field, value) => {
    setSelectedComponents(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeComponent = (index) => {
    setSelectedComponents(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-300">Загрузка...</div>;

  const roles = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooler', 'case'];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-100 via-orange-50 to-blue-100 dark:bg-none dark:bg-[#0f0f10] text-gray-200 p-6 pt-30">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Заголовок */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/prebuilt-pcs')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Редактирование готового ПК</h1>
        </div>

        {/* Основная форма */}
        <div className="bg-[#141416] border border-white/10 rounded-xl p-6 space-y-6">
          
          {/* Название и цена */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Название *" val={base.name} set={v => setBase({...base, name: v})} error={errors.name} placeholder="Например: Gaming Pro X1" />
            <Field label="Цена *" type="number" val={base.price} set={v => setBase({...base, price: v})} error={errors.price} placeholder="99990" />
          </div>

          {/* Описание */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Описание</label>
            <textarea 
              value={base.description ?? ''} 
              onChange={e => setBase({...base, description: e.target.value})}
              placeholder="Описание компьютера..."
              rows={4}
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Статус */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400">Статус:</label>
            <button 
              onClick={() => setBase({...base, is_active: !base.is_active})}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                base.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              {base.is_active ? 'Активен' : 'Скрыт'}
            </button>
          </div>

          {/* Теги */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase">Теги</label>
            <div className="flex flex-wrap gap-2">
              {refs.tags?.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Компоненты */}
        <div className="bg-[#141416] border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Компоненты</h2>
            {errors.components && <span className="text-xs text-red-400">{errors.components}</span>}
          </div>

          {/* Список выбранных компонентов */}
          <div className="space-y-3">
            {selectedComponents.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-[#0a0a0c] border border-white/10 rounded-lg p-3">
                <span className="text-xs text-gray-500 uppercase w-20">{item.role}</span>
                <select 
                  value={item.component_id || ''}
                  onChange={e => updateComponent(index, 'component_id', Number(e.target.value))}
                  className="flex-1 bg-[#141416] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="">Выберите компонент...</option>
                  {components
                    .filter(c => c.category?.slug === item.role)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.model} — {c.price.toLocaleString('ru-RU')} ₽</option>
                    ))
                  }
                </select>
                <button onClick={() => removeComponent(index)} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Добавить компонент */}
          <div className="flex items-center gap-2">
            <select 
              onChange={e => {
                addComponent(e.target.value);
                e.target.value = '';
              }}
              className="bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="">Добавить роль...</option>
              {roles.filter(r => !selectedComponents.some(sc => sc.role === r)).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Сохранить
          </button>
          <button 
            onClick={() => navigate('/admin/prebuilt-pcs')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <X className="w-5 h-5" />
            Отмена
          </button>
        </div>

      </div>
    </div>
  );
}
