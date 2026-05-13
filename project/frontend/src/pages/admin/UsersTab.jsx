import { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Filter, Trash2, Edit2, Save, X } from 'lucide-react';
import api from '@/services/api';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [currentPageData, setCurrentPageData] = useState({});

  // Загрузка списка пользователей
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole) params.append('role', filterRole);
      params.append('page', page);

      const response = await api.get(`/users?${params.toString()}`);
      setUsers(response.data.data);
      setCurrentPageData(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError(err.response?.data?.message || 'Не удалось загрузить пользователей.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterRole]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setNewRole(user.role);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setNewRole('');
  };

  const saveRoleChange = async (userId) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
      cancelEditing();
    } catch (err) {
      console.error('Ошибка при обновлении роли:', err);
      alert(err.response?.data?.message || 'Не удалось обновить роль.');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
      alert(err.response?.data?.message || 'Не удалось удалить пользователя.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры и поиск */}
      <div className="bg-[#141416] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h2 className="text-lg font-semibold text-white w-full sm:w-auto">Пользователи</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f10] border border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <select
              value={filterRole}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f10] border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">Все роли</option>
              <option value="user">Пользователь</option>
              <option value="manager">Менеджер</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="bg-[#141416] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f0f10] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-3 py-1.5 bg-[#0f0f10] border border-white/10 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-purple-500/50"
                          >
                            <option value="user">user</option>
                            <option value="manager">manager</option>
                            <option value="admin">admin</option>
                          </select>
                          <button
                            onClick={() => saveRoleChange(user.id)}
                            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Сохранить"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                            title="Отмена"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border min-w-[110px] justify-center ${
                              user.role === 'admin'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : user.role === 'manager'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-green-500/10 text-green-400 border-green-500/30'
                            }`}
                          >
                            {user.role === 'admin'
                              ? 'Администратор'
                              : user.role === 'manager'
                              ? 'Менеджер'
                              : 'Пользователь'}
                          </span>
                          {user.id !== 1 && (
                            <button
                              onClick={() => startEditing(user)}
                              className="p-1.5 text-gray-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                              title="Изменить роль"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {user.id === 1 ? (
                        <span className="text-gray-600 text-xs" title="Нельзя удалить главного админа">
                          —
                        </span>
                      ) : (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация (если нужно) */}
      {currentPageData.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: currentPageData.last_page }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchUsers(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPageData.current_page === page
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#141416] text-gray-400 hover:bg-white/5 border border-white/10'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
