import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { ThemeProvider } from './providers/ThemeProvider';
import { Header } from '@/widgets/header/ui/Header/Header';
import { FloatingAIButton } from '@/widgets/floating-ai-button/ui/FloatingAIButton/FloatingAIButton';
import { isAuthenticated } from '@/shared/api/auth.api';
import './styles/index.scss'
import styles from './App.module.scss';

const { Content, Footer } = Layout;

const AUTH_PAGES = ['/signin', '/signup', '/forgot-password'];
const AI_PAGE = '/ai';

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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [footerVisible, setFooterVisible] = useState(true);

    const touchStartY = useRef(0);
    const touchStartTime = useRef(0);
    const lastScrollY = useRef(0);
    const scrollDirection = useRef<'up' | 'down' | null>(null);

    const initRef = useRef(false);
    const authCheckCount = useRef(0);
    const lastNavigationRef = useRef<string>('');

    const isAuthPage = AUTH_PAGES.includes(location.pathname);
    const isAIPage = location.pathname === AI_PAGE;

    // Показываем плавающую кнопку AI только для авторизованных пользователей на страницах кроме AI и авторизации
    const showFloatingAI = authenticated && !isAuthPage && !isAIPage;

    // Управление видимостью заголовка и подвала на мобильных устройствах
    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth <= 768;
            setIsMobile(newIsMobile);

            if (!newIsMobile) {
                setHeaderVisible(true);
                setFooterVisible(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Управление видимостью заголовка и подвала при прокрутке на мобильных устройствах
    useEffect(() => {
        if (!isMobile) return;

        let scrollTimeout: NodeJS.Timeout;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY.current = e.touches[0].clientY;
            touchStartTime.current = Date.now();
        };

        const handleTouchMove = (e: TouchEvent) => {
            const currentY = e.touches[0].clientY;
            const deltaY = touchStartY.current - currentY;
            const deltaTime = Date.now() - touchStartTime.current;

            // Detect fast swipe gestures
            if (Math.abs(deltaY) > 50 && deltaTime < 300) {
                if (deltaY > 0) {
                    // Swipe up - hide header and footer
                    setHeaderVisible(false);
                    setFooterVisible(false);
                } else {
                    // Swipe down - show header and footer
                    setHeaderVisible(true);
                    setFooterVisible(true);
                }
            }
        };

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const deltaY = currentScrollY - lastScrollY.current;

            // Clear existing timeout
            clearTimeout(scrollTimeout);

            // Detect scroll direction
            if (Math.abs(deltaY) > 5) {
                const newDirection = deltaY > 0 ? 'down' : 'up';

                if (newDirection !== scrollDirection.current) {
                    scrollDirection.current = newDirection;

                    if (newDirection === 'down' && currentScrollY > 100) {
                        // Scrolling down - hide header and footer
                        setHeaderVisible(false);
                        setFooterVisible(false);
                    } else if (newDirection === 'up') {
                        // Scrolling up - show header and footer
                        setHeaderVisible(true);
                        setFooterVisible(true);
                    }
                }
            }

            lastScrollY.current = currentScrollY;

            // Auto-hide header after inactivity
            scrollTimeout = setTimeout(() => {
                if (currentScrollY > 100) {
                    setHeaderVisible(false);
                    setFooterVisible(false);
                }
            }, 2000);
        };

        // Add event listeners
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [isMobile]);

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
                console.log('✅ User authenticated, redirecting to main page');
                lastNavigationRef.current = '/workspaces';
                navigate('/workspaces', { replace: true });
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

    // Инициализация - КРИТИЧЕСКИ ВАЖНО: делаем навигацию СИНХРОННО
    useEffect(() => {
        if (initRef.current) return;

        console.log('🚀 App: Initializing...');
        initRef.current = true;

        // Повторно проверяем и обновляем состояние для синхронизации
        const authStatus = checkAuth();

        console.log('🚀 App: Auth status after init:', authStatus);
        console.log('🚀 App: Current path:', location.pathname);

        // Обновляем состояние авторизации если нужно
        if (authenticated !== authStatus) {
            console.log('🔄 Synchronizing auth state:', authenticated, '->', authStatus);
            setAuthenticated(authStatus);
        }

        // ВАЖНО: Сначала делаем навигацию, ПОТОМ убираем loading
        // Это предотвратит рендеринг компонентов до редиректа
        handleNavigation(authStatus, location.pathname);

        // Устанавливаем небольшую задержку для завершения навигации
        setTimeout(() => {
            setLoading(false);
        }, 50);
    }, []);

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
        console.log('📊 Is AI page:', isAIPage);
        console.log('📊 Show floating AI:', showFloatingAI);
        console.log('📊 Loading:', loading);
        console.log('📊 Auth checks performed:', authCheckCount.current);
        console.log('📊 Last navigation:', lastNavigationRef.current);
        console.log('📊 ===================');
    }, [authenticated, location.pathname, loading, showFloatingAI]);

    // ВАЖНО: Показываем загрузку ИЛИ если мы на неавторизованной странице без авторизации
    if (loading || (!authenticated && !isAuthPage && location.pathname !== '/signin')) {
        return (
            <ThemeProvider>
                <Layout className={`${styles.appLayout} ${isMobile ? styles.mobileLayout : ''}`}>
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
            <Layout className={`${styles.appLayout} ${isMobile ? styles.mobileLayout : ''}`}>
                <div className={`${styles.header} ${isMobile ? styles.mobileHeader : ''} ${isMobile && !headerVisible ? styles.headerHidden : ''}`}>
                    <Header
                        isAuthenticated={authenticated}
                        onAuthChange={updateAuth}
                    />
                </div>
                <Content className={`${styles.appContent} ${isMobile ? styles.mobileContent : ''}`}>
                    <div className={`${styles.appContentInner} ${!isAuthPage ? styles.regularPageContent : ''} ${isMobile ? styles.mobileContentInner : ''}`}>
                        <Outlet />
                    </div>
                </Content>
                <Footer className={`${styles.appFooter} ${isMobile ? styles.mobileFooter : ''} ${isMobile && !footerVisible ? styles.footerHidden : ''}`}>
                    Equiply ©{new Date().getFullYear()}
                </Footer>

                {/* Плавающая кнопка AI */}
                <div className={isMobile ? styles.mobileFloatingButton : ''}>
                    <FloatingAIButton
                        visible={showFloatingAI}
                    />
                </div>
            </Layout>
        </ThemeProvider>
    );
};

export default App;