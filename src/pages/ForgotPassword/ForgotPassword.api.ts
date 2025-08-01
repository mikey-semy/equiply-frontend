import api from '@/shared/api/api';
import { handleApiResponse, handleApiError } from '@/shared/api/api.handlers';
import { ForgotPasswordRequest } from './ForgotPassword.types';

/**
 * Выполняет запрос на восстановление пароля.
 *
 * @param data - Объект с данными для восстановления пароля (email).
 * @returns Promise<void> - Успешный ответ или ошибка.
 *
 * @example
 * await ForgotPassword({ email: 'user@example.com' });
 */
export const ForgotPassword = async (data: ForgotPasswordRequest): Promise<void> => {
    try {
        const response = await api.post('/api/v1/auth/forgot-password', data);
        handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};