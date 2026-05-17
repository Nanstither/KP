import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, ShoppingCart, ArrowRight, Package, LogIn, UserPlus, X, List, ChevronRight, ExternalLink } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [componentsModalOpen, setComponentsModalOpen] = useState(false);
  const [prebuiltComponents, setPrebuiltComponents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (err) {
      setError("Не удалось загрузить корзину");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  const clearCart = async () => {
    if (!cart?.items?.length) return;
    try {
      await Promise.all(cart.items.map(item => api.delete(`/cart/${item.id}`)));
      setCart(prev => ({ ...prev, items: [] }));
    } catch (err) {
      console.error("Ошибка очистки:", err);
    }
  };

  const openComponentsModal = async (item) => {
    setSelectedItem(item);
    setPrebuiltComponents([]);
    
    if (item.type === 'prebuilt' && item.prebuilt_id) {
      try {
        const res = await api.get(`/prebuilt/${item.prebuilt_id}`);
        if (res.data && res.data.components) {
          setPrebuiltComponents(res.data.components);
        }
      } catch (err) {
        console.error("Ошибка загрузки компонентов ПК:", err);
      }
    }
    
    setComponentsModalOpen(true);
  };

  const getComponentImage = (item) => {
    // Для готовых ПК
    if (item.type === 'prebuilt') {
      if (item.image) return item.image;
      // Ищем корпус в компонентах
      if (item.components && Array.isArray(item.components)) {
        const caseComponent = item.components.find(c => 
          c.component && c.component.category && c.component.category.slug === 'case'
        );
        if (caseComponent && caseComponent.component.image) {
          return caseComponent.component.image;
        }
      }
      return null;
    }
    
    // Для пользовательских сборок - ищем корпус
    if (item.type === 'custom' && item.components && Array.isArray(item.components)) {
      const caseComponent = item.components.find(c => 
        c.component && c.component.category && c.component.category.slug === 'case'
      );
      if (caseComponent && caseComponent.component.image) {
        return caseComponent.component.image;
      }
    }
    
    return null;
  };

  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%232a2a2e' width='200' height='200'/%3E%3Ctext fill='%23666' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const totalItems = cart?.items?.length || 0;
  const totalPrice = cart?.items?.reduce((sum, item) => sum + Number(item.total_price || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Корзина
          </h1>
        </motion.div>

        {totalItems === 0 ? (
          /* Пустая корзина */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl"
          >
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Корзина пуста</h2>
            <p className="text-gray-500 dark:text-gray-500 mb-6">Добавьте комплектующие или готовые сборки</p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Перейти в каталог <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          /* Заполненная корзина */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Список товаров */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, index) => {
                const itemImage = getComponentImage(item);
                const displayImage = itemImage || placeholderImage;
                
                return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                >
                  {/* Изображение товара */}
                  <div className="w-20 h-20 bg-gray-100 dark:bg-[#0a0a0c] rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-white/5 relative">
                    <img 
                      src={displayImage} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        item.type === "custom" 
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-300" 
                          : item.type === "prebuilt"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                          : "bg-gray-500/10 border-gray-500/30 text-gray-400"
                      }`}>
                        {item.type === "custom" ? "Сборка" : item.type === "prebuilt" ? "Готовый ПК" : "Компонент"}
                      </span>
                    </div>
                    
                    {/* Для сборок показываем количество компонентов */}
                    {item.components && item.components.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {item.components.length} компонент{item.components.length === 1 ? '' : 'а'}
                      </p>
                    )}
                  </div>

                  {/* Цена и кнопки */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-300 font-mono">
                      {Number(item.total_price).toLocaleString()} ₽
                    </span>
                    <div className="flex gap-2">
                      {item.type === "custom" && (
                        <button
                          onClick={() => navigate(`/config?edit=${item.id}`)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-600/10 rounded-lg transition-colors"
                          title="Изменить сборку"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openComponentsModal(item)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-600/10 rounded-lg transition-colors"
                        title="Показать характеристики"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
              })}

              {/* Кнопка очистки */}
              <button
                onClick={clearCart}
                className="w-full py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-dashed border-gray-300 dark:border-white/10 hover:border-red-500/30 rounded-lg transition-colors"
              >
                Очистить корзину
              </button>
            </div>

            {/* Итоговая панель */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Итого</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Товаров:</span>
                    <span>{totalItems} шт.</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Доставка:</span>
                    <span className="text-green-600 dark:text-green-400">Бесплатно</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-white/10 pt-3 flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">К оплате:</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-300 font-mono">
                      {totalPrice.toLocaleString()} ₽
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Проверяем авторизацию через контекст AuthContext
                    if (authLoading) {
                      return; // Ждем завершения проверки авторизации
                    }
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      navigate("/checkout");
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Оформить заказ <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
                  Нажимая кнопку, вы соглашаетесь с условиями покупки
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 dark:bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
      </div>

      {/* ✅ МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ ДЛЯ ОФОРМЛЕНИЯ ЗАКАЗА */}
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
                  Для оформления заказа пожалуйста, войдите в аккаунт или зарегистрируйтесь.
                </p>
                
                <div className="w-full space-y-3 pt-2">
                  <button 
                    onClick={() => {
                      setShowAuthModal(false);
                      navigate('/login', { state: { mode: 'login' } });
                    }} 
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Войти
                  </button>
                  <button 
                    onClick={() => {
                      setShowAuthModal(false);
                      navigate('/login', { state: { mode: 'register' } });
                    }} 
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

      {/* ✅ МОДАЛЬНОЕ ОКНО КОМПОНЕНТОВ */}
      <AnimatePresence>
        {componentsModalOpen && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setComponentsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setComponentsModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedItem.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedItem.type === 'prebuilt' ? 'Готовый компьютер' : 'Пользовательская сборка'}
                </p>
              </div>

              <div className="space-y-3">
                {(selectedItem.type === 'prebuilt' ? prebuiltComponents : selectedItem.components || []).map((comp, idx) => {
                  const component = comp.component || comp;
                  if (!component) return null;
                  const quantity = comp.quantity || 1;
                  
                  return (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5"
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{component.model || 'Компонент'}</p>
                          {quantity > 1 && (
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                              x{quantity}
                            </span>
                          )}
                        </div>
                        {component.category && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{component.category.name || component.category.slug}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {component.price && (
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                            {Number(component.price).toLocaleString()} ₽
                          </span>
                        )}
                        {component.id && (
                          <Link
                            to={`/components/${component.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-600/10 rounded transition-colors"
                            title="Подробнее"
                            onClick={() => setComponentsModalOpen(false)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Итого:</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-300">
                  {Number(selectedItem.total_price).toLocaleString()} ₽
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}