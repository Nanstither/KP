import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { parseApiError } from '@/lib/parseApiError';
import { ALLOWED_IMAGE_EXTENSIONS, validateImageFile } from '@/lib/imageUpload';
import { ArrowLeft, Edit, Save, X, Loader2, Upload } from 'lucide-react';
import { STORAGE_URL } from "@/lib/config";

const inputClass = () =>
  'w-full rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none transition-colors bg-white dark:bg-[#0a0a0c] text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 focus:border-purple-500 disabled:opacity-70';

const selectClass = () => inputClass();

const chipClass = (selected) =>
  `px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
    selected
      ? 'bg-purple-100 dark:bg-purple-600/20 border-purple-500 text-purple-700 dark:text-purple-300'
      : 'bg-gray-50 dark:bg-[#0a0a0c] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
  }`;

const Field = ({ label, type = 'text', val, set, dis, children, placeholder, step }) => (
  <div className="space-y-1">
    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
    {children || (
      <input
        type={type}
        step={step}
        value={val ?? ''}
        onChange={e => set(type === 'number' ? Number(e.target.value) : e.target.value)}
        disabled={dis}
        placeholder={placeholder || ''}
        className={inputClass()}
      />
    )}
  </div>
);

export default function ComponentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [base, setBase] = useState({});
  const [spec, setSpec] = useState({});
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    api.get(`/admin/components/${id}/edit`).then(res => {
      const c = res.data.component;
      setData(res.data);
      setBase({ category_id: c.category_id, brand_id: c.brand_id, model: c.model, price: c.price, stock: c.stock, image: c.image || '' });
      const slug = c.category?.slug;
      const key = slug === 'motherboard' ? 'motherboardSpec' : `${slug}Spec`;
      let s = c[key] ? { ...c[key] } : {};
      if (slug === 'cooler' && c.compatibleSockets) s.compatible_sockets = c.compatibleSockets.map(x => x.id);
      if (slug === 'case' && c.supportedFormFactors) s.supported_form_factors = c.supportedFormFactors.map(x => x.id);
      setSpec(s);
      setLoading(false);
    }).catch(() => navigate('/admin/components'));
  }, [id]);

  const handleCancel = () => { setIsEditing(false); setImageFile(null); window.location.reload(); };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      toast.warning(err);
      e.target.value = '';
      return;
    }
    setImageFile(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slug = data.component.category.slug;
      const specPayload = { ...spec };
      Object.keys(specPayload).forEach(k => { if (specPayload[k] === '' || specPayload[k] === null || specPayload[k] === undefined) delete specPayload[k]; });

      const formData = new FormData();
      Object.entries(base).forEach(([k, v]) => { if (k !== 'image' && v !== '' && v !== null && v !== undefined) formData.append(k, v); });
      if (imageFile instanceof File) {
        formData.append('image', imageFile);
      }
      formData.append('specs', JSON.stringify({ [slug]: specPayload }));

      await api.put(`/admin/components/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageFile(null);
      setIsEditing(false);
      toast.success('Компонент успешно обновлён');
    } catch (err) {
      toast.error(parseApiError(err));
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] flex items-center justify-center text-gray-500 dark:text-gray-400">
        Загрузка...
      </div>
    );
  }

  const slug = data.component.category.slug;
  const categoryName = data.component.category.name;
  const refs = data.refs;
  const DEFAULT_IMG = "/placeholder.svg";

  const previewSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : (base.image
        ? (base.image.startsWith('http') ? base.image : `${STORAGE_URL}/${base.image}`)
        : DEFAULT_IMG);

  const safeModelName = base.model?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 30) || 'component';
  const autoPath = `images/components/${slug}/${safeModelName}`;

  const chipBtnClass = (selected) =>
    `${chipClass(selected)} ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 p-6 pt-24 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад в таблицу
        </button>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.component.model}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Категория: <span className="text-purple-600 dark:text-purple-400 font-medium">{categoryName}</span>
            </p>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
              <Edit className="w-4 h-4" /> Редактировать
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить
              </button>
              <button onClick={handleCancel} className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-white/10">
                <X className="w-4 h-4" /> Отмена
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Основная информация</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 flex-shrink-0 space-y-4">
              <div
                className={`aspect-square bg-gray-100 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden relative group transition-all ${isEditing ? 'cursor-pointer hover:border-purple-400 dark:hover:border-purple-500/50' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                <img src={previewSrc} alt="Preview" onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }} className="w-full h-full object-cover" />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept={ALLOWED_IMAGE_EXTENSIONS} onChange={handleImageChange} />
              </div>
              <div className="bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Файл будет сохранён автоматически по пути:</p>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate" title={autoPath}>{autoPath}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Модель" val={base.model} set={v => setBase({ ...base, model: v })} dis={!isEditing} placeholder="Core i5-14400F" />
                <Field label="Бренд">
                  <select value={base.brand_id} onChange={e => setBase({ ...base, brand_id: +e.target.value })} disabled={!isEditing} className={selectClass()}>
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

        <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Характеристики</h2>
          {slug === 'cpu' && <>
            <Field label="Сокет">
              <select value={spec.socket_id || ''} onChange={e => setSpec({ ...spec, socket_id: +e.target.value })} disabled={!isEditing} className={selectClass()}>
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
              <select value={spec.vram_type_id || ''} onChange={e => setSpec({ ...spec, vram_type_id: +e.target.value })} disabled={!isEditing} className={selectClass()}>
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
              <select value={spec.ram_type_id || ''} onChange={e => setSpec({ ...spec, ram_type_id: +e.target.value })} disabled={!isEditing} className={selectClass()}>
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
                <select value={spec.socket_id || ''} onChange={e => setSpec({ ...spec, socket_id: +e.target.value })} disabled={!isEditing} className={selectClass()}>
                  <option value="" disabled>Выберите сокет...</option>
                  {refs.sockets?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Форм-фактор">
                <select value={spec.form_factor_id || ''} onChange={e => setSpec({ ...spec, form_factor_id: +e.target.value })} disabled={!isEditing} className={selectClass()}>
                  <option value="" disabled>Выберите форм-фактор...</option>
                  {refs.form_factors?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Чипсет" val={spec.chipset} set={v => setSpec({ ...spec, chipset: v })} dis={!isEditing} placeholder="B760" />
              <Field label="Слоты RAM" type="number" val={spec.ram_slots} set={v => setSpec({ ...spec, ram_slots: +v })} dis={!isEditing} placeholder="4" />
              <Field label="Тип RAM">
                <select value={spec.ram_type_id || ''} onChange={e => setSpec({ ...spec, ram_type_id: +e.target.value })} disabled={!isEditing} className={selectClass()}>
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
            <Field label="Тип">
              <select value={spec.type || ''} onChange={e => setSpec({ ...spec, type: e.target.value })} disabled={!isEditing} className={selectClass()}>
                <option value="">Выберите тип...</option>
                <option value="nvme">NVMe</option>
                <option value="sata">SATA</option>
              </select>
            </Field>
            <Field label="Объём (GB)" type="number" val={spec.capacity_gb} set={v => setSpec({ ...spec, capacity_gb: +v })} dis={!isEditing} placeholder="1000" />
            <Field label="Чтение (МБ/с)" type="number" val={spec.read_speed_mbps} set={v => setSpec({ ...spec, read_speed_mbps: +v })} dis={!isEditing} placeholder="7000" />
            <Field label="Запись (МБ/с)" type="number" val={spec.write_speed_mbps} set={v => setSpec({ ...spec, write_speed_mbps: +v })} dis={!isEditing} placeholder="5000" />
            <Field label="Форм-фактор" val={spec.form_factor} set={v => setSpec({ ...spec, form_factor: v })} dis={!isEditing} placeholder="m.2_2280" />
          </div>}
          {slug === 'cooler' && <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="TDP Rating (Вт)" type="number" val={spec.tdp_rating_watts} set={v => setSpec({ ...spec, tdp_rating_watts: +v })} dis={!isEditing} placeholder="220" />
              <Field label="Тип">
                <select value={spec.type || ''} onChange={e => setSpec({ ...spec, type: e.target.value })} disabled={!isEditing} className={selectClass()}>
                  <option value="">Выберите тип...</option>
                  <option value="tower">Tower (башенный)</option>
                  <option value="aio">AIO (жидкостное)</option>
                  <option value="fan">Fan (вентилятор)</option>
                </select>
              </Field>
              <Field label="Кол-во вентиляторов" type="number" val={spec.fan_count} set={v => setSpec({ ...spec, fan_count: +v })} dis={!isEditing} placeholder="1" />
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Совместимые сокеты</label>
              <div className="flex flex-wrap gap-2">
                {refs.sockets?.map(s => {
                  const isSelected = (spec.compatible_sockets || []).includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const current = spec.compatible_sockets || [];
                        const updated = isSelected ? current.filter(id => id !== s.id) : [...current, s.id];
                        setSpec({ ...spec, compatible_sockets: updated });
                      }}
                      disabled={!isEditing}
                      className={chipBtnClass(isSelected)}
                    >
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
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Тип корпуса</label>
                <div className="flex flex-wrap gap-2">
                  {refs.case_types?.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSpec({ ...spec, case_type_id: t.id })}
                      disabled={!isEditing}
                      className={chipBtnClass(spec.case_type_id === t.id)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Материал</label>
                <div className="flex flex-wrap gap-2">
                  {refs.materials?.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSpec({ ...spec, material_id: m.id })}
                      disabled={!isEditing}
                      className={chipBtnClass(spec.material_id === m.id)}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <Field label="Слоты сверху" type="number" val={spec.top_fan_slots} set={v => setSpec({ ...spec, top_fan_slots: +v })} dis={!isEditing} placeholder="2" />
                <Field label="Вентиляторов в комплекте" type="number" val={spec.fans_included} set={v => setSpec({ ...spec, fans_included: +v })} dis={!isEditing} placeholder="3" />
                <Field label="Отсеки 3.5&quot;" type="number" val={spec.drive_bays_3_5} set={v => setSpec({ ...spec, drive_bays_3_5: +v })} dis={!isEditing} placeholder="2" />
                <Field label="Отсеки 2.5&quot;" type="number" val={spec.drive_bays_2_5} set={v => setSpec({ ...spec, drive_bays_2_5: +v })} dis={!isEditing} placeholder="4" />
                <Field label="USB-A (перед)" type="number" val={spec.front_usb_a} set={v => setSpec({ ...spec, front_usb_a: +v })} dis={!isEditing} placeholder="2" />
                <Field label="USB-C (перед)" type="number" val={spec.front_usb_c} set={v => setSpec({ ...spec, front_usb_c: +v })} dis={!isEditing} placeholder="1" />
                <Field label="Макс. длина GPU (мм)" type="number" val={spec.max_length_gpu} set={v => setSpec({ ...spec, max_length_gpu: +v })} dis={!isEditing} placeholder="400" />
                <Field label="Высота (мм)" type="number" val={spec.height} set={v => setSpec({ ...spec, height: +v })} dis={!isEditing} placeholder="450" />
                <Field label="Ширина (мм)" type="number" val={spec.width} set={v => setSpec({ ...spec, width: +v })} dis={!isEditing} placeholder="220" />
                <Field label="Глубина (мм)" type="number" val={spec.length} set={v => setSpec({ ...spec, length: +v })} dis={!isEditing} placeholder="480" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={spec.front_audio_jack !== false}
                  onChange={e => setSpec({ ...spec, front_audio_jack: e.target.checked })}
                  disabled={!isEditing}
                  className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-purple-600 focus:ring-purple-500/30 disabled:opacity-70"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Аудиоразъём на передней панели</span>
              </label>
              <div className="space-y-2 pt-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Поддерживаемые форм-факторы</label>
                <div className="flex flex-wrap gap-2">
                  {refs.form_factors?.map(f => {
                    const isSelected = (spec.supported_form_factors || []).includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          const current = spec.supported_form_factors || [];
                          const updated = isSelected ? current.filter(id => id !== f.id) : [...current, f.id];
                          setSpec({ ...spec, supported_form_factors: updated });
                        }}
                        disabled={!isEditing}
                        className={chipBtnClass(isSelected)}
                      >
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
