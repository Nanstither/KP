import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { ArrowLeft, Edit, Save, X, Loader2, Upload, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { STORAGE_URL } from "@/lib/config";

// Шаблоны изображений по категориям
const imageTemplates = {
  cpu: [
    { label: 'Intel Core i3', path: 'components/cpu_core_i3.jpg' },
    { label: 'Intel Core i5', path: 'components/cpu_core_i5.jpg' },
    { label: 'Intel Core i7', path: 'components/cpu_core_i7.jpg' },
    { label: 'Intel Core i9', path: 'components/cpu_core_i9.jpg' },
    { label: 'AMD Ryzen 3', path: 'components/cpu_ryzen_3.jpg' },
    { label: 'AMD Ryzen 5', path: 'components/cpu_ryzen_5.jpg' },
    { label: 'AMD Ryzen 7', path: 'components/cpu_ryzen_7.jpg' },
    { label: 'AMD Ryzen 9', path: 'components/cpu_ryzen_9.jpg' },
  ],
  gpu: [
    { label: 'NVIDIA RTX 4060', path: 'components/gpu_rtx_4060.jpg' },
    { label: 'NVIDIA RTX 4070', path: 'components/gpu_rtx_4070.jpg' },
    { label: 'NVIDIA RTX 4080', path: 'components/gpu_rtx_4080.jpg' },
    { label: 'NVIDIA RTX 4090', path: 'components/gpu_rtx_4090.jpg' },
    { label: 'AMD Radeon', path: 'components/gpu_radeon.jpg' },
  ],
  ram: [
    { label: 'DDR4 Kit', path: 'components/ram_ddr4.jpg' },
    { label: 'DDR5 Kit', path: 'components/ram_ddr5.jpg' },
    { label: 'RGB Kit', path: 'components/ram_rgb.jpg' },
  ],
  motherboard: [
    { label: 'ATX Board', path: 'components/mobo_atx.jpg' },
    { label: 'mATX Board', path: 'components/mobo_matx.jpg' },
    { label: 'ITX Board', path: 'components/mobo_itx.jpg' },
  ],
  psu: [
    { label: 'Standard PSU', path: 'components/psu_standard.jpg' },
    { label: 'Modular PSU', path: 'components/psu_modular.jpg' },
  ],
  storage: [
    { label: 'NVMe SSD', path: 'components/storage_nvme.jpg' },
    { label: 'SATA SSD', path: 'components/storage_sata.jpg' },
    { label: 'HDD', path: 'components/storage_hdd.jpg' },
  ],
  cooler: [
    { label: 'Tower Cooler', path: 'components/cooler_tower.jpg' },
    { label: 'AIO Liquid', path: 'components/cooler_aio.jpg' },
    { label: 'Blower', path: 'components/cooler_blower.jpg' },
  ],
  case: [
    { label: 'Mid-Tower', path: 'components/case_mid.jpg' },
    { label: 'Full-Tower', path: 'components/case_full.jpg' },
    { label: 'Mini-ITX', path: 'components/case_mini.jpg' },
    { label: 'SFF', path: 'components/case_sff.jpg' },
  ],
};

const Field = ({ label, type = 'text', val, set, dis, children, placeholder }) => (
  <div className="space-y-1">
    <label className="text-xs text-gray-400 uppercase">{label}</label>
    {children || (
      <input 
        type={type} 
        value={val ?? ''} 
        onChange={e => set(type === 'number' ? Number(e.target.value) : e.target.value)} 
        disabled={dis}
        placeholder={placeholder || ''}
        className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors" 
      />
    )}
  </div>
);

export default function ComponentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [base, setBase] = useState({});
  const [spec, setSpec] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Загрузка данных
  useEffect(() => {
    api.get(`/admin/components/${id}/edit`).then(res => {
      const c = res.data.component;
      setData(res.data);
      setBase({
        category_id: c.category_id,
        brand_id: c.brand_id,
        model: c.model,
        price: c.price,
        stock: c.stock,
        image: c.image || ''
      });
      
      const slug = c.category?.slug;
      const key = slug === 'motherboard' ? 'motherboardSpec' : `${slug}Spec`;
      let s = c[key] ? { ...c[key] } : {};
      if (slug === 'cooler' && c.compatibleSockets) s.compatible_sockets = c.compatibleSockets.map(x => x.id);
      if (slug === 'case' && c.supportedFormFactors) s.supported_form_factors = c.supportedFormFactors.map(x => x.id);
      setSpec(s);
      setLoading(false);
    }).catch(() => navigate('/admin'));
  }, [id]);

  const handleCancel = () => { setIsEditing(false); setImageFile(null); window.location.reload(); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slug = data.component.category.slug;
      const specPayload = { ...spec };
      
      // Удаляем пустые/нулевые поля, чтобы бэкенд не стирал старые значения
      Object.keys(specPayload).forEach(k => {
        if (specPayload[k] === '' || specPayload[k] === null || specPayload[k] === undefined) delete specPayload[k];
      });

      const formData = new FormData();
      // Базовые поля (только заполненные)
      Object.entries(base).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) formData.append(k, v);
      });

      // Изображение: приоритет у загруженного файла
      if (imageFile && imageFile instanceof File) {
        formData.append('image', imageFile);
      } else if (base.image) {
        formData.append('image_url', base.image);
      }

      // Спецификации как JSON-строка
      formData.append('specs', JSON.stringify({ [slug]: specPayload }));

      await api.put(`/admin/components/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setImageFile(null);
      setIsEditing(false);
      alert('✅ Компонент успешно обновлён');
    } catch (err) { 
      alert('Ошибка: ' + (err.response?.data?.message || err.message)); 
    } finally { setSaving(false); }
  };

  const selectTemplate = (path) => {
    setBase(prev => ({ ...prev, image: path }));
    setImageFile(null); // Сбрасываем файл, если выбрали шаблон
    setShowTemplates(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center text-gray-400">Загрузка...</div>;

  const slug = data.component.category.slug;
  const categoryName = data.component.category.name;
  const refs = data.refs;
  const templates = imageTemplates[slug] || [];
  
  // Логика превью: Файл -> Ссылка (если внешняя) -> Ссылка из БД (локальная)
  const previewSrc = imageFile 
    ? URL.createObjectURL(imageFile) 
    : (base.image 
        ? (base.image.startsWith('http') ? base.image : `${STORAGE_URL}/${base.image}`) 
        : '');

  // Автоматический путь для подписи
  const safeModelName = base.model?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 30) || 'component';
  const autoPath = `components/${slug}/${safeModelName}.jpg`;

  return (
    <div className="min-h-screen bg-[#0f0f10] text-gray-200 p-6 pt-24">
      <div className="max-w-6xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-2">
          <ArrowLeft className="w-4 h-4" /> Назад в таблицу
        </button>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{data.component.model}</h1>
            <p className="text-sm text-gray-500 mt-1">Категория: <span className="text-purple-400">{categoryName}</span></p>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors">
              <Edit className="w-4 h-4" /> Редактировать
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить
              </button>
              <button onClick={handleCancel} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg transition-colors">
                <X className="w-4 h-4" /> Отмена
              </button>
            </div>
          )}
        </div>

        {/* Основная информация */}
        <div className="bg-[#141416] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Основная информация</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* ЛЕВАЯ КОЛОНКА: Изображение */}
            <div className="w-full md:w-80 flex-shrink-0 space-y-4">
              {/* Превью (клик для загрузки) */}
              <div 
                className={`aspect-square bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden relative group transition-all ${isEditing ? 'cursor-pointer hover:border-purple-500' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                {previewSrc ? (
                  <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs">Нажмите для загрузки</span>
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
              </div>

              {/* Подпись о пути сохранения */}
              <div className="bg-[#0a0a0c] border border-white/10 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 mb-1 text-center">Файл будет сохранён автоматически как:</p>
                <p className="text-xs font-mono text-gray-300 text-center truncate" title={autoPath}>
                  {autoPath}
                </p>
              </div>

              {/* Выбор из шаблона (аккуратная кнопка) */}
              {isEditing && (
                <div className="relative">
                  <button 
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-purple-300 transition-colors py-2"
                  >
                    <ImageIcon className="w-3 h-3" /> Выбрать из шаблона
                    <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                  </button>
                  {showTemplates && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1c] border border-white/10 rounded-lg shadow-xl z-10 p-2 max-h-48 overflow-y-auto">
                      {templates.length > 0 ? templates.map(t => (
                        <button key={t.path} onClick={() => selectTemplate(t.path)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-purple-600/20 hover:text-purple-300 rounded-md transition-colors text-left">
                          <div className="w-8 h-8 bg-[#0a0a0c] rounded border border-white/10 overflow-hidden flex-shrink-0">
                            <img src={t.path} className="w-full h-full object-cover" />
                          </div>
                          {t.label}
                        </button>
                      )) : <p className="px-3 py-2 text-xs text-gray-500">Нет шаблонов</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ПРАВАЯ КОЛОНКА: Поля */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Модель" val={base.model} set={v => setBase({ ...base, model: v })} dis={!isEditing} placeholder="Core i5-14400F" />
                <Field label="Бренд">
                  <select value={base.brand_id} onChange={e => setBase({ ...base, brand_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 focus:border-purple-500 focus:outline-none">
                    <option value="" disabled>Выберите бренд...</option>
                    {refs.brands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Цена (₽)" type="number" val={base.price} set={v => setBase({ ...base, price: +v })} dis={!isEditing} placeholder="25000" />
                <Field label="Наличие" type="number" val={base.stock} set={v => setBase({ ...base, stock: +v })} dis={!isEditing} placeholder="15" />
              </div>
            </div>
          </div>
        </div>

        {/* Характеристики */}
        <div className="bg-[#141416] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Характеристики</h2>
          
          {slug === 'cpu' && <>
            <Field label="Сокет">
              <select value={spec.socket_id || ''} onChange={e => setSpec({ ...spec, socket_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 focus:border-purple-500 focus:outline-none">
                <option value="" disabled>Выберите сокет...</option>
                {refs.sockets?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Ядра" type="number" val={spec.cores} set={v => setSpec({ ...spec, cores: +v })} dis={!isEditing} placeholder="6" />
              <Field label="Потоки" type="number" val={spec.threads} set={v => setSpec({ ...spec, threads: +v })} dis={!isEditing} placeholder="12" />
              <Field label="Базовая частота (МГц)" type="number" step="0.1" val={spec.base_clock_mhz} set={v => setSpec({ ...spec, base_clock_mhz: +v })} dis={!isEditing} placeholder="3500" />
              <Field label="Boost частота (МГц)" type="number" step="0.1" val={spec.boost_clock_mhz} set={v => setSpec({ ...spec, boost_clock_mhz: +v })} dis={!isEditing} placeholder="4800" />
              <Field label="TDP (Вт)" type="number" val={spec.tdp_watts} set={v => setSpec({ ...spec, tdp_watts: +v })} dis={!isEditing} placeholder="65" />
            </div>
          </>}

          {slug === 'gpu' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="VRAM (GB)" type="number" val={spec.vram_gb} set={v => setSpec({ ...spec, vram_gb: +v })} dis={!isEditing} placeholder="8" />
            <Field label="Тип VRAM">
              <select value={spec.vram_type_id || ''} onChange={e => setSpec({ ...spec, vram_type_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 focus:border-purple-500 focus:outline-none">
                <option value="" disabled>Выберите тип...</option>
                {refs.vram_types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Шина (бит)" type="number" val={spec.memory_bus_bit} set={v => setSpec({ ...spec, memory_bus_bit: +v })} dis={!isEditing} placeholder="128" />
            <Field label="TDP (Вт)" type="number" val={spec.tdp_watts} set={v => setSpec({ ...spec, tdp_watts: +v })} dis={!isEditing} placeholder="200" />
            <Field label="Длина (мм)" type="number" val={spec.length_mm} set={v => setSpec({ ...spec, length_mm: +v })} dis={!isEditing} placeholder="240" />
            <Field label="Ширина (мм)" type="number" val={spec.width_mm} set={v => setSpec({ ...spec, width_mm: +v })} dis={!isEditing} placeholder="120" />
            <Field label="PCIe Gen" val={spec.pcie_gen} set={v => setSpec({ ...spec, pcie_gen: v })} dis={!isEditing} placeholder="4.0" />
            <Field label="Питание" val={spec.power_requires} set={v => setSpec({ ...spec, power_requires: v })} dis={!isEditing} placeholder="1x8" />
            <Field label="Слоты PCIe" type="number" val={spec.pcie_slots_required} set={v => setSpec({ ...spec, pcie_slots_required: +v })} dis={!isEditing} placeholder="2" />
          </div>}

          {slug === 'ram' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Объём (GB)" type="number" val={spec.total_capacity_gb} set={v => setSpec({ ...spec, total_capacity_gb: +v })} dis={!isEditing} placeholder="16" />
            <Field label="Частота (МГц)" type="number" val={spec.speed_mhz} set={v => setSpec({ ...spec, speed_mhz: +v })} dis={!isEditing} placeholder="3200" />
            <Field label="Тип ОЗУ">
              <select value={spec.ram_type_id || ''} onChange={e => setSpec({ ...spec, ram_type_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 focus:border-purple-500 focus:outline-none">
                <option value="" disabled>Выберите тип...</option>
                {refs.ram_types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Тайминг CL" type="number" val={spec.latency_cl} set={v => setSpec({ ...spec, latency_cl: +v })} dis={!isEditing} placeholder="16" />
            <Field label="Кол-во модулей" type="number" val={spec.modules_count} set={v => setSpec({ ...spec, modules_count: +v })} dis={!isEditing} placeholder="2" />
          </div>}

          {slug === 'motherboard' && <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Сокет">
                <select value={spec.socket_id || ''} onChange={e => setSpec({ ...spec, socket_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 focus:border-purple-500 focus:outline-none">
                  <option value="" disabled>Выберите сокет...</option>
                  {refs.sockets?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Форм-фактор">
                <select value={spec.form_factor_id || ''} onChange={e => setSpec({ ...spec, form_factor_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 focus:border-purple-500 focus:outline-none">
                  <option value="" disabled>Выберите форм-фактор...</option>
                  {refs.form_factors?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Чипсет" val={spec.chipset} set={v => setSpec({ ...spec, chipset: v })} dis={!isEditing} placeholder="B760" />
              <Field label="Слоты RAM" type="number" val={spec.ram_slots} set={v => setSpec({ ...spec, ram_slots: +v })} dis={!isEditing} placeholder="4" />
              <Field label="Тип RAM">
                <select value={spec.ram_type_id || ''} onChange={e => setSpec({ ...spec, ram_type_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 focus:border-purple-500 focus:outline-none">
                  <option value="" disabled>Выберите тип...</option>
                  {refs.ram_types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
              <Field label="M.2 слоты" type="number" val={spec.m2_slots} set={v => setSpec({ ...spec, m2_slots: +v })} dis={!isEditing} placeholder="2" />
              <Field label="PCIe x16" type="number" val={spec.pcie_x16_slots} set={v => setSpec({ ...spec, pcie_x16_slots: +v })} dis={!isEditing} placeholder="1" />
              <Field label="PCIe Gen" val={spec.pcie_gen} set={v => setSpec({ ...spec, pcie_gen: v })} dis={!isEditing} placeholder="4.0" />
              <Field label="SATA порты" type="number" val={spec.sata_ports} set={v => setSpec({ ...spec, sata_ports: +v })} dis={!isEditing} placeholder="4" />
            </div>
          </div>}

          {slug === 'psu' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Мощность (Вт)" type="number" val={spec.wattage} set={v => setSpec({ ...spec, wattage: +v })} dis={!isEditing} placeholder="750" />
            <Field label="Эффективность" val={spec.efficiency} set={v => setSpec({ ...spec, efficiency: v })} dis={!isEditing} placeholder="80+ Gold" />
            <Field label="Модульность" val={spec.modularity} set={v => setSpec({ ...spec, modularity: v })} dis={!isEditing} placeholder="Full" />
            <Field label="Кабели PCIe" type="number" val={spec.pcie_cables_count} set={v => setSpec({ ...spec, pcie_cables_count: +v })} dis={!isEditing} placeholder="2" />
            <Field label="Тип коннектора" val={spec.pcie_cable_type} set={v => setSpec({ ...spec, pcie_cable_type: v })} dis={!isEditing} placeholder="6+2" />
          </div>}

          {slug === 'storage' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Тип" val={spec.type} set={v => setSpec({ ...spec, type: v })} dis={!isEditing} placeholder="nvme" />
            <Field label="Объём (GB)" type="number" val={spec.capacity_gb} set={v => setSpec({ ...spec, capacity_gb: +v })} dis={!isEditing} placeholder="1000" />
            <Field label="Чтение (МБ/с)" type="number" val={spec.read_speed_mbps} set={v => setSpec({ ...spec, read_speed_mbps: +v })} dis={!isEditing} placeholder="7000" />
            <Field label="Запись (МБ/с)" type="number" val={spec.write_speed_mbps} set={v => setSpec({ ...spec, write_speed_mbps: +v })} dis={!isEditing} placeholder="5000" />
            <Field label="Форм-фактор" val={spec.form_factor} set={v => setSpec({ ...spec, form_factor: v })} dis={!isEditing} placeholder="m.2_2280" />
          </div>}

          {slug === 'cooler' && <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="TDP Rating (Вт)" type="number" val={spec.tdp_rating_watts} set={v => setSpec({ ...spec, tdp_rating_watts: +v })} dis={!isEditing} placeholder="220" />
              <Field label="Тип" val={spec.type} set={v => setSpec({ ...spec, type: v })} dis={!isEditing} placeholder="tower" />
              <Field label="Кол-во вентиляторов" type="number" val={spec.fan_count} set={v => setSpec({ ...spec, fan_count: +v })} dis={!isEditing} placeholder="1" />
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-xs text-gray-400 uppercase">Совместимые сокеты</label>
              <div className="flex flex-wrap gap-2">
                {refs.sockets?.map(s => {
                  const isSelected = (spec.compatible_sockets || []).includes(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => {
                      const current = spec.compatible_sockets || [];
                      const updated = isSelected ? current.filter(id => id !== s.id) : [...current, s.id];
                      setSpec({ ...spec, compatible_sockets: updated });
                    }} disabled={!isEditing} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isSelected ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-[#0a0a0c] border-white/10 text-gray-400 hover:border-white/20'} ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </>}

          {slug === 'case' && <>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase">Тип корпуса</label>
                <div className="flex flex-wrap gap-2">
                  {refs.case_types?.map(t => (
                    <button key={t.id} type="button" onClick={() => setSpec({ ...spec, case_type_id: t.id })} disabled={!isEditing} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${spec.case_type_id === t.id ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-[#0a0a0c] border-white/10 text-gray-400 hover:border-white/20'} ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase">Материал</label>
                <div className="flex flex-wrap gap-2">
                  {refs.materials?.map(m => (
                    <button key={m.id} type="button" onClick={() => setSpec({ ...spec, material_id: m.id })} disabled={!isEditing} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${spec.material_id === m.id ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-[#0a0a0c] border-white/10 text-gray-400 hover:border-white/20'} ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <Field label="Слоты сверху" type="number" val={spec.top_fan_slots} set={v => setSpec({ ...spec, top_fan_slots: +v })} dis={!isEditing} placeholder="2" />
                <Field label="Вентиляторов" type="number" val={spec.fans_included} set={v => setSpec({ ...spec, fans_included: +v })} dis={!isEditing} placeholder="3" />
                <Field label="Отсеки 3.5" type="number" val={spec.drive_bays_3_5} set={v => setSpec({ ...spec, drive_bays_3_5: +v })} dis={!isEditing} placeholder="2" />
                <Field label="Отсеки 2.5" type="number" val={spec.drive_bays_2_5} set={v => setSpec({ ...spec, drive_bays_2_5: +v })} dis={!isEditing} placeholder="4" />
                <Field label="USB-A" type="number" val={spec.front_usb_a} set={v => setSpec({ ...spec, front_usb_a: +v })} dis={!isEditing} placeholder="2" />
                <Field label="USB-C" type="number" val={spec.front_usb_c} set={v => setSpec({ ...spec, front_usb_c: +v })} dis={!isEditing} placeholder="1" />
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-xs text-gray-400 uppercase">Поддерживаемые форм-факторы</label>
                <div className="flex flex-wrap gap-2">
                  {refs.form_factors?.map(f => {
                    const isSelected = (spec.supported_form_factors || []).includes(f.id);
                    return (
                      <button key={f.id} type="button" onClick={() => {
                        const current = spec.supported_form_factors || [];
                        const updated = isSelected ? current.filter(id => id !== f.id) : [...current, f.id];
                        setSpec({ ...spec, supported_form_factors: updated });
                      }} disabled={!isEditing} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isSelected ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-[#0a0a0c] border-white/10 text-gray-400 hover:border-white/20'} ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        {f.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}