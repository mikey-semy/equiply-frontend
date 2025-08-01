import { ApiError } from './api.types';

/**
 * Утилита для безопасного парсинга JSON ответов
 */
export const parseJsonResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    const isJsonResponse = contentType && contentType.includes('application/json');

    if (!response.ok) {
        if (isJsonResponse) {
            throw await response.json();
        } else {
            // Создаем стандартную ошибку для не-JSON ответов
            const error: { error: ApiError } = {
                error: {
                    detail: `HTTP ${response.status}: ${response.statusText}`,
                    error_type: 'http_error',
                    status_code: response.status,
                    timestamp: new Date().toISOString(),
                    request_id: 'unknown',
                    extra: {}
                }
            };
            throw error;
        }
    }

    return isJsonResponse ? response.json() : null;
};

/**
 * Определяет, является ли устройство мобильным
 * @returns boolean - true если мобильное устройство
 */
export const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};