import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { ArrowLeft, Edit, Save, X, Loader2 } from 'lucide-react';

// Универсальный инпут
const Field = ({ label, type = 'text', val, set, dis, children }) => (
  <div className="space-y-1">
    <label className="text-xs text-gray-400 uppercase">{label}</label>
    {children || (
      <input 
        type={type} 
        value={val ?? ''} 
        onChange={e => set(e.target.value)} 
        disabled={dis}
        className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 focus:border-purple-500 focus:outline-none" 
      />
    )}
  </div>
);

export default function ComponentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  
  // Текущие значения формы
  const [base, setBase] = useState({});
  const [spec, setSpec] = useState({});
  
  // Исходные значения для восстановления при отмене
  const [originalBase, setOriginalBase] = useState({});
  const [originalSpec, setOriginalSpec] = useState({});

  // Загрузка данных
  useEffect(() => {
    api.get(`/admin/components/${id}/edit`).then(res => {
      setData(res.data);
      const c = res.data.component;
      
      // Заполняем base
      const baseData = { 
        category_id: c.category_id, 
        brand_id: c.brand_id, 
        model: c.model, 
        price: c.price, 
        stock: c.stock, 
        image: c.image || '' 
      };
      setBase(baseData);
      setOriginalBase({ ...baseData });
      
      // Заполняем spec
      const slug = c.category?.slug;
      const key = slug === 'motherboard' ? 'motherboardSpec' : `${slug}Spec`;
      
      if (c[key]) {
        let s = { ...c[key] };
        // Many-to-Many: преобразуем в массивы ID
        if (slug === 'cooler' && c.compatibleSockets) {
          s.compatible_sockets = c.compatibleSockets.map(x => x.id);
        }
        if (slug === 'case' && c.supportedFormFactors) {
          s.supported_form_factors = c.supportedFormFactors.map(x => x.id);
        }
        setSpec(s);
        setOriginalSpec({ ...s });
      }
      setLoading(false);
    }).catch(() => navigate('/admin'));
  }, [id]);

  // 🆕 Предупреждение и сброс при смене категории
  useEffect(() => {
    if (data && Object.keys(spec).length > 0) {
      alert('⚠️ Внимание: при смене категории текущие характеристики будут сброшены.');
    }
    setSpec({});
  }, [base.category_id]);

  // Вычисляем slug и название из выбранной в форме категории
  const currentCategory = data?.refs?.categories?.find(c => c.id === base.category_id);
  const slug = currentCategory?.slug;
  const categoryName = currentCategory?.name || 'Не выбрано';

  // 🆕 Восстановление при отмене
  const handleCancel = () => {
    setBase({ ...originalBase });
    setSpec({ ...originalSpec });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Дефолты для обязательных полей, чтобы избежать SQL ошибки
      const specPayload = { ...spec };
      
      if (slug === 'gpu') {
        specPayload.vram_gb ||= 8; 
        specPayload.vram_type ||= 'GDDR6'; 
        specPayload.tdp_watts ||= 200;
      }
      if (slug === 'cpu') {
        specPayload.cores ||= 4; 
        specPayload.threads ||= 8; 
        specPayload.base_clock_mhz ||= 3000; 
        specPayload.tdp_watts ||= 65;
      }
      if (slug === 'ram') {
        specPayload.total_capacity_gb ||= 16; 
        specPayload.speed_mhz ||= 3200; 
        specPayload.type ||= 'DDR4'; 
        specPayload.latency_cl ||= 16;
      }
      if (slug === 'motherboard') {
        specPayload.ram_slots ||= 4;
        specPayload.ram_type ||= 'DDR4';
        specPayload.pcie_gen ||= '4.0';
      }
      if (slug === 'psu') {
        specPayload.wattage ||= 600;
        specPayload.efficiency ||= '80+ Bronze';
        specPayload.modularity ||= 'Non';
      }
      if (slug === 'storage') {
        specPayload.type ||= 'nvme';
        specPayload.capacity_gb ||= 500;
        specPayload.form_factor ||= 'm.2_2280';
      }
      if (slug === 'cooler') {
        specPayload.tdp_rating_watts ||= 150;
        specPayload.type ||= 'tower';
        specPayload.fan_count ||= 1;
      }
      if (slug === 'case') {
        specPayload.case_type ||= 'mid_tower';
        specPayload.material ||= 'steel';
      }

      await api.put(`/admin/components/${id}`, { 
        ...base, 
        specs: { [slug]: specPayload }
      });
      
      // После успешного сохранения обновляем "исходные" значения
      setOriginalBase({ ...base });
      setOriginalSpec({ ...specPayload });
      
      setIsEditing(false);
      alert('✅ Компонент успешно обновлён');
    } catch (err) { 
      alert('Ошибка: ' + (err.response?.data?.message || err.message)); 
    }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center text-gray-400">Загрузка...</div>;

  const refs = data.refs;

  return (
    <div className="min-h-screen bg-[#0f0f10] text-gray-200 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" /> Назад в таблицу
        </button>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Редактирование: {data.component.model}</h1>
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

        {/* Базовая информация */}
        <div className="bg-[#141416] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Основная информация</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Категория">
              <select value={base.category_id} onChange={e => setBase({ ...base, category_id: +e.target.value })} disabled={!isEditing}
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70">
                {refs.categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Бренд">
              <select value={base.brand_id} onChange={e => setBase({ ...base, brand_id: +e.target.value })} disabled={!isEditing}
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70">
                {refs.brands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Модель" val={base.model} set={v => setBase({ ...base, model: v })} dis={!isEditing} />
            <Field label="Цена (₽)" type="number" val={base.price} set={v => setBase({ ...base, price: +v })} dis={!isEditing} />
            <Field label="Наличие" type="number" val={base.stock} set={v => setBase({ ...base, stock: +v })} dis={!isEditing} />
            <Field label="Изображение (URL)" val={base.image} set={v => setBase({ ...base, image: v })} dis={!isEditing} />
          </div>
        </div>

        {/* Динамические характеристики */}
        <div className="bg-[#141416] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Характеристики: {categoryName}</h2>
          
          {slug === 'cpu' && <>
            <Field label="Сокет">
              <select value={spec.socket_id || ''} onChange={e => setSpec({ ...spec, socket_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70">
                {refs.sockets?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Ядра" type="number" val={spec.cores} set={v => setSpec({ ...spec, cores: +v })} dis={!isEditing} />
              <Field label="Потоки" type="number" val={spec.threads} set={v => setSpec({ ...spec, threads: +v })} dis={!isEditing} />
              <Field label="Базовая частота (МГц)" type="number" step="0.1" val={spec.base_clock_mhz} set={v => setSpec({ ...spec, base_clock_mhz: +v })} dis={!isEditing} />
              <Field label="Boost частота (МГц)" type="number" step="0.1" val={spec.boost_clock_mhz} set={v => setSpec({ ...spec, boost_clock_mhz: +v })} dis={!isEditing} />
              <Field label="TDP (Вт)" type="number" val={spec.tdp_watts} set={v => setSpec({ ...spec, tdp_watts: +v })} dis={!isEditing} />
            </div>
          </>}

          {slug === 'gpu' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="VRAM (GB)" type="number" val={spec.vram_gb} set={v => setSpec({ ...spec, vram_gb: +v })} dis={!isEditing} />
            <Field label="Тип VRAM" val={spec.vram_type} set={v => setSpec({ ...spec, vram_type: v })} dis={!isEditing} />
            <Field label="Шина (бит)" type="number" val={spec.memory_bus_bit} set={v => setSpec({ ...spec, memory_bus_bit: +v })} dis={!isEditing} />
            <Field label="TDP (Вт)" type="number" val={spec.tdp_watts} set={v => setSpec({ ...spec, tdp_watts: +v })} dis={!isEditing} />
            <Field label="Длина (мм)" type="number" val={spec.length_mm} set={v => setSpec({ ...spec, length_mm: +v })} dis={!isEditing} />
            <Field label="Ширина (мм)" type="number" val={spec.width_mm} set={v => setSpec({ ...spec, width_mm: +v })} dis={!isEditing} />
            <Field label="PCIe Gen" val={spec.pcie_gen} set={v => setSpec({ ...spec, pcie_gen: v })} dis={!isEditing} />
            <Field label="Питание" val={spec.power_requires} set={v => setSpec({ ...spec, power_requires: v })} dis={!isEditing} />
            <Field label="Слоты PCIe" type="number" val={spec.pcie_slots_required} set={v => setSpec({ ...spec, pcie_slots_required: +v })} dis={!isEditing} />
          </div>}

          {slug === 'ram' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Объём (GB)" type="number" val={spec.total_capacity_gb} set={v => setSpec({ ...spec, total_capacity_gb: +v })} dis={!isEditing} />
            <Field label="Частота (МГц)" type="number" val={spec.speed_mhz} set={v => setSpec({ ...spec, speed_mhz: +v })} dis={!isEditing} />
            <Field label="Тип" val={spec.type} set={v => setSpec({ ...spec, type: v })} dis={!isEditing} />
            <Field label="Тайминг CL" type="number" val={spec.latency_cl} set={v => setSpec({ ...spec, latency_cl: +v })} dis={!isEditing} />
            <Field label="Кол-во модулей" type="number" val={spec.modules_count} set={v => setSpec({ ...spec, modules_count: +v })} dis={!isEditing} />
          </div>}

          {slug === 'motherboard' && <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Сокет">
                <select value={spec.socket_id || ''} onChange={e => setSpec({ ...spec, socket_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70">
                  {refs.sockets?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Форм-фактор">
                <select value={spec.form_factor_id || ''} onChange={e => setSpec({ ...spec, form_factor_id: +e.target.value })} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70">
                  {refs.form_factors?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Чипсет" val={spec.chipset} set={v => setSpec({ ...spec, chipset: v })} dis={!isEditing} />
              <Field label="Слоты RAM" type="number" val={spec.ram_slots} set={v => setSpec({ ...spec, ram_slots: +v })} dis={!isEditing} />
              <Field label="Тип RAM" val={spec.ram_type} set={v => setSpec({ ...spec, ram_type: v })} dis={!isEditing} />
              <Field label="M.2 слоты" type="number" val={spec.m2_slots} set={v => setSpec({ ...spec, m2_slots: +v })} dis={!isEditing} />
              <Field label="PCIe x16" type="number" val={spec.pcie_x16_slots} set={v => setSpec({ ...spec, pcie_x16_slots: +v })} dis={!isEditing} />
              <Field label="PCIe Gen" val={spec.pcie_gen} set={v => setSpec({ ...spec, pcie_gen: v })} dis={!isEditing} />
              <Field label="SATA порты" type="number" val={spec.sata_ports} set={v => setSpec({ ...spec, sata_ports: +v })} dis={!isEditing} />
            </div>
          </div>}

          {slug === 'psu' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Мощность (Вт)" type="number" val={spec.wattage} set={v => setSpec({ ...spec, wattage: +v })} dis={!isEditing} />
            <Field label="Эффективность" val={spec.efficiency} set={v => setSpec({ ...spec, efficiency: v })} dis={!isEditing} />
            <Field label="Модульность" val={spec.modularity} set={v => setSpec({ ...spec, modularity: v })} dis={!isEditing} />
            <Field label="Кабели PCIe" type="number" val={spec.pcie_cables_count} set={v => setSpec({ ...spec, pcie_cables_count: +v })} dis={!isEditing} />
            <Field label="Тип коннектора" val={spec.pcie_cable_type} set={v => setSpec({ ...spec, pcie_cable_type: v })} dis={!isEditing} />
          </div>}

          {slug === 'storage' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Тип" val={spec.type} set={v => setSpec({ ...spec, type: v })} dis={!isEditing} />
            <Field label="Объём (GB)" type="number" val={spec.capacity_gb} set={v => setSpec({ ...spec, capacity_gb: +v })} dis={!isEditing} />
            <Field label="Чтение (МБ/с)" type="number" val={spec.read_speed_mbps} set={v => setSpec({ ...spec, read_speed_mbps: +v })} dis={!isEditing} />
            <Field label="Запись (МБ/с)" type="number" val={spec.write_speed_mbps} set={v => setSpec({ ...spec, write_speed_mbps: +v })} dis={!isEditing} />
            <Field label="Форм-фактор" val={spec.form_factor} set={v => setSpec({ ...spec, form_factor: v })} dis={!isEditing} />
          </div>}

          {slug === 'cooler' && <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="TDP Rating (Вт)" type="number" val={spec.tdp_rating_watts} set={v => setSpec({ ...spec, tdp_rating_watts: +v })} dis={!isEditing} />
              <Field label="Тип" val={spec.type} set={v => setSpec({ ...spec, type: v })} dis={!isEditing} />
              <Field label="Кол-во вентиляторов" type="number" val={spec.fan_count} set={v => setSpec({ ...spec, fan_count: +v })} dis={!isEditing} />
            </div>
            <Field label="Совместимые сокеты">
              <select multiple value={spec.compatible_sockets || []} onChange={e => {
                const opts = Array.from(e.target.selectedOptions).map(o => +o.value);
                setSpec({ ...spec, compatible_sockets: opts });
              }} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 h-32">
                {refs.sockets?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Ctrl+Click для выбора нескольких</p>
            </Field>
          </>}

          {slug === 'case' && <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Тип корпуса" val={spec.case_type} set={v => setSpec({ ...spec, case_type: v })} dis={!isEditing} />
              <Field label="Слоты сверху" type="number" val={spec.top_fan_slots} set={v => setSpec({ ...spec, top_fan_slots: +v })} dis={!isEditing} />
              <Field label="Вентиляторов в комплекте" type="number" val={spec.fans_included} set={v => setSpec({ ...spec, fans_included: +v })} dis={!isEditing} />
              <Field label="Отсеки 3.5" type="number" val={spec.drive_bays_3_5} set={v => setSpec({ ...spec, drive_bays_3_5: +v })} dis={!isEditing} />
              <Field label="Отсеки 2.5" type="number" val={spec.drive_bays_2_5} set={v => setSpec({ ...spec, drive_bays_2_5: +v })} dis={!isEditing} />
              <Field label="Материал" val={spec.material} set={v => setSpec({ ...spec, material: v })} dis={!isEditing} />
              <Field label="USB-A" type="number" val={spec.front_usb_a} set={v => setSpec({ ...spec, front_usb_a: +v })} dis={!isEditing} />
              <Field label="USB-C" type="number" val={spec.front_usb_c} set={v => setSpec({ ...spec, front_usb_c: +v })} dis={!isEditing} />
            </div>
            <Field label="Поддерживаемые форм-факторы">
              <select multiple value={spec.supported_form_factors || []} onChange={e => {
                const opts = Array.from(e.target.selectedOptions).map(o => +o.value);
                setSpec({ ...spec, supported_form_factors: opts });
              }} disabled={!isEditing} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 h-32">
                {refs.form_factors?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Ctrl+Click для выбора нескольких</p>
            </Field>
          </>}

          {!slug && <p className="text-gray-500 text-center py-4">Выберите категорию для отображения характеристик</p>}
        </div>
      </div>
    </div>
  );
}