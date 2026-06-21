import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Cpu, Monitor, Zap, HardDrive, Thermometer,
  ChevronDown, X, Info,
} from "lucide-react";

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

const COMPONENT_ORDER = ["cpu", "gpu", "ram", "motherboard", "storage", "psu", "cooler", "case"];

function formatSpecs(specs, role) {
  if (!specs) return [];
  const map = {
    cpu: [
      { k: "socket", l: "Сокет" }, { k: "cores", l: "Ядра" }, { k: "threads", l: "Потоки" },
      { k: "base_clock_mhz", l: "Баз. частота", fmt: v => `${v} МГц` }, { k: "tdp_watts", l: "TDP", fmt: v => `${v}W` },
    ],
    gpu: [
      { k: "vram_gb", l: "VRAM", fmt: v => `${v} GB` }, { k: "vram_type", l: "Тип памяти" },
      { k: "memory_bus_bit", l: "Шина", fmt: v => `${v} бит` }, { k: "tdp_watts", l: "TDP", fmt: v => `${v}W` },
    ],
    ram: [
      { k: "total_capacity_gb", l: "Объём", fmt: v => `${v} GB` }, { k: "speed_mhz", l: "Частота", fmt: v => `${v} МГц` },
      { k: "type", l: "Тип" }, { k: "latency_cl", l: "Тайминги", fmt: v => `CL${v}` },
    ],
    storage: [
      { k: "type", l: "Тип" }, { k: "capacity_gb", l: "Объём", fmt: v => `${v} GB` },
      { k: "read_speed_mbps", l: "Чтение", fmt: v => `${v} МБ/с` }, { k: "write_speed_mbps", l: "Запись", fmt: v => `${v} МБ/с` },
    ],
    psu: [
      { k: "wattage", l: "Мощность", fmt: v => `${v}W` }, { k: "efficiency", l: "Сертификат" },
      { k: "modularity", l: "Модульность" },
    ],
    motherboard: [
      { k: "chipset", l: "Чипсет" },
      { k: "ram_type", l: "Тип ОЗУ" },
      { k: "form_factor", l: "Форм-фактор" },
      { k: "m2_slots", l: "Слоты M.2" },
    ],
    cooler: [
      { k: "tdp_rating_watts", l: "Рассеивание", fmt: v => `${v}W` },
      { k: "type", l: "Тип" },
      { k: "fan_count", l: "Вентиляторы" },
    ],
    case: [
      { k: "case_type", l: "Форм-фактор" },
      { k: "material", l: "Материал" },
      { k: "fans_included", l: "Вент. в комплекте" },
    ],
  };

  return (map[role] || [])
    .filter(item => specs[item.k] !== undefined && specs[item.k] !== null)
    .map(item => ({
      label: item.l,
      value: item.fmt ? item.fmt(specs[item.k]) : specs[item.k],
    }));
}

function ComponentBlock({ role, data, isExpanded, onToggle, onCloseModal }) {
  const { icon: Icon, label } = ROLE_CONFIG[role] || { icon: Info, label: role };
  const specs = formatSpecs(data.specs, role);

  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-gray-50 dark:bg-[#0f0f10]/80 backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-gray-900 dark:text-white font-semibold tracking-wide">{data.model}</p>
          </div>
        </div>
        <Link
          to={`/components/${data.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onCloseModal?.();
          }}
          className="ml-auto mr-2 px-2.5 py-1 text-[11px] font-medium text-purple-600 dark:text-purple-300 rounded-md hover:bg-purple-100 dark:hover:bg-purple-500/10 hover:text-purple-800 dark:hover:text-white transition-all"
        >
          <Info />
        </Link>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
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
                <div key={i} className="flex flex-col gap-1 p-2.5 rounded-lg bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-500 font-medium">{s.label}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-200 font-mono">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PrebuiltPcSpecsModal({ pc, isOpen, onClose }) {
  const [expandedRole, setExpandedRole] = useState(null);
  const components = pc?.components || {};

  const handleClose = () => {
    setExpandedRole(null);
    onClose();
  };

  const toggleExpand = (role) => setExpandedRole(prev => (prev === role ? null : role));

  return (
    <AnimatePresence>
      {isOpen && pc && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg max-h-[85vh] overflow-hidden bg-white dark:bg-[#0f0f10] border border-gray-200 dark:border-white/10 rounded-2xl z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{pc.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">Полная конфигурация сборки</p>
              </div>
              <button type="button" onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

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
                    onCloseModal={handleClose}
                  />
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
