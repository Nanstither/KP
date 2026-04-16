import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.password_confirmation) {
          setError('Пароли не совпадают');
          return;
        }
        await register(formData.name, formData.email, formData.password, formData.password_confirmation);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/20 to-pink-950/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl bg-purple-950/30 border border-purple-400/20 backdrop-blur-xl"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-purple-300">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-purple-300/70 mb-2">Имя</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-purple-950/50 border border-purple-400/30 text-purple-200 focus:outline-none focus:border-purple-400"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-purple-300/70 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-purple-950/50 border border-purple-400/30 text-purple-200 focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-purple-300/70 mb-2">Пароль</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-purple-950/50 border border-purple-400/30 text-purple-200 focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm text-purple-300/70 mb-2">Подтвердите пароль</label>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-purple-950/50 border border-purple-400/30 text-purple-200 focus:outline-none focus:border-purple-400"
                required={!isLogin}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium transition-all cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-purple-300/70">
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}