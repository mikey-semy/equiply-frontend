import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

type ThemeContextType = {
    isDark: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    useEffect(() => {
        document.body.classList.toggle('dark-theme', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {
                        colorPrimary: 'var(--primary-color)',
                        colorBgBase: 'var(--background-color)',
                        colorTextBase: 'var(--text-color)',
                        colorBgContainer: 'var(--background-color)',
                        borderRadius: 6,
                    },
                    components: {
                        Layout: {
                            bodyBg: isDark ? '#0d1117' : '#f6f8fa',
                            headerBg: isDark ? '#161b22' : '#24292f',
                            headerColor: isDark ? '#c9d1d9' : '#fff',
                            headerHeight: 56,
                            headerPadding: '0 32px',
                            siderBg: isDark ? '#161b22' : '#fff',
                            triggerBg: isDark ? '#21262d' : '#f6f8fa',
                            triggerColor: isDark ? '#c9d1d9' : '#24292f',
                            footerBg: isDark ? '#161b22' : '#f6f8fa',
                            footerPadding: '16px 32px',
                            lightSiderBg: isDark ? '#161b22' : '#fff',
                            lightTriggerBg: isDark ? '#21262d' : '#f6f8fa',
                            lightTriggerColor: isDark ? '#c9d1d9' : '#24292f',
                        },
                        Menu: {
                            itemBg: 'var(--header-background)',
                            darkItemBg: 'var(--header-background)',
                            popupBg: 'var(--header-background)',
                            itemColor: isDark ? '#c9d1d9' : 'rgba(31,35,40,0.88)',
                            itemHoverBg: isDark ? '#21262d' : '#f6f8fa',
                            itemHoverColor: isDark ? '#fff' : '#24292f',
                            itemSelectedBg: isDark ? '#21262d' : '#e6f4ff',
                            itemSelectedColor: isDark ? '#fff' : '#1677ff',
                            itemActiveBg: isDark ? '#21262d' : '#e6f4ff',
                            itemDisabledColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                            itemBorderRadius: 6,
                            itemHeight: 40,
                            itemPaddingInline: 20,
                            subMenuItemBg: isDark ? '#161b22' : 'rgba(0,0,0,0.02)',
                            groupTitleColor: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)',
                            iconSize: 16,
                            iconMarginInlineEnd: 10,
                        },
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};
