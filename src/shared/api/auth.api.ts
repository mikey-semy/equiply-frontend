import { parseJsonResponse, isMobileDevice } from './api.utils';
import { apiPost, getAccessToken } from './api.client';
import { isTokenExpired, getUserFromToken } from '@/shared/utils/jwt.utils';
/**
 * Ответ от API при выходе из системы
 */
export type LogoutResponse = {
    success: boolean;
    message: string;
};

/**
 * Выполняет выход из системы
 */
export const logout = async (): Promise<LogoutResponse> => {
    const clearCookies = !isMobileDevice(); // Очищаем cookies для десктопа
    const url = `/api/v1/auth/logout?clear_cookies=${clearCookies}`;

    const response = await apiPost(url);
    const result = await parseJsonResponse(response);

    // Очищаем localStorage для мобильных
    if (isMobileDevice()) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    return result;
};

/**
 * Проверяет, аутентифицирован ли пользователь
 */
export const isAuthenticated = (): boolean => {
    const token = getAccessToken();

    console.log('=== isAuthenticated Debug ===');
    console.log('isMobileDevice:', isMobileDevice());
    console.log('localStorage access_token:', localStorage.getItem('access_token'));
    console.log('document.cookie:', document.cookie);
    console.log('getAccessToken result:', token);

    if (!token) {
        console.log('No token found, returning false');
        return false;
    }

    // Проверяем, не истек ли токен
    const expired = isTokenExpired(token);
    console.log('token expired:', expired);
    console.log('=== End Debug ===');

    return !expired;
};

/**
 * Получает информацию о текущем пользователе из токена
 */
export const getCurrentUser = () => {
    const token = getAccessToken();
    if (!token) {
        return null;
    }

    return getUserFromToken(token);
};