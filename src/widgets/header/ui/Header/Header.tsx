import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '@/shared/ui/Logo/Logo';
import { ThemeSwitcher } from '@/features/theme-switcher/ui/ThemeSwitcher/ThemeSwitcher';
import { useTheme } from '@/app/providers/ThemeProvider';
import { logout } from '@/shared/api/auth.api';
import { getErrorMessage } from '@/shared/api/api.handlers';
import { ApiError } from '@/shared/api/api.types';
import styles from './Header.module.scss';

const { Header: AntHeader } = Layout;

interface HeaderProps {
    isAuthenticated: boolean;
    onAuthChange: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated, onAuthChange }) => {
    const { isDark, toggleTheme } = useTheme();
    const [isFading, setIsFading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleThemeSwitch = () => {
        setIsFading(true);
        setTimeout(() => {
            toggleTheme();
            setTimeout(() => setIsFading(false), 250);
        }, 250);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            const response = await logout();

            if (response?.success) {
                message.success(response.message || 'Выход выполнен успешно');
                onAuthChange();
                navigate('/signin');
            } else {
                message.error('Ошибка при выходе из системы');
            }
        } catch (err: unknown) {
            console.error('Ошибка выхода:', err);

            if (err && typeof err === 'object' && 'error' in err) {
                const apiError = (err as { error: ApiError }).error;
                message.error(getErrorMessage(apiError));
            } else if (err && typeof err === 'object' && 'error_type' in err) {
                message.error(getErrorMessage(err as ApiError));
            } else {
                message.error('Произошла ошибка при выходе');
            }
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleMenuClick = (key: string) => {
        switch (key) {
            case 'home':
                navigate('/');
                break;
            case 'signin':
                navigate('/signin');
                break;
            case 'signup':
                navigate('/signup');
                break;
            case 'catalog':
                // TODO: Добавить страницу каталога
                break;
            case 'about':
                // TODO: Добавить страницу о нас
                break;
        }
    };

    // Определяем активный пункт меню на основе текущего пути
    const getSelectedKey = () => {
        if (location.pathname === '/signin') {
            return ['signin'];
        }
        if (location.pathname === '/signup') {
            return ['signup'];
        }
        if (location.pathname === '/') {
            return ['home'];
        }
        return ['home'];
    };

    // Меню пользователя (dropdown)
    const userMenuItems = [
        {
            key: 'profile',
            label: 'Профиль',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile'),
        },
        {
            key: 'settings',
            label: 'Настройки',
            icon: <SettingOutlined />,
            onClick: () => navigate('/settings'),
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            label: isLoggingOut ? 'Выходим...' : 'Выйти',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
            disabled: isLoggingOut,
        },
    ];

    const items = isAuthenticated
        ? [
            {
                key: 'home',
                label: 'Главная',
                onClick: () => handleMenuClick('home')
            },
            {
                key: 'catalog',
                label: 'Каталог',
                onClick: () => handleMenuClick('catalog')
            },
            {
                key: 'about',
                label: 'О нас',
                onClick: () => handleMenuClick('about')
            },
        ]
        : [
            {
                key: 'signin',
                label: 'Вход',
                onClick: () => handleMenuClick('signin')
            },
            {
                key: 'signup',
                label: 'Регистрация',
                onClick: () => handleMenuClick('signup')
            },
        ];

    return (
        <AntHeader className={styles.header}>
            <Logo />
            <Menu
                theme={isDark ? 'dark' : 'light'}
                mode="horizontal"
                selectedKeys={getSelectedKey()}
                items={items}
                className={`${styles.menu} menu-fade${isFading ? ' menu-fade-out' : ''}`}
            />
            <div className={styles.headerActions}>
                <ThemeSwitcher isDark={isDark} onChange={handleThemeSwitch} />

                {isAuthenticated && (
                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <Avatar
                            icon={<UserOutlined />}
                            className={styles.userAvatar}
                            style={{ cursor: 'pointer' }}
                        />
                    </Dropdown>
                )}
            </div>
        </AntHeader>
    );
};
