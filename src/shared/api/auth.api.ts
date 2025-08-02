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
 * Получает refresh токен из localStorage или cookies
 */
const getRefreshToken = (): string | null => {
    console.log('=== getRefreshToken Debug ===');
    console.log('isMobileDevice:', isMobileDevice());
    console.log('document.cookie:', document.cookie);

    // Для мобильных устройств - из localStorage
    if (isMobileDevice()) {
        const token = localStorage.getItem('refresh_token');
        console.log('Mobile refresh_token from localStorage:', token ? `${token.length} chars` : 'null');
        console.log('=== End getRefreshToken Debug ===');
        return token;
    }

    // Для десктопа - из cookies
    const cookies = document.cookie.split(';');
    console.log('All cookies:', cookies);

    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        console.log(`Cookie: ${name} = ${value ? `${value.length} chars` : 'empty'}`);
        if (name === 'refresh_token') {
            const decodedValue = decodeURIComponent(value);
            console.log('Found refresh_token cookie:', decodedValue ? `${decodedValue.length} chars` : 'empty');
            console.log('=== End getRefreshToken Debug ===');
            return decodedValue;
        }
    }

    console.log('No refresh_token cookie found');
    console.log('=== End getRefreshToken Debug ===');
    return null;
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
 * Обновляет access токен используя refresh токен
 */
export const refreshAccessToken = async (): Promise<void> => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        console.log('Refreshing access token...');
        console.log('Using refresh token:', refreshToken.substring(0, 50) + '...');

        const useCookies = isMobileDevice() ? 'false' : 'true';
        const url = `/api/v1/auth/refresh?use_cookies=${useCookies}`;

        console.log('=== Refresh API Debug ===');
        console.log('Current URL:', window.location.href);
        console.log('API URL:', url);
        console.log('Full API URL:', new URL(url, window.location.origin).href);
        console.log('useCookies:', useCookies);

        // Для мобильных используем заголовок, для десктопа полагаемся на cookies
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Для мобильных передаем refresh токен в заголовке
        if (isMobileDevice()) {
            headers['refresh-token'] = refreshToken;
        }

        // Создаем кастомный запрос
        const response = await fetch(url, {
            method: 'POST',
            headers,
            credentials: 'include', // Включаем cookies
        });

        console.log('Refresh response status:', response.status);
        console.log('Refresh response URL:', response.url);

        // Детально проверяем все заголовки ответа
        console.log('=== All Refresh Response Headers ===');
        for (const [name, value] of response.headers.entries()) {
            console.log(`${name}: ${value}`);
        }

        // Специально проверяем Set-Cookie заголовки
        const setCookieHeaders = response.headers.get('set-cookie');
        console.log('Set-Cookie header:', setCookieHeaders);

        // Проверяем cookies после запроса
        console.log('Cookies after refresh request:', document.cookie);

        if (!response.ok) {
            // Получаем детали ошибки
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = ` - ${JSON.stringify(errorData)}`;
            } catch (e) {
                // Игнорируем ошибки парсинга JSON
                console.log('Failed to parse error response as JSON:', e);
            }
            throw new Error(`Refresh failed: ${response.status} ${response.statusText}${errorDetails}`);
        }

        const result = await parseJsonResponse(response);
        console.log('Refresh response data:', result);
        console.log('=== End Refresh API Debug ===');

        // Проверяем успешность операции
        if (!result.success) {
            throw new Error('Refresh operation failed');
        }

        // Для десктопа (cookies) - токены уже установлены в cookies, проверяем их наличие
        if (!isMobileDevice()) {
            // Проверяем что новые токены есть в cookies
            const newAccessToken = getAccessToken();
            if (!newAccessToken) {
                throw new Error('No access token found in cookies after refresh');
            }
            console.log('Access token refreshed successfully via cookies');
        } else {
            // Для мобильных - сохраняем токены из ответа
            if (result.access_token) {
                localStorage.setItem('access_token', result.access_token);
                if (result.refresh_token) {
                    localStorage.setItem('refresh_token', result.refresh_token);
                }
                console.log('Access token refreshed successfully via localStorage');
            } else {
                throw new Error('No access token in refresh response for mobile');
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

        throw error;
    }
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
        console.log('=== End Debug ===');
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

/**
 * Проверяет статус авторизации (локально)
 */
export const checkAuthStatus = async (): Promise<boolean> => {
    return Promise.resolve(isAuthenticated());
};

// Экспортируем getAccessToken для обратной совместимости
export { getAccessToken } from './api.client';