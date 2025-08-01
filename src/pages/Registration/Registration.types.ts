/**
 * Данные для запроса регистрации.
 */
export type RegistrationRequest = {
    username: string;       // 1-50 символов
    email: string;          // валидный email
    phone?: string;         // +7 (XXX) XXX-XX-XX или null
    password: string;       // минимум 8 символов
};

/**
 * Данные пользователя в ответе регистрации
 */
export type RegistrationUserData = {
    id: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    access_token: string | null;  // null если use_cookies=true
    refresh_token: string | null; // null если use_cookies=true
    token_type: string;
    requires_verification: boolean;
};

/**
 * Ответ от API после успешной регистрации.
 */
export type RegistrationResponse = {
    success: boolean;
    message: string;
    data: RegistrationUserData;
};