import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { parseApiError } from '@/lib/parseApiError';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Phone, 
  Mail, 
  Truck, 
  MapPin, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Cpu, 
  Hash 
} from 'lucide-react';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Маппинг технических имен ролей в понятные названия
  const roleNames = {
    cpu: 'Процессор',
    gpu: 'Видеокарта',
    motherboard: 'Материнская плата',
    ram: 'Оперативная память',
    storage: 'Накопитель',
    psu: 'Блок питания',
    case: 'Корпус',
    cooler: 'Охлаждение',
    fan: 'Вентилятор',
    default: 'Компонент',
  };

  const numericRoleNames = {
    0: 'Процессор',
    1: 'Материнская плата',
    2: 'Видеокарта',
    3: 'Оперативная память',
    4: 'Накопитель',
    5: 'Блок питания',
    6: 'Корпус',
    7: 'Охлаждение',
  };

  const resolveRoleName = (comp) => {
    const role = comp?.role;
    if (role !== null && role !== undefined && roleNames[role]) {
      return roleNames[role];
    }
    if (role !== null && role !== undefined && numericRoleNames[role] !== undefined) {
      return numericRoleNames[role];
    }
    const categorySlug = comp?.component?.category?.slug;
    if (categorySlug && roleNames[categorySlug]) {
      return roleNames[categorySlug];
    }
    return roleNames.default;
  };

  // Цвета статусов для светлой и темной темы
  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
    paid: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    preparing: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    shipped: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    delivered: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
    cancelled: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
    ready: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  };

  const statusLabels = {
    pending: 'Ожидает оплаты',
    paid: 'Оплачен',
    preparing: 'Готовится к отправке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
    ready: 'Готов к отправке',
  };

  useEffect(() => {
    if (!user || !['admin', 'manager'].includes(user.role)) {
      navigate('/');
      return;
    }
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      // Адаптируем ответ, если данные лежат внутри ключа order
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      fetchOrder();
      if (newStatus === 'delivered' || newStatus === 'cancelled') {
        toast.success('Заказ завершён и перемещён в архив');
      } else {
        toast.success('Статус заказа обновлён');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(parseApiError(error));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0f0f10]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-[#0f0f10] min-h-screen text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Назад к заказам
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-900 dark:text-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 mt-24">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Назад к заказам
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Заказ #{order.id}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${statusColors[order.status]}`}>
                {order.status === 'pending' && <Clock className="w-4 h-4" />}
                {order.status === 'paid' && <CheckCircle className="w-4 h-4" />}
                {order.status === 'delivered' && <CheckCircle className="w-4 h-4" />}
                {order.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                {statusLabels[order.status]}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Создан: {new Date(order.created_at).toLocaleString('ru-RU')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {parseFloat(order.total_amount).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Итоговая сумма</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Items & Components */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#141416] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#141416]/50">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Package className="w-5 h-5 text-blue-500" />
                Товары в заказе
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className='text-left'>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{item.name}</h3>
                      {item.prebuilt_pc_id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                          Готовая сборка
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-100 dark:bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                          Конфигуратор
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {parseFloat(item.price).toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">x{item.quantity} шт.</div>
                    </div>
                  </div>

                  {/* Components List Logic */}
                  {item.components && item.components.length > 0 ? (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        Комплектующие:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.components.map((comp) => {
                          const roleName = resolveRoleName(comp);
                          
                          return (
                            <div key={comp.id} className="bg-gray-100 dark:bg-white/[0.02] rounded-lg p-3 border border-gray-200 dark:border-white/5 flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-100 dark:bg-blue-600/20 px-2 py-0.5 rounded">
                                  {roleName}
                                </span>
                                <span className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-white/[0.05] px-2 py-0.5 rounded">
                                  <Hash className="w-3 h-3 mr-1" />
                                  {comp.quantity} шт.
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 dark:text-gray-200 font-medium truncate" title={comp.component?.model}>
                                {comp.component?.model || `ID: ${comp.component_id}`}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {parseFloat(comp.price_snapshot).toLocaleString('ru-RU')} ₽
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 text-sm text-gray-500 dark:text-gray-400 italic">
                      Детали комплектующих недоступны
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Info Cards */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-[#141416] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#141416]/50">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="w-5 h-5 text-green-500" />
                Покупатель
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">ФИО</label>
                <div className="text-gray-900 dark:text-white font-medium mt-1">{order.recipient_name}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Телефон
                </label>
                <div className="text-gray-900 dark:text-white font-medium mt-1">{order.recipient_phone}</div>
              </div>
              {order.recipient_email && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  <div className="text-gray-900 dark:text-white font-medium mt-1 break-all">{order.recipient_email}</div>
                </div>
              )}
              {order.user && (
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/5">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Аккаунт</div>
                  <div className="text-sm text-gray-900 dark:text-white font-medium">{order.user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{order.user.email}</div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white dark:bg-[#141416] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#141416]/50">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Truck className="w-5 h-5 text-orange-500" />
                Доставка
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Тип</label>
                <div className="flex items-center gap-2 mt-1 text-gray-900 dark:text-white font-medium capitalize">
                  {order.delivery_type === 'pickup' ? <MapPin className="w-4 h-4 text-orange-400"/> : <Truck className="w-4 h-4 text-orange-400"/>}
                  {order.delivery_type === 'pickup' ? 'Самовывоз (СДЭК)' : 'Курьер'}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Адрес</label>
                <div className="text-gray-900 dark:text-white font-medium mt-1">{order.delivery_address}</div>
              </div>
              {order.cdek_code && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Код ПВЗ</label>
                  <div className="text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-white/[0.05] px-3 py-2 rounded border border-gray-200 dark:border-white/5 inline-block mt-1">
                    {order.cdek_code}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Controls */}
          <div className="bg-white dark:bg-[#141416] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#141416]/50">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Управление
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500 dark:text-gray-400">Статус</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateOrderStatus('paid')}
                  disabled={updating || order.status === 'paid'}
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                    order.status === 'paid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-white/[0.05] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10 disabled:opacity-50'
                  }`}
                >
                  Оплачен
                </button>
                <button
                  onClick={() => updateOrderStatus('preparing')}
                  disabled={updating || order.status === 'preparing'}
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                    order.status === 'preparing' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 dark:bg-white/[0.05] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10 disabled:opacity-50'
                  }`}
                >
                  Сборка
                </button>
                <button
                  onClick={() => updateOrderStatus('shipped')}
                  disabled={updating || order.status === 'shipped'}
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                    order.status === 'shipped' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 dark:bg-white/[0.05] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10 disabled:opacity-50'
                  }`}
                >
                  Отправлен
                </button>
                <button
                  onClick={() => updateOrderStatus('delivered')}
                  disabled={updating || order.status === 'delivered'}
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                    order.status === 'delivered' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 dark:bg-white/[0.05] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10 disabled:opacity-50'
                  }`}
                >
                  Доставлен
                </button>
                <button
                  onClick={() => updateOrderStatus('cancelled')}
                  disabled={updating || order.status === 'cancelled'}
                  className={`col-span-2 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    order.status === 'cancelled' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 dark:bg-white/[0.05] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10 disabled:opacity-50'
                  }`}
                >
                  Отменён
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}