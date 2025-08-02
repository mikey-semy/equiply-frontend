import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Button,
    Input,
    Select,
    Pagination,
    Empty,
    Spin,
    Typography,
    Space,
    Card
} from 'antd';
import {
    PlusOutlined,
    ReloadOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { useWorkspaces } from '@/shared/hooks/useWorkspaces';
import { CreateWorkspaceModal } from '@/features/workspace-create';
import { WorkspaceCard } from '@/widgets/workspace-card';
import type { Workspace, WorkspaceSortField, CreateWorkspaceRequest } from '@/entities/workspace';
import styles from './Dashboard.module.scss';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard: React.FC = () => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [mounted, setMounted] = useState(false);

    // Проверяем, что компонент смонтирован
    useEffect(() => {
        console.log('Dashboard: Component mounted');
        setMounted(true);

        return () => {
            console.log('Dashboard: Component unmounted');
            setMounted(false);
        };
    }, []);

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

    const handleCreateWorkspace = async (data: CreateWorkspaceRequest): Promise<boolean> => {
        if (!mounted) return false;
        return await createWorkspace(data);
    };

    const handleWorkspaceClick = (workspace: Workspace) => {
        if (!mounted) return;
        console.log('Open workspace:', workspace);
        // TODO: Навигация к рабочему пространству
    };

    const handleSearch = (value: string) => {
        if (!mounted) return;
        setSearchValue(value);
        updateParams({ search: value || undefined, skip: 0 });
    };

    const handleSortChange = (value: WorkspaceSortField) => {
        if (!mounted) return;
        updateParams({ sort_by: value, skip: 0 });
    };

    const handleSortOrderChange = (value: boolean) => {
        if (!mounted) return;
        updateParams({ sort_desc: value, skip: 0 });
    };

    const handlePageChange = (page: number, pageSize: number) => {
        if (!mounted) return;
        updateParams({
            skip: (page - 1) * pageSize,
            limit: pageSize
        });
    };

    const handleRefresh = () => {
        if (!mounted) return;
        refresh();
    };

    const handleCreateModalOpen = () => {
        if (!mounted) return;
        setCreateModalOpen(true);
    };

    const handleCreateModalClose = () => {
        if (!mounted) return;
        setCreateModalOpen(false);
    };

    // Если компонент не смонтирован, показываем загрузку
    if (!mounted) {
        return (
            <div className={styles.dashboard}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerMain}>
                        <Title level={2} className={styles.title}>
                            <AppstoreOutlined className={styles.titleIcon} />
                            Рабочие пространства
                        </Title>
                        <Text className={styles.subtitle}>
                            Управляйте проектами и командами
                        </Text>
                    </div>

                    <div className={styles.headerActions}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={loading}
                            className={styles.refreshButton}
                        >
                            Обновить
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateModalOpen}
                            size="large"
                            className={styles.createButton}
                        >
                            Создать пространство
                        </Button>
                    </div>
                </div>
            </div>

            <Card className={styles.filtersCard}>
                <div className={styles.filters}>
                    <div className={styles.searchContainer}>
                        <Input.Search
                            placeholder="Поиск по названию или описанию..."
                            allowClear
                            onSearch={handleSearch}
                            onChange={(e) => setSearchValue(e.target.value)}
                            value={searchValue}
                            style={{ width: 320 }}
                            size="large"
                        />
                    </div>

                    <Space className={styles.sortContainer}>
                        <Text>Сортировка:</Text>
                        <Select
                            value={params.sort_by}
                            onChange={handleSortChange}
                            style={{ width: 140 }}
                        >
                            <Option value="updated_at">По обновлению</Option>
                            <Option value="created_at">По созданию</Option>
                            <Option value="name">По названию</Option>
                        </Select>

                        <Select
                            value={params.sort_desc}
                            onChange={handleSortOrderChange}
                            style={{ width: 120 }}
                        >
                            <Option value={true}>По убыванию</Option>
                            <Option value={false}>По возрастанию</Option>
                        </Select>
                    </Space>
                </div>
            </Card>

            <div className={styles.content}>
                <Spin spinning={loading} size="large">
                    {workspaces.length === 0 && !loading ? (
                        <Empty
                            description="Рабочие пространства не найдены"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            className={styles.emptyState}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreateModalOpen}
                                size="large"
                            >
                                Создать первое пространство
                            </Button>
                        </Empty>
                    ) : (
                        <>
                            <Row gutter={[24, 24]} className={styles.workspaceGrid}>
                                {workspaces.map((workspace) => (
                                    <Col
                                        key={workspace.id}
                                        xs={24}
                                        sm={12}
                                        lg={8}
                                        xl={6}
                                        className={styles.workspaceCol}
                                    >
                                        <WorkspaceCard
                                            workspace={workspace}
                                            onClick={handleWorkspaceClick}
                                        />
                                    </Col>
                                ))}
                            </Row>

                            {total > (params.limit || 10) && (
                                <div className={styles.pagination}>
                                    <Pagination
                                        current={Math.floor((params.skip || 0) / (params.limit || 10)) + 1}
                                        pageSize={params.limit || 10}
                                        total={total}
                                        onChange={handlePageChange}
                                        showSizeChanger
                                        showQuickJumper
                                        showTotal={(total, range) =>
                                            `${range[0]}-${range[1]} из ${total} элементов`
                                        }
                                        pageSizeOptions={['10', '20', '50', '100']}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </Spin>
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

export default Dashboard;