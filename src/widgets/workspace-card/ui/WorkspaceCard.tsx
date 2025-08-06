import React from 'react';
import { Card, Tag, Tooltip } from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    EyeOutlined,
    LockOutlined
} from '@ant-design/icons';
import type { Workspace } from '@/pages/Workspaces/Workspaces.types';
import { formatDate } from '@/shared/lib/date.utils';
import styles from './WorkspaceCard.module.scss';

interface WorkspaceCardProps {
    workspace: Workspace;
    onClick?: (workspace: Workspace) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
    workspace,
    onClick,
}) => {
    const handleClick = () => {
        onClick?.(workspace);
    };

    return (
        <Card
            className={styles.card}
            hoverable
            onClick={handleClick}
            actions={[
                <Tooltip title="Дата создания" key="created">
                    <div className={styles.action}>
                        <CalendarOutlined />
                        <span>{formatDate(workspace.created_at)}</span>
                    </div>
                </Tooltip>,
                <Tooltip title="Владелец" key="owner">
                    <div className={styles.action}>
                        <UserOutlined />
                        <span>Владелец</span>
                    </div>
                </Tooltip>,
            ]}
        >
            <div className={styles.header}>
                <h3 className={styles.title}>{workspace.name}</h3>
                <div className={styles.tags}>
                    {workspace.is_public ? (
                        <Tag color="green" icon={<EyeOutlined />}>
                            Публичное
                        </Tag>
                    ) : (
                        <Tag color="orange" icon={<LockOutlined />}>
                            Приватное
                        </Tag>
                    )}
                </div>
            </div>

            {workspace.description && (
                <p className={styles.description}>
                    {workspace.description}
                </p>
            )}

            <div className={styles.meta}>
                <span className={styles.updated}>
                    Обновлено: {formatDate(workspace.updated_at)}
                </span>
            </div>
        </Card>
    );
};