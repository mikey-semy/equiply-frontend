/**
 * Компонент LoginPage
 *
 * Отображает форму входа с обработкой ошибок, блокировкой после превышения лимита попыток
 * и перенаправлением на главную страницу после успешной авторизации.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.scss';
import { Input, Button, Tooltip } from 'antd';
import { UserOutlined, InfoCircleOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { login } from './Login.api';
import { getErrorMessage } from '@/shared/api/api.handlers';
import { ApiError } from '@/shared/api/api.types';
import { isMobileDevice } from '@/shared/api/api.utils';
import { formatPhoneNumber, validateEmail, validatePhone } from '@/shared/utils/validation';

const MAX_ATTEMPTS = 5; // Максимальное количество попыток
const BLOCK_TIME = 300000; //300000; // Время блокировки (5 минут)

/**
 * Определяет тип введенных данных
 */
const getInputType = (value: string): 'email' | 'phone' | 'username' => {
    if (value.includes('@')) {
        return 'email';
    }
    if (value.startsWith('+7') || /^\d/.test(value.replace(/\D/g, ''))) {
        return 'phone';
    }
    return 'username';
};

/**
 * Получает иконку в зависимости от типа ввода
 */
const getInputIcon = (inputType: 'email' | 'phone' | 'username') => {
    switch (inputType) {
        case 'email':
            return <MailOutlined />;
        case 'phone':
            return <PhoneOutlined />;
        default:
            return <UserOutlined />;
    }
};

/**
 * Компонент LoginPage
 *
 * @returns JSX.Element - Форма входа
 */
