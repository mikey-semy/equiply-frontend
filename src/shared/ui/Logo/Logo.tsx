import React from 'react';
import { Typography } from 'antd';
import styles from './Logo.module.scss';

const { Title } = Typography;

export const Logo: React.FC = () => {
    return (
        <div className={styles.logo}>
            <Title level={4} style={{ margin: 0 }}>Equiply</Title>
        </div>
    );
};
