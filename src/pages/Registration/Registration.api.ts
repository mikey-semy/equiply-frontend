import { RegistrationRequest, RegistrationResponse } from './Registration.types';
import { parseJsonResponse, isMobileDevice } from '@/shared/api/api.utils';

/**
 * Выполняет запрос на регистрацию пользователя.
 *
 * @param data - Объект с данными для регистрации
 * @returns Promise<RegistrationResponse> - Ответ от API
 */
export const register = async (data: RegistrationRequest): Promise<RegistrationResponse> => {

    const useCookies = isMobileDevice() ? 'false' : 'true';
    const url = `/api/v1/register?use_cookies=${useCookies}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
    });

    return parseJsonResponse(response);
};