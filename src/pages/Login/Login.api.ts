import api from '@/shared/api/api';
import { handleApiResponse, handleApiError } from '@/shared/api/api.handlers';
import { LoginRequest, LoginResponse } from './Login.types';

/**
 * Выполняет запрос на авторизацию пользователя.
 *
 * @param data - Объект с данными для входа (username и password).
 * @returns Promise<LoginResponse | undefined> - Ответ от API с токенами или undefined в случае ошибки.
 *
 * @example
 * const response = await login({ username: 'user', password: 'password' });
 * if (response) {
 *   console.log(response.access_token);
 * }
 */
export const login = async (data: LoginRequest): Promise<LoginResponse | undefined> => {
    try {
        const response = await api.post<LoginResponse>('/api/v1/auth', data);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};