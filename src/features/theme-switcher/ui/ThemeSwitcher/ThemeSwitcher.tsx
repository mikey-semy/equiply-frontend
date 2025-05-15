import React from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import styles from './ThemeSwitcher.module.scss';

interface ThemeSwitcherProps {
    isDark: boolean;
    onChange: (checked: boolean) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ isDark, onChange }) => {
    return (
        <div className={styles.switcher}>
            <Switch
                checked={isDark}
                onChange={onChange}
                checkedChildren={<BulbFilled />}
                unCheckedChildren={<BulbOutlined />}
            />
        </div>
    );
};
