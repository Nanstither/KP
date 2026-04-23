import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Cpu, Monitor, Zap, HardDrive, Thermometer, 
  ChevronDown, X, ShoppingCart, Check, Info 
} from "lucide-react";

// Иконки и подписи ролей
const ROLE_CONFIG = {
  cpu: { icon: Cpu, label: "Процессор" },
  gpu: { icon: Monitor, label: "Видеокарта" },
  ram: { icon: Zap, label: "ОЗУ" },
  motherboard: { icon: HardDrive, label: "Мат. плата" },
  storage: { icon: HardDrive, label: "Накопитель" },
  psu: { icon: Thermometer, label: "Блок питания" },
  cooler: { icon: Thermometer, label: "Охлаждение" },
  case: { icon: HardDrive, label: "Корпус" },
};

// Порядок отображения
const COMPONENT_ORDER = ['cpu', 'gpu', 'ram', 'motherboard', 'storage', 'psu', 'cooler', 'case'];

// Преобразование specs в красивые пары label/value
const formatSpecs = (specs, role) => {
  if (!specs) return [];
  const map = {
    cpu: [
      { k: 'socket', l: 'Сокет' }, { k: 'cores', l: 'Ядра' }, { k: 'threads', l: 'Потоки' },
      { k: 'base_clock_mhz', l: 'Баз. частота', fmt: v => `${v} МГц` }, { k: 'tdp_watts', l: 'TDP', fmt: v => `${v}W` }
    ],
    gpu: [
      { k: 'vram_gb', l: 'VRAM', fmt: v => `${v} GB` }, { k: 'vram_type', l: 'Тип памяти' },
      { k: 'memory_bus_bit', l: 'Шина', fmt: v => `${v} бит` }, { k: 'tdp_watts', l: 'TDP', fmt: v => `${v}W` }
    ],
    ram: [
      { k: 'total_capacity_gb', l: 'Объём', fmt: v => `${v} GB` }, { k: 'speed_mhz', l: 'Частота', fmt: v => `${v} МГц` },
      { k: 'type', l: 'Тип' }, { k: 'latency_cl', l: 'Тайминги', fmt: v => `CL${v}` }
    ],
    storage: [
      { k: 'type', l: 'Тип' }, { k: 'capacity_gb', l: 'Объём', fmt: v => `${v} GB` },
      { k: 'read_speed_mbps', l: 'Чтение', fmt: v => `${v} МБ/с` }, { k: 'write_speed_mbps', l: 'Запись', fmt: v => `${v} МБ/с` }
    ],
    psu: [
      { k: 'wattage', l: 'Мощность', fmt: v => `${v}W` }, { k: 'efficiency', l: 'Сертификат' },
      { k: 'modularity', l: 'Модульность' }
    ],
    motherboard: [
      { k: 'chipset', l: 'Чипсет' }, 
      { k: 'ram_type', l: 'Тип ОЗУ' },
      { k: 'form_factor', l: 'Форм-фактор' }, 
      { k: 'm2_slots', l: 'Слоты M.2' }
    ],
    cooler: [
      { k: 'tdp_rating_watts', l: 'Рассеивание', fmt: v => `${v}W` }, 
      { k: 'type', l: 'Тип' },
      { k: 'fan_count', l: 'Вентиляторы' }
    ],
    case: [
      { k: 'case_type', l: 'Форм-фактор' }, 
      { k: 'material', l: 'Материал' },
      { k: 'fans_included', l: 'Вент. в комплекте' }
    ]
  };

  return (map[role] || [])
    .filter(item => specs[item.k] !== undefined && specs[item.k] !== null)
    .map(item => ({
      label: item.l,
      value: item.fmt ? item.fmt(specs[item.k]) : specs[item.k]
    }));
};

