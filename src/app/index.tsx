import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import { ThemeProvider } from './providers/ThemeProvider';
import { Header } from '@/widgets/header/ui/Header/Header';
import './styles/index.scss'

const { Content, Footer } = Layout;

const App: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('access_token='));
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            navigate('/login');
        }
    }, [navigate]);

    return (
        <ThemeProvider>
            <Layout>
                <Header isAuthenticated={isAuthenticated} />
                <Content style={{ padding: '0 48px' }}>
                    <div style={{ padding: 24, minHeight: 'calc(100vh - 64px - 70px)' }}>
                        <Outlet />
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Equiply ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </ThemeProvider>
    )
};

export default App;
