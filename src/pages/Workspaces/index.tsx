import React, { useState, useEffect } from 'react';
import {
    Button,
    Input,
    Select,
    Pagination,
    Empty,
    Spin,
    Typography,
    Avatar,
    Dropdown,
    type MenuProps
} from 'antd';
import {
    PlusOutlined,
    ReloadOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    SortAscendingOutlined,
    MoreOutlined,
    FolderOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useWorkspaces } from '@/shared/hooks/useWorkspaces';
import { CreateWorkspaceModal } from '@/features/workspace-create';
import { isAuthenticated } from '@/shared/api/auth.api';
import type { Workspace, WorkspaceSortField, CreateWorkspaceRequest } from './Workspaces.types';
import styles from './Workspaces.module.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

type ViewMode = 'grid' | 'list';

const Workspaces: React.FC = () => {
    console.log('Workspaces: Component mounted');

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<WorkspaceSortField>('updated_at');
    const [sortDesc, setSortDesc] = useState(true);

    const {
        workspaces,
        loading,
        creating,
        total,
        params,
        createWorkspace,
        updateParams,
        refresh,
    } = useWorkspaces();

    // Проверяем авторизацию и загружаем данные
    useEffect(() => {
        console.log('Workspaces: Component mounted - checking auth status');

        // Проверяем авторизацию перед загрузкой данных
        const authStatus = isAuthenticated();
        console.log('Workspaces: Auth status:', authStatus);

        if (authStatus) {
            console.log('Workspaces: User authenticated - loading initial data');
            refresh(); // Загружаем данные только если пользователь авторизован
        } else {
            console.log('Workspaces: User not authenticated - skipping data load');
        }

        return () => {
            console.log('Workspaces: Component unmounted');
        };
    }, []); // Пустой массив зависимостей - выполняется только при монтировании

    // // Если пользователь не авторизован, показываем заглушку
    // if (!isAuthenticated()) {
    //     return (
    //         <div className={styles.dashboard}>
    //             <div style={{
    //                 display: 'flex',
    //                 justifyContent: 'center',
    //                 alignItems: 'center',
    //                 height: '50vh',
    //                 fontSize: '16px'
    //             }}>
    //                 Перенаправление на страницу входа...
    //             </div>
    //         </div>
    //     );
    // }

    // Обработчики
    const handleCreateModalOpen = () => setCreateModalOpen(true);
    const handleCreateModalClose = () => setCreateModalOpen(false);

    const handleCreateWorkspace = async (data: CreateWorkspaceRequest): Promise<boolean> => {
        const success = await createWorkspace(data);
        if (success) {
            handleCreateModalClose();
        }
        return success;
    };

    const handleWorkspaceClick = (workspace: Workspace) => {
        console.log('Opening workspace:', workspace);
        // TODO: Navigate to workspace
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        updateParams({ search: value || undefined, skip: 0 });
    };

    const handleSortChange = (value: WorkspaceSortField) => {
        setSortBy(value);
        updateParams({ sort_by: value, skip: 0 });
    };

    const handleSortOrderChange = () => {
        const newSortDesc = !sortDesc;
        setSortDesc(newSortDesc);
        updateParams({ sort_desc: newSortDesc, skip: 0 });
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        updateParams({
            skip: (page - 1) * (pageSize || params.limit || 10),
            limit: pageSize || params.limit,
        });
    };

    const getWorkspaceActions = (workspace: Workspace): MenuProps['items'] => [
        {
            key: 'open',
            label: 'Открыть',
            onClick: () => handleWorkspaceClick(workspace),
        },
        {
            key: 'edit',
            label: 'Редактировать',
            onClick: () => console.log('Edit workspace:', workspace),
        },
        {
            type: 'divider',
        },
        {
            key: 'delete',
            label: 'Удалить',
            danger: true,
            onClick: () => console.log('Delete workspace:', workspace),
        },
    ];

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) return 'вчера';
            if (diffDays < 7) return `${diffDays} дн. назад`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
            return `${Math.floor(diffDays / 365)} г. назад`;
        } catch {
            return 'Недавно';
        }
    };

    const renderGridView = () => (
        <div className={styles.workspaceGrid}>
            {workspaces.map((workspace) => (
                <div
                    key={workspace.id}
                    className={styles.workspaceCard}
                    onClick={() => handleWorkspaceClick(workspace)}
                >
                    <div className={styles.cardPreview}>
                        <FolderOutlined className={styles.previewIcon} />
                    </div>
                    <div className={styles.cardContent}>
                        <Title level={4} className={styles.cardTitle}>
                            {workspace.name}
                        </Title>
                        <div className={styles.cardMeta}>
                            <Text className={styles.cardDate}>
                                {formatDate(workspace.updated_at)}
                            </Text>
                            <div className={styles.cardOwner}>
                                <Avatar size={20} icon={<UserOutlined />} />
                                <Text>Вы</Text>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderListView = () => (
        <div className={styles.workspaceList}>
            <div className={styles.listHeader}>
                <div className={styles.headerCell}>Название</div>
                <div className={styles.headerCell}>Владелец</div>
                <div className={styles.headerCell}>Обновлено</div>
                <div className={styles.headerCell}>Участники</div>
                <div className={styles.headerCell}></div>
            </div>
            {workspaces.map((workspace) => (
                <div
                    key={workspace.id}
                    className={styles.listItem}
                    onClick={() => handleWorkspaceClick(workspace)}
                >
                    <div className={styles.itemName}>
                        <div className={styles.itemIcon}>
                            <FolderOutlined />
                        </div>
                        <Title level={5} className={styles.itemTitle}>
                            {workspace.name}
                        </Title>
                    </div>
                    <div className={styles.itemOwner}>Вы</div>
                    <div className={styles.itemDate}>
                        {formatDate(workspace.updated_at)}
                    </div>
                    <div className={styles.itemMembers}>1</div>
                    <div className={styles.itemActions}>
                        <Dropdown
                            menu={{ items: getWorkspaceActions(workspace) }}
                            trigger={['click']}
                        >
                            <Button
                                type="text"
                                icon={<MoreOutlined />}
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Dropdown>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Title level={2} className={styles.title}>
                        Рабочие пространства
                    </Title>
                </div>
                <div className={styles.headerRight}>
                    <Button
                        type="default"
                        icon={<ReloadOutlined />}
                        onClick={refresh}
                        loading={loading}
                    >
                        Обновить
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined className={styles.createIcon} />}
                        onClick={handleCreateModalOpen}
                        className={styles.createButton}
                    >
                        Создать
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <Text className={styles.filterLabel}>Сортировка</Text>
                        <Select
                            value={sortBy}
                            onChange={handleSortChange}
                            className={styles.filterSelect}
                        >
                            <Option value="updated_at">По обновлению</Option>
                            <Option value="created_at">По созданию</Option>
                            <Option value="name">По названию</Option>
                        </Select>
                        <Button
                            type="text"
                            icon={<SortAscendingOutlined />}
                            onClick={handleSortOrderChange}
                            style={{
                                transform: sortDesc ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s',
                            }}
                        />
                    </div>
                    <Search
                        placeholder="Поиск пространств..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onSearch={handleSearch}
                        className={styles.searchInput}
                        allowClear
                    />
                </div>
                <div className={styles.viewToggle}>
                    <button
                        className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                        onClick={() => setViewMode('grid')}
                        aria-label="Сетка"
                    >
                        <AppstoreOutlined className={styles.viewIcon} />
                    </button>
                    <button
                        className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                        onClick={() => setViewMode('list')}
                        aria-label="Список"
                    >
                        <UnorderedListOutlined className={styles.viewIcon} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                    </div>
                ) : workspaces.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <div className={styles.emptyTitle}>
                                        Рабочие пространства не найдены
                                    </div>
                                    <div className={styles.emptyDescription}>
                                        Создайте первое пространство для начала работы с командой
                                    </div>
                                </div>
                            }
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreateModalOpen}
                                size="large"
                                className={styles.createFirstButton}
                            >
                                Создать первое пространство
                            </Button>
                        </Empty>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? renderGridView() : renderListView()}

                        {total > (params.limit || 10) && (
                            <div className={styles.pagination}>
                                <Pagination
                                    current={Math.floor((params.skip || 0) / (params.limit || 10)) + 1}
                                    total={total}
                                    pageSize={params.limit || 10}
                                    onChange={handlePageChange}
                                    showSizeChanger
                                    showQuickJumper
                                    showTotal={(total, range) =>
                                        `${range[0]}-${range[1]} из ${total} пространств`
                                    }
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <CreateWorkspaceModal
                open={createModalOpen}
                onCancel={handleCreateModalClose}
                onSubmit={handleCreateWorkspace}
                loading={creating}
            />
        </div>
    );
};

export default Workspaces;