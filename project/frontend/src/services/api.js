import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // благодаря прокси в vite.config.js это сработает
  withCredentials: true, // ✅ отправлять куки сессии
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Interceptor для добавления X-Session-ID для гостей
api.interceptors.request.use((config) => {
  // Добавляем session_id только если нет токена авторизации
  const token = localStorage.getItem('token');
  if (!token) {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('session_id', sessionId);
    }
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

// Инициализация CSRF-куки (вызывать один раз при загрузке)
export const initAPI = async () => {
  try {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    console.log('CSRF cookie установлен');
  } catch (err) {
    console.error('Ошибка установки CSRF:', err);
  }
};

export default api;