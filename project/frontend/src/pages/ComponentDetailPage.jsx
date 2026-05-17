import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";
import { STORAGE_URL, API_URL } from "@/lib/config";

// const API_URL = "http://localhost:8000/api";

export default function ComponentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/components/${id}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => navigate('/'));
  }, [id, navigate]);

  if (loading || !data) return <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center text-gray-400">Загрузка...</div>;

  // Динамическое определение типа
  const getType = () => {
    if (data.cpu_spec) return { label: "Процессор", specs: data.cpu_spec };
    if (data.gpu_spec) return { label: "Видеокарта", specs: data.gpu_spec };
    if (data.ram_spec) return { label: "ОЗУ", specs: data.ram_spec };
    if (data.motherboard_spec) return { label: "Мат. плата", specs: data.motherboard_spec };
    if (data.psu_spec) return { label: "Блок питания", specs: data.psu_spec };
    if (data.storage_spec) return { label: "Накопитель", specs: data.storage_spec };
    if (data.cooler_spec) return { label: "Охлаждение", specs: data.cooler_spec };
    if (data.case_spec) return { label: "Корпус", specs: data.case_spec };
    return { label: "Компонент", specs: {} };
  };

  const { label, specs } = getType();

  // Форматирование характеристик в пары label:value
  const formatSpecs = () => Object.entries(specs || {})
    .filter(([_, v]) => v !== null && v !== undefined)
    .map(([k, v]) => {
      // Превращаем объекты в строку (берем name или id), чтобы React не упал
      let displayValue = v;
      if (typeof v === 'object' && v !== null) {
        displayValue = v.name || v.id || JSON.stringify(v);
      }
      
      const labels = {
        socket: "Сокет", cores: "Ядра", threads: "Потоки", base_clock_mhz: "Баз. частота (МГц)", boost_clock_mhz: "Буст. частота (МГц)", tdp_watts: "TDP (Вт)",
        vram_gb: "VRAM (GB)", vram_type: "Тип памяти", memory_bus_bit: "Шина (бит)", length_mm: "Длина (мм)", width_mm: "Ширина (мм)", pcie_slots_required: "Слоты PCIe",
        total_capacity_gb: "Объём (GB)", speed_mhz: "Частота (МГц)", type: "Тип", latency_cl: "Тайминги (CL)", modules_count: "Модулей",
        chipset: "Чипсет", ram_slots: "Слоты ОЗУ", ram_type: "Тип ОЗУ", m2_slots: "Слоты M.2", pcie_gen: "Версия PCIe", form_factor: "Форм-фактор",
        wattage: "Мощность (Вт)", efficiency: "Сертификат", modularity: "Модульность", pcie_cables_count: "Кабелей PCIe",
        capacity_gb: "Объём (GB)", read_speed_mbps: "Чтение (МБ/с)", write_speed_mbps: "Запись (МБ/с)",
        tdp_rating_watts: "Рассеивание (Вт)", fan_count: "Вентиляторов",
        case_type: "Тип корпуса", top_fan_slots: "Слоты сверху", fans_included: "В комплекте", drive_bays_3_5: "Отсеки 3.5\"", drive_bays_2_5: "Отсеки 2.5\"",
        front_usb_a: "USB-A", front_usb_c: "USB-C", front_audio_jack: "Аудио", material: "Материал"
      };
      return { label: labels[k] || k, value: typeof displayValue === 'boolean' ? (displayValue ? "Да" : "Нет") : displayValue };
    });

  const formattedSpecs = formatSpecs();

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-[#101019] text-gray-900 dark:text-gray-200 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Навигация назад */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Назад к каталогу
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Верхний блок: Картинка слева, информация справа (на desktop) */}
          <div className="bg-white dark:bg-[#0f0f10] border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Левая колонка: Фото */}
              <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c]">
                <img src={`${STORAGE_URL}/${data.image}`} alt={data.model} onError={(e) => {e.target.onerror = null; e.target.src = '/placeholder-pc.png';}} className="w-full h-full object-cover" />
              </div>

              {/* Правая колонка: Название, бренд, категория, цена, наличие */}
              <div className="flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{data.model}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{data.brand?.name || 'Бренд'} • {label}</p>
                  
                  <div className="mb-4">
                    <p className="text-3xl font-semibold text-purple-600 dark:text-purple-400">{Number(data.price).toLocaleString('ru-RU')} ₽</p>
                  </div>
                  
                  <span className={`text-sm font-medium px-3 py-1.5 rounded-full inline-block ${data.stock > 0 ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                    {data.stock > 0 ? `В наличии: ${data.stock} шт.` : 'Нет в наличии'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Нижний блок: Характеристики */}
          <div className="bg-white dark:bg-[#0f0f10] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Характеристики
            </h3>
            
            {/* Две колонки на ПК, одна на мобильных */}
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              {formattedSpecs.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/10 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{s.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200 ml-4">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Совместимость (сокеты/форм-факторы) */}
          {(data.compatible_sockets && data.compatible_sockets.length > 0 || data.supported_form_factors && data.supported_form_factors.length > 0) && (
            <div className="bg-white dark:bg-[#0f0f10] border border-gray-200 dark:border-white/10 rounded-2xl p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Совместимость</h3>
              <div className="flex flex-wrap gap-2">
                {data.compatible_sockets && Array.isArray(data.compatible_sockets) && data.compatible_sockets.map((s, idx) => {
                  const socketName = typeof s === 'object' && s !== null ? (s.name || String(s.id || '')) : String(s);
                  if (!socketName) return null;
                  return (
                    <span key={idx} className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                      {socketName}
                    </span>
                  );
                })}
                {data.supported_form_factors && Array.isArray(data.supported_form_factors) && data.supported_form_factors.map((f, idx) => {
                  const formFactorName = typeof f === 'object' && f !== null ? (f.name || String(f.id || '')) : String(f);
                  if (!formFactorName) return null;
                  return (
                    <span key={idx} className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                      {formFactorName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Описание (если добавишь поле description в components) */}
          {data.description && (
            <div className="bg-white dark:bg-[#0f0f10] border border-gray-200 dark:border-white/10 rounded-2xl p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Описание</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{data.description}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}