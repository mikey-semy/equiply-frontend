import { isMobileDevice } from './api.utils';

/**
 * Получает токен авторизации
 */
const getAuthToken = (): string | null => {
    if (isMobileDevice()) {
        return localStorage.getItem('access_token');
    }

    // Для десктопа пытаемся получить из cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'access_token') {
            return decodeURIComponent(value);
        }
    }

    // Для десктопа cookies отправляются автоматически
    return null;
};

/**
 * Создает заголовки для API запросов с автоматической авторизацией
 */
export const createApiHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...additionalHeaders,
    };

    // Добавляем Authorization header для мобильных устройств
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

/**
 * Универсальная функция для API запросов с автоматической авторизацией
 */
export const apiRequest = async (
    url: string,
    options: RequestInit = {}
): Promise<Response> => {
    const defaultOptions: RequestInit = {
        credentials: 'include', // Для работы с cookies
        headers: createApiHeaders(options.headers as Record<string, string>),
        ...options,
    };

    return fetch(url, defaultOptions);
};

/**
 * GET запрос с автоматической авторизацией
 */
export const apiGet = async (url: string): Promise<Response> => {
    return apiRequest(url, { method: 'GET' });
};

/**
 * POST запрос с автоматической авторизацией
 */
export const apiPost = async (url: string, data?: unknown): Promise<Response> => {
    return apiRequest(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
};

/**
 * PUT запрос с автоматической авторизацией
 */
export const apiPut = async (url: string, data?: unknown): Promise<Response> => {
    return apiRequest(url, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
};

/**
 * DELETE запрос с автоматической авторизацией
 */
export const apiDelete = async (url: string): Promise<Response> => {
    return apiRequest(url, { method: 'DELETE' });
};


/**
 * Экспортируем функцию для использования в других модулях
 */
export const getAccessToken = getAuthToken;