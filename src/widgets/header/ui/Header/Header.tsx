import React from 'react';
import { Layout, Menu } from 'antd';
import { Logo } from '@/shared/ui/Logo/Logo';
import { ThemeSwitcher } from '@/features/theme-switcher/ui/ThemeSwitcher/ThemeSwitcher';
import { useTheme } from '@/app/providers/ThemeProvider';
import styles from './Header.module.scss';

const { Header: AntHeader } = Layout;

const items = [
    { key: '1', label: 'Главная' },
    { key: '2', label: 'Каталог' },
    { key: '3', label: 'О нас' },
];

export const Header: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();

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
