/**
 * Утилиты для валидации форм
 */

/**
 * Проверяет корректность имени пользователя
 */
export const validateUsername = (username: string): string | null => {
    if (!username.trim()) {
        return 'Имя пользователя обязательно';
    }
    if (username.length < 1 || username.length > 50) {
        return 'Имя пользователя должно содержать от 1 до 50 символов';
    }
    return null;
};

/**
 * Проверяет корректность email
 */
export const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
        return 'Email обязателен';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Введите корректный email';
    }
    return null;
};

/**
 * Проверяет корректность российского номера телефона
 */
export const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
        return null; // телефон опциональный
    }
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(phone)) {
        return 'Введите телефон в формате +7 (XXX) XXX-XX-XX';
    }
    return null;
};

/**
 * Проверяет силу пароля
 */
export const validatePassword = (password: string): string | null => {
    if (!password) {
        return 'Пароль обязателен';
    }
    if (password.length < 8) {
        return 'Пароль должен содержать минимум 8 символов';
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
        return 'Пароль должен содержать заглавные буквы';
    }
    if (!hasLowerCase) {
        return 'Пароль должен содержать строчные буквы';
    }
    if (!hasNumbers) {
        return 'Пароль должен содержать цифры';
    }
    if (!hasSpecial) {
        return 'Пароль должен содержать специальные символы';
    }

    return null;
};

/**
 * Форматирует номер телефона в российском формате
 */
export const formatPhoneNumber = (value: string): string => {

    // Убираем все символы кроме цифр
    const cleaned = value.replace(/\D/g, '');

    // Если пусто, возвращаем пустую строку
    if (cleaned.length === 0) {
        return '';
    }

    let digits = cleaned;

    // Если начинается с 8, заменяем на 7
    if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
    }

    // Если не начинается с 7, добавляем 7 только если есть цифры
    if (!digits.startsWith('7') && digits.length > 0) {
        digits = '7' + digits;
    }

    // Обрезаем до максимального количества цифр (11 цифр для российского номера)
    if (digits.length > 11) {
        digits = digits.slice(0, 11);
    }

    // Форматируем в зависимости от количества цифр
    if (digits.length === 1) {
        return '+7';
    } else if (digits.length <= 4) {
        return `+7 (${digits.slice(1)}`;
    } else if (digits.length <= 7) {
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    } else if (digits.length <= 9) {
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    } else {
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }

};