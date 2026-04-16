import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // благодаря прокси в vite.config.js это сработает
  withCredentials: true, // ✅ отправлять куки сессии
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
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