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

const MAX_ATTEMPTS = 5; // Максимальное количество попыток
const BLOCK_TIME = 300000; // Время блокировки (5 минут)

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
            if (response?.access_token) {
                localStorage.setItem('loginAttempts', '0');
                setAttempts(0);
                setError('');
                navigate('/');
            } else {
                setError('Неверные учетные данные.');
            }
        } catch (err: unknown) {
            console.error('Ошибка входа:', err);
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            localStorage.setItem('loginAttempts', String(newAttempts));

            if (newAttempts >= MAX_ATTEMPTS) {
                block();
            } else {
                setError('Произошла ошибка.');
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
                    setRemainingTimeDisplay(`Попробуйте через ${remainingSeconds} секунд`);
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
                <h1 className={styles.loginTitle}>Equiply Access</h1>
                <Input
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ marginBottom: 10 }}
                />
                <Input.Password
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ marginBottom: 10 }}
                />
                {error ? (
                    <div className={styles.errorContainer}>{error}</div>
                ) : (
                    <div className={styles.emptyContainer} />
                )}
                <div className={styles.formLoginAction}>
                    <Button
                        htmlType="submit"
                        type="primary"
                        title="Войти"
                        disabled={isBlocked || !username || !password}
                    >
                        Войти
                    </Button>
                    <Button
                        onClick={() => navigate('/forgot-password')}
                        title="Забыли пароль?"
                    >
                        Забыли пароль?
                    </Button>
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