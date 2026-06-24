import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, aspectRatio } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/services/api";
import { useToast } from '@/context/ToastContext';
import { parseApiError } from '@/lib/parseApiError';
import { STORAGE_URL } from "@/lib/config";
import {
  Monitor, Cpu, HardDrive, Fan, Battery,
  MemoryStick, ChevronRight, Check, ArrowLeft, X,
  ShoppingBag, LayoutGrid, Plus, Minus, AlertCircle, AlertTriangle,
  Sun, Moon, Loader2
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
      if (spec.socket?.name) specs.push(`Сокет: ${spec.socket.name}`);
      else if (spec.socket_id) specs.push(`Сокет: ${spec.socket_id}`);
      if (spec.form_factor?.name) specs.push(`Форм-фактор: ${spec.form_factor.name}`);
      else if (spec.form_factor_id) specs.push(`Форм-фактор: ${spec.form_factor_id}`);
      if (spec.ram_type?.name) specs.push(`Поддерживаемая ОЗУ: ${spec.ram_type.name}`);
      else if (spec.ram_type_id) specs.push(`Поддерживаемая ОЗУ: ${spec.ram_type_id}`);
      if (spec.ram_slots) specs.push(`Слотов ОЗУ: ${spec.ram_slots}`);
      if (spec.m2_slots) specs.push(`M.2 слотов: ${spec.m2_slots}`);
      if (spec.sata_ports) specs.push(`SATA портов: ${spec.sata_ports}`);
      break;
    case 'cpu':
      if (spec.cores) specs.push(`${spec.cores} ядер`);
      if (spec.base_clock_mhz) specs.push(`${(spec.base_clock_mhz / 1000).toFixed(1)} GHz`);
      if (spec.socket?.name) specs.push(`Socket: ${spec.socket.name}`);
      else if (spec.socket_id) specs.push(`Socket: ${spec.socket_id}`);
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
      if (spec.ram_type?.name) specs.push(spec.ram_type.name);
      else if (spec.ram_type_id) specs.push(spec.ram_type_id);
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

const getCaseFormFactorsLabel = (caseItem) => {
  const factors = caseItem?.supported_form_factors;
  if (Array.isArray(factors) && factors.length > 0) {
    return factors.map(f => f.name).join(', ');
  }
  return '—';
};

const getCaseMaxGpuLabel = (caseItem) => {
  const maxLength = caseItem?.case_spec?.max_length_gpu;
  return maxLength ? `${maxLength} мм` : '—';
};

const findComponentInGrouped = (grouped, componentId) => {
  for (const list of Object.values(grouped)) {
    const found = list.find((c) => c.id === componentId);
    if (found) return found;
  }
  return null;
};

/** Восстанавливает состояние конфигуратора из элемента корзины */
const applyCartItemToBuild = (cartItem, grouped) => {
  const newBuild = {};
  let caseItem = null;
  let limitsFromMb = null;

  for (const cic of cartItem.components || []) {
    const compId = cic.component_id ?? cic.component?.id;
    const qty = cic.quantity || 1;
    const slug = cic.role || cic.component?.category?.slug;
    if (!compId || !slug) continue;

    const fullComp = findComponentInGrouped(grouped, compId);
    if (!fullComp) continue;

    if (slug === 'case') {
      caseItem = fullComp;
      continue;
    }

    if (slug === 'storage') {
      const storageType = fullComp.storage_spec?.type;
      const key = storageType === 'sata' ? 'sata' : 'nvme';
      if (!newBuild[key]) {
        newBuild[key] = { item: fullComp, quantity: qty };
      }
      continue;
    }

    const catKey = slug === 'motherboard' ? 'motherboard' : slug;
    newBuild[catKey] = { item: fullComp, quantity: qty };

    if (slug === 'motherboard') {
      const spec = fullComp.motherboard_spec || {};
      limitsFromMb = {
        ram: spec.ram_slots || 2,
        nvme: spec.m2_slots || 1,
        sata: spec.sata_ports || 4,
      };
    }
  }

  return { caseItem, build: newBuild, limits: limitsFromMb };
};

export default function ConfiguratorPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
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

  // 1. Загрузка данных и восстановление сборки из корзины (?edit=)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const editCartItemId = searchParams.get('edit');
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

        if (editCartItemId) {
          try {
            let cartItem;
            try {
              const cartRes = await api.get(`/cart/${editCartItemId}`);
              cartItem = cartRes.data;
            } catch {
              const cartRes = await api.get('/cart');
              cartItem = cartRes.data?.items?.find(
                (i) => String(i.id) === String(editCartItemId)
              );
            }

            if (cartItem?.type === 'custom') {
              const { caseItem, build: restoredBuild, limits: restoredLimits } =
                applyCartItemToBuild(cartItem, grouped);

              if (caseItem) setSelectedCase(caseItem);
              if (Object.keys(restoredBuild).length > 0) setBuild(restoredBuild);
              if (restoredLimits) setLimits(restoredLimits);
              if (restoredBuild.nvme?.item) setActiveStorageType('nvme');
              else if (restoredBuild.sata?.item) setActiveStorageType('sata');
              return;
            }
          } catch (err) {
            console.error('Ошибка загрузки сборки для редактирования:', err);
            toast.error('Не удалось загрузить сборку для редактирования');
          }
        }

        // 🔹 Выбираем корпус по умолчанию
        const initialCase = grouped.case?.[0];
        if (initialCase) setSelectedCase(initialCase);

        // 🔹 Выбираем материнскую плату (первую совместимую)
        const mbs = grouped.motherboard || [];
        let compatibleMb = null;
        const caseFormFactors = initialCase?.supported_form_factors?.map(f => f.id) || [];

        for (const mb of mbs) {
          const mbFormFactor = mb.motherboard_spec?.form_factor_id;
          if (caseFormFactors.length === 0 || caseFormFactors.includes(mbFormFactor)) {
            compatibleMb = mb;
            break;
          }
        }

        if (compatibleMb) {
          setBuild({ motherboard: { item: compatibleMb, quantity: 1 } });
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
  }, [searchParams]);

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

    // CPU ↔ MB (Socket) — при проверке материнской платы
    if (catId === 'motherboard' && cpu) {
      if (item.motherboard_spec?.socket_id !== cpuSpec.socket_id) {
        return { status: 'error', message: 'Несовместимый сокет с процессором' };
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
        const requiredRamTypeName = mb.motherboard_spec?.ram_type?.name || `тип ${mbSpec.ram_type_id}`;
        return { status: 'error', message: `Требуется тип ${requiredRamTypeName}` };
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

  const getBuildCompatibilityIssues = () => {
    const issues = [];
    categories.forEach((cat) => {
      if (cat.id === 'storage') return;
      const selectedItem = build[cat.id]?.item;
      if (!selectedItem) return;
      const { status, message } = checkCompatibility(cat.id, selectedItem);
      if (status === 'warn' || status === 'error') {
        issues.push({ category: cat.name, status, message, model: selectedItem.model });
      }
    });
    return issues;
  };

  const selectComponent = (catId, item) => {
    const compat = checkCompatibility(catId, item);
    if (compat.status === 'error') return;
    setIsCaseSelectorOpen(false);
    setBuild(prev => ({ ...prev, [catId]: { item, quantity: 1 } }));
  };

  const openCategory = (catId) => {
    setIsCaseSelectorOpen(false);
    setSelectedCategory(prev => {
      const isSelected = prev === catId;
      if (!isSelected && catId === 'storage') {
        setActiveStorageType(build.nvme?.item ? 'nvme' : 'sata');
      }
      return isSelected ? null : catId;
    });
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
  const [showCompatWarning, setShowCompatWarning] = useState(false);
  const [compatIssues, setCompatIssues] = useState([]);
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
  const handleAddToCart = async (options = {}) => {
    const skipCompatWarning = options.skipCompatWarning === true;
    const issues = getBuildCompatibilityIssues();
    if (!skipCompatWarning && issues.length > 0) {
      setCompatIssues(issues);
      setShowCompatWarning(true);
      return;
    }

    setIsAddingToCart(true);
    try {
      // Проверяем, редактируем ли мы существующую сборку
      const editCartItemId = searchParams.get('edit');
      
      // Собираем ID всех выбранных компонентов
      const componentIds = [];
      
      // Добавляем корпус
      if (selectedCase?.id) {
        componentIds.push(selectedCase.id);
      }
      
      // Добавляем остальные компоненты из build с учетом количества
      Object.values(build).forEach(({ item, quantity }) => {
        if (item?.id) {
          for (let i = 0; i < quantity; i++) {
            componentIds.push(item.id);
          }
        }
      });
      
      if (componentIds.length === 0) {
        toast.warning('Сборка пуста');
        setIsAddingToCart(false);
        return;
      }
      
      // Генерируем имя сборки
      const cpuModel = build.cpu?.item?.model || 'Без CPU';
      const gpuModel = build.gpu?.item?.model || 'Без GPU';
      const buildName = `Сборка: ${cpuModel} + ${gpuModel}`;
      
      if (editCartItemId) {
        // Обновляем существующую сборку в корзине
        // Формируем payload с количеством для каждого компонента
        const componentsPayload = [];
        
        // Добавляем корпус (quantity: 1)
        if (selectedCase?.id) {
          componentsPayload.push({ id: selectedCase.id, quantity: 1 });
        }
        
        // Добавляем остальные компоненты с их количеством
        Object.values(build).forEach(({ item, quantity }) => {
          if (item?.id) {
            componentsPayload.push({ id: item.id, quantity: quantity || 1 });
          }
        });
        
        const payload = {
          components: componentsPayload,
          name: buildName
        };
        
        await api.put(`/cart/${editCartItemId}`, payload);
        toast.success('Сборка успешно обновлена');
        navigate('/cart');
      } else {
        // Создаем новую сборку в корзине
        // Формируем payload с количеством для каждого компонента
        const componentsPayload = [];
        
        // Добавляем корпус (quantity: 1)
        if (selectedCase?.id) {
          componentsPayload.push({ id: selectedCase.id, quantity: 1 });
        }
        
        // Добавляем остальные компоненты с их количеством
        Object.values(build).forEach(({ item, quantity }) => {
          if (item?.id) {
            componentsPayload.push({ id: item.id, quantity: quantity || 1 });
          }
        });
        
        const payload = {
          type: 'custom',
          name: buildName,
          components: componentsPayload
        };

        // Отправляем на сервер (теперь доступно и для гостей)
        // Session-ID добавляется автоматически через interceptor в api.js
        const response = await api.post('/cart', payload);
        
        toast.success('Сборка успешно добавлена в корзину');
        navigate('/cart');
      }
      
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      toast.error(parseApiError(error));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const confirmAddDespiteWarnings = () => {
    setShowCompatWarning(false);
    handleAddToCart({ skipCompatWarning: true });
  };

  // Определяем, находимся ли мы в режиме редактирования
  const isEditingMode = !!searchParams.get('edit');

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
  const rightPanelWidth = selectedCategory ? 660 : 320;

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
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{cat.name}</span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 ml-3"></div>
                  </div>

                  {/* Строка NVMe */}
                  {nvmeItem && (
                    <div className="pl-2 border-l-2 border-green-500/50 bg-green-50 dark:bg-green-500/5 rounded-r-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-mono flex-shrink-0">NVMe</span>
                          <span className="text-xs font-medium truncate max-w-[160px] text-green-700 dark:text-green-300">{nvmeItem.model}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {nvmeQty > 1 && <span className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-1.5 rounded">x{nvmeQty}</span>}
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Строка SATA */}
                  {sataItem && (
                    <div className="pl-2 border-l-2 border-green-500/50 bg-green-50 dark:bg-green-500/5 rounded-r-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-mono flex-shrink-0">SATA</span>
                          <span className="text-xs font-medium truncate max-w-[160px] text-green-700 dark:text-green-300">{sataItem.model}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {sataQty > 1 && <span className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-1.5 rounded">x{sataQty}</span>}
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isPicked && (
                     <div className="pl-2 border-l-2 border-gray-300 dark:border-gray-600/30 bg-gray-100 dark:bg-gray-800/20 rounded-r-lg p-2">
                       <span className="text-xs text-gray-400 dark:text-gray-500">Ожидание выбора</span>
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
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{cat.name}</span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 ml-3"></div>
                </div>
                
                <div className={`pl-2 border-l-2 transition-colors ${
                  isError ? 'border-red-500/50 bg-red-50 dark:bg-red-500/5' : 
                  isWarn ? 'border-orange-500/50 bg-orange-50 dark:bg-orange-500/5' : 
                  isEmpty ? 'border-gray-300 dark:border-gray-600/30 bg-gray-100 dark:bg-gray-800/20' : 
                  'border-green-500/50 bg-green-50 dark:bg-green-500/5'
                } rounded-r-lg p-2`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`text-xs font-medium truncate ${
                        isError ? 'text-red-600 dark:text-red-400' : isWarn ? 'text-orange-600 dark:text-orange-300' : isEmpty ? 'text-gray-400 dark:text-gray-500' : 'text-green-700 dark:text-green-300'
                      }`}>
                        {selectedItem ? selectedItem.model : '—'}
                      </span>
                      {qty > 1 && (
                        <span className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-1.5 rounded flex-shrink-0">
                          x{qty}
                        </span>
                      )}
                    </div>

                    {status === 'ok' && <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />}
                    {isWarn && <AlertTriangle className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />}
                    {isError && <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />}
                    {isEmpty && <span className="text-gray-400 dark:text-gray-600 text-xs flex-shrink-0">Ожидание</span>}
                  </div>
                  {(isWarn || isError) && (
                    <p className={`text-[10px] mt-1 ${isError ? 'text-red-600/80 dark:text-red-400/80' : 'text-orange-600/80 dark:text-orange-300/80'}`}>
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
            onClick={() => handleAddToCart()}
            disabled={isAddingToCart}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/20 ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> {isEditingMode ? 'Обновление...' : 'Добавление...'}
              </>
            ) : (
              <>
                {isEditingMode ? (
                  <>
                    <Check className="w-5 h-5" /> Обновить сборку
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Добавить в корзину
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🔵 ОСНОВНАЯ ОБЛАСТЬ */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Хедер с кнопками */}
        <header className="absolute top-6 left-0 right-72 z-10 flex justify-center pointer-events-none">
          <div className="flex gap-3 pointer-events-auto">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#141416] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:border-purple-500/50 rounded-full shadow-lg backdrop-blur-md transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Обратно
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setIsCaseSelectorOpen(!isCaseSelectorOpen); setSelectedCategory(null); }} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#141416] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:border-purple-500/50 rounded-full shadow-lg backdrop-blur-md transition-colors text-sm font-medium">
              <LayoutGrid className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Сменить&nbsp;корпус
            </motion.button>
            {/* <div className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full shadow-lg shadow-purple-500/60 dark:shadow-purple-500/20 transition-colors duration-300 text-sm font-bold text-white">
              <ShoppingBag className="w-4 h-4" /> Конфигурация
            </div> */}
            <motion.button 
              onClick={toggleTheme} 
              className="cursor-pointer px-3 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141416] hover:border-purple-400 shadow-lg backdrop-blur-md transition-colors"
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

        {/* Панель выбора корпусов — одна строка, горизонтальный скролл */}
        <AnimatePresence>
          {isCaseSelectorOpen && (
            <motion.div
              initial={{ y: 280, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 280, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              style={{ right: rightPanelWidth }}
              className="absolute bottom-0 left-0 z-30 bg-white dark:bg-[#141416] border-t border-gray-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.45)] transition-[right] duration-300"
            >
              <div className="h-full flex flex-col px-4 py-3">
                <div className="flex justify-between items-center mb-3 flex-shrink-0">
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Выберите корпус</h3>
                  <button onClick={() => setIsCaseSelectorOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden custom-scrollbar">
                  <div className="flex gap-4 h-full items-stretch pb-1">
                    {allCases.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCase(c); setIsCaseSelectorOpen(false); }}
                        className={`relative flex-shrink-0 w-56 h-full flex flex-col p-3 rounded-xl border transition-all text-left group ${
                          selectedCase?.id === c.id
                            ? "bg-purple-600/10 border-purple-500 ring-1 ring-purple-500/50"
                            : "bg-gray-50 dark:bg-[#0a0a0c] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-[#111114]"
                        }`}
                      >
                        <div className="aspect-square bg-gray-200 dark:bg-[#050505] rounded-lg mb-3 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={`${STORAGE_URL}/${c.image}` || "/placeholder.svg"}
                            alt={c.model}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            onError={(e) => { e.target.src = "/placeholder.svg"; }}
                          />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">{c.model}</p>
                        <div className="mt-2 space-y-1 flex-1">
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                            <span className="text-gray-400 dark:text-gray-500">Форм-фактор: </span>
                            <span className="text-gray-700 dark:text-gray-300">{getCaseFormFactorsLabel(c)}</span>
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="text-gray-400 dark:text-gray-500">Макс. GPU: </span>
                            <span className="text-gray-700 dark:text-gray-300 font-mono">{getCaseMaxGpuLabel(c)}</span>
                          </p>
                        </div>
                        <p className="text-purple-600 dark:text-purple-300 text-xs font-mono font-semibold mt-2">{Number(c.price).toLocaleString('ru-RU')} ₽</p>
                        {selectedCase?.id === c.id && (
                          <div className="absolute top-2.5 right-2.5 bg-purple-500 rounded-full p-1.5 shadow-lg">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
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
                    onClick={() => openCategory(cat.id)} 
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
                      <div className="flex flex-col gap-1 mt-1 text-left w-full">
                        {build.nvme?.item && <span className="text-xs text-gray-500 dark:text-gray-300 truncate">NVMe: {build.nvme.item.model}</span>}
                        {build.sata?.item && <span className="text-xs text-gray-500 dark:text-gray-300 truncate">SATA: {build.sata.item.model}</span>}
                      </div>
                    ) : (
                      isPicked && selectedItem && (
                        <div className="flex items-center justify-between w-full mt-1">
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
                      <button onClick={() => { setIsCaseSelectorOpen(false); setSelectedCategory(null); }} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{categories.find(c => c.id === selectedCategory)?.name}</span>
                    </div>
                    <button onClick={() => { setIsCaseSelectorOpen(false); setSelectedCategory(null); }} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400"><X className="w-4 h-4" /></button>
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
                            <button onClick={() => { setIsCaseSelectorOpen(false); setActiveStorageType('nvme'); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all ${isNvmeActive ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30' : 'bg-gray-100 dark:bg-[#0a0a0c] text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 border border-transparent'}`}>
                              <span>NVMe SSD (M.2)</span>
                              <span className="text-xs font-mono opacity-70">{build.nvme?.quantity || 0} / {limits.nvme}</span>
                            </button>
                            {isNvmeActive && nvmeItems.length > 0 && <div className="space-y-2 mt-2 mb-4 pl-2 border-l-2 border-purple-500/30">{nvmeItems.map(item => renderDiskCard(item, 'nvme'))}</div>}

                            <button onClick={() => { setIsCaseSelectorOpen(false); setActiveStorageType('sata'); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all ${isSataActive ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30' : 'bg-gray-100 dark:bg-[#0a0a0c] text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 border border-transparent'}`}>
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

      <AnimatePresence>
        {showCompatWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowCompatWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Есть проблемы совместимости</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    В сборке обнаружены предупреждения или ошибки. Вы уверены, что хотите {isEditingMode ? 'обновить' : 'добавить'} её в корзину?
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-6 max-h-48 overflow-y-auto custom-scrollbar">
                {compatIssues.map((issue, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 p-3 rounded-lg text-sm border ${
                      issue.status === 'error'
                        ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300'
                        : 'bg-orange-50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    {issue.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{issue.category}: {issue.model}</p>
                      <p className="text-xs opacity-80 mt-0.5">{issue.message}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCompatWarning(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={confirmAddDespiteWarnings}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-medium transition-opacity"
                >
                  {isEditingMode ? 'Всё равно обновить' : 'Всё равно добавить'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}