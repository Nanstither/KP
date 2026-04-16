import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { 
  Cpu, 
  Monitor, 
  Zap, 
  Package, 
  Settings, 
  Users, 
  LogOut,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

export default function AdminPanel() {
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await api.get('/components');
      setComponents(response.data);
    } catch (error) {
      console.error('❌ Ошибка загрузки компонентов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const tabs = [
    { id: 'dashboard', label: 'Дашборд', icon: Monitor },
    { id: 'components', label: 'Компоненты', icon: Cpu },
    { id: 'orders', label: 'Заказы', icon: Package },
    ...(isAdmin() ? [{ id: 'settings', label: 'Настройки', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-950 via-purple-950/20 to-pink-950/20">
      <div className="container mx-auto px-6 py-8">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-purple-300 mb-2">
              Панель управления
            </h1>
            <p className="text-purple-200/70">
              Добро пожаловать, {user?.name} ({user?.role === 'admin' ? 'Администратор' : 'Менеджер'})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-400/30 text-purple-300 hover:bg-purple-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Боковое меню */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl bg-purple-950/30 border border-purple-400/20 backdrop-blur-xl p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-purple-300/70 hover:bg-purple-500/10'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Контент */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <DashboardTab components={components} />
            )}
            {activeTab === 'components' && (
              <ComponentsTab components={components} loading={loading} />
            )}
            {activeTab === 'orders' && (
              <OrdersTab />
            )}
            {activeTab === 'settings' && isAdmin() && (
              <SettingsTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Под-компоненты для вкладок
function DashboardTab({ components }) {
  const stats = [
    { label: 'Всего компонентов', value: components.length, icon: Cpu, color: 'from-purple-500 to-pink-500' },
    { label: 'В наличии', value: components.filter(c => c.stock > 0).length, icon: Package, color: 'from-green-500 to-emerald-500' },
    { label: 'Закончились', value: components.filter(c => c.stock === 0).length, icon: Zap, color: 'from-red-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl bg-purple-950/30 border border-purple-400/20 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300/70 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ComponentsTab({ components, loading }) {
  if (loading) {
    return <div className="text-purple-300 text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="rounded-2xl bg-purple-950/30 border border-purple-400/20 backdrop-blur-xl overflow-hidden">
      <div className="p-6 border-b border-purple-400/20 flex justify-between items-center">
        <h2 className="text-xl font-bold text-purple-300">Компоненты</h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all">
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-950/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300/70 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300/70 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300/70 uppercase">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300/70 uppercase">Наличие</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300/70 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-400/10">
            {components.map((component) => (
              <tr key={component.id} className="hover:bg-purple-500/5">
                <td className="px-6 py-4 text-sm text-purple-200">{component.id}</td>
                <td className="px-6 py-4 text-sm text-purple-200">{component.model}</td>
                <td className="px-6 py-4 text-sm text-purple-200">{component.price} ₽</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    component.stock > 0 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {component.stock > 0 ? `В наличии: ${component.stock}` : 'Нет в наличии'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-1 text-blue-400 hover:text-blue-300">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="rounded-2xl bg-purple-950/30 border border-purple-400/20 backdrop-blur-xl p-8 text-center">
      <Package className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-purple-300 mb-2">Заказы</h3>
      <p className="text-purple-200/70">Раздел в разработке</p>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="rounded-2xl bg-purple-950/30 border border-purple-400/20 backdrop-blur-xl p-8 text-center">
      <Settings className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-purple-300 mb-2">Настройки</h3>
      <p className="text-purple-200/70">Раздел в разработке</p>
    </div>
  );
}