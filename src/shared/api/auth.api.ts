import api from '@/shared/api/api';
import { isMobileDevice } from './api.utils';
import { isTokenExpired, getUserFromToken } from '@/shared/utils/jwt.utils';

/**
 * Ответ от API при выходе из системы
 */
export type LogoutResponse = {
    success: boolean;
    message: string;
};

/**
 * Получает access токен из localStorage или cookies
 * @returns string | null - Access токен или null если не найден
 * @example
 * const token = getAccessToken();
 * if (token) {
 *   console.log('Access token:', token);
 * }
*/
export const getAccessToken = (): string | null => {
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

    return null;
};

/**
 * Получает refresh токен из localStorage или cookies
 * @returns string | null - Refresh токен или null если не найден
 *
 * @example
 * const refreshToken = getRefreshToken();
 * if (refreshToken) {
 *  console.log('Refresh token:', refreshToken);
 */
const getRefreshToken = (): string | null => {
    if (isMobileDevice()) {
        return localStorage.getItem('refresh_token');
    }

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'refresh_token') {
            return decodeURIComponent(value);
        }
    }

    return null;
};

/**
 * Выполняет выход из системы.
 *
 * @returns Promise<LogoutResponse> - Ответ с результатом операции выхода.
 *
 * @example
 * const response = await logout();
 * console.log(response.success);
 */
export const logout = async (): Promise<LogoutResponse> => {
    const clearCookies = !isMobileDevice();

    const response = await api.post(`/api/v1/auth/logout?clear_cookies=${clearCookies}`);

    // Очищаем localStorage для мобильных
    if (isMobileDevice()) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    return response.data;
};

/**
 * Обновляет access токен используя refresh токен.
 *
 * @returns Promise<void> - Успешное обновление или ошибка.
 *
 * @example
 * await refreshAccessToken();
 */
export const refreshAccessToken = async (): Promise<void> => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const useCookies = isMobileDevice() ? 'false' : 'true';
        const headers: Record<string, string> = {};

        // Для мобильных передаем refresh токен в заголовке
        if (isMobileDevice()) {
            headers['refresh-token'] = refreshToken;
        }

        const response = await api.post(`/api/v1/auth/refresh?use_cookies=${useCookies}`, {}, { headers });

        if (!response.data.success) {
            throw new Error('Refresh operation failed');
        }

        // Для мобильных сохраняем токены из ответа
        if (isMobileDevice() && response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            if (response.data.refresh_token) {
                localStorage.setItem('refresh_token', response.data.refresh_token);
            }
        }

    } catch (error) {
        console.error('Failed to refresh access token:', error);

        // Очищаем токены при неудачном обновлении
        if (isMobileDevice()) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        } else {
            // Очищаем cookies для десктопа
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
    }
};

/**
 * Проверяет, аутентифицирован ли пользователь.
 *
 * @returns boolean - true если пользователь авторизован и токен не истек.
 *
 * @example
 * if (isAuthenticated()) {
 *   console.log('User is logged in');
 * }
 */
export const isAuthenticated = (): boolean => {
    const token = getAccessToken();

    if (!token) {
        return false;
    }

    return !isTokenExpired(token);
};

/**
 * Получает информацию о текущем пользователе из токена.
 *
 * @returns User | null - Объект пользователя или null если не авторизован.
 *
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *   console.log(user.email);
 * }
 */
export const getCurrentUser = () => {
    const token = getAccessToken();
    if (!token) {
        return null;
    }

    return getUserFromToken(token);
};

/**
 * Проверяет статус авторизации (локально).
 *
 * @returns Promise<boolean> - Статус авторизации.
 *
 * @example
 * const isLoggedIn = await checkAuthStatus();
 */
export const checkAuthStatus = async (): Promise<boolean> => {
    return Promise.resolve(isAuthenticated());
};