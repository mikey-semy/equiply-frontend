/**
 * Компонент LoginPage
 *
 * Отображает форму входа с обработкой ошибок, блокировкой после превышения лимита попыток
 * и перенаправлением на главную страницу после успешной авторизации.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.scss';
import { Input, Button } from 'antd';
import { login } from './Login.api';
import { getErrorMessage } from '@/shared/api/api.handlers';
import { ApiError } from '@/shared/api/api.types';
import { isMobileDevice } from '@/shared/api/api.utils';

const MAX_ATTEMPTS = 5; // Максимальное количество попыток
const BLOCK_TIME = 3//300000; // Время блокировки (5 минут)

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
    const [attempts, setAttempts] = useState(() => Number(localStorage.getItem('loginAttempts')) || 0);
    const [isBlocked, setIsBlocked] = useState(() => {
        const blockUntil = localStorage.getItem('blockUntil');
        return blockUntil && Number(blockUntil) > Date.now();
    });
    const [remainingTimeDisplay, setRemainingTimeDisplay] = useState('');

    /**
     * Блокирует пользователя после превышения лимита попыток
     */
    const block = () => {
        setIsBlocked(true);
        const blockUntil = Date.now() + BLOCK_TIME;
        localStorage.setItem('blockUntil', String(blockUntil));
        const remainingTime = Math.ceil((blockUntil - Date.now()) / 1000);
        setError(`Повторите попытку через ${remainingTime} секунд`);
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

        try {
            const response = await login({ username, password });

            console.log('=== Login Debug ===');
            console.log('Login response:', response);
            console.log('isMobileDevice:', isMobileDevice());
            console.log('Cookies before saving:', document.cookie);
            console.log('LocalStorage before saving:', localStorage.getItem('access_token'));

            if (response?.success) {
                localStorage.setItem('loginAttempts', '0');
                setAttempts(0);
                setError('');

                // Для мобильных устройств сохраняем токены в localStorage
                // (для десктопа они автоматически сохраняются в cookies)
                if (response.access_token && response.refresh_token) {

                    console.log('Response has tokens, saving to localStorage:', {
                        access_token: response.access_token,
                        refresh_token: response.refresh_token
                    });

                    localStorage.setItem('access_token', response.access_token);
                    localStorage.setItem('refresh_token', response.refresh_token);
                } else {
                    console.log('No tokens in response - should be in cookies for desktop');
                    console.log('Response data:', {
                        access_token: response.access_token,
                        refresh_token: response.refresh_token,
                        token_type: response.token_type,
                        expires_in: response.expires_in
                    });
                }

                console.log('Cookies after login:', document.cookie);
                console.log('LocalStorage after login:', localStorage.getItem('access_token'));
                console.log('=== End Login Debug ===');

                // Уведомляем приложение об изменении аутентификации
                window.dispatchEvent(new Event('auth-change'));

                navigate('/');
            } else {
                setError('Неверные учетные данные.');
            }
        } catch (err: unknown) {
            console.error('Ошибка входа:', err);
            if (err && typeof err === 'object' && 'error' in err) {
                const apiError = (err as { error: ApiError }).error;
                setError(getErrorMessage(apiError));
            } else if (err && typeof err === 'object' && 'error_type' in err) {
                // Если ошибка пришла напрямую (не в wrapper'е)
                setError(getErrorMessage(err as ApiError));
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
                    <Input
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

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
                        disabled={isBlocked || !username || !password}
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