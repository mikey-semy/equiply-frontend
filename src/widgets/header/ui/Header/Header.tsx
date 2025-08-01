import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '@/shared/ui/Logo/Logo';
import { ThemeSwitcher } from '@/features/theme-switcher/ui/ThemeSwitcher/ThemeSwitcher';
import { useTheme } from '@/app/providers/ThemeProvider';
import styles from './Header.module.scss';

const { Header: AntHeader } = Layout;

interface HeaderProps {
    isAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
    const { isDark, toggleTheme } = useTheme();
    const [isFading, setIsFading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleThemeSwitch = () => {
        setIsFading(true);
        setTimeout(() => {
            toggleTheme();
            setTimeout(() => setIsFading(false), 250);
        }, 250);
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
            <ThemeSwitcher isDark={isDark} onChange={handleThemeSwitch} />
        </AntHeader>
    );
};
