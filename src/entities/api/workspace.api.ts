import { handleApiError } from '@/shared/api/api.handlers';
import { parseJsonResponse } from '@/shared/api/api.utils';
import { getAccessToken } from '@/shared/api/auth.api';
import type {
    CreateWorkspaceRequest,
    WorkspaceCreateResponse,
    WorkspaceListParams,
    WorkspaceListResponse,
} from '../types/workspace.types';

/**
 * Создание нового рабочего пространства.
 *
 * @param data - Объект с данными для создания рабочего пространства
 * @returns Promise<WorkspaceCreateResponse> - Ответ от API с созданным рабочим пространством
 *
 * @example
 * const workspace = await createWorkspace({
 *   name: 'Мой проект',
 *   description: 'Описание проекта',
 *   is_public: false
 * });
 */
export const createWorkspace = async (data: CreateWorkspaceRequest): Promise<WorkspaceCreateResponse> => {
    try {
        const accessToken = getAccessToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Добавляем Authorization заголовок если есть токен
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch('/api/v1/workspaces', {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = ` - ${JSON.stringify(errorData)}`;
            } catch (e) {
                console.log(`Failed to parse error response as JSON:`, e);
            }
            throw new Error(`Create workspace failed: ${response.status} ${response.statusText}${errorDetails}`);
        }

        const result = await parseJsonResponse(response);
        return result;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Получение списка рабочих пространств.
 *
 * @param params - Параметры для фильтрации и пагинации
 * @returns Promise<WorkspaceListResponse> - Ответ от API со списком рабочих пространств
 *
 * @example
 * const workspaces = await getWorkspaces({
 *   skip: 0,
 *   limit: 10,
 *   sort_by: 'updated_at',
 *   sort_desc: true,
 *   search: 'проект'
 * });
 */
export const getWorkspaces = async (params: WorkspaceListParams = {}): Promise<WorkspaceListResponse> => {
    try {
        // Формируем query параметры
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const url = `/api/v1/workspaces${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        console.log('=== Workspaces API Debug ===');
        console.log('Current URL:', window.location.href);
        console.log('API URL:', url);
        console.log('Full API URL:', new URL(url, window.location.origin).href);
        console.log('Params:', params);

        const accessToken = getAccessToken();
        console.log('Access token for request:', accessToken ? `${accessToken.substring(0, 50)}...` : 'null');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Добавляем Authorization заголовок если есть токен
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
            console.log('Authorization header added:', `Bearer ${accessToken.substring(0, 20)}...`);
        } else {
            console.warn('⚠️ No access token found! Request will fail.');
        }

        console.log('Request headers:', headers);

        const response = await fetch(url, {
            method: 'GET',
            headers,
            credentials: 'include', // Включаем cookies для авторизации
        });

        console.log('Workspaces response status:', response.status);
        console.log('Workspaces response URL:', response.url);

        if (!response.ok) {
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = ` - ${JSON.stringify(errorData)}`;
            } catch (e) {
                console.log('Failed to parse error response as JSON:', e);
            }
            throw new Error(`Workspaces request failed: ${response.status} ${response.statusText}${errorDetails}`);
        }

        const result = await parseJsonResponse(response);
        console.log('Workspaces response data:', result);
        console.log('=== End Workspaces API Debug ===');

        return result;
    } catch (error) {
        console.error('Failed to get workspaces:', error);
        handleApiError(error);
        throw error;
    }
};