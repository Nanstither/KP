import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Edit2, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/profile', formData);
      setSuccess('Профиль успешно обновлен');
      await checkAuth();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-purple-200/70">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Профиль пользователя
            </h1>
            <p className="text-gray-600 dark:text-purple-200/50">
              Управление личной информацией
            </p>
          </div>

          {/* Карточка профиля */}
          <div className="bg-white/50 dark:bg-[#0f0f10]/50 backdrop-blur-xl border border-purple-200/30 dark:border-purple-400/10 rounded-2xl p-8 shadow-xl">
            {/* Аватар и основная информация */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-purple-100">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-600 dark:text-purple-200/70 capitalize">
                  {user.role === 'admin' ? 'Администратор' : 
                   user.role === 'manager' ? 'Менеджер' : 'Пользователь'}
                </span>
              </div>
            </div>

            {/* Форма редактирования */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-purple-200/70 mb-2">
                    Имя
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-[#0f0f10]/50 border border-purple-200/30 dark:border-purple-400/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-purple-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-purple-200/70 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-[#0f0f10]/50 border border-purple-200/30 dark:border-purple-400/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-purple-100"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Сохранить
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200/50 dark:bg-white/5 hover:bg-gray-300/50 dark:hover:bg-white/10 text-gray-700 dark:text-purple-200/70 font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Отмена
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-purple-200/50 mb-1">
                    Имя
                  </label>
                  <div className="flex items-center gap-3 text-gray-800 dark:text-purple-100">
                    <User className="w-5 h-5 text-purple-400" />
                    <span>{user.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-purple-200/50 mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-3 text-gray-800 dark:text-purple-100">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-purple-200/50 mb-1">
                    Роль
                  </label>
                  <div className="flex items-center gap-3 text-gray-800 dark:text-purple-100">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="capitalize">
                      {user.role === 'admin' ? 'Администратор' : 
                       user.role === 'manager' ? 'Менеджер' : 'Пользователь'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                >
                  <Edit2 className="w-5 h-5" />
                  Редактировать профиль
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
