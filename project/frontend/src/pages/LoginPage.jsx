import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';

// ─── Компонент фона с частицами ───
const ParticlesBackground = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.2 + 0.05,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [p.opacity, p.opacity / 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
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
      if (!isRegistering) {
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
      setError(err.response?.data?.message || 'Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f10] to-[#0f0f10] pointer-events-none" />
      <ParticlesBackground />

      {/* ГЛАВНЫЙ КОНТЕЙНЕР (Окно) */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[900px] h-[580px] bg-[#141416] rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden border border-white/10 z-10"
      >
        {/* --- СЛОЙ ФОРМ (Находятся под оверлеем) --- */}
        <div className="absolute inset-0 flex">
          
          {/* 🟣 ФОРМА ВХОДА (Справа, уезжает ВПРАВО при регистрации) */}
          <motion.div
            className="w-1/2 h-full flex flex-col items-center justify-center p-10 absolute right-0"
            animate={{ x: isRegistering ? '100%' : '0%' }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
            style={{ pointerEvents: isRegistering ? 'none' : 'auto' }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">Добро пожаловать</h2>
            <p className="text-gray-400 mb-8 text-sm">Введите свои данные для входа</p>

            <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  name="password"
                  type="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Загрузка...' : (
                  <>
                    <LogIn className="w-5 h-5" /> Войти
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* 🟣 ФОРМА РЕГИСТРАЦИИ (Слева, приезжает СЛЕВА при регистрации) */}
          <motion.div
            className="w-1/2 h-full flex flex-col items-center justify-center p-10 absolute left-0"
            animate={{ x: isRegistering ? '0%' : '-100%' }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
            style={{ pointerEvents: isRegistering ? 'auto' : 'none' }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">Создать аккаунт</h2>
            <p className="text-gray-400 mb-8 text-sm">Присоединяйтесь к нашему сообществу</p>

            <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  name="name"
                  type="text"
                  placeholder="Имя пользователя"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  required={isRegistering}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  name="password"
                  type="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  name="password_confirmation"
                  type="password"
                  placeholder="Подтвердите пароль"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  required={isRegistering}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Создание...' : (
                  <>
                    <UserPlus className="w-5 h-5" /> Зарегистрироваться
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* --- OVERLAY (СКОЛЬЗЯЩИЙ БЛОК) --- */}
        {/* Изначально слева (0%), при регистрации уезжает направо (100%) */}
        <motion.div
          animate={{ x: isRegistering ? '100%' : '0%' }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
          className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-purple-700 to-indigo-900 rounded-3xl shadow-2xl z-20 flex items-center justify-center text-center p-10 overflow-hidden"
        >
          {/* Декоративные пятна света */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

          <AnimatePresence mode="wait">
            {isRegistering ? (
              // Текст когда мы на странице регистрации (Кнопка "Войти")
              <motion.div
                key="welcome-back"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
              >
                <h3 className="text-3xl font-bold text-white mb-4">Уже с нами?</h3>
                <p className="text-purple-200 mb-8 text-sm leading-relaxed">
                  Чтобы не прерывать свой путь, войдите в свой аккаунт. Мы скучали!
                </p>
                <button
                  onClick={() => setIsRegistering(false)}
                  className="px-8 py-3 bg-transparent border-2 border-white rounded-full text-white font-bold hover:bg-white hover:text-purple-700 transition-all duration-300"
                >
                  ВОЙТИ
                </button>
              </motion.div>
            ) : (
              // Текст когда мы на странице входа (Кнопка "Регистрация")
              <motion.div
                key="new-here"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
              >
                <h3 className="text-3xl font-bold text-white mb-4">Новичок?</h3>
                <p className="text-purple-200 mb-8 text-sm leading-relaxed">
                  Присоединяйтесь к нам сегодня и откройте мир возможностей. Создайте аккаунт за секунды!
                </p>
                <button
                  onClick={() => setIsRegistering(true)}
                  className="px-8 py-3 bg-transparent border-2 border-white rounded-full text-white font-bold hover:bg-white hover:text-purple-700 transition-all duration-300"
                >
                  РЕГИСТРАЦИЯ
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}