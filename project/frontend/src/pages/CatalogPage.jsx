import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { STORAGE_URL, API_URL } from "@/lib/config";
import { useAuth } from "@/context/AuthContext"; // ✅ Импортируем Auth
import { Search, Monitor, Cpu, Filter, ShoppingCart, Loader2, LogIn, UserPlus, X } from "lucide-react";

export default function CatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Достаем пользователя
  const [view, setView] = useState("components");
  const [components, setComponents] = useState([]);
  const [prebuilts, setPrebuilts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [addingId, setAddingId] = useState(null);
  
  // ✅ Состояние для окна авторизации
  const [showAuthModal, setShowAuthModal] = useState(false);

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
    setSearch("");
  };

  const categories = useMemo(() => {
    if (view === "components") {
      return ["all", ...new Set(components.map(c => c.category?.name).filter(Boolean))];
    }
    return ["all", ...new Set(prebuilts.flatMap(pc => pc.tags?.map(t => t.name) || []))];
  }, [view, components, prebuilts]);

  const currentData = view === "prebuilts" ? prebuilts : components;

  const filteredData = useMemo(() => {
    return currentData.filter(item => {
      const name = view === "prebuilts" ? item.name : item.model;
      const matchSearch = name?.toLowerCase().includes(search.toLowerCase());
      let matchFilter = true;
      if (selectedFilter !== "all") {
        matchFilter = view === "components" 
          ? item.category?.name === selectedFilter 
          : item.tags?.some(t => t.name === selectedFilter);
      }
      return matchSearch && matchFilter;
    });
  }, [currentData, search, selectedFilter, view]);

  // ✅ Логика добавления в корзину
  const handleAddToCart = async (pc) => {
    // Если нет пользователя — показываем модалку и прерываем
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setAddingId(pc.id);
    try {
      await api.post("/cart", { type: "prebuilt", prebuilt_id: pc.id });
      alert("✅ Готовый ПК добавлен в корзину");
    } catch (err) {
      alert("Ошибка: " + (err.response?.data?.message || "Не удалось добавить"));
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* 📦 ЛЕВАЯ ПАНЕЛЬ */}
        <aside className="lg:w-64 flex-shrink-0 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-5 sticky top-24 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Раздел</h3>
            <div className="space-y-2">
              <button onClick={() => handleViewChange("components")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${view === "components" ? "bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent"}`}>
                <Cpu className="w-4 h-4" /> Комплектующие
              </button>
              <button onClick={() => handleViewChange("prebuilts")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${view === "prebuilts" ? "bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent"}`}>
                <Monitor className="w-4 h-4" /> Готовые ПК
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> {view === "components" ? "Категории" : "Назначение"}
              </h3>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedFilter(cat)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedFilter === cat ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                    {cat === "all" ? "Все" : cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </aside>

        {/* 📋 ОСНОВНОЙ КОНТЕНТ */}
        <main className="flex-1 space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder={`Поиск ${view === "components" ? "комплектующих" : "сборок"}...`} value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none transition-colors shadow-sm dark:shadow-none" />
          </motion.div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{view === "prebuilts" ? "Готовые сборки" : "Каталог комплектующих"}</h1>
            <span className="text-sm text-gray-500 dark:text-gray-500">Найдено: {filteredData.length}</span>
          </div>

          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredData.map((item, index) => (
                <ProductCard 
                  key={item.id} 
                  item={item} 
                  view={view} 
                  index={index} 
                  isAdding={addingId === item.id} 
                  onAdd={view === "prebuilts" ? () => handleAddToCart(item) : null} 
                />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none">
              <p className="text-gray-500 dark:text-gray-500 text-lg mb-4">Ничего не найдено 😔</p>
              <button onClick={() => { setSearch(""); setSelectedFilter("all"); }} className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-sm underline">Сбросить фильтры</button>
            </motion.div>
          )}
        </main>
      </div>

      {/* ✅ МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#141416] border border-purple-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-600/20 rounded-full flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Требуется авторизация</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Чтобы добавить товар в корзину и сохранить сборку, пожалуйста, войдите в аккаунт или зарегистрируйтесь.
                </p>
                
                <div className="w-full space-y-3 pt-2">
                  <button 
                    onClick={() => navigate('/login')} 
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Войти
                  </button>
                  <button 
                    onClick={() => navigate('/register')} 
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-3 rounded-xl font-medium transition-colors border border-gray-200 dark:border-white/10"
                  >
                    <UserPlus className="w-4 h-4" /> Регистрация
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 🃏 Компонент карточки
function ProductCard({ item, view, index, isAdding, onAdd }) {
  const navigate = useNavigate();
  const title = view === "prebuilts" ? item.name : item.model;
  const price = item.price;
  const imgSrc = item.image ? (item.image.startsWith("http") ? item.image : `${STORAGE_URL}/${item.image}`) : "/placeholder.svg";
  
  let badgeText = "Без категории";
  if (view === "prebuilts" && item.tags?.length > 0) badgeText = item.tags[0].name;
  else if (view === "components" && item.category) badgeText = item.category.name;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 flex flex-col shadow-sm dark:shadow-none">
      <div className="aspect-[4/3] bg-gray-100 dark:bg-[#0a0a0c] relative overflow-hidden cursor-pointer" onClick={() => navigate(view === 'prebuilts' ? `/pc/${item.slug}` : `/component/${item.id}`)}>
        <img src={imgSrc} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => e.target.src = "/placeholder.svg"} />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-1.5rem)]">
          {view === "prebuilts" && item.tags?.length > 0 ? item.tags.map(tag => (
            <span key={tag.id || tag.slug} className="px-2 py-1 bg-purple-100 dark:bg-purple-600/80 backdrop-blur-md rounded-lg text-[10px] font-medium text-purple-700 dark:text-white border border-purple-200 dark:border-white/10 shadow-sm">{tag.name}</span>
          )) : view === "components" && item.category ? (
            <span className="px-2.5 py-1 bg-purple-100 dark:bg-black/60 backdrop-blur-md rounded-lg text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-white/10">{item.category.name}</span>
          ) : null}
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors cursor-pointer" onClick={() => navigate(view === 'prebuilts' ? `/pc/${item.slug}` : `/component/${item.id}`)}>{title}</h3>
        
        {view === "prebuilts" && item.components && (
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-0.5 line-clamp-2">
            {item.components.cpu && <p>CPU: {item.components.cpu.model}</p>}
            {item.components.gpu && <p>GPU: {item.components.gpu.model}</p>}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
          <span className="text-xl font-bold text-purple-600 dark:text-purple-300 font-mono">{Number(price).toLocaleString()} ₽</span>
          
          {view === "prebuilts" ? (
            <button 
              onClick={onAdd} 
              disabled={isAdding}
              className="p-2.5 bg-purple-100 dark:bg-purple-600/10 hover:bg-purple-600 text-purple-600 dark:text-purple-300 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
            </button>
          ) : (
            <button 
              onClick={() => navigate(`/components/${item.id}`)} 
              className="p-2.5 bg-gray-100 dark:bg-gray-600/10 text-gray-600 dark:text-gray-400 hover:bg-gray-600 dark:hover:bg-gray-600 hover:text-white dark:hover:text-white rounded-lg transition-all"
              title="Комплектующие добавляются через Конфигуратор"
            >
              <Cpu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}