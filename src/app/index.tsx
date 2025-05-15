import React from 'react';
import { Layout } from 'antd';
import { ThemeProvider } from './providers/ThemeProvider';
import { Header } from '@/widgets/header/ui/Header/Header';
import './styles/index.css'

const { Content, Footer } = Layout;

const App: React.FC = () => {

    return (
        <ThemeProvider>
            <Layout>
                <Header />
                <Content style={{ padding: '0 48px' }}>
                    <div style={{ padding: 24, minHeight: 'calc(100vh - 64px - 70px)' }}>
                        <h1>Добро пожаловать в Equiply</h1>
                        {/* Здесь будет форма входа */}
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
