import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/services/api";
import { STORAGE_URL } from "@/lib/config";
import PrebuiltPcCard from "@/components/PrebuiltPcCard";
import { Search, Monitor, Cpu, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw } from "lucide-react";

const CARD_BADGE_CLASS =
  "px-2 py-0.5 text-[10px] font-medium rounded-md bg-white/60 dark:bg-black/40 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10";

const CARD_ARTICLE_CLASS =
  "group relative bg-white dark:bg-[#0f0f10] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.08)] transition-all duration-300 flex flex-col h-full";

const CARD_PRICE_CLASS =
  "text-2xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 dark:from-purple-300 dark:via-pink-300 dark:to-purple-400 bg-clip-text text-transparent";

const INITIAL_PREBUILT_FILTERS = {
  purpose: "all",
  cpus: [],
  gpus: [],
  coolerBrands: [],
  ramCapacities: [],
  storageTypes: [],
  priceMin: "",
  priceMax: "",
};

const STORAGE_TYPE_LABELS = {
  nvme: "NVMe",
  sata: "SATA",
};

function toggleArrayValue(arr, value) {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

function hasActivePrebuiltFilters(filters) {
  return (
    filters.purpose !== "all" ||
    filters.cpus.length > 0 ||
    filters.gpus.length > 0 ||
    filters.coolerBrands.length > 0 ||
    filters.ramCapacities.length > 0 ||
    filters.storageTypes.length > 0 ||
    filters.priceMin !== "" ||
    filters.priceMax !== ""
  );
}

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState("prebuilts");
  const [components, setComponents] = useState([]);
  const [prebuilts, setPrebuilts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [prebuiltFilters, setPrebuiltFilters] = useState(INITIAL_PREBUILT_FILTERS);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const viewParam = searchParams.get("view");
    const categoryParam = searchParams.get("category");

    if (viewParam === "components" || viewParam === "prebuilts") {
      setView(viewParam);
    }

    if (categoryParam && (viewParam === "components" || !viewParam)) {
      setSelectedFilter(categoryParam);
      if (!viewParam) {
        setView("components");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [compRes, pcRes] = await Promise.all([
          api.get("/components"),
          api.get("/prebuilt-pcs"),
        ]);
        setComponents(Array.isArray(compRes.data) ? compRes.data : compRes.data?.data || []);
        setPrebuilts(Array.isArray(pcRes.data) ? pcRes.data : pcRes.data?.data || []);
      } catch (err) {
        console.error("Ошибка загрузки каталога:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewChange = (newView) => {
    setView(newView);
    setSelectedFilter("all");
    setPrebuiltFilters(INITIAL_PREBUILT_FILTERS);
    setSearch("");
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    if (view === "prebuilts") {
      setPrebuiltFilters(INITIAL_PREBUILT_FILTERS);
    } else {
      setSelectedFilter("all");
    }
  };

  const updatePrebuiltFilter = (key, value) => {
    setPrebuiltFilters(prev => ({ ...prev, [key]: value }));
  };

  const togglePrebuiltFilter = (key, value) => {
    setPrebuiltFilters(prev => ({
      ...prev,
      [key]: toggleArrayValue(prev[key], value),
    }));
  };

  const componentCategories = useMemo(
    () => ["all", ...new Set(components.map(c => c.category?.name).filter(Boolean))],
    [components]
  );

  const prebuiltFilterOptions = useMemo(() => {
    const cpus = new Set();
    const gpus = new Set();
    const coolerBrands = new Set();
    const ramCapacities = new Set();
    const storageTypes = new Set();
    const purposes = new Set();

    prebuilts.forEach(pc => {
      pc.tags?.forEach(t => purposes.add(t.name));
      if (pc.components?.cpu?.model) cpus.add(pc.components.cpu.model);
      if (pc.components?.gpu?.model) gpus.add(pc.components.gpu.model);
      if (pc.components?.cooler?.brand) coolerBrands.add(pc.components.cooler.brand);
      const ramGb = pc.components?.ram?.specs?.total_capacity_gb;
      if (ramGb != null) ramCapacities.add(ramGb);
      const storageType = pc.components?.storage?.specs?.type;
      if (storageType) storageTypes.add(storageType);
    });

    return {
      purposes: [...purposes].sort(),
      cpus: [...cpus].sort(),
      gpus: [...gpus].sort(),
      coolerBrands: [...coolerBrands].sort(),
      ramCapacities: [...ramCapacities].sort((a, b) => a - b),
      storageTypes: [...storageTypes].sort(),
    };
  }, [prebuilts]);

  const filteredData = useMemo(() => {
    if (view === "components") {
      return components.filter(item => {
        const matchSearch = item.model?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = selectedFilter === "all" || item.category?.name === selectedFilter;
        return matchSearch && matchFilter;
      });
    }

    return prebuilts.filter(item => {
      const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      if (prebuiltFilters.purpose !== "all" && !item.tags?.some(t => t.name === prebuiltFilters.purpose)) {
        return false;
      }

      if (prebuiltFilters.cpus.length > 0) {
        const cpuModel = item.components?.cpu?.model;
        if (!cpuModel || !prebuiltFilters.cpus.includes(cpuModel)) return false;
      }

      if (prebuiltFilters.gpus.length > 0) {
        const gpuModel = item.components?.gpu?.model;
        if (!gpuModel || !prebuiltFilters.gpus.includes(gpuModel)) return false;
      }

      if (prebuiltFilters.coolerBrands.length > 0) {
        const coolerBrand = item.components?.cooler?.brand;
        if (!coolerBrand || !prebuiltFilters.coolerBrands.includes(coolerBrand)) return false;
      }

      if (prebuiltFilters.ramCapacities.length > 0) {
        const ramGb = item.components?.ram?.specs?.total_capacity_gb;
        if (ramGb == null || !prebuiltFilters.ramCapacities.includes(ramGb)) return false;
      }

      if (prebuiltFilters.storageTypes.length > 0) {
        const storageType = item.components?.storage?.specs?.type;
        if (!storageType || !prebuiltFilters.storageTypes.includes(storageType)) return false;
      }

      const price = Number(item.price);
      if (prebuiltFilters.priceMin !== "" && price < Number(prebuiltFilters.priceMin)) return false;
      if (prebuiltFilters.priceMax !== "" && price > Number(prebuiltFilters.priceMax)) return false;

      return true;
    });
  }, [view, components, prebuilts, search, selectedFilter, prebuiltFilters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFilter, view, prebuiltFilters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const filtersActive = view === "prebuilts"
    ? hasActivePrebuiltFilters(prebuiltFilters) || search !== ""
    : selectedFilter !== "all" || search !== "";

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-blue-100 dark:bg-none dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto my-8 flex items-center justify-between">
        <h1 className="text-4xl! my-0! font-bold text-gray-900 dark:text-white">{view === "prebuilts" ? "Готовые сборки" : "Каталог комплектующих"}</h1>
        <span className="text-sm items-center text-gray-500 dark:text-gray-500">Найдено: {filteredData.length}</span>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <aside className={`${view === "prebuilts" ? "lg:w-72" : "lg:w-64"} flex-shrink-0`}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-5 sticky top-24 shadow-sm dark:shadow-none max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Раздел</h3>
            <div className="space-y-2">
              <button onClick={() => handleViewChange("prebuilts")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${view === "prebuilts" ? "bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent"}`}>
                <Monitor className="w-4 h-4" /> Готовые ПК
              </button>
              <button onClick={() => handleViewChange("components")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${view === "components" ? "bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent"}`}>
                <Cpu className="w-4 h-4" /> Комплектующие
              </button>
            </div>

            {view === "components" ? (
              <FilterBlock title="Категории">
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {componentCategories.map(cat => (
                    <button key={cat} onClick={() => setSelectedFilter(cat)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedFilter === cat ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                      {cat === "all" ? "Все" : cat}
                    </button>
                  ))}
                </div>
              </FilterBlock>
            ) : (
              <>
                <FilterBlock title="Назначение">
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    <button
                      onClick={() => updatePrebuiltFilter("purpose", "all")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${prebuiltFilters.purpose === "all" ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                    >
                      Все
                    </button>
                    {prebuiltFilterOptions.purposes.map(purpose => (
                      <button
                        key={purpose}
                        onClick={() => updatePrebuiltFilter("purpose", purpose)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${prebuiltFilters.purpose === purpose ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                      >
                        {purpose}
                      </button>
                    ))}
                  </div>
                </FilterBlock>

                <FilterBlock title="Цена, ₽">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      placeholder="От"
                      value={prebuiltFilters.priceMin}
                      onChange={e => updatePrebuiltFilter("priceMin", e.target.value)}
                      className="w-full min-w-0 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-purple-500/50 focus:outline-none"
                    />
                    <span className="text-gray-400 shrink-0">—</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="До"
                      value={prebuiltFilters.priceMax}
                      onChange={e => updatePrebuiltFilter("priceMax", e.target.value)}
                      className="w-full min-w-0 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                </FilterBlock>

                {prebuiltFilterOptions.cpus.length > 0 && (
                  <FilterBlock title="Процессор">
                    <CheckboxFilter
                      options={prebuiltFilterOptions.cpus}
                      selected={prebuiltFilters.cpus}
                      onToggle={value => togglePrebuiltFilter("cpus", value)}
                      scrollable
                    />
                  </FilterBlock>
                )}

                {prebuiltFilterOptions.gpus.length > 0 && (
                  <FilterBlock title="Видеокарта">
                    <CheckboxFilter
                      options={prebuiltFilterOptions.gpus}
                      selected={prebuiltFilters.gpus}
                      onToggle={value => togglePrebuiltFilter("gpus", value)}
                      scrollable
                    />
                  </FilterBlock>
                )}

                {prebuiltFilterOptions.coolerBrands.length > 0 && (
                  <FilterBlock title="Кулер (бренд)">
                    <CheckboxFilter
                      options={prebuiltFilterOptions.coolerBrands}
                      selected={prebuiltFilters.coolerBrands}
                      onToggle={value => togglePrebuiltFilter("coolerBrands", value)}
                    />
                  </FilterBlock>
                )}

                {prebuiltFilterOptions.ramCapacities.length > 0 && (
                  <FilterBlock title="ОЗУ">
                    <CheckboxFilter
                      options={prebuiltFilterOptions.ramCapacities}
                      selected={prebuiltFilters.ramCapacities}
                      onToggle={value => togglePrebuiltFilter("ramCapacities", value)}
                      getLabel={gb => `${gb} GB`}
                    />
                  </FilterBlock>
                )}

                {prebuiltFilterOptions.storageTypes.length > 0 && (
                  <FilterBlock title="Накопитель">
                    <CheckboxFilter
                      options={prebuiltFilterOptions.storageTypes}
                      selected={prebuiltFilters.storageTypes}
                      onToggle={value => togglePrebuiltFilter("storageTypes", value)}
                      getLabel={type => STORAGE_TYPE_LABELS[type] || type}
                    />
                  </FilterBlock>
                )}
              </>
            )}

            {filtersActive && (
              <button
                onClick={resetFilters}
                className="mt-5 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-600/10 hover:bg-purple-100 dark:hover:bg-purple-600/20 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Сбросить фильтры
              </button>
            )}
          </motion.div>
        </aside>

        <main className="flex-1 space-y-6 min-w-0">

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder={`Поиск ${view === "components" ? "комплектующих" : "сборок"}...`} value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none transition-colors shadow-sm dark:shadow-none" />
          </motion.div>

          {filteredData.length > 0 ? (
            <>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedData.map((item, index) =>
                  view === "prebuilts" ? (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-full"
                    >
                      <PrebuiltPcCard pc={item} />
                    </motion.div>
                  ) : (
                    <ComponentCatalogCard key={item.id} item={item} index={index} />
                  )
                )}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none">
              <p className="text-gray-500 dark:text-gray-500 text-lg mb-4">Ничего не найдено</p>
              <button onClick={resetFilters} className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-sm underline">Сбросить фильтры</button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Filter className="w-3.5 h-3.5" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function CheckboxFilter({ options, selected, onToggle, getLabel, scrollable = false }) {
  return (
    <div className={`space-y-1.5 ${scrollable ? "max-h-36 overflow-y-auto pr-1 custom-scrollbar" : ""}`}>
      {options.map(option => {
        const id = `filter-${String(option).replace(/\s+/g, "-")}`;
        const isChecked = selected.includes(option);
        return (
          <label
            key={option}
            htmlFor={id}
            className={`flex items-start gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${isChecked ? "bg-purple-50 dark:bg-purple-600/10" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
          >
            <input
              id={id}
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggle(option)}
              className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 dark:border-white/20 text-purple-600 focus:ring-purple-500/30 shrink-0"
            />
            <span className="text-xs leading-snug text-gray-700 dark:text-gray-300">
              {getLabel ? getLabel(option) : option}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Первая страница"
      >
        <ChevronsLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Предыдущая страница"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={index} className="px-3 py-2 text-gray-400 dark:text-gray-600">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Следующая страница"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Последняя страница"
      >
        <ChevronsRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function ComponentCatalogCard({ item, index }) {
  const navigate = useNavigate();
  const imgSrc = item.image
    ? (item.image.startsWith("http") ? item.image : `${STORAGE_URL}/${item.image}`)
    : "/placeholder.svg";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={CARD_ARTICLE_CLASS}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-[#0a0a0c]">
        <img
          src={imgSrc}
          alt={item.model}
          onError={e => { e.target.onerror = null; e.target.src = "/placeholder.svg"; }}
          className="mx-auto scale-90 h-full object-center object-cover opacity-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0f0f10] via-transparent to-transparent" />

        {item.category?.name && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className={CARD_BADGE_CLASS}>{item.category.name}</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-5 flex-1 flex flex-col">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight line-clamp-1">
            {item.model}
          </h3>
          {item.brand?.name && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{item.brand.name}</p>
          )}
          <p className={CARD_PRICE_CLASS}>
            {Number(item.price).toLocaleString("ru-RU")} ₽
          </p>
        </div>

        {item.stock != null && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {item.stock > 0 ? `В наличии: ${item.stock} шт.` : "Нет в наличии"}
          </p>
        )}

        <button
          onClick={() => navigate(`/components/${item.id}`)}
          className="mt-auto w-full py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
        >
          Подробнее
        </button>
      </div>
    </motion.article>
  );
}
