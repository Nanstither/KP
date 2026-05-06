import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { ArrowLeft, Save, X, Loader2, Upload, Image as ImageIcon, ChevronDown } from 'lucide-react';

const imageTemplates = {
  cpu: [{ label: 'Intel Core i3', path: 'images/components/cpu/Intel_Core_i3.svg' }, { label: 'AMD Ryzen 7', path: 'images/components/cpu/AMD_Ryzen_7.svg' }],
  gpu: [{ label: 'NVIDIA RTX 4060', path: 'images/components/gpu/RTX_4060.jpg' }],
  ram: [{ label: 'DDR4 Kit', path: 'images/components/ram/DDR4_Kit.jpg' }],
  motherboard: [{ label: 'ATX Board', path: 'images/components/motherboard/ATX_Board.jpg' }],
  psu: [{ label: 'Standard PSU', path: 'images/components/psu/Standard_PSU.jpg' }],
  storage: [{ label: 'NVMe SSD', path: 'images/components/storage/NVMe_SSD.jpg' }],
  cooler: [{ label: 'Tower Cooler', path: 'images/components/cooler/Tower_Cooler.jpg' }],
  case: [{ label: 'Mid-Tower', path: 'images/components/case/Mid_Tower.jpg' }],
};

// ✅ Обновленный Field с поддержкой ошибок
const Field = ({ label, type = 'text', val, set, error, children, placeholder, onChange }) => (
  <div className="space-y-1">
    <label className="text-xs text-gray-400 uppercase">{label}</label>
    {children || (
      <input 
        type={type} 
        value={val ?? ''} 
        onChange={e => {
          const v = type === 'number' ? Number(e.target.value) : e.target.value;
          set(v);
          onChange?.(v);
        }}
        placeholder={placeholder || ''} 
        className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors ${
          error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500'
        }`} 
      />
    )}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

export default function ComponentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refs, setRefs] = useState({});
  const [base, setBase] = useState({ category_id: '', brand_id: '', model: '', price: '', stock: '' });
  const [spec, setSpec] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [errors, setErrors] = useState({}); 
  const [specErrors, setSpecErrors] = useState({}); // ✅ Ошибки для характеристик

  useEffect(() => {
    api.get('/admin/components/create').then(res => {
      setRefs(res.data.refs);
      const catSlug = searchParams.get('cat');
      if (catSlug) {
        const found = res.data.refs.categories.find(c => c.slug === catSlug);
        if (found) setBase(prev => ({ ...prev, category_id: found.id }));
      }
      setLoading(false);
    }).catch(() => navigate('/admin/components'));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!base.category_id) newErrors.category_id = 'Выберите категорию';
    if (!base.brand_id) newErrors.brand_id = 'Выберите бренд';
    if (!base.model?.trim()) newErrors.model = 'Введите модель';
    if (base.price === '' || Number(base.price) < 0) newErrors.price = 'Укажите цену (≥ 0)';
    if (base.stock === '' || Number(base.stock) < 0 || !Number.isInteger(Number(base.stock))) newErrors.stock = 'Укажите наличие (целое число ≥ 0)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Валидация характеристик
  const validateSpecs = () => {
    const newSpecErrors = {};
    const slug = refs.categories.find(c => c.id == base.category_id)?.slug;
    if (!slug) return true;

    if (slug === 'cpu') {
      if (!spec.socket_id) newSpecErrors.socket_id = 'Выберите сокет';
      if (!spec.cores) newSpecErrors.cores = 'Укажите кол-во ядер';
      if (!spec.threads) newSpecErrors.threads = 'Укажите кол-во потоков';
      if (!spec.base_clock_mhz) newSpecErrors.base_clock_mhz = 'Укажите базовую частоту';
      if (!spec.tdp_watts) newSpecErrors.tdp_watts = 'Укажите TDP';
    }
    if (slug === 'gpu') {
      if (!spec.vram_gb) newSpecErrors.vram_gb = 'Укажите объём VRAM';
      if (!spec.vram_type_id) newSpecErrors.vram_type_id = 'Выберите тип VRAM';
      if (!spec.memory_bus_bit) newSpecErrors.memory_bus_bit = 'Укажите шину';
      if (!spec.tdp_watts) newSpecErrors.tdp_watts = 'Укажите TDP';
      if (!spec.pcie_gen) newSpecErrors.pcie_gen = 'Укажите PCIe Gen';
    }
    if (slug === 'ram') {
      if (!spec.total_capacity_gb) newSpecErrors.total_capacity_gb = 'Укажите объём';
      if (!spec.speed_mhz) newSpecErrors.speed_mhz = 'Укажите частоту';
      if (!spec.ram_type_id) newSpecErrors.ram_type_id = 'Выберите тип ОЗУ';
      if (!spec.latency_cl) newSpecErrors.latency_cl = 'Укажите тайминг CL';
    }
    if (slug === 'motherboard') {
      if (!spec.socket_id) newSpecErrors.socket_id = 'Выберите сокет';
      if (!spec.form_factor_id) newSpecErrors.form_factor_id = 'Выберите форм-фактор';
      if (!spec.chipset?.trim()) newSpecErrors.chipset = 'Укажите чипсет';
      if (!spec.ram_slots) newSpecErrors.ram_slots = 'Укажите слоты RAM';
      if (!spec.ram_type_id) newSpecErrors.ram_type_id = 'Выберите тип RAM';
      if (!spec.pcie_gen) newSpecErrors.pcie_gen = 'Укажите PCIe Gen';
    }
    if (slug === 'psu') {
      if (!spec.wattage) newSpecErrors.wattage = 'Укажите мощность';
      if (!spec.efficiency?.trim()) newSpecErrors.efficiency = 'Укажите эффективность';
    }
    if (slug === 'storage') {
      if (!spec.type?.trim()) newSpecErrors.type = 'Укажите тип';
      if (!spec.capacity_gb) newSpecErrors.capacity_gb = 'Укажите объём';
    }
    if (slug === 'cooler') {
      if (!spec.tdp_rating_watts) newSpecErrors.tdp_rating_watts = 'Укажите TDP Rating';
      if (!spec.type?.trim()) newSpecErrors.type = 'Укажите тип охлаждения';
      if (!spec.compatible_sockets || spec.compatible_sockets.length === 0) newSpecErrors.compatible_sockets = 'Выберите совместимые сокеты';
    }
    if (slug === 'case') {
      if (!spec.case_type_id) newSpecErrors.case_type_id = 'Выберите тип корпуса';
      if (!spec.material_id) newSpecErrors.material_id = 'Выберите материал';
      if (!spec.supported_form_factors || spec.supported_form_factors.length === 0) newSpecErrors.supported_form_factors = 'Выберите поддерживаемые форм-факторы';
    }

    setSpecErrors(newSpecErrors);
    return Object.keys(newSpecErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !validateSpecs()) return;
    
    setSaving(true);
    try {
      const slug = refs.categories.find(c => c.id == base.category_id)?.slug;
      const specPayload = { ...spec };
      Object.keys(specPayload).forEach(k => { if (specPayload[k] === '' || specPayload[k] == null) delete specPayload[k]; });

      const formData = new FormData();
      Object.entries(base).forEach(([k, v]) => { if (v !== '' && v != null) formData.append(k, v); });
      if (imageFile) formData.append('image', imageFile);
      formData.append('specs', JSON.stringify({ [slug]: specPayload }));

      await api.post('/admin/components', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('✅ Компонент успешно создан');
      navigate('/admin/components');
    } catch (err) { 
      alert('Ошибка: ' + (err.response?.data?.message || err.message)); 
    } finally { setSaving(false); }
  };

  const handleCategoryChange = (val) => {
    setBase(prev => ({ ...prev, category_id: val }));
    setSpec({});
    setSpecErrors({}); // Сброс ошибок при смене категории
    setImageFile(null);
    setErrors(prev => ({ ...prev, category_id: '' }));
  };

  const selectTemplate = (path) => {
    setImageFile(null);
    setBase(prev => ({ ...prev, image: path }));
    setShowTemplates(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center text-gray-400">Загрузка справочников...</div>;

  const slug = refs.categories.find(c => c.id == base.category_id)?.slug || '';
  const templates = imageTemplates[slug] || [];
  const previewSrc = imageFile ? URL.createObjectURL(imageFile) : '';
  const autoPath = base.model ? `images/components/${slug}/${base.model.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}.jpg` : '...';

  return (
    <div className="min-h-screen bg-[#0f0f10] text-gray-200 p-6 pt-24">
      <div className="max-w-6xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-2"><ArrowLeft className="w-4 h-4" /> Назад к списку</button>

        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-bold text-white">Создание компонента</h1><p className="text-sm text-gray-500 mt-1">Категория: <span className="text-purple-400">{slug ? refs.categories.find(c=>c.slug===slug)?.name : 'Не выбрана'}</span></p></div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Создать</button>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg transition-colors"><X className="w-4 h-4" /> Отмена</button>
          </div>
        </div>

        <div className="bg-[#141416] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Основная информация</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 flex-shrink-0 space-y-4">
              <div className="aspect-square bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {previewSrc ? <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-600"><ImageIcon className="w-12 h-12 mb-2 opacity-50" /><span className="text-xs">Нажмите для загрузки</span></div>}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Upload className="w-6 h-6 text-white drop-shadow-md" /></div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><label className="text-xs text-gray-400 uppercase">Изображение (необязательно)</label><span className="text-[10px] text-gray-600">Сохранится как:</span></div>
                <div className="bg-[#0a0a0c] border border-white/10 rounded-lg p-3 text-center"><p className="text-xs font-mono text-gray-300 truncate">{autoPath}</p></div>
                {slug && (
                  <div className="relative mt-2">
                    <button onClick={() => setShowTemplates(!showTemplates)} className="w-full flex items-center justify-between bg-[#0a0a0c] border border-white/10 hover:border-purple-500/30 rounded-lg px-3 py-2 text-xs text-gray-300 transition-colors"><span>Выбрать из шаблона</span><ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} /></button>
                    {showTemplates && <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1c] border border-white/10 rounded-lg shadow-xl z-10 p-2 max-h-48 overflow-y-auto">{templates.map((t, i) => <button key={i} onClick={() => selectTemplate(t.path)} className="w-full px-3 py-2 text-xs text-gray-300 hover:bg-purple-600/20 rounded-md text-left">{t.label}</button>)}</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Категория *" error={errors.category_id} onChange={() => setErrors(p => ({...p, category_id: ''}))}>
                  <select value={base.category_id} onChange={e => handleCategoryChange(e.target.value)} className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${errors.category_id ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500'}`}>
                    <option value="">Выберите категорию...</option>
                    {refs.categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Бренд *" error={errors.brand_id} onChange={() => setErrors(p => ({...p, brand_id: ''}))}>
                  <select value={base.brand_id} onChange={e => { setBase({ ...base, brand_id: +e.target.value }); setErrors(p => ({...p, brand_id: ''})); }} className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${errors.brand_id ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500'}`}>
                    <option value="">Выберите бренд...</option>
                    {refs.brands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Модель *" val={base.model} set={v => setBase({ ...base, model: v })} error={errors.model} onChange={() => setErrors(p => ({...p, model: ''}))} placeholder="Core i5-14400F" />
                <Field label="Цена (₽) *" type="number" val={base.price} set={v => setBase({ ...base, price: +v })} error={errors.price} onChange={() => setErrors(p => ({...p, price: ''}))} placeholder="25000" />
                <Field label="Наличие *" type="number" val={base.stock} set={v => setBase({ ...base, stock: +v })} error={errors.stock} onChange={() => setErrors(p => ({...p, stock: ''}))} placeholder="15" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#141416] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Характеристики</h2>
          {!slug && <p className="text-gray-500 text-sm">Выберите категорию выше, чтобы увидеть поля характеристик.</p>}
          
          {/* ✅ CPU */}
          {slug === 'cpu' && <>
            <Field label="Сокет *" error={specErrors.socket_id} onChange={() => setSpecErrors(p => ({...p, socket_id: ''}))}>
              <select value={spec.socket_id || ''} onChange={e => setSpec({ ...spec, socket_id: +e.target.value })} className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${specErrors.socket_id ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500'}`}>
                <option value="">Выберите сокет...</option>
                {refs.sockets?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Ядра *" type="number" val={spec.cores} set={v => setSpec({ ...spec, cores: +v })} error={specErrors.cores} onChange={() => setSpecErrors(p => ({...p, cores: ''}))} placeholder="6" />
              <Field label="Потоки *" type="number" val={spec.threads} set={v => setSpec({ ...spec, threads: +v })} error={specErrors.threads} onChange={() => setSpecErrors(p => ({...p, threads: ''}))} placeholder="12" />
              <Field label="Базовая частота (МГц) *" type="number" step="0.1" val={spec.base_clock_mhz} set={v => setSpec({ ...spec, base_clock_mhz: +v })} error={specErrors.base_clock_mhz} onChange={() => setSpecErrors(p => ({...p, base_clock_mhz: ''}))} placeholder="3500" />
              <Field label="Boost частота (МГц)" type="number" step="0.1" val={spec.boost_clock_mhz} set={v => setSpec({ ...spec, boost_clock_mhz: +v })} placeholder="4800" />
              <Field label="TDP (Вт) *" type="number" val={spec.tdp_watts} set={v => setSpec({ ...spec, tdp_watts: +v })} error={specErrors.tdp_watts} onChange={() => setSpecErrors(p => ({...p, tdp_watts: ''}))} placeholder="65" />
            </div>
          </>}

          {/* ✅ GPU */}
          {slug === 'gpu' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="VRAM (GB) *" type="number" val={spec.vram_gb} set={v => setSpec({ ...spec, vram_gb: +v })} error={specErrors.vram_gb} onChange={() => setSpecErrors(p => ({...p, vram_gb: ''}))} placeholder="8" />
            <Field label="Тип VRAM *" error={specErrors.vram_type_id} onChange={() => setSpecErrors(p => ({...p, vram_type_id: ''}))}>
              <select value={spec.vram_type_id || ''} onChange={e => setSpec({ ...spec, vram_type_id: +e.target.value })} className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${specErrors.vram_type_id ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500'}`}>
                <option value="">Выберите тип...</option>
                {refs.vram_types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Шина (бит) *" type="number" val={spec.memory_bus_bit} set={v => setSpec({ ...spec, memory_bus_bit: +v })} error={specErrors.memory_bus_bit} onChange={() => setSpecErrors(p => ({...p, memory_bus_bit: ''}))} placeholder="128" />
            <Field label="TDP (Вт) *" type="number" val={spec.tdp_watts} set={v => setSpec({ ...spec, tdp_watts: +v })} error={specErrors.tdp_watts} onChange={() => setSpecErrors(p => ({...p, tdp_watts: ''}))} placeholder="200" />
            <Field label="Длина (мм)" type="number" val={spec.length_mm} set={v => setSpec({ ...spec, length_mm: +v })} placeholder="240" />
            <Field label="Ширина (мм)" type="number" val={spec.width_mm} set={v => setSpec({ ...spec, width_mm: +v })} placeholder="120" />
            <Field label="PCIe Gen *" val={spec.pcie_gen} set={v => setSpec({ ...spec, pcie_gen: v })} error={specErrors.pcie_gen} onChange={() => setSpecErrors(p => ({...p, pcie_gen: ''}))} placeholder="4.0" />
            <Field label="Питание" val={spec.power_requires} set={v => setSpec({ ...spec, power_requires: v })} placeholder="1x8" />
            <Field label="Слоты PCIe" type="number" val={spec.pcie_slots_required} set={v => setSpec({ ...spec, pcie_slots_required: +v })} placeholder="2" />
          </div>}

          {/* ✅ RAM */}
          {slug === 'ram' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Объём (GB) *" type="number" val={spec.total_capacity_gb} set={v => setSpec({ ...spec, total_capacity_gb: +v })} error={specErrors.total_capacity_gb} onChange={() => setSpecErrors(p => ({...p, total_capacity_gb: ''}))} placeholder="16" />
            <Field label="Частота (МГц) *" type="number" val={spec.speed_mhz} set={v => setSpec({ ...spec, speed_mhz: +v })} error={specErrors.speed_mhz} onChange={() => setSpecErrors(p => ({...p, speed_mhz: ''}))} placeholder="3200" />
            <Field label="Тип ОЗУ *" error={specErrors.ram_type_id} onChange={() => setSpecErrors(p => ({...p, ram_type_id: ''}))}>
              <select value={spec.ram_type_id || ''} onChange={e => setSpec({ ...spec, ram_type_id: +e.target.value })} className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${specErrors.ram_type_id ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500'}`}>
                <option value="">Выберите тип...</option>
                {refs.ram_types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Тайминг CL *" type="number" val={spec.latency_cl} set={v => setSpec({ ...spec, latency_cl: +v })} error={specErrors.latency_cl} onChange={() => setSpecErrors(p => ({...p, latency_cl: ''}))} placeholder="16" />
            <Field label="Кол-во модулей" type="number" val={spec.modules_count} set={v => setSpec({ ...spec, modules_count: +v })} placeholder="2" />
          </div>}

          {/* ✅ Motherboard */}
          {slug === 'motherboard' && <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Сокет *" error={specErrors.socket_id} onChange={() => setSpecErrors(p => ({...p, socket_id: ''}))}>
                <select value={spec.socket_id || ''} onChange={e => setSpec({ ...spec, socket_id: +e.target.value })} className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${specErrors.socket_id ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500'}`}>
                  <option value="">Выберите сокет...</option>
                  {refs.sockets?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Форм-фактор *" error={specErrors.form_factor_id} onChange={() => setSpecErrors(p => ({...p, form_factor_id: ''}))}>
                <select value={spec.form_factor_id || ''} onChange={e => setSpec({ ...spec, form_factor_id: +e.target.value })} className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${specErrors.form_factor_id ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500'}`}>
                  <option value="">Выберите форм-фактор...</option>
                  {refs.form_factors?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Чипсет *" val={spec.chipset} set={v => setSpec({ ...spec, chipset: v })} error={specErrors.chipset} onChange={() => setSpecErrors(p => ({...p, chipset: ''}))} placeholder="B760" />
              <Field label="Слоты RAM *" type="number" val={spec.ram_slots} set={v => setSpec({ ...spec, ram_slots: +v })} error={specErrors.ram_slots} onChange={() => setSpecErrors(p => ({...p, ram_slots: ''}))} placeholder="4" />
              <Field label="Тип RAM *" error={specErrors.ram_type_id} onChange={() => setSpecErrors(p => ({...p, ram_type_id: ''}))}>
                <select value={spec.ram_type_id || ''} onChange={e => setSpec({ ...spec, ram_type_id: +e.target.value })} className={`w-full bg-[#0a0a0c] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${specErrors.ram_type_id ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500'}`}>
                  <option value="">Выберите тип...</option>
                  {refs.ram_types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
              <Field label="M.2 слоты" type="number" val={spec.m2_slots} set={v => setSpec({ ...spec, m2_slots: +v })} placeholder="2" />
              <Field label="PCIe x16" type="number" val={spec.pcie_x16_slots} set={v => setSpec({ ...spec, pcie_x16_slots: +v })} placeholder="1" />
              <Field label="PCIe Gen *" val={spec.pcie_gen} set={v => setSpec({ ...spec, pcie_gen: v })} error={specErrors.pcie_gen} onChange={() => setSpecErrors(p => ({...p, pcie_gen: ''}))} placeholder="4.0" />
              <Field label="SATA порты" type="number" val={spec.sata_ports} set={v => setSpec({ ...spec, sata_ports: +v })} placeholder="4" />
            </div>
          </div>}

          {/* ✅ PSU */}
          {slug === 'psu' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Мощность (Вт) *" type="number" val={spec.wattage} set={v => setSpec({ ...spec, wattage: +v })} error={specErrors.wattage} onChange={() => setSpecErrors(p => ({...p, wattage: ''}))} placeholder="750" />
            <Field label="Эффективность *" val={spec.efficiency} set={v => setSpec({ ...spec, efficiency: v })} error={specErrors.efficiency} onChange={() => setSpecErrors(p => ({...p, efficiency: ''}))} placeholder="80+ Gold" />
            <Field label="Модульность" val={spec.modularity} set={v => setSpec({ ...spec, modularity: v })} placeholder="Full" />
            <Field label="Кабели PCIe" type="number" val={spec.pcie_cables_count} set={v => setSpec({ ...spec, pcie_cables_count: +v })} placeholder="2" />
            <Field label="Тип коннектора" val={spec.pcie_cable_type} set={v => setSpec({ ...spec, pcie_cable_type: v })} placeholder="6+2" />
          </div>}

          {/* ✅ Storage */}
          {slug === 'storage' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Тип *" val={spec.type} set={v => setSpec({ ...spec, type: v })} error={specErrors.type} onChange={() => setSpecErrors(p => ({...p, type: ''}))} placeholder="nvme" />
            <Field label="Объём (GB) *" type="number" val={spec.capacity_gb} set={v => setSpec({ ...spec, capacity_gb: +v })} error={specErrors.capacity_gb} onChange={() => setSpecErrors(p => ({...p, capacity_gb: ''}))} placeholder="1000" />
            <Field label="Чтение (МБ/с)" type="number" val={spec.read_speed_mbps} set={v => setSpec({ ...spec, read_speed_mbps: +v })} placeholder="7000" />
            <Field label="Запись (МБ/с)" type="number" val={spec.write_speed_mbps} set={v => setSpec({ ...spec, write_speed_mbps: +v })} placeholder="5000" />
            <Field label="Форм-фактор" val={spec.form_factor} set={v => setSpec({ ...spec, form_factor: v })} placeholder="m.2_2280" />
          </div>}

          {/* ✅ Cooler */}
          {slug === 'cooler' && <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="TDP Rating (Вт) *" type="number" val={spec.tdp_rating_watts} set={v => setSpec({ ...spec, tdp_rating_watts: +v })} error={specErrors.tdp_rating_watts} onChange={() => setSpecErrors(p => ({...p, tdp_rating_watts: ''}))} placeholder="220" />
              <Field label="Тип *" val={spec.type} set={v => setSpec({ ...spec, type: v })} error={specErrors.type} onChange={() => setSpecErrors(p => ({...p, type: ''}))} placeholder="tower" />
              <Field label="Кол-во вентиляторов" type="number" val={spec.fan_count} set={v => setSpec({ ...spec, fan_count: +v })} placeholder="1" />
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-xs text-gray-400 uppercase">Совместимые сокеты *</label>
              <div className="flex flex-wrap gap-2">
                {refs.sockets?.map(s => { 
                  const sel = (spec.compatible_sockets || []).includes(s.id); 
                  const err = specErrors.compatible_sockets;
                  return <button key={s.id} type="button" onClick={() => { const c = spec.compatible_sockets || []; setSpec({ ...spec, compatible_sockets: sel ? c.filter(i=>i!==s.id) : [...c, s.id] }); setSpecErrors(p => ({...p, compatible_sockets: ''})); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${sel ? 'bg-purple-600/20 border-purple-500 text-purple-300' : `bg-[#0a0a0c] border-white/10 text-gray-400 hover:border-white/20`} ${err ? 'border-red-500/50' : ''} cursor-pointer`}>{s.name}</button> 
                })}
              </div>
              {specErrors.compatible_sockets && <p className="text-xs text-red-400">{specErrors.compatible_sockets}</p>}
            </div>
          </>}

          {/* ✅ Case */}
          {slug === 'case' && <>
             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs text-gray-400 uppercase">Тип корпуса *</label>
                 <div className="flex flex-wrap gap-2">
                  {refs.case_types?.map(t => (
                    <button key={t.id} type="button" onClick={() => { setSpec({ ...spec, case_type_id: t.id }); setSpecErrors(p => ({...p, case_type_id: ''})); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${spec.case_type_id === t.id ? 'bg-purple-600/20 border-purple-500 text-purple-300' : `bg-[#0a0a0c] border-white/10 text-gray-400 hover:border-white/20`} ${specErrors.case_type_id ? 'border-red-500/50' : ''} cursor-pointer`}>{t.name}</button>
                  ))}
                 </div>
                 {specErrors.case_type_id && <p className="text-xs text-red-400">{specErrors.case_type_id}</p>}
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs text-gray-400 uppercase">Материал *</label>
                 <div className="flex flex-wrap gap-2">
                  {refs.materials?.map(m => (
                    <button key={m.id} type="button" onClick={() => { setSpec({ ...spec, material_id: m.id }); setSpecErrors(p => ({...p, material_id: ''})); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${spec.material_id === m.id ? 'bg-purple-600/20 border-purple-500 text-purple-300' : `bg-[#0a0a0c] border-white/10 text-gray-400 hover:border-white/20`} ${specErrors.material_id ? 'border-red-500/50' : ''} cursor-pointer`}>{m.name}</button>
                  ))}
                 </div>
                 {specErrors.material_id && <p className="text-xs text-red-400">{specErrors.material_id}</p>}
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                 <Field label="Слоты сверху" type="number" val={spec.top_fan_slots} set={v => setSpec({ ...spec, top_fan_slots: +v })} placeholder="2" />
                 <Field label="Вентиляторов" type="number" val={spec.fans_included} set={v => setSpec({ ...spec, fans_included: +v })} placeholder="3" />
                 <Field label="Отсеки 3.5" type="number" val={spec.drive_bays_3_5} set={v => setSpec({ ...spec, drive_bays_3_5: +v })} placeholder="2" />
                 <Field label="Отсеки 2.5" type="number" val={spec.drive_bays_2_5} set={v => setSpec({ ...spec, drive_bays_2_5: +v })} placeholder="4" />
                 <Field label="USB-A" type="number" val={spec.front_usb_a} set={v => setSpec({ ...spec, front_usb_a: +v })} placeholder="2" />
                 <Field label="USB-C" type="number" val={spec.front_usb_c} set={v => setSpec({ ...spec, front_usb_c: +v })} placeholder="1" />
               </div>
               <div className="space-y-2 pt-2">
                 <label className="text-xs text-gray-400 uppercase">Поддерживаемые форм-факторы *</label>
                 <div className="flex flex-wrap gap-2">
                  {refs.form_factors?.map(f => { 
                    const sel = (spec.supported_form_factors || []).includes(f.id); 
                    const err = specErrors.supported_form_factors;
                    return <button key={f.id} type="button" onClick={() => { const c = spec.supported_form_factors || []; setSpec({ ...spec, supported_form_factors: sel ? c.filter(i=>i!==f.id) : [...c, f.id] }); setSpecErrors(p => ({...p, supported_form_factors: ''})); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${sel ? 'bg-purple-600/20 border-purple-500 text-purple-300' : `bg-[#0a0a0c] border-white/10 text-gray-400 hover:border-white/20`} ${err ? 'border-red-500/50' : ''} cursor-pointer`}>{f.name}</button> 
                  })}
                 </div>
                 {specErrors.supported_form_factors && <p className="text-xs text-red-400">{specErrors.supported_form_factors}</p>}
               </div>
             </div>
          </>}
        </div>
      </div>
    </div>
  );
}