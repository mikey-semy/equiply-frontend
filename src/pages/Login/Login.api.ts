import { LoginRequest, LoginResponse } from './Login.types';
import { parseJsonResponse } from '@/shared/api/api.utils';

/**
 * Определяет, является ли устройство мобильным
 * @returns boolean - true если мобильное устройство
 */
const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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

    // Для мобильных устройств cookies не желательно
    const useCookies = isMobileDevice() ? 'false' : 'true';
    const url = `/api/v1/auth?use_cookies=${useCookies}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        credentials: 'include',
    });

    return parseJsonResponse(response);
};