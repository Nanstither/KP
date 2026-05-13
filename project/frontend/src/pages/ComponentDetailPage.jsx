import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, X, Cpu, Monitor, Zap, HardDrive, Thermometer, Info } from "lucide-react";
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

  // Динамическое определение типа и иконки
  const getType = () => {
    if (data.cpu_spec) return { label: "Процессор", icon: Cpu, specs: data.cpu_spec };
    if (data.gpu_spec) return { label: "Видеокарта", icon: Monitor, specs: data.gpu_spec };
    if (data.ram_spec) return { label: "ОЗУ", icon: Zap, specs: data.ram_spec };
    if (data.motherboard_spec) return { label: "Мат. плата", icon: Cpu, specs: data.motherboard_spec };
    if (data.psu_spec) return { label: "Блок питания", icon: Thermometer, specs: data.psu_spec };
    if (data.storage_spec) return { label: "Накопитель", icon: HardDrive, specs: data.storage_spec };
    if (data.cooler_spec) return { label: "Охлаждение", icon: Thermometer, specs: data.cooler_spec };
    if (data.case_spec) return { label: "Корпус", icon: HardDrive, specs: data.case_spec };
    return { label: "Компонент", icon: Info, specs: {} };
  };

  const { label, icon: Icon, specs } = getType();

  // Форматирование характеристик в пары label:value
  const formatSpecs = () => Object.entries(specs || {})
    .filter(([_, v]) => v !== null && v !== undefined)
    .map(([k, v]) => {
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
      return { label: labels[k] || k, value: typeof v === 'boolean' ? (v ? "Да" : "Нет") : v };
    });

  const formattedSpecs = formatSpecs();

  return (
    <div className="min-h-screen pt-20 bg-[#101019] text-gray-200">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Навигация назад */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Назад к каталогу
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-8">
          {/* Левая колонка: Фото + Цена */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0c]">
              <img src={`${STORAGE_URL}/${data.image}`} alt={data.model} onError={(e) => {e.target.onerror = null; e.target.src = '/placeholder-pc.png';}} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{data.model}</h1>
                <p className="text-gray-400">{data.brand?.name} • {data.category?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-purple-300">{Number(data.price).toLocaleString('ru-RU')} ₽</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block ${data.stock > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {data.stock > 0 ? `В наличии: ${data.stock} шт.` : 'Нет в наличии'}
                </span>
              </div>
            </div>
          </div>

          {/* Правая колонка: Характеристики + Совместимость */}
          <div className="space-y-6">
            {/* Ключевые характеристики */}
            <div className="bg-[#0f0f10] border border-white/10 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Icon className="w-5 h-5 text-purple-400" /> {label}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {formattedSpecs.map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-mono text-gray-200 mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Совместимость (сокеты/форм-факторы) */}
            {(data.compatible_sockets?.length > 0 || data.supported_form_factors?.length > 0) && (
              <div className="bg-[#0f0f10] border border-white/10 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-3">Совместимость</h3>
                <div className="flex flex-wrap gap-2">
                  {data.compatible_sockets?.map(s => (
                    <span key={s.id} className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {s.name}
                    </span>
                  ))}
                  {data.supported_form_factors?.map(f => (
                    <span key={f.id} className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Описание (если добавишь поле description в components) */}
            {data.description && (
              <p className="text-gray-400 leading-relaxed text-sm">{data.description}</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}