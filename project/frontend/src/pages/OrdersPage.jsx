import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, Truck, AlertCircle, ArrowLeft, CreditCard, MapPin } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Загружаем из API
      const response = await api.get('/orders');
      setOrders(response.data.reverse()); // Новые заказы сверху
    } catch (err) {
      console.error("Ошибка загрузки истории:", err);
    } finally {
      setLoading(false);
    }
  };
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Ожидает оплаты', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Clock };
      case 'paid':
        return { label: 'Оплачен', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: CheckCircle };
      case 'preparing':
        return { label: 'Готовится', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: Package };
      case 'shipped':
        return { label: 'Отправлен', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: Truck };
      case 'delivered':
        return { label: 'Доставлен', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle };
      case 'cancelled':
        return { label: 'Отменён', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertCircle };
      default:
        return { label: status, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: Package };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Назад в профиль
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-400" />
            История покупок
          </h1>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl"
          >
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">История пуста</h2>
            <p className="text-gray-500 dark:text-gray-500 mb-6">У вас пока нет оформленных заказов</p>
            <button
              onClick={() => navigate('/catalog')}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Перейти в каталог
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-6"
                >
                  {/* Заголовок заказа */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Заказ #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusInfo.bg} ${statusInfo.border}`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Детали заказа */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Товары */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-500" />
                        Товары
                      </p>
                      <div className="bg-gray-50 dark:bg-[#0a0a0c] rounded-lg p-3 space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                                {item.name}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {typeof item.total_price === 'number' ? item.total_price.toLocaleString() : Number(item.total_price || 0).toLocaleString()} ₽
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-500">Нет данных</p>
                        )}
                      </div>
                    </div>

                    {/* Доставка */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        Доставка
                      </p>
                      <div className="bg-gray-50 dark:bg-[#0a0a0c] rounded-lg p-3">
                        {order.delivery ? (
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {order.delivery.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.delivery.address}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {order.delivery.city}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-500">Нет данных</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Получатель и оплата */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-500" />
                        Оплата
                      </p>
                      <div className="bg-gray-50 dark:bg-[#0a0a0c] rounded-lg p-3">
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-300">
                          {typeof order.total === 'number' ? order.total.toLocaleString() : Number(order.total || 0).toLocaleString()} ₽
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Оплачено онлайн
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Получатель
                      </p>
                      <div className="bg-gray-50 dark:bg-[#0a0a0c] rounded-lg p-3">
                        {order.customer ? (
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-900 dark:text-white">
                              {order.customer.name}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {order.customer.phone}
                            </p>
                            {order.customer.email && (
                              <p className="text-gray-600 dark:text-gray-400">
                                {order.customer.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-500">Нет данных</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Комментарий */}
                  {order.customer?.comment && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Комментарий к заказу
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#0a0a0c] rounded-lg p-3">
                        {order.customer.comment}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
