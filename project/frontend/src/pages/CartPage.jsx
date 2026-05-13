import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Edit3, ShoppingCart, ArrowRight, Package, Cpu, Monitor } from "lucide-react";
import api from "@/services/api";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#0f0f10] text-gray-200 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-purple-400" />
            Корзина
            {totalItems > 0 && (
              <span className="text-sm bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                {totalItems} шт.
              </span>
            )}
          </h1>
        </motion.div>

        {totalItems === 0 ? (
          /* Пустая корзина */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#141416] border border-white/10 rounded-xl"
          >
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Корзина пуста</h2>
            <p className="text-gray-500 mb-6">Добавьте комплектующие или готовые сборки</p>
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
              {cart.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#141416] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                >
                  {/* Иконка типа товара */}
                  <div className="w-12 h-12 bg-[#0a0a0c] rounded-lg flex items-center justify-center flex-shrink-0 border border-white/5">
                    {item.type === "custom" ? (
                      <Cpu className="w-6 h-6 text-purple-400" />
                    ) : item.type === "prebuilt" ? (
                      <Monitor className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{item.name}</h3>
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
                    
                    {/* Для сборок показываем компоненты */}
                    {item.type === "custom" && item.components?.length > 0 && (
                      <p className="text-xs text-gray-500 truncate">
                        {item.components.map(c => c.component?.model || "Компонент").join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Цена и кнопки */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-lg font-bold text-purple-300 font-mono">
                      {Number(item.total_price).toLocaleString()} ₽
                    </span>
                    <div className="flex gap-2">
                      {item.type === "custom" && (
                        <button
                          onClick={() => navigate(`/configurator?edit=${item.id}`)}
                          className="p-2 text-gray-400 hover:text-purple-300 hover:bg-purple-600/10 rounded-lg transition-colors"
                          title="Изменить сборку"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Кнопка очистки */}
              <button
                onClick={clearCart}
                className="w-full py-3 text-sm text-gray-400 hover:text-red-400 border border-dashed border-white/10 hover:border-red-500/30 rounded-lg transition-colors"
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
              <div className="bg-[#141416] border border-white/10 rounded-xl p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4">Итого</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Товаров:</span>
                    <span>{totalItems} шт.</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Доставка:</span>
                    <span className="text-green-400">Бесплатно</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-lg font-semibold text-white">К оплате:</span>
                    <span className="text-2xl font-bold text-purple-300 font-mono">
                      {totalPrice.toLocaleString()} ₽
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Оформить заказ <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Нажимая кнопку, вы соглашаетесь с условиями покупки
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}