import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, message, Button, Drawer } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    StarOutlined,
    CompassOutlined,
    LoginOutlined,
    UserAddOutlined,
    MenuOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
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

export const Header: React.FC<HeaderProps> = ({ isAuthenticated: authProp, onAuthChange }) => {
    const { isDark, toggleTheme } = useTheme();
    const [isFading, setIsFading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();
    const location = useLocation();

    // Проверяем, находимся ли мы на странице AI
    const isAIPage = location.pathname === '/ai';

    // Отслеживаем размер экрана
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        setMobileMenuOpen(false);

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
        setMobileMenuOpen(false);

        switch (key) {
            case 'home':
                navigate('/');
                break;
            case 'recent':
                navigate('/dashboard/recent');
                break;
            case 'starred':
                navigate('/dashboard/starred');
                break;
            case 'explorer':
                navigate('/dashboard/explorer');
                break;
            case 'signin':
                navigate('/signin');
                break;
            case 'signup':
                navigate('/signup');
                break;
            case 'back-to-home':
                navigate('/');
                break;
        }
    };

    // Определяем активный пункт меню на основе текущего пути
    const getSelectedKey = () => {
        const path = location.pathname;

        if (path === '/signin') return ['signin'];
        if (path === '/signup') return ['signup'];
        if (path === '/dashboard/recent') return ['recent'];
        if (path === '/dashboard/starred') return ['starred'];
        if (path === '/dashboard/explorer') return ['explorer'];
        if (path === '/' || path === '/dashboard') return ['home'];
        if (path === '/ai') return ['back-to-home'];

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

    // Основные пункты меню - разные для AI страницы и остальных
    const mainMenuItems = authProp
        ? isAIPage
            ? [
                {
                    key: 'back-to-home',
                    label: 'Вернуться на главную',
                    icon: <ArrowLeftOutlined />,
                    onClick: () => handleMenuClick('back-to-home')
                }
            ]
            : [
                {
                    key: 'home',
                    label: 'Главная',
                    icon: <HomeOutlined />,
                    onClick: () => handleMenuClick('home')
                },
                {
                    key: 'recent',
                    label: 'Недавние',
                    icon: <ClockCircleOutlined />,
                    onClick: () => handleMenuClick('recent')
                },
                {
                    key: 'starred',
                    label: 'Избранное',
                    icon: <StarOutlined />,
                    onClick: () => handleMenuClick('starred')
                },
                {
                    key: 'explorer',
                    label: 'Обзор',
                    icon: <CompassOutlined />,
                    onClick: () => handleMenuClick('explorer')
                },
            ]
        : [
            {
                key: 'signin',
                label: 'Вход',
                icon: <LoginOutlined />,
                onClick: () => handleMenuClick('signin')
            },
            {
                key: 'signup',
                label: 'Регистрация',
                icon: <UserAddOutlined />,
                onClick: () => handleMenuClick('signup')
            },
        ];

    // Полное меню для мобильных
    const mobileMenuItems = authProp
        ? isAIPage
            ? [
                {
                    key: 'back-to-home',
                    label: 'Вернуться на главную',
                    icon: <ArrowLeftOutlined />,
                    onClick: () => handleMenuClick('back-to-home')
                },
                { type: 'divider' as const },
                {
                    key: 'profile',
                    label: 'Профиль',
                    icon: <UserOutlined />,
                    onClick: () => handleMenuClick('profile')
                },
                {
                    key: 'settings',
                    label: 'Настройки',
                    icon: <SettingOutlined />,
                    onClick: () => handleMenuClick('settings')
                },
                { type: 'divider' as const },
                {
                    key: 'logout',
                    label: isLoggingOut ? 'Выходим...' : 'Выйти',
                    icon: <LogoutOutlined />,
                    onClick: handleLogout,
                    disabled: isLoggingOut,
                    danger: true,
                },
            ]
            : [
                ...mainMenuItems,
                { type: 'divider' as const },
                {
                    key: 'profile',
                    label: 'Профиль',
                    icon: <UserOutlined />,
                    onClick: () => handleMenuClick('profile')
                },
                {
                    key: 'settings',
                    label: 'Настройки',
                    icon: <SettingOutlined />,
                    onClick: () => handleMenuClick('settings')
                },
                { type: 'divider' as const },
                {
                    key: 'logout',
                    label: isLoggingOut ? 'Выходим...' : 'Выйти',
                    icon: <LogoutOutlined />,
                    onClick: handleLogout,
                    disabled: isLoggingOut,
                    danger: true,
                },
            ]
        : mainMenuItems;

    return (
        <AntHeader className={styles.header}>
            <Logo />
            {/* Десктопное меню */}
            {!isMobile && (
                <Menu
                    theme={isDark ? 'dark' : 'light'}
                    mode="horizontal"
                    selectedKeys={getSelectedKey()}
                    items={mainMenuItems}
                    className={`${styles.menu} menu-fade${isFading ? ' menu-fade-out' : ''}`}
                    style={{
                        border: 'none',
                        background: 'transparent'
                    }}
                />
            )}

            <div className={styles.headerActions}>
                <ThemeSwitcher isDark={isDark} onChange={handleThemeSwitch} />

                {/* Десктопный аватар */}
                {!isMobile && authProp && (
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

                {/* Мобильная кнопка меню */}
                {isMobile && (
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileMenuOpen(true)}
                        className={styles.mobileMenuButton}
                    />
                )}
            </div>

            {/* Мобильное выпадающее меню */}
            <Drawer
                title="Меню"
                placement="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                className={styles.mobileDrawer}
                width={280}
            >
                <Menu
                    theme={isDark ? 'dark' : 'light'}
                    mode="vertical"
                    selectedKeys={getSelectedKey()}
                    items={mobileMenuItems}
                    className={styles.mobileMenu}
                    style={{
                        border: 'none',
                        background: 'transparent'
                    }}
                />
            </Drawer>
        </AntHeader>
    );
};