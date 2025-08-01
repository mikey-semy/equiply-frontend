import { RegistrationRequest, RegistrationResponse } from './Registration.types';
import { parseJsonResponse } from '@/shared/api/api.utils';

/**
 * Определяет, является ли устройство мобильным
 * @returns boolean - true если мобильное устройство
 */
const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Выполняет запрос на регистрацию пользователя.
 *
 * @param data - Объект с данными для регистрации
 * @returns Promise<RegistrationResponse> - Ответ от API
 */
export const register = async (data: RegistrationRequest): Promise<RegistrationResponse> => {
    // Для мобильных устройств cookies не желательно
    const useCookies = isMobileDevice() ? 'false' : 'true';
    const url = `/api/v1/register?use_cookies=${useCookies}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Для работы с cookies (если роутер будет обновлен)
    });

    return parseJsonResponse(response);
};