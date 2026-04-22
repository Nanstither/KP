// src/components/PrebuiltPcCard.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, Monitor, Zap, HardDrive, Thermometer, 
  ChevronDown, ChevronUp, ShoppingCart, X 
} from "lucide-react";

// Иконки для разных типов компонентов
const ComponentIcon = {
  cpu: Cpu,
  gpu: Monitor,
  ram: Zap,
  storage: HardDrive,
  psu: Thermometer,
  motherboard: Cpu,
  cooler: Thermometer,
  case: HardDrive,
};

// Краткое отображение компонента (для главной карточки)
const CompactComponent = ({ component, role }) => {
  const Icon = ComponentIcon[role] || Cpu;
  return (
    <div className="flex items-center gap-2 text-xs text-purple-200/70">
      <Icon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
      <span className="truncate">{component?.model || "Не выбран"}</span>
    </div>
  );
};

// Детали компонента (для модалки, раскрываются по клику)
const ComponentDetails = ({ component, role }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = ComponentIcon[role] || Cpu;

  // Формируем список характеристик в зависимости от типа
  const getSpecs = () => {
    if (!component?.specs) return [];
    const specs = component.specs;
    
    switch (role) {
      case 'cpu':
        return [
          specs.socket && `Сокет: ${specs.socket}`,
          specs.cores && `${specs.cores} ядер / ${specs.threads} потоков`,
          specs.base_clock_mhz && `Частота: ${specs.base_clock_mhz} МГц`,
          specs.tdp_watts && `TDP: ${specs.tdp_watts}W`,
        ].filter(Boolean);
      case 'gpu':
        return [
          specs.vram_gb && `VRAM: ${specs.vram_gb}GB ${specs.vram_type || ''}`,
          specs.memory_bus_bit && `Шина: ${specs.memory_bus_bit} бит`,
          specs.tdp_watts && `TDP: ${specs.tdp_watts}W`,
          specs.length_mm && `Длина: ${specs.length_mm}мм`,
        ].filter(Boolean);
      case 'ram':
        return [
          specs.total_capacity_gb && `Объём: ${specs.total_capacity_gb}GB`,
          specs.speed_mhz && `Частота: ${specs.speed_mhz}МГц`,
          specs.type && `Тип: ${specs.type}`,
          specs.latency_cl && `Тайминги: CL${specs.latency_cl}`,
        ].filter(Boolean);
      case 'storage':
        return [
          specs.type && `Тип: ${specs.type.toUpperCase()}`,
          specs.capacity_gb && `Объём: ${specs.capacity_gb}GB`,
          specs.read_speed_mbps && `Чтение: ${specs.read_speed_mbps} МБ/с`,
        ].filter(Boolean);
      case 'psu':
        return [
          specs.wattage && `Мощность: ${specs.wattage}W`,
          specs.efficiency && `Сертификат: ${specs.efficiency}`,
          specs.modularity && `Модульность: ${specs.modularity}`,
        ].filter(Boolean);
      default:
        return [];
    }
  };

  const specs = getSpecs();

  return (
    <div className="border-b border-purple-400/10 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-2 hover:bg-purple-500/5 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-purple-200">{component?.model}</p>
            <p className="text-xs text-purple-300/50">{component?.brand?.name}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-purple-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-purple-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && specs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="px-11 pb-3 space-y-1 text-xs text-purple-300/60">
              {specs.map((spec, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-400 rounded-full" />
                  {spec}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Модальное окно "Все характеристики"
const SpecsModal = ({ isOpen, onClose, components }) => {
  // Порядок отображения компонентов
  const order = ['cpu', 'gpu', 'ram', 'motherboard', 'storage', 'psu', 'cooler', 'case'];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Затемнение фона */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Модалка */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       w-[95%] max-w-md max-h-[80vh] overflow-hidden
                       bg-[#0f0f10] border border-purple-400/20 rounded-2xl z-50 shadow-2xl"
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between p-4 border-b border-purple-400/10">
              <h3 className="text-lg font-semibold text-purple-200">Все характеристики</h3>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-purple-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-purple-300" />
              </button>
            </div>
            
            {/* Список компонентов */}
            <div className="p-2 overflow-y-auto max-h-[60vh]">
              {order.map((role) => {
                const component = components[role];
                if (!component) return null;
                return (
                  <ComponentDetails 
                    key={role} 
                    component={component} 
                    role={role} 
                  />
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Основная карточка
export default function PrebuiltPcCard({ pc, onAddToCart }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Преобразуем массив компонентов в объект по ролям
//   const componentsByRole = pc.components?.reduce((acc, item) => {
//     acc[item.pivot?.role || item.role] = item;
//     return acc;
//   }, {}) || {};
  const componentsByRole = pc.components || {};

  const handleAddToCart = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);
    
    // Имитация запроса
    await new Promise(res => setTimeout(res, 500));
    
    if (onAddToCart) onAddToCart(pc.id);
    setIsAdded(true);
    setIsLoading(false);
    
    // Сброс через 2 секунды (для демо)
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <>
      <article className="group bg-[#0f0f10] border border-purple-400/20 rounded-2xl overflow-hidden 
                         hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10 
                         transition-all duration-300">
        
        {/* Изображение + теги */}
        <div className="relative aspect-video overflow-hidden bg-[#0f0f10]">
          <img 
            src={pc.image || '/placeholder-pc.jpg'} 
            alt={pc.name} 
            className="h-full mx-auto object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Теги поверх изображения */}
          {pc.tags?.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {pc.tags.slice(0, 2).map((tag) => (
                <span 
                  key={tag.id}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-full 
                             bg-purple-500/20 text-purple-300 border border-purple-400/30"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="p-5 space-y-4">
          
          {/* Название и цена */}
          <div>
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{pc.name}</h3>
            <p className="text-xl font-semibold bg-gradient-to-r from-purple-300 to-pink-300 
                         bg-clip-text text-transparent">
              {pc.price?.toLocaleString('ru-RU')} ₽
            </p>
          </div>

          {/* 3 ключевых компонента */}
          <div className="space-y-2">
            <CompactComponent component={componentsByRole.cpu} role="cpu" />
            <CompactComponent component={componentsByRole.gpu} role="gpu" />
            <CompactComponent component={componentsByRole.ram} role="ram" />
          </div>

          {/* Кнопка "Все характеристики" */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 text-sm text-purple-300 hover:text-purple-200 
                       border border-purple-400/30 rounded-lg hover:bg-purple-500/10 
                       transition-all duration-200"
          >
            Все характеристики →
          </button>

          {/* Кнопка "В корзину" */}
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-200 
                       flex items-center justify-center gap-2 ${
              isAdded
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-purple-500/25"
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : isAdded ? (
              <>✓ В корзине</>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                В корзину
              </>
            )}
          </button>
        </div>
      </article>

      {/* Модальное окно */}
      <SpecsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        components={componentsByRole} 
      />
    </>
  );
}