/**
 * Выполняет запрос на авторизацию пользователя.
 *
 * @param data - Объект с данными для входа (username и password).
 * @returns Promise<LoginResponse | undefined> - Ответ от API с токенами или undefined в случае ошибки.
 *
 * @example
 * const response = await login({ username: 'user', password: 'password' });
 * if (response) {
 *   console.log(response.access_token);
 * }
 */

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
export type LoginResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
};