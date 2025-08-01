/**
 * Компонент ForgotPasswordPage
 *
 * Отображает форму для восстановления пароля с отправкой запроса на email пользователя.
 * После успешной отправки отображает сообщение об успехе.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.scss';
import { Input, Button } from 'antd';
import { ForgotPassword } from './ForgotPassword.api';

/**
 * Компонент ForgotPasswordPage для восстановления пароля
 *
 * @returns JSX.Element - Форма восстановления пароля
 */
const ForgotPasswordPage: React.FC = () => {
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
            await ForgotPassword({ email });
            setIsSuccess(true);
        } catch (err: unknown) {
            console.error('Ошибка восстановления пароля:', err);
            setError('Ошибка восстановления пароля');
        }
    };

    return (
        <div className={styles.forgotPasswordPage}>
            <form
                onSubmit={handleSubmit}
                className={`${styles.forgotPasswordForm} ${error ? styles.hasError : ''}`}
            >
                <div className={styles.formTopAction}>
                    {/* Кнопка для переключения темы */}
                </div>

                <h1 className={styles.forgotPasswordTitle}>Куда отправить пароль?</h1>
                
                {!isSuccess ? (
                    <>
                        <div className={styles.inputsContainer}>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                            />
                        </div>

                        <div className={styles.messageContainer}>
                            {error ? (
                                <div className={styles.errorContainer}>{error}</div>
                            ) : email ? (
                                <div className={styles.emptyContainer} />
                            ) : (
                                <div className={styles.inputHint}>
                                    Введите email для восстановления пароля
                                </div>
                            )}
                        </div>

                        <div className={styles.formAction}>
                            <Button
                                htmlType="submit"
                                type="primary"
                                title="Отправить"
                                disabled={!email}
                            >
                                Отправить
                            </Button>

                            <a 
                                onClick={() => navigate('/login')}
                                className={styles.backToLoginLink}
                            >
                                Вернуться к входу
                            </a>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.inputsContainer}>
                            {/* Пустая область для сохранения структуры */}
                        </div>
                        
                        <div className={styles.messageContainer}>
                            <div className={styles.successMessage}>
                                Инструкции отправлены на ваш email
                            </div>
                        </div>

                        <div className={styles.formAction}>
                            <Button
                                onClick={() => navigate('/login')}
                                title="Вернуться к входу"
                                className={styles.forgotPasswordButton}
                            >
                                Вернуться к входу
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};

export default ForgotPasswordPage;