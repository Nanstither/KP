import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { STORAGE_URL } from "@/lib/config";
import {
  Monitor, Cpu, HardDrive, Fan, Battery,
  MemoryStick, ChevronRight, Check, ArrowLeft, X,
  ShoppingBag, LayoutGrid, Plus, Minus
} from "lucide-react";

const ICON_MAP = {
  motherboard: <Monitor className="w-5 h-5" />,
  mb: <Monitor className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  gpu: <Monitor className="w-5 h-5" />,
  ram: <MemoryStick className="w-5 h-5" />,
  psu: <Battery className="w-5 h-5" />,
  cooler: <Fan className="w-5 h-5" />,
  storage: <HardDrive className="w-5 h-5" />,
  case: <LayoutGrid className="w-5 h-5" />,
};

const formatSpecs = (item, categoryId) => {
  const specs = [];
  const specKey = `${categoryId}_spec`;
  const spec = item[specKey];
  if (!spec) return "";

  switch (categoryId) {
    case 'motherboard':
    case 'mb':
      if (spec.socket_id) specs.push(`Сокет: ${spec.socket_id}`);
      if (spec.form_factor_id) specs.push(`Форм-фактор: ${spec.form_factor_id}`);
      if (spec.ram_type_id) specs.push(`Поддерживаемая ОЗУ: ${spec.ram_type_id}`);
      if (spec.ram_slots) specs.push(`Слотов ОЗУ: ${spec.ram_slots}`);
      if (spec.m2_slots) specs.push(`M.2 слотов: ${spec.m2_slots}`);
      if (spec.sata_ports) specs.push(`SATA портов: ${spec.sata_ports}`);
      break;
    case 'cpu':
      if (spec.cores) specs.push(`${spec.cores} ядер`);
      if (spec.base_clock_mhz) specs.push(`${(spec.base_clock_mhz / 1000).toFixed(1)} GHz`);
      if (spec.socket_id) specs.push(`Socket: ${spec.socket_id}`);
      break;
    case 'gpu':
      if (spec.vram_gb) specs.push(`${spec.vram_gb} GB`);
      if (spec.vram_type_id) specs.push(`VRAM: ${spec.vram_type_id}`);
      if (spec.memory_bus_bit) specs.push(`${spec.memory_bus_bit}-bit`);
      if (spec.tdp_watts) specs.push(`${spec.tdp_watts}W`);
      if (spec.length_mm) specs.push(`${spec.length_mm}мм`);
      break;
    case 'ram':
      if (spec.total_capacity_gb) specs.push(`Объем: ${spec.total_capacity_gb} GB`);
      if (spec.modules_count) specs.push(`В комплекте: ${spec.modules_count} шт.`);
      if (spec.ram_type_id) specs.push(spec.ram_type_id);
      if (spec.speed_mhz) specs.push(`${spec.speed_mhz} MHz`);
      break;
    case 'psu':
      if (spec.wattage) specs.push(`${spec.wattage}W`);
      if (spec.efficiency) specs.push(spec.efficiency);
      if (spec.modularity) specs.push(`Модульность: ${spec.modularity}`);
      break;
    case 'cooler':
      if (spec.type) specs.push(spec.type);
      if (spec.tdp_rating_watts) specs.push(`${spec.tdp_rating_watts}W`);
      if (spec.fan_count) specs.push(`Вентиляторов: ${spec.fan_count}`);
      break;
    case 'storage':
      if (spec.type) specs.push(`Тип: ${spec.type}`);
      if (spec.capacity_gb) specs.push(`${spec.capacity_gb} GB`);
      if (spec.read_speed_mbps) specs.push(`Чтение: ${spec.read_speed_mbps} MB/s`);
      break;
    default: break;
  }
  return specs.join(' / ');
};

