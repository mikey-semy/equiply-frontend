/**
 * Компонент RegistrationPage
 *
 * Отображает форму регистрации с валидацией полей на фронтенде
 * и обработкой ошибок от API.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from 'antd';
import { register } from './Registration.api';
import { getErrorMessage } from '@/shared/api/api.handlers';
import { ApiError } from '@/shared/api/api.types';
import {
    validateUsername,
    validateEmail,
    validatePhone,
    validatePassword,
    formatPhoneNumber
} from '@/shared/utils/validation';
import styles from './Registration.module.scss';

/**
 * Компонент RegistrationPage
 *
 * @returns JSX.Element - Форма регистрации
 */
const RegistrationPage: React.FC = () => {
    const navigate = useNavigate();

    // Состояние полей формы
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('+7 ');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Состояние ошибок валидации
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Валидирует все поля формы
     */
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        const usernameError = validateUsername(username);
        if (usernameError) newErrors.username = usernameError;

        const emailError = validateEmail(email);
        if (emailError) newErrors.email = emailError;

        const phoneError = validatePhone(phone);
        if (phoneError) newErrors.phone = phoneError;

        const passwordError = validatePassword(password);
        if (passwordError) newErrors.password = passwordError;

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Обрабатывает изменение телефона с форматированием
     */
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);

        // Очищаем ошибку при вводе
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    /**
     * Обрабатывает отправку формы регистрации
     */
    const handleRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await register({
                username: username.trim(),
                email: email.trim(),
                phone: phone.trim() === '+7 ' ? undefined : phone.trim(),
                password,
            });

            if (response?.success && response.data) {
                // Пользователь всегда попадает на главную страницу после регистрации
                // Токены уже установлены (в cookies для десктопа, в JSON для мобильных)
                navigate('/', {
                    state: {
                        message: response.message, // "Регистрация завершена. Подтвердите email для полного доступа."
                        showVerificationReminder: response.data.requires_verification,
                        userEmail: email.trim()
                    }
                });
            } else {
                setApiError('Ошибка регистрации. Попробуйте еще раз.');
            }
        } catch (err: unknown) {
            console.error('Ошибка регистрации:', err);

            if (err && typeof err === 'object' && 'error' in err) {
                const apiError = (err as { error: ApiError }).error;
                setApiError(getErrorMessage(apiError));
            } else if (err && typeof err === 'object' && 'error_type' in err) {
                setApiError(getErrorMessage(err as ApiError));
            } else {
                setApiError('Произошла ошибка при регистрации.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = username && email && password && confirmPassword && password === confirmPassword;

    return (
        <div className={styles.registrationPage}>
            <form
                onSubmit={handleRegistration}
                className={`${styles.formRegistration} ${apiError ? styles.hasError : ''}`}
            >
                <h1 className={styles.registrationTitle}>Создать аккаунт</h1>

                <div className={styles.inputsContainer}>
                    <div className={styles.inputGroup}>
                        <Input
                            placeholder="Имя пользователя *"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (errors.username) {
                                    setErrors(prev => ({ ...prev, username: '' }));
                                }
                            }}
                            status={errors.username ? 'error' : ''}
                            maxLength={50}
                        />
                        {errors.username && (
                            <div className={styles.fieldError}>{errors.username}</div>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <Input
                            placeholder="Email *"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) {
                                    setErrors(prev => ({ ...prev, email: '' }));
                                }
                            }}
                            status={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                            <div className={styles.fieldError}>{errors.email}</div>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <Input
                            placeholder="Телефон (опционально)"
                            value={phone}
                            onChange={handlePhoneChange}
                            status={errors.phone ? 'error' : ''}
                            maxLength={18} // +7 (XXX) XXX-XX-XX
                        />
                        {errors.phone && (
                            <div className={styles.fieldError}>{errors.phone}</div>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <Input.Password
                            placeholder="Пароль *"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: '' }));
                                }
                            }}
                            status={errors.password ? 'error' : ''}
                        />
                        {errors.password && (
                            <div className={styles.fieldError}>{errors.password}</div>
                        )}
                        <div className={styles.passwordHint}>
                            Минимум 8 символов, заглавные и строчные буквы, цифры и специальные символы
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <Input.Password
                            placeholder="Подтвердите пароль *"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) {
                                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                }
                            }}
                            status={errors.confirmPassword ? 'error' : ''}
                        />
                        {errors.confirmPassword && (
                            <div className={styles.fieldError}>{errors.confirmPassword}</div>
                        )}
                    </div>
                </div>

                <div className={styles.messageContainer}>
                    {apiError ? (
                        <div className={styles.errorContainer}>{apiError}</div>
                    ) : (
                        <div className={styles.emptyContainer} />
                    )}
                </div>

                <div className={styles.formRegistrationAction}>
                    <Button
                        htmlType="submit"
                        type="primary"
                        title="Зарегистрироваться"
                        disabled={!isFormValid || isLoading}
                        loading={isLoading}
                        className={styles.registrationButton}
                    >
                        Зарегистрироваться
                    </Button>

                    <a
                        onClick={() => navigate('/signin')}
                        className={styles.loginLink}
                    >
                        Уже есть аккаунт? Войти
                    </a>
                </div>
            </form>
        </div>
    );
};

export default RegistrationPage;