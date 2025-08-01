import { LoginRequest, LoginResponse } from './Login.types';
import { parseJsonResponse, isMobileDevice } from '@/shared/api/api.utils';

/**
 * Выполняет запрос на авторизацию пользователя.
 *
 * @param data - Объект с данными для входа (username и password).
 * @returns Promise<LoginResponse> - Ответ от API с токенами.
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', data.username);
    params.append('password', data.password);
    params.append('scope', '');
    params.append('client_id', '');
    params.append('client_secret', '');

    const useCookies = isMobileDevice() ? 'false' : 'true';
    const url = `/api/v1/auth?use_cookies=${useCookies}`;

    console.log('=== Login API Debug ===');
    console.log('Current URL:', window.location.href);
    console.log('API URL:', url);
    console.log('Full API URL:', new URL(url, window.location.origin).href);
    console.log('Same origin?', new URL(url, window.location.origin).origin === window.location.origin);
    console.log('useCookies:', useCookies);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        credentials: 'include',
    });

    console.log('Response status:', response.status);
    console.log('Response URL:', response.url);

    // Детально проверяем все заголовки ответа
    console.log('=== All Response Headers ===');
    for (const [name, value] of response.headers.entries()) {
        console.log(`${name}: ${value}`);
    }

    // Специально проверяем Set-Cookie заголовки (могут быть множественные)
    const setCookieHeaders = response.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeaders);

    // Проверяем cookies после запроса
    console.log('Cookies after request:', document.cookie);

    const result = await parseJsonResponse(response);
    console.log('Parsed response:', result);
    console.log('=== End Login API Debug ===');

    return result;
};