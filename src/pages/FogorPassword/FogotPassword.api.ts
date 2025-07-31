import api from '@/shared/api/api';
import { handleApiResponse, handleApiError } from '@/shared/api/api.handlers';
import { FogotPasswordRequest } from './FogotPassword.types';

/**
 * Выполняет запрос на восстановление пароля.
 *
 * @param data - Объект с данными для восстановления пароля (email).
 * @returns Promise<void> - Успешный ответ или ошибка.
 *
 * @example
 * await FogotPassword({ email: 'user@example.com' });
 */
export const FogotPassword = async (data: FogotPasswordRequest): Promise<void> => {
    try {
        const response = await api.post('/api/v1/auth/forgot-password', data);
        handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};