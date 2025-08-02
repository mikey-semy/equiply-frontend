import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { ThemeProvider } from './providers/ThemeProvider';
import { Header } from '@/widgets/header/ui/Header/Header';
import { isAuthenticated } from '@/shared/api/auth.api';
import './styles/index.scss'
import styles from './App.module.scss';

const { Content, Footer } = Layout;

const AUTH_PAGES = ['/signin', '/signup', '/forgot-password'];

const App: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Инициализируем состояние сразу с правильным значением
    const [authenticated, setAuthenticated] = useState<boolean>(() => {
        const initialAuth = isAuthenticated();
        console.log('🚀 Initial authenticated state:', initialAuth);
        return initialAuth;
    });

    const [loading, setLoading] = useState(true);
    const initRef = useRef(false);
    const authCheckCount = useRef(0);
    const lastNavigationRef = useRef<string>('');

    const isAuthPage = AUTH_PAGES.includes(location.pathname);

    // Функция проверки авторизации с детальным логированием
    const checkAuth = (): boolean => {
        authCheckCount.current += 1;
        const checkId = authCheckCount.current;

        console.log(`🔍 Auth check #${checkId} started`);

        // Проверяем наличие токенов в localStorage
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        console.log(`🔍 Auth check #${checkId} - tokens:`, {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            accessTokenLength: accessToken?.length || 0,
            refreshTokenLength: refreshToken?.length || 0
        });

        // Проверяем через функцию isAuthenticated
        const authStatus = isAuthenticated();

        console.log(`🔍 Auth check #${checkId} result:`, authStatus);

        return authStatus;
    };

    // Функция навигации с защитой от зацикливания
    const handleNavigation = (authStatus: boolean, currentPath: string) => {
        console.log('🚀 Navigation check:', {
            authStatus,
            currentPath,
            isAuthPage,
            loading,
            lastNavigation: lastNavigationRef.current
        });

        // Предотвращаем повторную навигацию на тот же путь
        if (lastNavigationRef.current === currentPath) {
            console.log('⚠️ Same path as last navigation, skipping');
            return;
        }

        if (!authStatus) {
            if (!isAuthPage) {
                console.log('❌ User not authenticated, redirecting to /signin');
                lastNavigationRef.current = '/signin';
                navigate('/signin', { replace: true });
            }
        } else {
            if (currentPath === '/signin' || currentPath === '/signup' || currentPath === '/') {
                console.log('✅ User authenticated, redirecting to /dashboard');
                lastNavigationRef.current = '/dashboard';
                navigate('/dashboard', { replace: true });
            }
        }
    };

    // Основная функция обновления состояния
    const updateAuth = () => {
        console.log('🔄 updateAuth called');

        const authStatus = checkAuth();

        if (authenticated !== authStatus) {
            console.log('🔄 Auth status changed:', authenticated, '->', authStatus);
            setAuthenticated(authStatus);
        }

        if (!loading) {
            handleNavigation(authStatus, location.pathname);
        }
    };

    // Инициализация
    useEffect(() => {
        if (initRef.current) return;

        console.log('🚀 App: Initializing...');
        initRef.current = true;

        // Повторно проверяем и обновляем состояние для синхронизации
        const authStatus = checkAuth();
        if (authenticated !== authStatus) {
            console.log('🔄 Synchronizing auth state:', authenticated, '->', authStatus);
            setAuthenticated(authStatus);
        }

        setLoading(false);

        console.log('🚀 App: Auth status after init:', authStatus);
        console.log('🚀 App: Current path:', location.pathname);

        // Добавляем небольшую задержку для стабилизации состояния
        setTimeout(() => {
            handleNavigation(authStatus, location.pathname);
        }, 100);
    }, []);

    // Отслеживание изменений маршрута - УБИРАЕМ ЭТОТ ЭФФЕКТ!
    // Он вызывает зацикливание при навигации
    // useEffect(() => {
    //     if (!loading) {
    //         console.log('📍 Route changed to:', location.pathname);
    //         updateAuth();
    //     }
    // }, [location.pathname]);

    // События
    useEffect(() => {
        if (loading) return;

        const handleStorageChange = (e: StorageEvent) => {
            console.log('💾 Storage change:', e.key, e.newValue ? 'SET' : 'REMOVED');
            if (e.key === 'access_token' || e.key === 'refresh_token') {
                setTimeout(updateAuth, 100);
            }
        };

        const handleAuthEvent = () => {
            console.log('📡 Custom auth event received');
            setTimeout(updateAuth, 100);
        };

        // Глобальный обработчик 401 ошибок
        const handle401Error = () => {
            console.log('🚨 401 Error received, clearing auth and redirecting');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            setAuthenticated(false);
            lastNavigationRef.current = '/signin';
            navigate('/signin', { replace: true });
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-change', handleAuthEvent);
        window.addEventListener('auth-401-error', handle401Error);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleAuthEvent);
            window.removeEventListener('auth-401-error', handle401Error);
        };
    }, [loading, navigate]);

    // Детальный debug
    useEffect(() => {
        console.log('📊 === App State ===');
        console.log('📊 Authenticated:', authenticated);
        console.log('📊 Path:', location.pathname);
        console.log('📊 Is auth page:', isAuthPage);
        console.log('📊 Loading:', loading);
        console.log('📊 Auth checks performed:', authCheckCount.current);
        console.log('📊 Last navigation:', lastNavigationRef.current);
        console.log('📊 ===================');
    }, [authenticated, location.pathname, loading]);

    if (loading) {
        return (
            <ThemeProvider>
                <Layout className={styles.appLayout}>
                    <Content className={styles.appContent}>
                        <div className={styles.appContentInner}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100vh',
                                fontSize: '18px'
                            }}>
                                Загрузка...
                            </div>
                        </div>
                    </Content>
                </Layout>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <Layout className={styles.appLayout}>
                <Header
                    isAuthenticated={authenticated}
                    onAuthChange={updateAuth}
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
    );
};

export default App;