import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import {
  Cpu, Monitor, Package, Settings, LogOut, Plus,
  TrendingUp, AlertTriangle, Users
} from 'lucide-react';

// ✅ Импортируем разделенные компоненты
import Dashboard from './Dashboard';
import ComponentsTable from './ComponentsTable';
import SettingsTab, { PlaceholderComponent } from './SettingsTab';
import UsersTab from './UsersTab';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Данные и состояние загрузки
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Фильтры
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); 
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Загрузка компонентов при старте
  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const res = await api.get('/components');
      setComponents(res.data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  // Переход к фильтру "Мало на складе"
  const navigateToLowStock = () => {
    setActiveTab('components');
    setStockFilter('low');
    setCategoryFilter('all');
    setSearch('');
    setPage(1);
  };

  // Смена вкладки
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'components') {
      setStockFilter('all');
      setPage(1);
    }
  };

  // Вычисляемые KPI (остаются здесь, так как это глобальная статистика)
  const totalStock = components.reduce((acc, c) => acc + (c.stock || 0), 0);
  const lowStockCount = components.filter(c => c.stock > 0 && c.stock <= 5).length;

  return (
    <div className="min-h-screen bg-[#0f0f10] text-gray-200 p-6 pt-30">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* --- KPI BAR (Всегда виден) --- */}
        <div className="grid grid-cols-3 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="flex flex-col items-center justify-center py-5 border-r border-white/10 last:border-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Всего компонентов</p>
            <p className="text-2xl font-bold text-white">{components.length}</p>
            <Monitor className="w-4 h-4 text-purple-500 mt-2" />
          </div>
          <div className="flex flex-col items-center justify-center py-5 border-r border-white/10 last:border-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Общий склад</p>
            <p className="text-2xl font-bold text-white">{totalStock} шт.</p>
            <Package className="w-4 h-4 text-blue-500 mt-2" />
          </div>
          <div className="flex flex-col items-center justify-center py-5 border-r border-white/10 last:border-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Заканчивается</p>
            <p className="text-2xl font-bold text-red-400">{lowStockCount}</p>
            <AlertTriangle className="w-4 h-4 text-red-500 mt-2" />
          </div>
        </div>

        {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Сайдбар */}
          <motion.aside initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <nav className="sticky top-24 space-y-1 bg-[#141416] border border-white/10 rounded-xl p-2">
              {[
                { id: 'dashboard', label: 'Дашборд', icon: TrendingUp },
                { id: 'components', label: 'Компоненты', icon: Cpu },
                { id: 'orders', label: 'Заказы', icon: Package },
                ...(user?.role === 'admin' ? [{ id: 'users', label: 'Пользователи', icon: Users }] : []),
                ...(user?.role === 'admin' ? [{ id: 'settings', label: 'Настройки', icon: Settings }] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className='sticky top-80 bg-[#141416] border border-white/10 rounded-xl p-2 mt-4'>
              <p className="text-sm text-gray-400 text-left">
                Приветствую, {user?.name} <br /> <span className='text-[12px] text-purple-300/[0.75]'>( {user?.role === 'admin' ? 'Администратор' : 'Менеджер'} )</span>
              </p>
            </div>
          </motion.aside>

          {/* Область данных (здесь происходит переключение компонентов) */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              
              {activeTab === 'dashboard' && (
                <Dashboard 
                  key="dash" 
                  components={components} 
                  onNavigateToLowStock={navigateToLowStock}
                  onGoToComponents={() => handleTabChange('components')}
                />
              )}

              {activeTab === 'components' && (
                <ComponentsTable 
                  key="comp"
                  components={components} 
                  setComponents={setComponents}
                  loading={loading}
                  search={search} setSearch={setSearch}
                  categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                  stockFilter={stockFilter} setStockFilter={setStockFilter}
                  page={page} setPage={setPage}
                  perPage={perPage} setPerPage={setPerPage}
                />
              )}

              {activeTab === 'orders' && (
                <PlaceholderComponent title="Заказы" icon={Package} />
              )}

              {activeTab === 'users' && user?.role === 'admin' && (
                <UsersTab key="users" />
              )}

              {activeTab === 'settings' && user?.role === 'admin' && (
                <SettingsTab />
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}