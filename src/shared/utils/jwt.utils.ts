/**
 * Тип данных в payload JWT токена
 */
export interface JWTPayload {
    sub: string;        // email пользователя
    expires_at: number; // timestamp истечения
    user_id: string;    // ID пользователя
    is_verified: boolean; // статус верификации
    role: string;       // роль пользователя
    iat?: number;       // issued at (опционально)
    exp?: number;       // expiration time (опционально)
}

/**
 * Декодирует JWT токен без проверки подписи (только для чтения payload)
 *
 * @param token - JWT токен
 * @returns Декодированный payload или null если токен некорректный
 */
export const decodeJWT = (token: string): JWTPayload | null => {
    if (!token || typeof token !== 'string') {
        return null;
    }

    try {
        // JWT состоит из трех частей, разделенных точками
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Декодируем payload (вторая часть)
        const payload = parts[1];

        // Добавляем padding если необходимо
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

        // Декодируем из base64
        const decodedPayload = atob(paddedPayload);

        // Парсим JSON
        return JSON.parse(decodedPayload) as JWTPayload;
    } catch (error) {
        console.warn('Ошибка декодирования JWT токена:', error);
        return null;
    }
};

/**
 * Проверяет, истек ли токен
 *
 * @param token - JWT токен
 * @returns true если токен истек
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload) {
        return true;
    }

    const now = Math.floor(Date.now() / 1000);

    // Проверяем expires_at из нашего payload
    if (payload.expires_at && payload.expires_at < now) {
        return true;
    }

    // Проверяем стандартное поле exp (если есть)
    if (payload.exp && payload.exp < now) {
        return true;
    }

    return false;
};

/**
 * Получает информацию о пользователе из токена
 *
 * @param token - JWT токен
 * @returns Информация о пользователе или null
 */
export const getUserFromToken = (token: string): {
    userId: string;
    email: string;
    isVerified: boolean;
    role: string;
} | null => {
    const payload = decodeJWT(token);
    if (!payload) {
        return null;
    }

    return {
        userId: payload.user_id,
        email: payload.sub,
        isVerified: payload.is_verified,
        role: payload.role,
    };
};