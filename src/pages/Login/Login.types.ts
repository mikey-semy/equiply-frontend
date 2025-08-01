import { AuthSuccessResponse } from '@/shared/api/api.types';

/**
 * Данные для запроса авторизации.
 */
export type LoginRequest = {
    username: string;
    password: string;
};

/**
 * Ответ от API после успешной авторизации.
 */
export type LoginResponse = AuthSuccessResponse;