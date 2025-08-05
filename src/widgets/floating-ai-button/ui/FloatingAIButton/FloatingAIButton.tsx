import React from 'react';
import { Button, Tooltip } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './FloatingAIButton.module.scss';

interface FloatingAIButtonProps {
    visible?: boolean;
}

export const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ visible = true }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/ai');
    };

    if (!visible) return null;

    return (
        <Tooltip title="Открыть AI чат" placement="left">
            <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<RobotOutlined />}
                onClick={handleClick}
                className={styles.floatingButton}
            />
        </Tooltip>
    );
};