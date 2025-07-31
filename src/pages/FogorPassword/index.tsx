/**
 * Компонент ResetPasswordPage
 *
 * Отображает форму для восстановления пароля с отправкой запроса на email пользователя.
 * После успешной отправки отображает сообщение об успехе.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FogotPassword.module.scss';
import { Input, Button } from 'antd';
import { FogotPassword } from './FogotPassword.api';

/**
 * Компонент ResetPasswordPage для восстановления пароля
 *
 * @returns JSX.Element - Форма восстановления пароля
 */
const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    /**
     * Обрабатывает отправку формы восстановления пароля
     *
     * @param e - Событие отправки формы
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await FogotPassword({ email });
            setIsSuccess(true);
        } catch (err: unknown) {
            console.error('Ошибка восстановления пароля:', err);
            setError('Ошибка восстановления пароля');
        }
    };

    return (
        <div className={styles.FogotPasswordPage}>
            <form
                onSubmit={handleSubmit}
                className={`${styles.FogotPasswordForm} ${error ? styles.hasError : ''}`}
            >
                <div className={styles.formTopAction}>
                    {/* Кнопка для переключения темы */}
                </div>
                <h1 className={styles.FogotPasswordTitle}>Куда отправить пароль?</h1>
                {!isSuccess ? (
                    <>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            style={{ marginBottom: 10 }}
                            required
                        />
                        {error ? (
                            <div className={styles.errorContainer}>{error}</div>
                        ) : email ? (
                            <div className={styles.emptyContainer} />
                        ) : (
                            <div className={styles.inputHint}>
                                Введите email для восстановления пароля
                            </div>
                        )}
                        <div className={styles.formAction}>
                            <Button
                                htmlType="submit"
                                type="primary"
                                title="Отправить"
                                disabled={!email}
                            >
                                Отправить
                            </Button>
                            <Button
                                onClick={() => navigate('/login')}
                                title="Нет, не забыл"
                            >
                                Нет, не забыл
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div>Новый пароль отправлен на email</div>
                        <Button
                            onClick={() => navigate('/login')}
                            title="Хорошо"
                        >
                            Хорошо
                        </Button>
                    </>
                )}
            </form>
        </div>
    );
};

export default ResetPasswordPage;