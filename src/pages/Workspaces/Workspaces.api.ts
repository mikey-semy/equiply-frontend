import api from '@/shared/api/api';
import { handleApiResponse, handleApiError } from '@/shared/api/api.handlers';
import type {
    CreateWorkspaceRequest,
    WorkspaceCreateResponse,
    WorkspaceListParams,
    WorkspaceListResponse,
} from './Workspaces.types';

/**
 * Создание нового рабочего пространства.
 *
 * @param data - Объект с данными для создания рабочего пространства (name, description и др.).
 * @returns Promise<WorkspaceCreateResponse> - Ответ с информацией о созданном рабочем пространстве.
 *
 * @example
 * const response = await createWorkspace({
 *   name: 'My Workspace',
 *   description: 'Project workspace'
 * });
 * console.log(response.workspace);
 */
export const createWorkspace = async (data: CreateWorkspaceRequest): Promise<WorkspaceCreateResponse> => {
    try {
        const response = await api.post('/api/v1/workspaces', data);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Получение списка рабочих пространств.
 *
 * @param params - Параметры запроса (page, limit, search и др.).
 * @returns Promise<WorkspaceListResponse> - Ответ со списком рабочих пространств.
 *
 * @example
 * const response = await getWorkspaces({ page: 1, limit: 10 });
 * console.log(response.workspaces);
 */
export const getWorkspaces = async (params: WorkspaceListParams = {}): Promise<WorkspaceListResponse> => {
    try {
        const response = await api.get('/api/v1/workspaces', { params });
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};