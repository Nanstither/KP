import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { STORAGE_URL } from "@/lib/config";
import {
  Monitor, Cpu, HardDrive, Fan, Battery,
  MemoryStick, ChevronRight, Check, ArrowLeft, X,
  ShoppingBag, LayoutGrid, Plus, Minus, AlertCircle, AlertTriangle,
  Sun, Moon
} from "lucide-react";

// 🔹 Порядок сортировки категорий (Мат. плата всегда первая)
const CATEGORY_ORDER = ['motherboard', 'cpu', 'gpu', 'ram', 'storage', 'psu', 'cooler'];

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

// 🔹 Глобальная функция переключения темы
const toggleGlobalTheme = () => {
  const html = document.documentElement;
  const isDark = !html.classList.contains('dark');
  
  if (isDark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
  
  return isDark;
};

// 🔹 Получение текущей темы
const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return true; // по умолчанию тёмная
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
      if (spec.tdp_watts) specs.push(`TDP: ${spec.tdp_watts}W`);
      break;
    case 'gpu':
      if (spec.vram_gb) specs.push(`${spec.vram_gb} GB`);
      if (spec.vram_type_id) specs.push(`VRAM: ${spec.vram_type_id}`);
      if (spec.memory_bus_bit) specs.push(`${spec.memory_bus_bit}-bit`);
      if (spec.tdp_watts) specs.push(`TDP: ${spec.tdp_watts}W`);
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
      break;
    case 'cooler':
      if (spec.type) specs.push(spec.type);
      if (spec.tdp_rating_watts) specs.push(`${spec.tdp_rating_watts}W`);
      break;
    case 'storage':
      if (spec.type) specs.push(`Тип: ${spec.type}`);
      if (spec.capacity_gb) specs.push(`${spec.capacity_gb} GB`);
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
  
  // build хранит: { categoryId: { item: Object, quantity: Number } }
  // Для накопителей используем отдельные ключи: build.nvme и build.sata
  const [build, setBuild] = useState({});
  const [limits, setLimits] = useState({ ram: 2, nvme: 1, sata: 4 });
  const [activeStorageType, setActiveStorageType] = useState('nvme');
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Загрузка данных и Авто-выбор компонентов
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

        catsList.sort((a, b) => CATEGORY_ORDER.indexOf(a.id) - CATEGORY_ORDER.indexOf(b.id));
        setCategories(catsList);
        setProducts(grouped);

        // 🔹 Выбираем корпус
        const initialCase = grouped.case?.[0];
        if (initialCase) setSelectedCase(initialCase);

        // 🔹 Выбираем материнскую плату (первую совместимую)
        const mbs = grouped.motherboard || [];
        let compatibleMb = null;
        const caseFormFactors = initialCase?.supported_form_factors?.map(f => f.id) || [];

        for (const mb of mbs) {
          const mbFormFactor = mb.motherboard_spec?.form_factor_id;
          // Если ограничений нет или форм-фактор совпадает
          if (caseFormFactors.length === 0 || caseFormFactors.includes(mbFormFactor)) {
            compatibleMb = mb;
            break;
          }
        }

        if (compatibleMb) {
          setBuild(prev => ({
            ...prev,
            motherboard: { item: compatibleMb, quantity: 1 }
          }));
          const spec = compatibleMb.motherboard_spec || {};
          setLimits({
            ram: spec.ram_slots || 2,
            nvme: spec.m2_slots || 1,
            sata: spec.sata_ports || 4
          });
        }
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Авто-коррекция ОЗУ при изменении лимитов
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

  // 2. Проверка совместимости
  const checkCompatibility = (catId, item) => {
    const mb = build.motherboard?.item || build.mb?.item;
    const mbSpec = mb?.motherboard_spec || {};
    const cpu = build.cpu?.item;
    const cpuSpec = cpu?.cpu_spec || {};
    
    if (!item) return { status: 'empty', message: 'Не выбрано' };

    // MB ↔ Case (Form Factor)
    if (catId === 'motherboard' && selectedCase?.supported_form_factors) {
      const mbForm = item.motherboard_spec?.form_factor_id;
      const supportedIds = selectedCase.supported_form_factors.map(f => f.id);
      if (!supportedIds.includes(mbForm)) {
        return { status: 'error', message: 'Несовместимый форм-фактор с корпусом' };
      }
    }

    // CPU ↔ MB (Socket)
    if (catId === 'cpu' && mb) {
      if (item.cpu_spec?.socket_id !== mbSpec.socket_id) {
        return { status: 'error', message: `Несовместимый сокет` };
      }
    }

    // RAM ↔ MB (Type)
    if (catId === 'ram' && mb) {
      if (item.ram_spec?.ram_type_id !== mbSpec.ram_type_id) {
        return { status: 'error', message: `Требуется тип ${mbSpec.ram_type_id}` };
      }
    }

    // GPU ↔ Case (Length)
    if (catId === 'gpu' && selectedCase?.case_spec?.max_length_gpu && item.gpu_spec?.length_mm) {
      if (item.gpu_spec.length_mm > selectedCase.case_spec.max_length_gpu) {
        return { status: 'error', message: `Не влезет в корпус` };
      }
    }

    // Cooler ↔ CPU (TDP & Sockets)
    if (catId === 'cooler' && cpu) {
      const tdpDiff = (item.cooler_spec?.tdp_rating_watts || 0) - (cpuSpec.tdp_watts || 0);
      if (tdpDiff < 0) return { status: 'warn', message: `Мало мощности (нужно ≥${cpuSpec.tdp_watts}W)` };
      
      const compatibleSocketIds = item.compatible_sockets?.map(s => s.id) || [];
      if (compatibleSocketIds.length > 0 && !compatibleSocketIds.includes(cpuSpec.socket_id)) {
        return { status: 'error', message: `Не подходит под сокет` };
      }
    }

    // PSU ↔ CPU + GPU (Power Check)
    if (catId === 'psu') {
      const gpu = build.gpu?.item;
      const gpuSpec = gpu?.gpu_spec || {};
      const cpuTdp = cpuSpec.tdp_watts || 0;
      const gpuTdp = gpuSpec.tdp_watts || 0;
      const totalTdp = cpuTdp + gpuTdp;
      const psuWattage = item.psu_spec?.wattage || 0;
      
      if (totalTdp > 0 && psuWattage > 0) {
        if (psuWattage < totalTdp) {
          return { status: 'error', message: `Недостаточно мощности (нужно ≥${totalTdp}W)` };
        }
        // Предупреждение, если запас меньше 20%
        const margin = ((psuWattage - totalTdp) / totalTdp) * 100;
        if (margin < 20) {
          return { status: 'warn', message: `Малый запас мощности (рекомендуется ≥${Math.ceil(totalTdp * 1.2)}W)` };
        }
      }
    }

    return { status: 'ok', message: 'Совместимо' };
  };

  const selectComponent = (catId, item) => {
    const compat = checkCompatibility(catId, item);
    if (compat.status === 'error') return; // Блокируем выбор
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

  const getSortedProducts = (catId) => {
    const items = products[catId] || [];
    return [...items].sort((a, b) => {
      const compatA = checkCompatibility(catId, a);
      const compatB = checkCompatibility(catId, b);
      if (compatA.status === 'error' && compatB.status !== 'error') return 1;
      if (compatB.status === 'error' && compatA.status !== 'error') return -1;
      return 0;
    });
  };

  // 1. Объяви состояние (сразу после других useState)
  const [isDark, setIsDark] = useState(getInitialTheme); // true = тёмная тема по умолчанию
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [user, setUser] = useState(null); // Состояние пользователя

  // Проверка авторизации при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Если токен есть, считаем пользователя авторизованным
      // В реальном приложении здесь можно сделать запрос /me для получения данных
      setUser({ isAuth: true });
    } else {
      setUser({ isAuth: false });
    }
  }, []);

  // Функция переключения темы (локальная + глобальная синхронизация)
  const toggleTheme = () => {
    const newIsDark = toggleGlobalTheme();
    setIsDark(newIsDark);
  };

  // Функция добавления сборки в корзину
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      // Собираем ID всех выбранных компонентов
      const componentIds = [];
      
      // Добавляем корпус
      if (selectedCase?.id) {
        componentIds.push(selectedCase.id);
      }
      
      // Добавляем остальные компоненты из build
      Object.values(build).forEach(({ item, quantity }) => {
        if (item?.id) {
          for (let i = 0; i < quantity; i++) {
            componentIds.push(item.id);
          }
        }
      });
      
      if (componentIds.length === 0) {
        alert('Сборка пуста');
        setIsAddingToCart(false);
        return;
      }
      
      // Генерируем имя сборки
      const cpuModel = build.cpu?.item?.model || 'Без CPU';
      const gpuModel = build.gpu?.item?.model || 'Без GPU';
      const buildName = `Сборка: ${cpuModel} + ${gpuModel}`;
      
      const payload = {
        type: 'custom',
        name: buildName,
        components: componentIds
      };

      // Отправляем на сервер (теперь доступно и для гостей)
      // Session-ID добавляется автоматически через interceptor в api.js
      const response = await api.post('/cart', payload);
      
      alert('Сборка успешно добавлена в корзину!');
      navigate('/cart'); // Переход в корзину
      
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      alert(error.response?.data?.message || 'Не удалось добавить сборку в корзину');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 2. Эффект переключения класса на <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // 3. Восстановление темы при перезагрузке
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') setIsDark(false);
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0f0f10] text-gray-400">Загрузка...</div>;

  const allCases = products.case || [];

  return (
    <div className="flex w-full h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 overflow-hidden select-none">
      
      {/* 🔵 ЛЕВАЯ ПАНЕЛЬ: Статус конфигурации */}
      <div className="w-[360px] flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#141416] z-40 relative shadow-lg dark:shadow-none">
        <div className="p-5 border-b border-gray-200 dark:border-white/10">
          <h2 className="font-bold text-gray-900 dark:!text-white text-lg mb-1">Статус сборки</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Проверка совместимости</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
          {/* 🔹 ПУНКТ 1: КОРПУС */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Корпус</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 ml-3"></div>
            </div>
            <div className={`pl-2 border-l-2 transition-colors ${selectedCase ? 'border-green-500/50 bg-green-50 dark:bg-green-500/5' : 'border-gray-300 dark:border-gray-600/30 bg-gray-100 dark:bg-gray-800/20'} rounded-r-lg p-2`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium truncate max-w-[200px] ${selectedCase ? 'text-green-700 dark:text-green-300' : 'text-gray-400 dark:text-gray-500'}`}>
                  {selectedCase ? selectedCase.model : '—'}
                </span>
                {selectedCase ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <span className="text-gray-400 dark:text-gray-600 text-xs">Ожидание</span>}
              </div>
            </div>
          </div>

          {/* 🔹 ОСТАЛЬНЫЕ КОМПОНЕНТЫ */}
          {categories.map(cat => {
            // 🔹 СПЕЦИАЛЬНЫЙ РЕНДЕР ДЛЯ НАКОПИТЕЛЕЙ (NVMe + SATA)
            if (cat.id === 'storage') {
              const nvmeItem = build.nvme?.item;
              const sataItem = build.sata?.item;
              const nvmeQty = build.nvme?.quantity || 0;
              const sataQty = build.sata?.quantity || 0;
              const isPicked = nvmeItem || sataItem;

              return (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">{cat.name}</span>
                    <div className="h-px flex-1 bg-white/10 ml-3"></div>
                  </div>

                  {/* Строка NVMe */}
                  {nvmeItem && (
                    <div className="pl-2 border-l-2 border-green-500/50 bg-green-500/5 rounded-r-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-mono flex-shrink-0">NVMe</span>
                          <span className="text-xs font-medium truncate max-w-[160px] text-green-300">{nvmeItem.model}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {nvmeQty > 1 && <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 rounded">x{nvmeQty}</span>}
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Строка SATA */}
                  {sataItem && (
                    <div className="pl-2 border-l-2 border-green-500/50 bg-green-500/5 rounded-r-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-mono flex-shrink-0">SATA</span>
                          <span className="text-xs font-medium truncate max-w-[160px] text-green-300">{sataItem.model}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {sataQty > 1 && <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 rounded">x{sataQty}</span>}
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isPicked && (
                     <div className="pl-2 border-l-2 border-gray-600/30 bg-gray-800/20 rounded-r-lg p-2">
                       <span className="text-xs text-gray-500">Ожидание выбора</span>
                     </div>
                  )}
                </div>
              );
            }

            // 🔹 СТАНДАРТНЫЙ РЕНДЕР (CPU, GPU, RAM...)
            const selectedItem = build[cat.id]?.item;
            const qty = build[cat.id]?.quantity || 0;
            const { status, message } = selectedItem ? checkCompatibility(cat.id, selectedItem) : { status: 'empty', message: 'Не выбрано' };
            const isWarn = status === 'warn';
            const isError = status === 'error';
            const isEmpty = status === 'empty';

            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">{cat.name}</span>
                  <div className="h-px flex-1 bg-white/10 ml-3"></div>
                </div>
                
                <div className={`pl-2 border-l-2 transition-colors ${
                  isError ? 'border-red-500/50 bg-red-500/5' : 
                  isWarn ? 'border-orange-500/50 bg-orange-500/5' : 
                  isEmpty ? 'border-gray-600/30 bg-gray-800/20' : 
                  'border-green-500/50 bg-green-500/5'
                } rounded-r-lg p-2`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`text-xs font-medium truncate ${
                        isError ? 'text-red-400' : isWarn ? 'text-orange-300' : isEmpty ? 'text-gray-500' : 'text-green-300'
                      }`}>
                        {selectedItem ? selectedItem.model : '—'}
                      </span>
                      {qty > 1 && (
                        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 rounded flex-shrink-0">
                          x{qty}
                        </span>
                      )}
                    </div>

                    {status === 'ok' && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                    {isWarn && <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                    {isError && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    {isEmpty && <span className="text-gray-600 text-xs flex-shrink-0">Ожидание</span>}
                  </div>
                  {(isWarn || isError) && (
                    <p className={`text-[10px] mt-1 ${isError ? 'text-red-400/80' : 'text-orange-300/80'}`}>
                      {message}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#141416] space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Итого:</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{Number(totalPrice).toLocaleString('ru-RU')} ₽</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/20 ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAddingToCart ? (
              <>
                <span className="animate-spin">⏳</span> Добавление...
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" /> Добавить в корзину
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🔵 ОСНОВНАЯ ОБЛАСТЬ */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Хедер с кнопками */}
        <header className="absolute top-6 left-0 right-72 z-50 flex justify-center pointer-events-none">
          <div className="flex gap-3 pointer-events-auto">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#141416] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:border-purple-500/50 rounded-full shadow-lg backdrop-blur-md transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Обратно
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setIsCaseSelectorOpen(!isCaseSelectorOpen); setSelectedCategory(null); }} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#141416] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:border-purple-500/50 rounded-full shadow-lg backdrop-blur-md transition-colors text-sm font-medium">
              <LayoutGrid className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Сменить&nbsp;корпус
            </motion.button>
            <div className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full shadow-lg shadow-purple-500/60 dark:shadow-purple-500/20 transition-colors duration-300 text-sm font-bold text-white">
              <ShoppingBag className="w-4 h-4" /> Конфигурация
            </div>
            <motion.button 
              onClick={toggleTheme} 
              className="cursor-pointer flex aspect-square items-center justify-center p-2.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141416] hover:border-purple-400 shadow-lg backdrop-blur-md transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </motion.button>
          </div>
        </header>

        {/* Центральная картинка корпуса */}
        <main className="flex-1 flex items-center justify-center relative z-0 pr-[320px] transition-all duration-300">
          <div className="relative w-full max-w-3xl aspect-video flex items-center justify-center">
            <motion.img 
              key={selectedCase?.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              src={`${STORAGE_URL}/${selectedCase?.image}` || "/placeholder.svg"} alt={selectedCase?.model}
              onError={(e) => { e.target.src = "/placeholder.svg"; }}
              className="h-[600px] aspect-[1/1] object-cover drop-shadow-2xl rounded-2xl"
            />
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-black/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-lg flex flex-col items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-widest">{selectedCase?.model || "Корпус не выбран"}</span>
            </div>
          </div>
        </main>

        {/* Модалка выбора корпусов */}
        <AnimatePresence>
          {isCaseSelectorOpen && (
            <motion.div initial={{ y: 420, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 420, opacity: 0 }} transition={{ type: "spring", damping: 25 }} className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#141416] border-t border-gray-200 dark:border-white/10 z-40 min-h-[420px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Выберите корпус</h3>
                  <button onClick={() => setIsCaseSelectorOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {allCases.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCase(c); setIsCaseSelectorOpen(false); }} className={`relative flex flex-col p-4 rounded-xl border transition-all text-left group ${selectedCase?.id === c.id ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/50" : "bg-gray-50 dark:bg-[#0a0a0c] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-[#111114]"}`}>
                      <div className="bg-gray-200 dark:bg-[#050505] rounded-lg mb-3 flex items-center justify-center overflow-hidden flex-shrink-0 aspect-video">
                        <img src={`${STORAGE_URL}/${c.image}` || "/placeholder.svg"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => { e.target.src = "/placeholder.svg"; }} />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">{c.model}</p>
                      <p className="text-purple-600 dark:text-purple-300 text-xs font-mono mt-1">{Number(c.price).toLocaleString('ru-RU')} ₽</p>
                      {selectedCase?.id === c.id && <div className="absolute top-3 right-3 bg-purple-500 rounded-full p-1.5 shadow-lg"><Check className="w-3 h-3 text-white" /></div>}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔵 ПРАВАЯ ПАНЕЛЬ: Выбор компонентов */}
        <motion.aside animate={{ width: selectedCategory ? 660 : 320 }} transition={{ type: "spring", stiffness: 120, damping: 22 }} className="absolute top-0 right-0 h-full bg-white dark:bg-[#141416] border-l border-gray-200 dark:border-white/10 z-40 flex overflow-hidden shadow-2xl dark:shadow-none">
          {/* Левая часть правой панели: Список категорий */}
          <div className="w-[320px] flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#141416]">
            <div className="p-4 h-16 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white text-sm">Комплектующие</span>
              {Object.keys(build).length > 0 && <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-0.5 rounded-full">{Object.keys(build).length} выбр.</span>}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                const isPicked = !!build[cat.id]?.item || (cat.id === 'storage' && (build.nvme?.item || build.sata?.item));
                const selectedItem = build[cat.id]?.item;
                const qty = build[cat.id]?.quantity;
                
                return (
                  <button 
                    key={cat.id} 
                    onClick={() => {
                       setSelectedCategory(isSelected ? null : cat.id);
                       if (cat.id === 'storage') setActiveStorageType(build.nvme?.item ? 'nvme' : 'sata');
                    }} 
                    className={`w-full flex flex-col items-start p-3 rounded-xl border transition-all group cursor-pointer ${
                      isSelected ? "bg-purple-600/10 border-purple-500/40" : 
                      isPicked ? "bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/10" : 
                      "bg-gray-50 dark:bg-[#0a0a0c] border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-[#1a1a1d] hover:border-gray-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isPicked ? 'bg-purple-500/20 text-purple-600 dark:bg-white/10 dark:text-white' : isSelected ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300' : 'bg-gray-100 dark:bg-white/5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                          {cat.icon}
                        </div>
                        <span className={`text-sm font-medium ${isPicked ? 'text-gray-900 dark:text-white' : isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'}`}>
                          {cat.name}
                        </span>
                      </div>
                      {isPicked ? <Check className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-purple-500 dark:text-purple-400' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`} />}
                    </div>
                    
                    {cat.id === 'storage' ? (
                      <div className="flex flex-col gap-1 mt-1 ml-11 w-full">
                        {build.nvme?.item && <span className="text-xs text-gray-700 dark:text-gray-300 truncate">NVMe: {build.nvme.item.model}</span>}
                        {build.sata?.item && <span className="text-xs text-gray-700 dark:text-gray-300 truncate">SATA: {build.sata.item.model}</span>}
                      </div>
                    ) : (
                      isPicked && selectedItem && (
                        <div className="flex items-center justify-between w-full mt-1 ml-11">
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{selectedItem.model}</span>
                          {qty > 1 && <span className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-1.5 rounded">x{qty}</span>}
                        </div>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Правая часть правой панели: Список товаров */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 120, damping: 22 }} className="flex-shrink-0 overflow-hidden bg-gray-50 dark:bg-[#0f0f10]">
                <div className="w-[340px] h-full flex flex-col">
                  <div className="p-4 h-16 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#141416]">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{categories.find(c => c.id === selectedCategory)?.name}</span>
                    </div>
                    <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400"><X className="w-4 h-4" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 dark:bg-transparent bg-gray-100 dark:bg-gray-700/80">
                    {selectedCategory === 'storage' ? (
                      (() => {
                        const sortedItems = getSortedProducts('storage');
                        const nvmeItems = sortedItems.filter(i => i.storage_spec?.type === 'nvme');
                        const sataItems = sortedItems.filter(i => i.storage_spec?.type === 'sata');
                        const isNvmeActive = activeStorageType === 'nvme';
                        const isSataActive = activeStorageType === 'sata';

                        const renderDiskCard = (item, type) => {
                          const compat = checkCompatibility(type, item);
                          const isDisabled = compat.status === 'error';
                          const isSelected = build[type]?.item?.id === item.id;
                          const currentQty = build[type]?.quantity || 0;
                          const limit = type === 'nvme' ? limits.nvme : limits.sata;
                          const specsString = formatSpecs(item, 'storage');

                          return (
                            <div key={item.id} className="relative group">
                              <div
                                onClick={() => { if (!isDisabled && !isSelected) selectComponent(type, item); }}
                                className={`w-full p-3 rounded-xl border text-left transition-all relative ${
                                  isDisabled ? "opacity-40 cursor-not-allowed grayscale" :
                                  isSelected ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/30 cursor-pointer" :
                                  "bg-white dark:bg-[#141416] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#1a1a1d] cursor-pointer"
                                }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`text-sm font-semibold ${isSelected ? 'text-purple-600 dark:text-purple-300' : isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>{item.model}</span>
                                  <span className={`text-xs font-mono ${isDisabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>{Number(item.price).toLocaleString('ru-RU')} ₽</span>
                                </div>
                                {specsString && <div className={`text-[10px] mb-2 line-clamp-2 ${isDisabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>{specsString}</div>}
                                {isSelected && !isDisabled && (
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Кол-во:</span>
                                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#0a0a0c] rounded-lg p-1">
                                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(type, -1); }} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30" disabled={currentQty <= 1}><Minus className="w-3 h-3" /></button>
                                      <span className="text-xs font-mono w-4 text-center text-gray-900 dark:text-white">{currentQty}</span>
                                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(type, 1); }} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30" disabled={currentQty >= limit}><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Макс: {limit}</span>
                                  </div>
                                )}
                              </div>
                              {isDisabled && (
                                <div className="absolute inset-x-0 bottom-full mb-2 mx-4 hidden group-hover:block z-50 pointer-events-none">
                                  <div className="bg-red-900/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-red-500/30">
                                    {compat.message}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        };

                        return (
                          <>
                            <button onClick={() => setActiveStorageType('nvme')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all ${isNvmeActive ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30' : 'bg-gray-100 dark:bg-[#0a0a0c] text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 border border-transparent'}`}>
                              <span>NVMe SSD (M.2)</span>
                              <span className="text-xs font-mono opacity-70">{build.nvme?.quantity || 0} / {limits.nvme}</span>
                            </button>
                            {isNvmeActive && nvmeItems.length > 0 && <div className="space-y-2 mt-2 mb-4 pl-2 border-l-2 border-purple-500/30">{nvmeItems.map(item => renderDiskCard(item, 'nvme'))}</div>}

                            <button onClick={() => setActiveStorageType('sata')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all ${isSataActive ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30' : 'bg-gray-100 dark:bg-[#0a0a0c] text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 border border-transparent'}`}>
                              <span>SATA SSD / HDD</span>
                              <span className="text-xs font-mono opacity-70">{build.sata?.quantity || 0} / {limits.sata}</span>
                            </button>
                            {isSataActive && sataItems.length > 0 && <div className="space-y-2 mt-2 mb-4 pl-2 border-l-2 border-purple-500/30">{sataItems.map(item => renderDiskCard(item, 'sata'))}</div>}
                          </>
                        );
                      })()
                    ) : selectedCategory === 'ram' ? (
                      getSortedProducts('ram').map(item => {
                        const compat = checkCompatibility('ram', item);
                        const isDisabled = compat.status === 'error';
                        const isSelected = build['ram']?.item?.id === item.id;
                        const currentQty = build['ram']?.quantity || 1;
                        const specsString = formatSpecs(item, 'ram');
                        const maxQty = Math.floor(limits.ram / (item.ram_spec?.modules_count || 1));

                        return (
                          <div key={item.id} className="relative group">
                            <div
                              onClick={() => { if (!isDisabled) selectComponent('ram', item); }}
                              className={`w-full p-3 rounded-xl border text-left transition-all relative ${
                                isDisabled ? "opacity-40 cursor-not-allowed grayscale" :
                                isSelected ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/30 cursor-pointer" :
                                "bg-white dark:bg-[#141416] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#1a1a1d] cursor-pointer"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-semibold ${isSelected ? 'text-purple-600 dark:text-purple-300' : isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>{item.model}</span>
                                <span className={`text-xs font-mono ${isDisabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>{Number(item.price).toLocaleString('ru-RU')} ₽</span>
                              </div>
                              {specsString && <div className={`text-[10px] mb-2 line-clamp-2 ${isDisabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>{specsString}</div>}
                              {isSelected && !isDisabled && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Кол-во:</span>
                                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#0a0a0c] rounded-lg p-1">
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity('ram', -1); }} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30" disabled={currentQty <= 1}><Minus className="w-3 h-3" /></button>
                                    <span className="text-xs font-mono w-4 text-center text-gray-900 dark:text-white">{currentQty}</span>
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity('ram', 1); }} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30" disabled={currentQty >= maxQty}><Plus className="w-3 h-3" /></button>
                                  </div>
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Макс: {maxQty}</span>
                                </div>
                              )}
                            </div>
                            {isDisabled && (
                              <div className="absolute inset-x-0 bottom-full mb-2 mx-4 hidden group-hover:block z-50 pointer-events-none">
                                <div className="bg-red-900/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-red-500/30">
                                  {compat.message}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      getSortedProducts(selectedCategory).map(item => {
                        const compat = checkCompatibility(selectedCategory, item);
                        const isDisabled = compat.status === 'error';
                        const isSelected = build[selectedCategory]?.item?.id === item.id;
                        const specsString = formatSpecs(item, selectedCategory);

                        return (
                          <div key={item.id} className="relative group">
                            <div
                              onClick={() => { if (!isDisabled) selectComponent(selectedCategory, item); }}
                              className={`w-full p-3 rounded-xl border text-left transition-all relative ${
                                isDisabled ? "opacity-40 cursor-not-allowed grayscale" :
                                isSelected ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/30 cursor-pointer" :
                                "bg-white dark:bg-[#141416] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#1a1a1d] cursor-pointer"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-semibold ${isSelected ? 'text-purple-600 dark:text-purple-300' : isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>{item.model}</span>
                                <span className={`text-xs font-mono ${isDisabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>{Number(item.price).toLocaleString('ru-RU')} ₽</span>
                              </div>
                              {specsString && <div className={`text-[10px] mb-1 line-clamp-2 ${isDisabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>{specsString}</div>}
                              {isSelected && !isDisabled && (
                                <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1 shadow-lg">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            {isDisabled && (
                              <div className="absolute inset-x-0 bottom-full mb-2 mx-4 hidden group-hover:block z-50 pointer-events-none">
                                <div className="bg-red-900/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-red-500/30">
                                  {compat.message}
                                </div>
                              </div>
                            )}
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
    </div>
  );
}