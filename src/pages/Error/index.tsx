import React from 'react';

const Error: React.FC = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Ошибка</h1>
            <p>Что-то пошло не так. Попробуйте обновить страницу или вернуться позже.</p>
        </div>
    );
};

export default Error;