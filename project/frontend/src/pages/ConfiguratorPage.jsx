import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import {
  Monitor, Cpu, HardDrive, Fan, Battery,
  MemoryStick, ChevronRight, Check, ArrowLeft, X,
  ShoppingBag, LayoutGrid
} from "lucide-react";

// Маппинг иконок под slug категории
const ICON_MAP = {
  motherboard: <Monitor className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  gpu: <Monitor className="w-5 h-5" />,
  ram: <MemoryStick className="w-5 h-5" />,
  psu: <Battery className="w-5 h-5" />,
  cooler: <Fan className="w-5 h-5" />,
  storage: <HardDrive className="w-5 h-5" />,
  case: <LayoutGrid className="w-5 h-5" />,
};

// Функция для форматирования характеристик в одну строку
const formatSpecs = (item, categoryId) => {
  const specs = [];
  
  // ✅ ИСПРАВЛЕНИЕ: Ищем поля с подчёркиванием (snake_case)
  const specKey = `${categoryId}_spec`;
  const spec = item[specKey]; // Например, item['cpu_spec'] или item['case_spec']
  
  if (!spec) return "";
  
  switch(categoryId) {
    case 'case':
      if (spec.top_fan_slots) specs.push(`Верх. вентиляторы: ${spec.top_fan_slots}`);
      if (spec.fans_included) specs.push(`В комплекте: ${spec.fans_included} вентилятора`);
      if (spec.drive_bays_3_5) specs.push(`3.5" отсеки: ${spec.drive_bays_3_5}`);
      if (spec.drive_bays_2_5) specs.push(`2.5" отсеки: ${spec.drive_bays_2_5}`);
      if (spec.front_usb_a) specs.push(`USB-A: ${spec.front_usb_a}`);
      if (spec.front_usb_c) specs.push(`USB-C: ${spec.front_usb_c}`);
      if (spec.max_gpu_length) specs.push(`GPU: до ${spec.max_gpu_length}мм`);
      if (spec.max_cooler_height) specs.push(`Кулер: до ${spec.max_cooler_height}мм`);
      if (spec.max_psu_length) specs.push(`БП: до ${spec.max_psu_length}мм`);
      break;
      
    case 'motherboard':
    case 'mb':
      if (spec.socket_id) specs.push(`Socket: ${spec.socket_id}`); // Если socket_id
      if (spec.chipset) specs.push(spec.chipset);
      if (spec.form_factor) specs.push(spec.form_factor);
      break;
      
    case 'cpu':
      if (spec.cores) specs.push(`${spec.cores} ядер`);
      if (spec.base_clock_mhz) specs.push(`${(spec.base_clock_mhz / 1000).toFixed(1)} GHz`);
      if (spec.socket_id) specs.push(`Socket: ${spec.socket_id}`);
      break;
      
    case 'gpu':
      if (spec.vram_gb) specs.push(`${spec.vram_gb} GB`);
      if (spec.vram_type_id) specs.push(`VRAM Type ID: ${spec.vram_type_id}`); // Лучше заменить на связь с таблицей типов
      if (spec.memory_bus_bit) specs.push(`${spec.memory_bus_bit}-bit`);
      if (spec.tdp_watts) specs.push(`${spec.tdp_watts}W`);
      if (spec.length_mm) specs.push(`${spec.length_mm}мм`);
      if (spec.pcie_gen) specs.push(`PCIe ${spec.pcie_gen}`);
      if (spec.power_requires) specs.push(spec.power_requires);
      break;
      
    case 'ram':
      if (spec.capacity) specs.push(spec.capacity);
      if (spec.type) specs.push(spec.type);
      if (spec.speed_mhz) specs.push(`${spec.speed_mhz} MHz`);
      break;
      
    case 'psu':
      if (spec.watts) specs.push(`${spec.watts}W`);
      if (spec.efficiency) specs.push(spec.efficiency);
      break;
      
    case 'cooler':
      if (spec.type) specs.push(spec.type);
      if (spec.tdp_watts) specs.push(`${spec.tdp_watts}W TDP`);
      if (spec.height_mm) specs.push(`${spec.height_mm}mm`);
      break;
      
    case 'storage':
      if (spec.type) specs.push(spec.type);
      if (spec.capacity_gb) specs.push(`${spec.capacity_gb} GB`);
      if (spec.speed_read_mbps) specs.push(`${spec.speed_read_mbps} MB/s`);
      break;
      
    default:
      break;
  }
  
  return specs.join(' / ');
};

