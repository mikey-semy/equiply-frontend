import { AxiosError } from 'axios';
import { BaseApiResponse, ApiError, ValidationError, ApiErrorType } from './api.types';

export type ApiResponse<T> = {
    data: T;
    status: number;
};

/**
 * Обрабатывает ошибки API с учетом различных форматов ответов
 */
export const handleApiError = (error: unknown): never => {
    if (error instanceof AxiosError) {
        const response = error.response;
        console.log('Full API Response:', response?.data);

        // Обработка ошибки валидации (422) - отдельный формат
        if (response?.status === 422) {
            const validationError: ValidationError = response.data;
            const apiError: ApiError = {
                detail: 'Ошибка валидации данных',
                error_type: 'validation_error',
                status_code: 422,
                timestamp: new Date().toISOString(),
                request_id: 'unknown',
                extra: { errors: validationError.detail }
            };
            console.error('Validation Error:', apiError);
            throw apiError;
        }

        // Обработка стандартных ошибок API (401, 403, 429)
        if (response?.data?.error) {
            const baseResponse: BaseApiResponse = response.data;
            console.error('API Error:', baseResponse.error);
            throw baseResponse.error;
        }

        // Fallback для неожиданных ошибок
        const fallbackError: ApiError = {
            detail: response?.data?.detail || error.message || 'Неизвестная ошибка',
            error_type: 'unknown_error',
            status_code: response?.status || 500,
            timestamp: new Date().toISOString(),
            request_id: 'unknown',
            extra: {}
        };
        console.error('Fallback Error:', fallbackError);
        throw fallbackError;
    }
    throw error;
};

/**
 * Обрабатывает успешные ответы API
 */
export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    throw new Error(`Unexpected response status: ${response.status}`);
};

/**
 * Получает человекочитаемое сообщение об ошибке
 */
export const getErrorMessage = (error: ApiError): string => {
    switch (error.error_type as ApiErrorType) {
        // Auth errors
        case 'invalid_credentials':
        case 'auth_error':
            return 'Неверные учетные данные';
        case 'user_inactive':
            return 'Аккаунт деактивирован';
        case 'validation_error':
            return 'Заполните все обязательные поля';
        case 'rate_limit_exceeded':
            return 'Превышен лимит запросов. Попробуйте позже';

        // Registration errors
        case 'user_exists':
            // Используем detail из ошибки для более точного сообщения
            return error.detail || 'Пользователь с такими данными уже существует';
        case 'user_creation_error':
            return 'Не удалось создать пользователя. Попробуйте позже';
        case 'user_already_exists':
            return 'Пользователь с такими данными уже существует';
        case 'email_already_exists':
            return 'Пользователь с таким email уже зарегистрирован';
        case 'username_already_exists':
            return 'Пользователь с таким именем уже существует';
        case 'phone_already_exists':
            return 'Пользователь с таким телефоном уже зарегистрирован';
        case 'weak_password':
            return 'Пароль не соответствует требованиям безопасности';

        // Общие ошибки API
        case 'not_found':
            return 'Ресурс не найден';
        case 'forbidden':
            return 'Недостаточно прав для выполнения операции';
        case 'unauthorized':
            return 'Требуется авторизация';
        case 'internal_server_error':
            return 'Внутренняя ошибка сервера';
        case 'bad_request':
            return 'Некорректный запрос';
        case 'conflict':
            return 'Конфликт данных';

        default:
            return error.detail || 'Произошла ошибка';
    }
};