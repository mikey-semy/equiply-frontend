/**
 * Базовая структура ответа API
 */
export type BaseApiResponse<T = unknown> = {
    success: boolean;
    message: string | null;
    data: T | null;
    error: ApiError | null;
};

/**
 * Структура ошибки API
 */
export type ApiError = {
    detail: string;
    error_type: string;
    status_code: number;
    timestamp: string;
    request_id: string;
    extra: Record<string, unknown>;
    reset_time?: number; // для ошибки 429
};

/**
 * Структура ошибки валидации (422)
 */
export type ValidationError = {
    detail: Array<{
        loc: (string | number)[];
        msg: string;
        type: string;
    }>;
};

/**
 * Ответ успешной авторизации
 */
export type AuthSuccessResponse = {
    success: true;
    message: string;
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
};

/**
 * Все возможные типы ошибок API
 */
export type ApiErrorType =
    // Auth errors
    | 'invalid_credentials'
    | 'auth_error'
    | 'user_inactive'
    | 'validation_error'
    | 'rate_limit_exceeded'
    // Registration errors
    | 'user_exists'           // 409 - Пользователь уже существует
    | 'user_creation_error'   // 500 - Ошибка создания пользователя
    | 'user_already_exists'
    | 'email_already_exists'
    | 'username_already_exists'
    | 'phone_already_exists'
    | 'weak_password'
    // HTTP errors
    | 'http_error'
    // Общие ошибки
    | 'not_found'
    | 'forbidden'
    | 'unauthorized'
    | 'internal_server_error'
    | 'bad_request'
    | 'conflict'
    | 'unknown_error';