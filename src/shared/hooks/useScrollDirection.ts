import { useState, useEffect } from 'react';

export const useScrollDirection = () => {
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Показываем header если:
            // 1. Скроллим вверх
            // 2. Находимся в самом верху страницы (первые 100px)
            if (currentScrollY < lastScrollY || currentScrollY < 100) {
                setIsHeaderVisible(true);
            }
            // Скрываем header если скроллим вниз и прошли больше 100px
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsHeaderVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        // Добавляем passive для лучшей производительности
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return isHeaderVisible;
};