export default function ConfiguratorPage() {
  const [isCaseSelectorOpen, setIsCaseSelectorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [build, setBuild] = useState({});
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/components");
        const allComponents = res.data || [];

        const grouped = {};
        const catsList = [];

        allComponents.forEach(comp => {
          const cat = comp.category;
          if (!cat?.slug) return;

          // Группируем ВСЕ компоненты, включая корпуса
          if (!grouped[cat.slug]) grouped[cat.slug] = [];
          grouped[cat.slug].push(comp);

          // Но в список категорий для правой панели НЕ добавляем корпуса
          if (cat.slug === 'case') return;

          if (!catsList.find(c => c.id === cat.slug)) {
            catsList.push({
              id: cat.slug,
              name: cat.name,
              icon: ICON_MAP[cat.slug] || <Monitor className="w-5 h-5" />
            });
          }
        });

        setCategories(catsList);
        setProducts(grouped);

        // По умолчанию выбираем первый корпус из БД
        const cases = grouped.case || [];
        if (cases.length > 0) {
          setSelectedCase(cases[0]);
        }
      } catch (err) {
        console.error("Ошибка загрузки конфигуратора:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPrice = useMemo(() => {
    const componentsSum = Object.values(build).reduce((acc, item) => acc + Number(item?.price || 0), 0);
    return Number(componentsSum) + Number(selectedCase?.price || 0);
  }, [build, selectedCase]);

  const selectComponent = (catId, item) => {
    setBuild(prev => ({ ...prev, [catId]: item }));
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#0f0f10] text-gray-400">Загрузка конфигуратора...</div>;
  }

  const allCases = products.case || [];

  return (
    <div className="relative w-full h-screen bg-[#0f0f10] overflow-hidden text-gray-200 select-none flex flex-col">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <header className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => { setIsCaseSelectorOpen(!isCaseSelectorOpen); setSelectedCategory(null); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#141416] border border-white/10 hover:border-purple-500/50 rounded-full shadow-lg backdrop-blur-md transition-colors text-sm font-medium"
          >
            <LayoutGrid className="w-4 h-4 text-purple-400" /> Сменить корпус
          </motion.button>

          <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-500/20 text-sm font-bold text-white">
            <ShoppingBag className="w-4 h-4" /> Конфигурация
          </div>
        </div>
      </header>

      {/* ЦЕНТРАЛЬНАЯ ОБЛАСТЬ (Корпус) */}
      <main className="flex-1 flex items-center justify-center relative z-0">
        <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center">
          <motion.img 
            key={selectedCase?.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={selectedCase?.image || "/placeholder.svg"} 
            alt={selectedCase?.model}
            onError={(e) => { e.target.src = "/placeholder.svg"; }}
            className="max-h-[80vh] object-contain drop-shadow-2xl relative z-10 scale-140"
          />

          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">{selectedCase?.model || "Корпус не выбран"}</span>
            <span className="text-2xl font-bold text-white font-mono">{Number(totalPrice).toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </main>

      {/* НИЖНЯЯ ПАНЕЛЬ (Выбор корпуса) */}
      <AnimatePresence>
        {isCaseSelectorOpen && (
          <motion.div
            initial={{ y: 420, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 420, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-0 left-0 right-0 bg-[#141416] border-t border-white/10 z-40 min-h-[420px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="p-6 h-full overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Выберите корпус</h3>
                <button onClick={() => setIsCaseSelectorOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              {/* Сетка: больше колонок → карточки уже. */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allCases.map(c => {
                  // ✅ ИСПРАВЛЕНИЕ: Ищем поле case_spec (snake_case)
                  const spec = c.case_spec || {}; 
                  
                  const specItems = [
                    spec.max_gpu_length && `GPU: до ${spec.max_gpu_length}мм`,
                    spec.max_cooler_height && `Кулер: до ${spec.max_cooler_height}мм`,
                    spec.top_fan_slots && `Вентиляторы: ${spec.top_fan_slots}`,
                    spec.fans_included && `В комплекте: ${spec.fans_included}`,
                    spec.drive_bays_3_5 && `3.5": ${spec.drive_bays_3_5}`,
                    spec.drive_bays_2_5 && `2.5": ${spec.drive_bays_2_5}`,
                    spec.front_usb_a && `USB-A: ${spec.front_usb_a}`,
                    spec.front_usb_c && `USB-C: ${spec.front_usb_c}`,
                  ].filter(Boolean);

                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCase(c); setIsCaseSelectorOpen(false); }}
                      className={`relative flex flex-col h-[320px] p-4 rounded-xl border transition-all text-left group ${
                        selectedCase?.id === c.id 
                          ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/50" 
                          : "bg-[#0a0a0c] border-white/5 hover:border-white/20 hover:bg-[#111114]"
                      }`}
                    >
                      {/* Картинка */}
                      <div className="h-28 bg-[#050505] rounded-lg mb-3 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img 
                          src={c.image || "/placeholder.svg"} 
                          className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                          onError={(e) => { e.target.src = "/placeholder.svg"; }} 
                        />
                      </div>

                      {/* Название и цена */}
                      <div className="mb-2">
                        <p className="font-medium text-white text-sm leading-tight line-clamp-2">{c.model}</p>
                        <p className="text-purple-300 text-xs font-mono mt-1">{Number(c.price).toLocaleString('ru-RU')} ₽</p>
                      </div>

                      {/* Характеристики */}
                      <div className="flex-1 pt-2 border-t border-white/5 overflow-hidden">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">Параметры:</p>
                        <ul className="space-y-1">
                          {specItems.length > 0 ? (
                            specItems.map((s, i) => (
                              <li key={i} className="text-[10px] text-gray-400 flex items-start gap-1.5">
                                <span className="text-purple-500 mt-px flex-shrink-0">•</span>
                                <span className="line-clamp-1">{s}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-[10px] text-gray-600 italic">Нет данных</li>
                          )}
                        </ul>
                      </div>

                      {selectedCase?.id === c.id && (
                        <div className="absolute top-3 right-3 bg-purple-500 rounded-full p-1.5 shadow-lg">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ПРАВАЯ ПАНЕЛЬ (Только компоненты, БЕЗ корпусов) */}
      <motion.aside
        animate={{ width: selectedCategory ? 660 : 320 }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
        className="absolute top-0 right-0 h-full bg-[#141416] border-l border-white/10 z-40 flex overflow-hidden shadow-2xl"
      >
        {/* КОЛОНКА 1: Категории */}
        <div className="w-[320px] flex-shrink-0 flex flex-col border-r border-white/10 bg-[#141416]">
          <div className="p-4 h-16 border-b border-white/10 flex items-center justify-between">
            <span className="font-bold text-white text-sm">Платформа</span>
            {Object.keys(build).length > 0 && (
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                {Object.keys(build).length} выбр.
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const isPicked = !!build[cat.id];
              const selectedItem = build[cat.id];
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`w-full flex flex-col items-start p-3 rounded-xl border transition-all group ${
                    isSelected
                      ? "bg-purple-600/10 border-purple-500/40"
                      : isPicked
                      ? "bg-white/5 border-green-500/30"
                      : "bg-[#0a0a0c] border-white/5 hover:bg-[#1a1a1d] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isPicked ? 'bg-green-500/20 text-green-400' : isSelected ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'}`}>
                        {cat.icon}
                      </div>
                      <span className={`text-sm font-medium ${isPicked ? 'text-green-300' : isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {cat.name}
                      </span>
                    </div>
                    {isPicked ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    )}
                  </div>
                  
                  {isPicked && selectedItem && (
                    <span className="text-xs text-gray-400 ml-11 truncate w-[calc(100%-44px)]">
                      {selectedItem.model}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* КОЛОНКА 2: Список товаров */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              className="flex-shrink-0 overflow-hidden bg-[#0f0f10]"
            >
              <div className="w-[340px] h-full flex flex-col">
                <div className="p-4 h-16 border-b border-white/10 flex items-center justify-between bg-[#141416]">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-white text-sm">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                  <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {(products[selectedCategory] || []).map(item => {
                    const isSelected = build[selectedCategory]?.id === item.id;
                    const specsString = formatSpecs(item, selectedCategory);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectComponent(selectedCategory, item)}
                        className={`w-full p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/30"
                            : "bg-[#141416] border-white/5 hover:border-white/20 hover:bg-[#1a1a1d]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                            {item.model}
                          </span>
                          <span className="text-xs font-mono text-gray-300">{Number(item.price).toLocaleString('ru-RU')} ₽</span>
                        </div>
                        
                        {/* Характеристики в одну строку */}
                        {specsString && (
                          <div className="text-[10px] text-gray-500 mb-1">
                            {specsString}
                          </div>
                        )}
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1 shadow-lg">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </div>
  );
}