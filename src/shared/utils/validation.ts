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
    // Удаляем все нецифровые символы
    const numbers = value.replace(/\D/g, '');

    // Если начинается с 8, заменяем на 7
    const normalizedNumbers = numbers.startsWith('8') ? '7' + numbers.slice(1) : numbers;

    // Форматируем в +7 (XXX) XXX-XX-XX
    if (normalizedNumbers.length >= 1) {
        let formatted = '+7';
        if (normalizedNumbers.length > 1) {
            formatted += ' (' + normalizedNumbers.slice(1, 4);
            if (normalizedNumbers.length > 4) {
                formatted += ') ' + normalizedNumbers.slice(4, 7);
                if (normalizedNumbers.length > 7) {
                    formatted += '-' + normalizedNumbers.slice(7, 9);
                    if (normalizedNumbers.length > 9) {
                        formatted += '-' + normalizedNumbers.slice(9, 11);
                    }
                }
            }
        }
        return formatted;
    }

    return '+7 ';
};