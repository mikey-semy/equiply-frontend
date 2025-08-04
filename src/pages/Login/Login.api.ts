import api from '@/shared/api/api';
import { isMobileDevice } from '@/shared/api/api.utils';
import { LoginRequest, LoginResponse } from './Login.types';

/**
 * Выполняет запрос на авторизацию пользователя.
 *
 * @param data - Объект с данными для авторизации (username, password).
 * @returns Promise<LoginResponse> - Ответ с токенами и информацией о пользователе.
 *
 * @example
 * const response = await login({ username: 'user@example.com', password: 'password123' });
 * console.log(response.access_token);
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

    const response = await api.post(`/api/v1/auth?use_cookies=${useCookies}`, params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
};