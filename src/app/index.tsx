import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { ThemeProvider } from './providers/ThemeProvider';
import { Header } from '@/widgets/header/ui/Header/Header';
import { isAuthenticated } from '@/shared/api/auth.api';
import './styles/index.scss'
import styles from './App.module.scss';

const { Content, Footer } = Layout;

const App: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [authenticated, setAuthenticated] = useState(false);

    const isAuthPage = ['/signin', '/signup', '/forgot-password'].includes(location.pathname);

    // Функция для обновления состояния аутентификации (без навигации)
    const updateAuthState = useCallback(() => {
        const authStatus = isAuthenticated();
        console.log('updateAuthState:', authStatus);
        setAuthenticated(authStatus);
        return authStatus;
    }, []);

    // Функция для полного обновления с навигацией
    const handleAuthChange = useCallback(() => {
        const authStatus = updateAuthState();

        console.log('handleAuthChange:', authStatus, 'isAuthPage:', isAuthPage);

        // Если пользователь не аутентифицирован и не на странице авторизации
        if (!authStatus && !isAuthPage) {
            navigate('/signin');
        }
        // Если пользователь аутентифицирован и на странице входа/регистрации
        else if (authStatus && (location.pathname === '/signin' || location.pathname === '/signup')) {
            navigate('/');
        }
    }, [updateAuthState, isAuthPage, navigate, location.pathname]);

    useEffect(() => {
        // Только обновляем состояние при загрузке, без навигации
        updateAuthState();

        // Слушаем события изменения аутентификации
        const handleStorageChange = () => {
            console.log('storage change event');
            handleAuthChange();
        };
        const handleAuthChangeEvent = () => {
            console.log('auth-change event');
            handleAuthChange();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-change', handleAuthChangeEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleAuthChangeEvent);
        };
    }, [location.pathname, isAuthPage, handleAuthChange, updateAuthState]);

    useEffect(() => {
        console.log('authenticated state changed:', authenticated); // Для отладки
    }, [authenticated]);

    return (
        <ThemeProvider>
            <Layout className={styles.appLayout}>
                <Header
                    isAuthenticated={authenticated}
                    onAuthChange={handleAuthChange}
                />
                <Content className={styles.appContent}>
                    <div className={`${styles.appContentInner} ${!isAuthPage ? styles.regularPageContent : ''}`}>
                        <Outlet />
                    </div>
                </Content>
                <Footer className={styles.appFooter}>
                    Equiply ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </ThemeProvider>
    )
};

export default App;