// Блок компонента в модалке (аккордеон)
const ComponentBlock = ({ role, data, isExpanded, onToggle }) => {
  const { icon: Icon, label } = ROLE_CONFIG[role] || { icon: Info, label: role };
  const specs = formatSpecs(data.specs, role);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0f0f10]/80 backdrop-blur-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">{label}</p>
            <p className="text-white font-semibold tracking-wide">{data.model}</p>
          </div>
        </div>
        {/* Кнопка "Подробнее" */}
        <Link
          to={`/components/${data.id}`}
          onClick={(e) => {
            e.stopPropagation(); // Чтобы не срабатывал аккордеон при клике на ссылку
            setIsModalOpen(false); // Закрыть модалку при переходе
          }}
          className="ml-auto mr-2 px-2.5 py-1 text-[11px] font-medium text-purple-300 
                    rounded-md hover:bg-purple-500/10 
                    hover:text-white transition-all"
        >
        <Info/>
        </Link>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && specs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-3">
              {specs.map((s, i) => (
                <div key={i} className="flex flex-col gap-1 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">{s.label}</span>
                  <span className="text-sm text-gray-200 font-mono">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Основная карточка
export default function PrebuiltPcCard({ pc, onAddToCart }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Данные уже приходят объектом по ролям благодаря контроллеру
  const components = pc.components || {};

  const handleAddToCart = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 400));
    if (onAddToCart) onAddToCart(pc);
    setIsAdded(true);
    setIsLoading(false);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const toggleExpand = (role) => setExpandedRole(prev => prev === role ? null : role);

  return (
    <>
      {/* Карточка */}
      <article className="group relative bg-[#0f0f10] border border-white/10 rounded-2xl overflow-hidden 
                          hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.08)] 
                          transition-all duration-300">
        
        {/* Изображение */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0a0a0c]">
          <img 
            src={pc.image || '/placeholder-pc.jpg'} 
            alt={pc.name} 
            className="mx-auto scale-90 h-full object-center object-cover opacity-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-transparent to-transparent" />
          
          {/* Теги */}
          {pc.tags?.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {pc.tags.slice(0, 2).map(tag => (
                <span key={tag.slug} className="px-2 py-0.5 text-[10px] font-medium rounded-md 
                                               bg-black/40 backdrop-blur-md text-gray-300 border border-white/10">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="p-5 space-y-5">
          {/* Заголовок и цена */}
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">{pc.name}</h3>
            <p className="text-2xl font-semibold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">
              {Number(pc.price).toLocaleString('ru-RU')} ₽
            </p>
          </div>

          {/* Быстрые характеристики (чипы) */}
          <div className="grid grid-cols-3 gap-2">
            {['cpu', 'gpu', 'ram'].map(role => {
              const data = components[role];
              const { icon: Icon } = ROLE_CONFIG[role];
              return (
                <div key={role} className="flex flex-col items-center justify-center p-2.5 rounded-xl 
                                          bg-white/[0.03] border border-white/5 text-center">
                  <Icon className="w-4 h-4 text-purple-400 mb-1.5" />
                  <span className="text-[11px] text-gray-400 leading-tight line-clamp-2 font-mono">
                    {data?.model || '—'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Кнопки */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 py-2.5 text-sm font-medium text-gray-300 border border-white/10 rounded-xl 
                         hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              Характеристики
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                         ${isAdded 
                           ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                           : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-purple-500/20'}`}
            >
              {isLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : isAdded ? (
                <> <Check className="w-4 h-4" /> Готово </>
              ) : (
                <> <ShoppingCart className="w-4 h-4" /> В корзину </>
              )}
            </button>
          </div>
        </div>
      </article>

      {/* Модальное окно */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                         w-[95%] max-w-lg max-h-[85vh] overflow-hidden
                         bg-[#0f0f10] border border-white/10 rounded-2xl z-50 shadow-2xl"
            >
              {/* Шапка модалки */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-semibold text-white">{pc.name}</h3>
                  <p className="text-sm text-gray-500">Полная конфигурация сборки</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Список компонентов */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[65vh] [scrollbar-gutter:stable]">
                {COMPONENT_ORDER.map(role => {
                  const data = components[role];
                  if (!data) return null;
                  return (
                    <ComponentBlock
                      key={role}
                      role={role}
                      data={data}
                      isExpanded={expandedRole === role}
                      onToggle={() => toggleExpand(role)}
                    />
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}