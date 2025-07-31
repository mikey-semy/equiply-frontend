import React from 'react';
import { Layout, Menu } from 'antd';
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

    const items = isAuthenticated
        ? [
            { key: '1', label: 'Главная' },
            { key: '2', label: 'Каталог' },
            { key: '3', label: 'О нас' },
        ]
        : [
            { key: '1', label: 'Вход' },
            { key: '2', label: 'Регистрация' },
        ];

    return (
        <AntHeader className={styles.header}>
            <Logo />
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['1']}
                items={items}
                className={styles.menu}
            />
            <ThemeSwitcher isDark={isDark} onChange={toggleTheme} />
        </AntHeader>
    );
};