export default function ConfiguratorPage() {
  const navigate = useNavigate();
  const [isCaseSelectorOpen, setIsCaseSelectorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  
  // build теперь хранит nvme и sata раздельно
  const [build, setBuild] = useState({});
  const [limits, setLimits] = useState({ ram: 2, nvme: 1, sata: 4 });
  const [activeStorageType, setActiveStorageType] = useState('nvme');
  
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
          if (!grouped[cat.slug]) grouped[cat.slug] = [];
          grouped[cat.slug].push(comp);
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
        if (grouped.case?.length > 0) setSelectedCase(grouped.case[0]);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const mb = build.motherboard?.item || build.mb?.item;
    if (mb) {
      const spec = mb.motherboard_spec || {};
      setLimits({
        ram: spec.ram_slots || 2,
        nvme: spec.m2_slots || 1,
        sata: spec.sata_ports || 4
      });
    } else {
      setLimits({ ram: 2, nvme: 1, sata: 4 });
    }
  }, [build.motherboard, build.mb]);

  useEffect(() => {
    if (build.ram?.item) {
      const slots = limits.ram || 2;
      const modules = build.ram.item.ram_spec?.modules_count || 1;
      const maxSets = Math.floor(slots / modules);
      if (build.ram.quantity > maxSets) {
        setBuild(prev => ({ ...prev, ram: { ...prev.ram, quantity: maxSets } }));
      }
    }
  }, [limits.ram, build.ram?.item]);

  const selectComponent = (catId, item) => {
    setBuild(prev => ({ ...prev, [catId]: { item, quantity: 1 } }));
  };

  const updateQuantity = (catId, delta) => {
    setBuild(prev => {
      const current = prev[catId];
      if (!current) return prev;
      let newQty = current.quantity + delta;
      if (newQty < 1) newQty = 1;

      if (catId === 'ram') {
        const slots = limits.ram || 2;
        const modules = current.item.ram_spec?.modules_count || 1;
        newQty = Math.min(newQty, Math.floor(slots / modules));
      }
      if (catId === 'nvme') newQty = Math.min(newQty, limits.nvme);
      if (catId === 'sata') newQty = Math.min(newQty, limits.sata);

      return { ...prev, [catId]: { ...current, quantity: newQty } };
    });
  };

  const totalPrice = useMemo(() => {
    let sum = Number(selectedCase?.price || 0);
    Object.values(build).forEach(({ item, quantity }) => {
      sum += Number(item?.price || 0) * (quantity || 1);
    });
    return sum;
  }, [build, selectedCase]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0f0f10] text-gray-400">Загрузка конфигуратора...</div>;

  const allCases = products.case || [];

  return (
    <div className="relative w-full h-screen bg-[#0f0f10] overflow-hidden text-gray-200 select-none flex flex-col">
      <header className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-[#141416] border border-white/10 hover:border-purple-500/50 rounded-full shadow-lg backdrop-blur-md transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Обратно
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setIsCaseSelectorOpen(!isCaseSelectorOpen); setSelectedCategory(null); }} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-[#141416] border border-white/10 hover:border-purple-500/50 rounded-full shadow-lg backdrop-blur-md transition-colors text-sm font-medium">
            <LayoutGrid className="w-4 h-4 text-purple-400" /> Сменить корпус
          </motion.button>
          <div className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full shadow-lg shadow-purple-500/20 transition-colors duration-300 text-sm font-bold text-white">
            <ShoppingBag className="w-4 h-4" /> Конфигурация
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-0">
        <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center">
          <motion.img 
            key={selectedCase?.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            src={`${STORAGE_URL}/${selectedCase?.image}` || "/placeholder.svg"} alt={selectedCase?.model}
            onError={(e) => { e.target.src = "/placeholder.svg"; }}
            className="h-130 aspect-[4/4] object-cover drop-shadow-2xl relative z-10 rounded-2xl"
          />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">{selectedCase?.model || "Корпус не выбран"}</span>
            <span className="text-2xl font-bold text-white font-mono">{Number(totalPrice).toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isCaseSelectorOpen && (
          <motion.div initial={{ y: 420, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 420, opacity: 0 }} transition={{ type: "spring", damping: 25 }} className="absolute bottom-0 left-0 right-0 bg-[#141416] border-t border-white/10 z-40 min-h-[420px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="p-6 h-full overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Выберите корпус</h3>
                <button onClick={() => setIsCaseSelectorOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allCases.map(c => {
                  const spec = c.case_spec || {}; 
                  const specItems = [
                    spec.case_type_id && `Тип: ${spec.case_type_id}`,
                    spec.top_fan_slots && `Верх. вент: ${spec.top_fan_slots}`,
                    spec.fans_included && `В компл: ${spec.fans_included}`,
                    spec.drive_bays_3_5 && `3.5": ${spec.drive_bays_3_5}`,
                    spec.drive_bays_2_5 && `2.5": ${spec.drive_bays_2_5}`,
                    spec.front_usb_a && `USB-A: ${spec.front_usb_a}`,
                    spec.front_usb_c && `USB-C: ${spec.front_usb_c}`,
                  ].filter(Boolean);

                  return (
                    <button key={c.id} onClick={() => { setSelectedCase(c); setIsCaseSelectorOpen(false); }} className={`relative flex flex-col p-4 rounded-xl border transition-all text-left group ${selectedCase?.id === c.id ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/50" : "bg-[#0a0a0c] border-white/5 hover:border-white/20 hover:bg-[#111114]"}`}>
                      <div className="bg-[#050505] rounded-lg mb-3 flex items-center justify-center overflow-hidden flex-shrink-0 aspect-video">
                        <img src={`${STORAGE_URL}/${c.image}` || "/placeholder.svg"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => { e.target.src = "/placeholder.svg"; }} />
                      </div>
                      <div className="mb-2">
                        <p className="font-medium text-white text-sm leading-tight line-clamp-2">{c.model}</p>
                        <p className="text-purple-300 text-xs font-mono mt-1">{Number(c.price).toLocaleString('ru-RU')} ₽</p>
                      </div>
                      <div className="flex-1 pt-2 border-t border-white/5 overflow-hidden">
                        <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1.5">Параметры:</p>
                        <ul className="space-y-0">
                          {specItems.length > 0 ? specItems.map((s, i) => (
                            <li key={i} className="text-[12px] text-gray-400 flex items-start gap-1.5"><span className="text-purple-500 mt-px flex-shrink-0">•</span><span className="line-clamp-1">{s}</span></li>
                          )) : <li className="text-[10px] text-gray-600 italic">Нет данных</li>}
                        </ul>
                      </div>
                      {selectedCase?.id === c.id && <div className="absolute top-3 right-3 bg-purple-500 rounded-full p-1.5 shadow-lg"><Check className="w-3 h-3 text-white" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.aside animate={{ width: selectedCategory ? 660 : 320 }} transition={{ type: "spring", stiffness: 120, damping: 22 }} className="absolute top-0 right-0 h-full bg-[#141416] border-l border-white/10 z-40 flex overflow-hidden shadow-2xl">
        <div className="w-[320px] flex-shrink-0 flex flex-col border-r border-white/10 bg-[#141416]">
          <div className="p-4 h-16 border-b border-white/10 flex items-center justify-between">
            <span className="font-bold text-white text-sm">Платформа</span>
            {Object.keys(build).length > 0 && <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{Object.keys(build).length} выбр.</span>}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              
              // 🔹 СПЕЦИАЛЬНЫЙ РЕНДЕР ДЛЯ НАКОПИТЕЛЕЙ
              // 🔹 СПЕЦИАЛЬНЫЙ РЕНДЕР ДЛЯ НАКОПИТЕЛЕЙ (Замени старый блок на этот)
              if (cat.id === 'storage') {
                const nvmeItem = build.nvme?.item;
                const sataItem = build.sata?.item;
                const nvmeQty = build.nvme?.quantity || 0;
                const sataQty = build.sata?.quantity || 0;
                const isAnyPicked = nvmeItem || sataItem;

                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(isSelected ? null : cat.id)} className={`w-full flex flex-col items-start p-3 rounded-xl border transition-all group ${
                    isSelected ? "bg-purple-600/10 border-purple-500/40" : isAnyPicked ? "bg-white/5 border-green-500/30" : "bg-[#0a0a0c] border-white/5 hover:bg-[#1a1a1d] hover:border-white/20"
                  }`}>
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isAnyPicked ? 'bg-green-500/20 text-green-400' : isSelected ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'}`}>
                          {cat.icon}
                        </div>
                        <span className={`text-sm font-medium ${isAnyPicked ? 'text-green-300' : isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                          {cat.name}
                        </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    </div>
                    
                    {/* NVMe строка */}
                    {nvmeItem && (
                      <div className="flex items-center gap-2 mt-1 w-full">
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-[10px] text-gray-500 uppercase font-mono flex-shrink-0">NVMe</span>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-between">
                          <span className="text-xs text-gray-300 truncate">{nvmeItem.model}</span>
                          {nvmeQty > 1 && <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 rounded flex-shrink-0">x{nvmeQty}</span>}
                        </div>
                      </div>
                    )}
                    
                    {/* SATA строка */}
                    {sataItem && (
                      <div className="flex items-center gap-2 mt-0.5 w-full">
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-[10px] text-gray-500 uppercase font-mono flex-shrink-0">SATA</span>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-between">
                          <span className="text-xs text-gray-300 truncate">{sataItem.model}</span>
                          {sataQty > 1 && <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 rounded flex-shrink-0">x{sataQty}</span>}
                        </div>
                      </div>
                    )}
                  </button>
                );
              }

              // 🔹 СТАНДАРТНЫЙ РЕНДЕР ДЛЯ ОСТАЛЬНЫХ
              const isPicked = !!build[cat.id]?.item;
              const selectedItem = build[cat.id]?.item;
              const qty = build[cat.id]?.quantity;
              
              return (
                <button key={cat.id} onClick={() => setSelectedCategory(isSelected ? null : cat.id)} className={`w-full flex flex-col items-start p-3 rounded-xl border transition-all group ${isSelected ? "bg-purple-600/10 border-purple-500/40" : isPicked ? "bg-white/5 border-green-500/30" : "bg-[#0a0a0c] border-white/5 hover:bg-[#1a1a1d] hover:border-white/20"}`}>
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isPicked ? 'bg-green-500/20 text-green-400' : isSelected ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'}`}>{cat.icon}</div>
                      <span className={`text-sm font-medium ${isPicked ? 'text-green-300' : isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{cat.name}</span>
                    </div>
                    {isPicked ? <Check className="w-4 h-4 text-green-400" /> : <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`} />}
                  </div>
                  {isPicked && selectedItem && (
                    <div className="flex items-center justify-between w-full mt-1">
                      <span className="text-xs text-gray-400 truncate max-w-[140px]">{selectedItem.model}</span>
                      {qty > 1 && <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 rounded">x{qty}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {selectedCategory && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 120, damping: 22 }} className="flex-shrink-0 overflow-hidden bg-[#0f0f10]">
              <div className="w-[340px] h-full flex flex-col">
                <div className="p-4 h-16 border-b border-white/10 flex items-center justify-between bg-[#141416]">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
                    <span className="font-semibold text-white text-sm">{categories.find(c => c.id === selectedCategory)?.name}</span>
                  </div>
                  <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {selectedCategory === 'storage' ? (
                    (() => {
                      const allItems = products.storage || [];
                      const nvmeItems = allItems.filter(i => i.storage_spec?.type === 'nvme');
                      const sataItems = allItems.filter(i => i.storage_spec?.type === 'sata');
                      const isNvmeActive = activeStorageType === 'nvme';
                      const isSataActive = activeStorageType === 'sata';

                      const renderDiskCard = (item, type) => {
                        const isSelected = build[type]?.item?.id === item.id;
                        const currentQty = build[type]?.quantity || 0;
                        const limit = type === 'nvme' ? limits.nvme : limits.sata;
                        const specsString = formatSpecs(item, 'storage');

                        return (
                          <div key={item.id} onClick={() => { if (!isSelected) selectComponent(type, item); }} className={`w-full p-3 rounded-xl border text-left transition-all relative cursor-pointer ${isSelected ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/30" : "bg-[#141416] border-white/5 hover:border-white/20 hover:bg-[#1a1a1d]"}`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-sm font-semibold ${isSelected ? 'text-purple-300' : 'text-white'}`}>{item.model}</span>
                              <span className="text-xs font-mono text-gray-300">{Number(item.price).toLocaleString('ru-RU')} ₽</span>
                            </div>
                            {specsString && <div className="text-[10px] text-gray-500 mb-2 line-clamp-2">{specsString}</div>}
                            
                            {isSelected && (
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                                <span className="text-xs text-gray-400">Кол-во:</span>
                                <div className="flex items-center gap-2 bg-[#0a0a0c] rounded-lg p-1">
                                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(type, -1); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white disabled:opacity-30" disabled={currentQty <= 1}><Minus className="w-3 h-3" /></button>
                                  <span className="text-xs font-mono w-4 text-center text-white">{currentQty}</span>
                                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(type, 1); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white disabled:opacity-30" disabled={currentQty >= limit}><Plus className="w-3 h-3" /></button>
                                </div>
                                <span className="text-[10px] text-gray-500">Макс: {limit}</span>
                              </div>
                            )}
                          </div>
                        );
                      };

                      return (
                        <>
                          <button onClick={() => setActiveStorageType('nvme')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all ${isNvmeActive ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'bg-[#0a0a0c] text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                            <span>NVMe SSD (M.2)</span>
                            <span className="text-xs font-mono opacity-70">{build.nvme?.quantity || 0} / {limits.nvme}</span>
                          </button>
                          {isNvmeActive && nvmeItems.length > 0 && <div className="space-y-2 mt-2 mb-4 pl-2 border-l-2 border-purple-500/30">{nvmeItems.map(item => renderDiskCard(item, 'nvme'))}</div>}

                          <button onClick={() => setActiveStorageType('sata')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all ${isSataActive ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'bg-[#0a0a0c] text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                            <span>SATA SSD / HDD</span>
                            <span className="text-xs font-mono opacity-70">{build.sata?.quantity || 0} / {limits.sata}</span>
                          </button>
                          {isSataActive && sataItems.length > 0 && <div className="space-y-2 mt-2 mb-4 pl-2 border-l-2 border-purple-500/30">{sataItems.map(item => renderDiskCard(item, 'sata'))}</div>}
                        </>
                      );
                    })()
                  ) : selectedCategory === 'ram' ? (
                    (products[selectedCategory] || []).map(item => {
                      const isSelected = build[selectedCategory]?.item?.id === item.id;
                      const specsString = formatSpecs(item, selectedCategory);
                      const currentQty = build[selectedCategory]?.quantity || 1;
                      return (
                        <div key={item.id} onClick={() => selectComponent(selectedCategory, item)} className={`w-full p-3 rounded-xl border text-left transition-all relative cursor-pointer ${isSelected ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/30" : "bg-[#141416] border-white/5 hover:border-white/20 hover:bg-[#1a1a1d]"}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-semibold ${isSelected ? 'text-purple-300' : 'text-white'}`}>{item.model}</span>
                            <span className="text-xs font-mono text-gray-300">{Number(item.price).toLocaleString('ru-RU')} ₽</span>
                          </div>
                          {specsString && <div className="text-[10px] text-gray-500 mb-2 line-clamp-2">{specsString}</div>}
                          {isSelected && (
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                              <span className="text-xs text-gray-400">Кол-во:</span>
                              <div className="flex items-center gap-2 bg-[#0a0a0c] rounded-lg p-1">
                                <button onClick={(e) => { e.stopPropagation(); updateQuantity(selectedCategory, -1); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white disabled:opacity-30" disabled={currentQty <= 1}><Minus className="w-3 h-3" /></button>
                                <span className="text-xs font-mono w-4 text-center text-white">{currentQty}</span>
                                <button onClick={(e) => { e.stopPropagation(); updateQuantity(selectedCategory, 1); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white disabled:opacity-30" disabled={currentQty >= Math.floor(limits.ram / (build.ram?.item?.ram_spec?.modules_count || 1))}><Plus className="w-3 h-3" /></button>
                              </div>
                              <span className="text-[10px] text-gray-500">Макс: {Math.floor(limits.ram / (build.ram?.item?.ram_spec?.modules_count || 1))}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    (products[selectedCategory] || []).map(item => {
                      const isSelected = build[selectedCategory]?.item?.id === item.id;
                      const specsString = formatSpecs(item, selectedCategory);
                      return (
                        <div key={item.id} onClick={() => selectComponent(selectedCategory, item)} className={`w-full p-3 rounded-xl border text-left transition-all relative cursor-pointer ${isSelected ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/30" : "bg-[#141416] border-white/5 hover:border-white/20 hover:bg-[#1a1a1d]"}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-semibold ${isSelected ? 'text-purple-300' : 'text-white'}`}>{item.model}</span>
                            <span className="text-xs font-mono text-gray-300">{Number(item.price).toLocaleString('ru-RU')} ₽</span>
                          </div>
                          {specsString && <div className="text-[10px] text-gray-500 mb-1 line-clamp-2">{specsString}</div>}
                          {isSelected && <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1 shadow-lg"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </div>
  );
}