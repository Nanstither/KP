import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Package, Eye, Download } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { parseApiError } from '@/lib/parseApiError';

const ACTIVE_STATUS_OPTIONS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидает оплаты' },
  { value: 'paid', label: 'Оплачен' },
  { value: 'preparing', label: 'Готовится' },
  { value: 'shipped', label: 'Отправлен' },
];

const ARCHIVE_STATUS_OPTIONS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

export default function OrdersTab() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [listScope, setListScope] = useState('active');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, listScope]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 20, scope: listScope };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const response = await api.get('/admin/orders', { params });
      setOrders(response.data.data || []);
      setPagination(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const handleScopeChange = (scope) => {
    setListScope(scope);
    setStatusFilter('all');
    setPage(1);
  };

  const handleExportArchive = async () => {
    try {
      const response = await api.get('/admin/orders/export', {
        params: { scope: 'archive' },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `archive-orders-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка экспорта:', err);
      toast.error(parseApiError(err));
    }
  };

  const statusOptions = listScope === 'archive' ? ARCHIVE_STATUS_OPTIONS : ACTIVE_STATUS_OPTIONS;
  const emptyMessage = listScope === 'archive' ? 'Архив пуст' : 'Нет заказов в работе';

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
      paid: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400',
      preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Ожидает оплаты',
      paid: 'Оплачен',
      preparing: 'Готовится',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Заказы</h2>

          <div className="flex flex-wrap gap-3">
            {listScope === 'archive' && (
              <button
                type="button"
                onClick={handleExportArchive}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Скачать Excel
              </button>
            )}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-[#1e1e22] text-gray-900 dark:text-gray-200 text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Поиск по имени..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-[#1e1e22] text-gray-900 dark:text-gray-200 text-sm w-48"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Найти
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => handleScopeChange('active')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              listScope === 'active'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Активные{pagination.total != null && listScope === 'active' ? ` (${pagination.total})` : ''}
          </button>
          <button
            type="button"
            onClick={() => handleScopeChange('archive')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              listScope === 'archive'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Архив{pagination.total != null && listScope === 'archive' ? ` (${pagination.total})` : ''}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-white/5">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Клиент</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{order.id}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <div className="font-medium">{order.recipient_name}</div>
                    {order.user && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">{order.user.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {Number(order.total_amount).toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Страница {pagination.current_page} из {pagination.last_page}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pagination.current_page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-[#1e1e22] text-gray-900 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/10"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
              disabled={pagination.current_page === pagination.last_page}
              className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-[#1e1e22] text-gray-900 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/10"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
