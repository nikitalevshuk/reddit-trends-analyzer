import axios, { InternalAxiosRequestConfig } from 'axios';

// В production используем URL из переменной окружения, в development - локальный URL
const baseURL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL 
  : import.meta.env.VITE_API_URL; // Используем тот же URL для разработки

console.log('API Base URL:', baseURL); // Добавляем лог для проверки URL
console.log('Environment:', import.meta.env.MODE); // Проверяем режим (development/production)

// Создаем инстанс axios с базовым URL
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик для установки токена авторизации
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  const url = `${config.baseURL || ''}${config.url || ''}`;
  console.log('Making request to:', url); // Логируем полный URL запроса
  return config;
});

// Добавляем перехватчик ответов для логирования ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api; 