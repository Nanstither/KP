import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
      setOrder(response.data);
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
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Ошибка при обновлении статуса заказа');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      ready: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Ожидает оплаты',
      paid: 'Оплачен',
      preparing: 'Готовится к отправке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
      ready: 'Готов к отправке',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          ← Назад к заказам
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Заказ #{order.id}</h1>
            <p className="text-gray-600">от {new Date(order.created_at).toLocaleDateString('ru-RU')}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Информация о клиенте</h3>
            <p className="text-gray-600"><strong>Имя:</strong> {order.recipient_name}</p>
            <p className="text-gray-600"><strong>Телефон:</strong> {order.recipient_phone}</p>
            {order.recipient_email && (
              <p className="text-gray-600"><strong>Email:</strong> {order.recipient_email}</p>
            )}
            {order.user && (
              <p className="text-gray-600"><strong>Аккаунт:</strong> {order.user.name} ({order.user.email})</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Доставка</h3>
            <p className="text-gray-600"><strong>Тип:</strong> {order.delivery_type === 'pickup' ? 'Самовывоз (СДЭК)' : 'Курьер'}</p>
            <p className="text-gray-600"><strong>Адрес:</strong> {order.delivery_address}</p>
            {order.cdek_code && (
              <p className="text-gray-600"><strong>Код ПВЗ:</strong> {order.cdek_code}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Управление статусом заказа</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateOrderStatus('paid')}
              disabled={updating || order.status === 'paid'}
              className={`px-3 py-1 rounded text-sm ${order.status === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Оплачен
            </button>
            <button
              onClick={() => updateOrderStatus('preparing')}
              disabled={updating || order.status === 'preparing'}
              className={`px-3 py-1 rounded text-sm ${order.status === 'preparing' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Готовится
            </button>
            <button
              onClick={() => updateOrderStatus('shipped')}
              disabled={updating || order.status === 'shipped'}
              className={`px-3 py-1 rounded text-sm ${order.status === 'shipped' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Отправлен
            </button>
            <button
              onClick={() => updateOrderStatus('delivered')}
              disabled={updating || order.status === 'delivered'}
              className={`px-3 py-1 rounded text-sm ${order.status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Доставлен
            </button>
            <button
              onClick={() => updateOrderStatus('cancelled')}
              disabled={updating || order.status === 'cancelled'}
              className={`px-3 py-1 rounded text-sm ${order.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Отменён
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-4">Товары в заказе</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-gray-600">Количество: {item.quantity} × {item.price.toLocaleString()} ₽</p>
                    <p className="text-gray-800 font-medium">Итого: {(item.quantity * item.price).toLocaleString()} ₽</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                {item.components_data && Array.isArray(item.components_data) && item.components_data.length > 0 ? (
                  <div className="mt-3">
                    <h5 className="font-medium text-gray-700 mb-2">Комплектующие:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {item.components_data.map((comp, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">{comp.component?.model || comp.component?.name || 'Не указано'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : item.components && typeof item.components === 'object' && !Array.isArray(item.components) && Object.keys(item.components).length > 0 ? (
                  <div className="mt-3">
                    <h5 className="font-medium text-gray-700 mb-2">Комплектующие:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(item.components).map(([roleName, modelName]) => (
                        <div key={roleName} className="text-sm text-gray-600">
                          <span className="font-medium">{roleName}: </span>
                          {modelName || 'Не указано'}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-500">
                    Комплектующие не указаны
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Итого:</h3>
            <p className="text-2xl font-bold text-gray-900">{order.total_amount.toLocaleString()} ₽</p>
          </div>
          {order.paid_at && (
            <p className="text-gray-600 mt-2">Оплачено: {new Date(order.paid_at).toLocaleDateString('ru-RU')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
