import api from '@/shared/api/api';
import { isMobileDevice } from '@/shared/api/api.utils';
import { RegistrationRequest, RegistrationResponse } from './Registration.types';

/**
 * Выполняет запрос на регистрацию пользователя.
 *
 * @param data - Объект с данными для регистрации (email, password, name и др.).
 * @returns Promise<RegistrationResponse> - Ответ с информацией о созданном пользователе.
 *
 * @example
 * const response = await register({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   name: 'John Doe'
 * });
 * console.log(response.user);
 */
export const register = async (data: RegistrationRequest): Promise<RegistrationResponse> => {
    const useCookies = isMobileDevice() ? 'false' : 'true';

    const response = await api.post(`/api/v1/register?use_cookies=${useCookies}`, data);

    return response.data;
};