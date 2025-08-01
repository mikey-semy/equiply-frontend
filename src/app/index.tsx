import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { ThemeProvider } from './providers/ThemeProvider';
import { Header } from '@/widgets/header/ui/Header/Header';
import './styles/index.scss'
import styles from './App.module.scss';

const { Content, Footer } = Layout;

const App: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const isAuthPage = ['/signin', '/forgot-password'].includes(location.pathname);
    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('access_token='));
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            navigate('/signin');
        }
    }, [navigate]);

    return (
        <ThemeProvider>
            <Layout className={styles.appLayout}>
                <Header isAuthenticated={isAuthenticated} />
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
