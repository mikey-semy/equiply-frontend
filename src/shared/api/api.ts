import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { getAccessToken, refreshAccessToken } from './auth.api';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(config => {
    // Используем правильную функцию для получения токена
    const token = getAccessToken();

    // Не добавляем токен для аутентификации
    if (token && !config.url?.includes('/auth')) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Не обрабатываем 401 для auth эндпоинтов и страницы восстановления пароля
            if (originalRequest.url?.includes('/auth') ||
                originalRequest.url?.includes('password') ||
                window.location.pathname === '/signin') {
                return Promise.reject(error);
            }

            try {
                console.log('Attempting to refresh token...');
                await refreshAccessToken();

                // Повторяем запрос с новым токеном
                const newToken = getAccessToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                // Очищаем токены
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

                // Отправляем кастомное событие вместо прямого редиректа
                window.dispatchEvent(new CustomEvent('auth-401-error'));

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;