const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const [attempts, setAttempts] = useState(() => Number(localStorage.getItem('loginAttempts')) || 0);
    const [isBlocked, setIsBlocked] = useState(() => {
        const blockUntil = localStorage.getItem('blockUntil');
        return blockUntil && Number(blockUntil) > Date.now();
    });
    const [remainingTimeDisplay, setRemainingTimeDisplay] = useState('');

    // Определяем тип ввода для динамической иконки
    const inputType = getInputType(username);

    /**
     * Обрабатывает изменение поля ввода логина с автоформатированием и валидацией
     */
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        let formattedValue = inputValue;
        let validation = '';

        const detectedType = getInputType(inputValue);

        // Форматируем телефон автоматически
        if (detectedType === 'phone') {
            formattedValue = formatPhoneNumber(inputValue);
            // Валидируем телефон только если введено достаточно символов
            if (formattedValue.length > 4) {
                validation = validatePhone(formattedValue) || '';
            }
        } else if (detectedType === 'email' && inputValue.trim()) {
            // Валидируем email только если есть @ и что-то после него
            if (inputValue.includes('@') && inputValue.split('@')[1]) {
                validation = validateEmail(inputValue) || '';
            }
        }

        setUsername(formattedValue);
        setValidationError(validation);
    };

    /**
     * Блокирует пользователя после превышения лимита попыток
     */
    const block = () => {
        setIsBlocked(true);
        const blockUntil = Date.now() + BLOCK_TIME;
        localStorage.setItem('blockUntil', String(blockUntil));
        const remainingTime = Math.ceil((blockUntil - Date.now()) / 1000);
        setError(`Повторите попытку через ${remainingTime / 60} минут`);
    };

    /**
     * Обрабатывает отправку формы входа
     *
     * @param e - Событие отправки формы
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isBlocked) {
            setError('Слишком много попыток. Попробуйте позже.');
            return;
        }

        // Финальная валидация перед отправкой
        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            const response = await login({ username: username, password });

            console.log('=== Login Debug ===');
            console.log('Login response:', response);
            console.log('Input type:', inputType);
            console.log('Username for API:', username);
            console.log('isMobileDevice:', isMobileDevice());

            if (response?.success) {
                localStorage.setItem('loginAttempts', '0');
                setAttempts(0);
                setError('');

                // Для мобильных устройств сохраняем токены в localStorage
                // (для десктопа они автоматически сохраняются в cookies)
                if (response.access_token && response.refresh_token) {
                    localStorage.setItem('access_token', response.access_token);
                    localStorage.setItem('refresh_token', response.refresh_token);
                }

                // Уведомляем приложение об изменении аутентификации
                window.dispatchEvent(new Event('auth-change'));
                navigate('/');
            } else {
                setError('Неверные учетные данные.');
            }
        } catch (err: unknown) {
            console.error('Ошибка входа:', err);

            if (err && typeof err === 'object') {
                // Проверяем разные возможные структуры ошибки
                if ('error' in err && typeof err.error === 'string') {
                    // Если error это строка, извлекаем текст после ": "
                    const errorText = err.error as string;
                    const message = errorText.includes(': ')
                        ? errorText.split(': ').slice(1).join(': ') // Убираем "401: " и берем остальное
                        : errorText;
                    setError(message);
                } else if ('detail' in err && typeof err.detail === 'string') {
                    // Используем detail если есть
                    setError(err.detail as string);
                } else if ('error' in err) {
                    // Fallback к getErrorMessage для сложных структур
                    const apiError = (err as { error: ApiError }).error;
                    setError(getErrorMessage(apiError));
                } else if ('error_type' in err) {
                    // Если ошибка пришла напрямую (не в wrapper'е)
                    setError(getErrorMessage(err as ApiError));
                } else {
                    setError('Произошла ошибка.');
                }
            } else {
                setError('Произошла ошибка.');
            }

            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            localStorage.setItem('loginAttempts', String(newAttempts));

            if (newAttempts >= MAX_ATTEMPTS) {
                block();
            }
        }
    };

    /**
     * Проверяет статус блокировки и обновляет оставшееся время
     */
    useEffect(() => {
        const checkBlockStatus = () => {
            const blockUntil = localStorage.getItem('blockUntil');
            if (blockUntil) {
                const remaining = Number(blockUntil) - Date.now();
                if (remaining <= 0) {
                    setIsBlocked(false);
                    setError('');
                    setAttempts(0);
                    setRemainingTimeDisplay('');
                    localStorage.removeItem('blockUntil');
                    localStorage.setItem('loginAttempts', '0');
                } else {
                    setIsBlocked(true);
                    const remainingSeconds = Math.ceil(remaining / 1000);
                    setRemainingTimeDisplay(`${remainingSeconds}`);
                }
            }
        };

        checkBlockStatus();
        const interval = setInterval(checkBlockStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    // Определяем статус валидации для стилизации
    const hasValidationError = validationError && username.length > 0;
    const isValid = username.length > 0 && !validationError;

    return (
        <div className={styles.loginPage}>
            <form
                onSubmit={handleLogin}
                className={`${styles.formLogin} ${error ? styles.hasError : ''}`}
            >
                <div className={styles.formTopAction}>
                    {/* Кнопка для переключения темы */}
                </div>

                <h1 className={styles.loginTitle}>Equiply Access</h1>

                <div className={styles.inputsContainer}>
                    <Tooltip
                        title="Вы можете использовать email, имя пользователя или номер телефона в формате +7 (XXX) XXX-XX-XX"
                        placement="topLeft"
                    >
                        <Input
                            prefix={getInputIcon(inputType)}
                            suffix={
                                <Tooltip title="Email, имя пользователя или телефон +7 (XXX) XXX-XX-XX">
                                    <InfoCircleOutlined
                                        style={{
                                            color: hasValidationError
                                                ? '#ff4d4f'
                                                : isValid
                                                    ? '#52c41a'
                                                    : 'rgba(0,0,0,.45)'
                                        }}
                                    />
                                </Tooltip>
                            }
                            placeholder="Email, имя пользователя или телефон"
                            value={username}
                            onChange={handleUsernameChange}
                            status={hasValidationError ? 'error' : undefined}
                        />
                    </Tooltip>

                    {validationError && username.length > 0 && (
                        <div className={styles.validationError}>
                            {validationError}
                        </div>
                    )}

                    <Input.Password
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className={styles.messageContainer}>
                    {error ? (
                        <div className={styles.errorContainer}>{error}</div>
                    ) : (
                        <div className={styles.emptyContainer} />
                    )}
                </div>

                <div className={styles.formLoginAction}>
                    <Button
                        htmlType="submit"
                        type="primary"
                        title="Войти"
                        disabled={!!(isBlocked || !username || !password || hasValidationError)}
                        className={styles.loginButton}
                    >
                        Войти
                    </Button>

                    <a
                        onClick={() => navigate('/forgot-password')}
                        className={styles.forgotPasswordLink}
                    >
                        Забыли пароль?
                    </a>
                    <a
                        onClick={() => navigate('/signup')}
                        className={styles.signupLink}
                    >
                        Нет аккаунта? Зарегистрироваться
                    </a>

                </div>

                {isBlocked && (
                    <div className={styles.attemptsContainer}>
                        {remainingTimeDisplay}
                    </div>
                )}
            </form>
        </div>
    );
};

export default LoginPage;