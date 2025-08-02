import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import {
    createWorkspace,
    getWorkspaces,
    type Workspace,
    type CreateWorkspaceRequest,
    type WorkspaceListParams,
} from '@/entities/workspace';
import { ApiError } from '@/shared/api/api.types';

export const useWorkspaces = (initialParams: WorkspaceListParams = {}) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [total, setTotal] = useState(0);
    const [params, setParams] = useState<WorkspaceListParams>({
        skip: 0,
        limit: 10,
        sort_by: 'updated_at',
        sort_desc: true,
        ...initialParams,
    });

    const mountedRef = useRef(true);
    const paramsRef = useRef(params);
    paramsRef.current = params;

    const fetchWorkspaces = useCallback(async (newParams?: WorkspaceListParams) => {
        if (!mountedRef.current) return;

        setLoading(true);
        try {
            const currentParams = newParams || paramsRef.current;
            console.log('Fetching workspaces with params:', currentParams);

            const response = await getWorkspaces(currentParams);

            if (!mountedRef.current) return;

            if (response.success) {
                setWorkspaces(response.data.items);
                setTotal(response.data.total);
                console.log('Workspaces loaded:', response.data.items.length);
            } else {
                message.error('Ошибка при загрузке рабочих пространств');
            }
        } catch (error) {
            if (!mountedRef.current) return;

            console.error('Error fetching workspaces:', error);

            // Проверяем, не ошибка ли авторизации
            const apiError = error as ApiError;
            if (apiError?.status_code === 401) {
                console.log('Unauthorized access - redirecting to login');
                // Здесь НЕ делаем редирект, пусть это делает глобальный обработчик
                return;
            }

            message.error('Ошибка при загрузке рабочих пространств');
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    const createWorkspaceHandler = useCallback(async (data: CreateWorkspaceRequest): Promise<boolean> => {
        if (!mountedRef.current) return false;

        setCreating(true);
        try {
            const response = await createWorkspace(data);

            if (!mountedRef.current) return false;

            if (response.success) {
                message.success(response.message || 'Рабочее пространство успешно создано');
                await fetchWorkspaces();
                return true;
            } else {
                message.error('Ошибка при создании рабочего пространства');
                return false;
            }
        } catch (error) {
            if (!mountedRef.current) return false;

            console.error('Error creating workspace:', error);

            const apiError = error as ApiError;
            if (apiError?.status_code === 401) {
                console.log('Unauthorized access during creation');
                return false;
            }

            message.error('Ошибка при создании рабочего пространства');
            return false;
        } finally {
            if (mountedRef.current) {
                setCreating(false);
            }
        }
    }, [fetchWorkspaces]);

    const updateParams = useCallback((newParams: Partial<WorkspaceListParams>) => {
        if (!mountedRef.current) return;

        const updatedParams = { ...paramsRef.current, ...newParams };
        setParams(updatedParams);
        fetchWorkspaces(updatedParams);
    }, [fetchWorkspaces]);

    const refresh = useCallback(() => {
        if (!mountedRef.current) return;
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    useEffect(() => {
        console.log('useWorkspaces: Initial mount');
        fetchWorkspaces();

        return () => {
            console.log('useWorkspaces: Cleanup');
            mountedRef.current = false;
        };
    }, []); // Только при монтировании

    return {
        workspaces,
        loading,
        creating,
        total,
        params,
        fetchWorkspaces,
        createWorkspace: createWorkspaceHandler,
        updateParams,
        refresh,
    };
};