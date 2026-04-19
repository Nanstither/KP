import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Cpu, 
  Monitor, 
  Zap, 
  HardDrive, 
  Thermometer, 
  AlertTriangle,
  ChevronRight,
  BookOpen,
  BarChart3,
  Info
} from "lucide-react";

const KnowledgeBase = () => {
  const [activeSection, setActiveSection] = useState("pci");

  const sections = [
    { id: "pci", label: "PCIe и видеокарты", icon: Monitor },
    { id: "cpu", label: "Процессоры и маркировки", icon: Cpu },
    { id: "ram", label: "ОЗУ: скорость и тайминги", icon: Zap },
    { id: "storage", label: "Накопители", icon: HardDrive },
    { id: "cooling", label: "Охлаждение и TDP", icon: Thermometer },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-pink-950/20">      
      <div className="pt-24 pb-12 container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">
              База знаний
            </span>
          </h1>
          <p className="text-purple-200/70 max-w-2xl mx-auto">
            Подробные технические руководства по совместимости компонентов 
            и их характеристикам
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-[#0f0f10]/80 backdrop-blur-xl border border-purple-400/20 rounded-xl p-4 space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                    activeSection === section.id
                      ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                      : "text-purple-200/70 hover:bg-purple-500/10 hover:text-purple-300"
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* PCIe Section */}
            {activeSection === "pci" && (
              <PCIeSection />
            )}

            {/* CPU Section */}
            {activeSection === "cpu" && (
              <CPUSection />
            )}

            {/* RAM Section */}
            {activeSection === "ram" && (
              <RAMSection />
            )}

            {/* Storage Section */}
            {activeSection === "storage" && (
              <StorageSection />
            )}

            {/* Cooling Section */}
            {activeSection === "cooling" && (
              <CoolingSection />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PCIe Section ───
const PCIeSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="bg-[#0f0f10]/80 backdrop-blur-xl border border-purple-400/20 rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-purple-200 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-yellow-400" />
        Совместимость PCIe поколений
      </h2>
      
      <div className="prose prose-invert max-w-none text-purple-200/70 space-y-4">
        <p>
          PCIe (Peripheral Component Interconnect Express) — это стандарт подключения 
          высокоскоростных компонентов. Каждое новое поколение удваивает пропускную способность.
        </p>

        <div className="bg-purple-950/30 border border-purple-400/20 rounded-lg p-4 my-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">
            ⚠️ Важное предупреждение
          </h3>
          <p>
            Старые видеокарты с PCIe 3.0 будут работать в слотах PCIe 4.0/5.0, 
            но современные GPU (RTX 4000, RX 7000) могут потерять до 5-10% 
            производительности при установке в PCIe 3.0.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-purple-400/20">
              <th className="text-left py-3 px-4 text-purple-300">Поколение</th>
              <th className="text-left py-3 px-4 text-purple-300">Год</th>
              <th className="text-left py-3 px-4 text-purple-300">Пропускная способность (x16)</th>
              <th className="text-left py-3 px-4 text-purple-300">Примеры GPU</th>
            </tr>
          </thead>
          <tbody className="text-purple-200/70">
            <tr className="border-b border-purple-400/10">
              <td className="py-3 px-4 font-mono">PCIe 3.0</td>
              <td className="py-3 px-4">2010</td>
              <td className="py-3 px-4">15.75 GB/s</td>
              <td className="py-3 px-4">GTX 10/16 series, RTX 2000</td>
            </tr>
            <tr className="border-b border-purple-400/10 bg-purple-500/5">
              <td className="py-3 px-4 font-mono">PCIe 4.0</td>
              <td className="py-3 px-4">2017</td>
              <td className="py-3 px-4">31.5 GB/s</td>
              <td className="py-3 px-4">RTX 3000, RX 6000</td>
            </tr>
            <tr className="border-b border-purple-400/10">
              <td className="py-3 px-4 font-mono">PCIe 5.0</td>
              <td className="py-3 px-4">2022</td>
              <td className="py-3 px-4">63 GB/s</td>
              <td className="py-3 px-4">RTX 4000, RX 7000</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Performance Impact Chart */}
      <div className="mt-8 bg-purple-950/20 border border-purple-400/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">
          Потеря производительности при использовании PCIe 3.0
        </h3>
        <div className="space-y-4">
          {[
            { gpu: "RTX 4090", loss: 8, color: "from-red-500 to-pink-500" },
            { gpu: "RTX 4080", loss: 6, color: "from-orange-500 to-yellow-500" },
            { gpu: "RTX 4070", loss: 4, color: "from-yellow-500 to-green-500" },
            { gpu: "RTX 4060", loss: 2, color: "from-green-500 to-emerald-500" },
          ].map((item) => (
            <div key={item.gpu} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">{item.gpu}</span>
                <span className="text-purple-300">-{item.loss}%</span>
              </div>
              <div className="h-2 bg-purple-950/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${item.loss * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── CPU Section ───
const CPUSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="bg-[#0f0f10]/80 backdrop-blur-xl border border-purple-400/20 rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-purple-200 mb-4 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-purple-400" />
        Расшифровка маркировок процессоров
      </h2>

      {/* Intel Example */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-purple-300 mb-4">Intel Core</h3>
        <div className="bg-purple-950/30 border border-purple-400/20 rounded-lg p-6">
          <div className="flex flex-wrap items-center gap-2 text-lg mb-4">
            <span className="text-purple-400">Core</span>
            <span className="text-purple-300">i5</span>
            <span className="text-purple-200">-</span>
            <span className="text-pink-400">13</span>
            <span className="text-purple-200">400</span>
            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-sm">F</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-200/70">
            <div className="space-y-2">
              <p><strong className="text-purple-300">Core i5:</strong> Средний сегмент</p>
              <p><strong className="text-purple-300">13:</strong> 13-е поколение (2023)</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-purple-300">400:</strong> Уровень производительности</p>
              <p><strong className="text-purple-300">F:</strong> Нет встроенной графики</p>
            </div>
          </div>
        </div>
      </div>

      {/* AMD Example */}
      <div>
        <h3 className="text-xl font-semibold text-purple-300 mb-4">AMD Ryzen</h3>
        <div className="bg-purple-950/30 border border-purple-400/20 rounded-lg p-6">
          <div className="flex flex-wrap items-center gap-2 text-lg mb-4">
            <span className="text-purple-400">Ryzen</span>
            <span className="text-purple-300">5</span>
            <span className="text-purple-200">7</span>
            <span className="text-pink-400">600</span>
            <span className="text-purple-200">X</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-200/70">
            <div className="space-y-2">
              <p><strong className="text-purple-300">Ryzen 5:</strong> Средний сегмент</p>
              <p><strong className="text-purple-300">7:</strong> 7000 серия (Zen 4)</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-purple-300">600:</strong> Уровень производительности</p>
              <p><strong className="text-purple-300">X:</strong> Увеличенная частота</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suffix Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Суффиксы процессоров Intel</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-400/20">
                <th className="text-left py-3 px-4 text-purple-300">Суффикс</th>
                <th className="text-left py-3 px-4 text-purple-300">Значение</th>
                <th className="text-left py-3 px-4 text-purple-300">Пример</th>
              </tr>
            </thead>
            <tbody className="text-purple-200/70">
              <tr className="border-b border-purple-400/10">
                <td className="py-3 px-4 font-mono bg-yellow-500/10">F</td>
                <td className="py-3 px-4">Без встроенной графики (нужна видеокарта)</td>
                <td className="py-3 px-4">i5-13400F</td>
              </tr>
              <tr className="border-b border-purple-400/10">
                <td className="py-3 px-4 font-mono bg-purple-500/10">K</td>
                <td className="py-3 px-4">Разблокирован для разгона</td>
                <td className="py-3 px-4">i9-13900K</td>
              </tr>
              <tr className="border-b border-purple-400/10">
                <td className="py-3 px-4 font-mono bg-blue-500/10">KF</td>
                <td className="py-3 px-4">Разгон + без графики</td>
                <td className="py-3 px-4">i7-13700KF</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono bg-green-500/10">T</td>
                <td className="py-3 px-4">Энергоэффективный (35W)</td>
                <td className="py-3 px-4">i5-13400T</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── RAM Section ───
const RAMSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="bg-[#0f0f10]/80 backdrop-blur-xl border border-purple-400/20 rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-purple-200 mb-4 flex items-center gap-2">
        <Zap className="w-6 h-6 text-yellow-400" />
        Скорость и тайминги ОЗУ
      </h2>

      <div className="space-y-6 text-purple-200/70">
        <p>
          Производительность оперативной памяти зависит от двух параметров: 
          частоты (МГц) и таймингов (задержек).
        </p>

        {/* Frequency Impact */}
        <div className="bg-purple-950/30 border border-purple-400/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Влияние частоты на производительность
          </h3>
          <div className="space-y-4">
            {[
              { freq: "DDR4-2666", gaming: 100, productivity: 100 },
              { freq: "DDR4-3200", gaming: 108, productivity: 105 },
              { freq: "DDR4-3600", gaming: 112, productivity: 108 },
              { freq: "DDR5-5600", gaming: 118, productivity: 115 },
              { freq: "DDR5-6000", gaming: 122, productivity: 118 },
            ].map((item) => (
              <div key={item.freq} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200 font-mono">{item.freq}</span>
                  <span className="text-purple-300">
                    Игры: +{item.gaming - 100}% | Работа: +{item.productivity - 100}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-purple-950/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${item.gaming}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timings Explanation */}
        <div className="bg-purple-950/30 border border-purple-400/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Что такое тайминги?
          </h3>
          <p className="mb-4">
            Тайминги — это задержки в тактах между операциями. 
            Формат: <code className="bg-purple-950 px-2 py-1 rounded text-purple-300">CL-tRCD-tRP-tRAS</code>
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-300 font-bold text-sm">CL</span>
                </div>
                <div>
                  <p className="text-purple-200 font-medium">CAS Latency</p>
                  <p className="text-sm text-purple-200/60">Задержка до начала передачи данных</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-300 font-bold text-sm">tRCD</span>
                </div>
                <div>
                  <p className="text-purple-200 font-medium">RAS to CAS Delay</p>
                  <p className="text-sm text-purple-200/60">Задержка между строкой и столбцом</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-300 font-bold text-sm">tRP</span>
                </div>
                <div>
                  <p className="text-purple-200 font-medium">RAS Precharge</p>
                  <p className="text-sm text-purple-200/60">Время подготовки следующей строки</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-300 font-bold text-sm">tRAS</span>
                </div>
                <div>
                  <p className="text-purple-200 font-medium">Active to Precharge</p>
                  <p className="text-sm text-purple-200/60">Минимальное время активности строки</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-400/20">
                <th className="text-left py-3 px-4 text-purple-300">Конфигурация</th>
                <th className="text-left py-3 px-4 text-purple-300">Тайминги</th>
                <th className="text-left py-3 px-4 text-purple-300">Игры</th>
                <th className="text-left py-3 px-4 text-purple-300">Работа</th>
              </tr>
            </thead>
            <tbody className="text-purple-200/70">
              <tr className="border-b border-purple-400/10">
                <td className="py-3 px-4">DDR4-3200</td>
                <td className="py-3 px-4 font-mono">CL22-22-22</td>
                <td className="py-3 px-4">Базовая</td>
                <td className="py-3 px-4">Базовая</td>
              </tr>
              <tr className="border-b border-purple-400/10 bg-purple-500/5">
                <td className="py-3 px-4">DDR4-3600</td>
                <td className="py-3 px-4 font-mono">CL16-18-18</td>
                <td className="py-3 px-4 text-green-400">+5-8%</td>
                <td className="py-3 px-4 text-green-400">+3-5%</td>
              </tr>
              <tr>
                <td className="py-3 px-4">DDR5-6000</td>
                <td className="py-3 px-4 font-mono">CL30-36-36</td>
                <td className="py-3 px-4 text-green-400">+10-15%</td>
                <td className="py-3 px-4 text-green-400">+8-12%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Storage Section ───
const StorageSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="bg-[#0f0f10]/80 backdrop-blur-xl border border-purple-400/20 rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-purple-200 mb-4 flex items-center gap-2">
        <HardDrive className="w-6 h-6 text-blue-400" />
        Типы накопителей
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-purple-950/30 border border-purple-400/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">NVMe SSD (M.2)</h3>
          <ul className="space-y-2 text-sm text-purple-200/70">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Скорость: 3000-7000 MB/s
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Подключение: PCIe x4
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Форм-фактор: M.2 2280
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              Цена: выше
            </li>
          </ul>
        </div>

        <div className="bg-purple-950/30 border border-purple-400/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">SATA SSD (2.5")</h3>
          <ul className="space-y-2 text-sm text-purple-200/70">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              Скорость: 500-550 MB/s
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              Подключение: SATA III
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              Форм-фактор: 2.5"
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Цена: ниже
            </li>
          </ul>
        </div>
      </div>

      {/* Speed Comparison */}
      <div className="bg-purple-950/20 border border-purple-400/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">
          Сравнение скоростей
        </h3>
        <div className="space-y-4">
          {[
            { type: "NVMe Gen4 (PCIe 4.0)", speed: 7000, color: "from-purple-500 to-pink-500" },
            { type: "NVMe Gen3 (PCIe 3.0)", speed: 3500, color: "from-blue-500 to-cyan-500" },
            { type: "SATA SSD", speed: 550, color: "from-green-500 to-emerald-500" },
            { type: "HDD 7200 RPM", speed: 150, color: "from-gray-500 to-gray-600" },
          ].map((item) => (
            <div key={item.type} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">{item.type}</span>
                <span className="text-purple-300 font-mono">{item.speed} MB/s</span>
              </div>
              <div className="h-3 bg-purple-950/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${(item.speed / 7000) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Cooling Section ───
const CoolingSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="bg-[#0f0f10]/80 backdrop-blur-xl border border-purple-400/20 rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-purple-200 mb-4 flex items-center gap-2">
        <Thermometer className="w-6 h-6 text-red-400" />
        TDP и охлаждение
      </h2>

      <div className="space-y-6 text-purple-200/70">
        <p>
          <strong className="text-purple-300">TDP (Thermal Design Power)</strong> — 
          максимальное количество тепла, которое система охлаждения должна отводить 
          от процессора или видеокарты.
        </p>

        {/* TDP Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-400/20">
                <th className="text-left py-3 px-4 text-purple-300">Компонент</th>
                <th className="text-left py-3 px-4 text-purple-300">TDP</th>
                <th className="text-left py-3 px-4 text-purple-300">Рекомендуемое охлаждение</th>
              </tr>
            </thead>
            <tbody className="text-purple-200/70">
              <tr className="border-b border-purple-400/10">
                <td className="py-3 px-4">Intel i5-13400F</td>
                <td className="py-3 px-4 font-mono">65W</td>
                <td className="py-3 px-4">Боксовый кулер</td>
              </tr>
              <tr className="border-b border-purple-400/10">
                <td className="py-3 px-4">Intel i7-13700K</td>
                <td className="py-3 px-4 font-mono">125W (253W boost)</td>
                <td className="py-3 px-4">Башенный кулер / AIO 240mm</td>
              </tr>
              <tr className="border-b border-purple-400/10">
                <td className="py-3 px-4">Intel i9-13900K</td>
                <td className="py-3 px-4 font-mono">125W (320W boost)</td>
                <td className="py-3 px-4">AIO 360mm</td>
              </tr>
              <tr className="border-b border-purple-400/10">
                <td className="py-3 px-4">RTX 4070</td>
                <td className="py-3 px-4 font-mono">200W</td>
                <td className="py-3 px-4">БП 650W+</td>
              </tr>
              <tr>
                <td className="py-3 px-4">RTX 4090</td>
                <td className="py-3 px-4 font-mono">450W</td>
                <td className="py-3 px-4">БП 1000W+</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-300 font-semibold mb-1">Важно!</h4>
              <p className="text-sm">
                При выборе блока питания добавляйте запас 20-30% к суммарному TDP 
                всех компонентов. Например, для системы с TDP 400W нужен БП 650-750W.
              </p>
            </div>
          </div>
        </div>

        {/* PSU Calculator Example */}
        <div className="bg-purple-950/30 border border-purple-400/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Пример расчета мощности БП
          </h3>
          <div className="space-y-3">
            {[
              { comp: "Intel i5-13400F", tdp: 65 },
              { comp: "RTX 4070", tdp: 200 },
              { comp: "Материнская плата", tdp: 50 },
              { comp: "ОЗУ (2 планки)", tdp: 10 },
              { comp: "SSD + HDD", tdp: 15 },
              { comp: "Вентиляторы", tdp: 10 },
            ].map((item) => (
              <div key={item.comp} className="flex justify-between text-sm">
                <span className="text-purple-200">{item.comp}</span>
                <span className="text-purple-300 font-mono">{item.tdp}W</span>
              </div>
            ))}
            <div className="border-t border-purple-400/20 pt-3 mt-3">
              <div className="flex justify-between font-semibold">
                <span className="text-purple-200">Итого:</span>
                <span className="text-purple-300">350W</span>
              </div>
              <div className="flex justify-between text-green-400 mt-2">
                <span>Рекомендуемый БП (с запасом 30%):</span>
                <span className="font-mono font-bold">650W</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default KnowledgeBase;