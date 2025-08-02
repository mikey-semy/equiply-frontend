export interface Workspace {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    description: string;
    owner_id: string;
    is_public: boolean;
}

export interface CreateWorkspaceRequest {
    name: string;
    description?: string;
    is_public?: boolean;
}

export interface WorkspaceCreateResponse {
    success: boolean;
    message: string;
    data: Workspace;
}

export interface WorkspaceListParams {
    skip?: number;
    limit?: number;
    sort_by?: 'name' | 'created_at' | 'updated_at';
    sort_desc?: boolean;
    search?: string;
}

export interface WorkspaceListResponse {
    success: boolean;
    message: string;
    data: {
        items: Workspace[];
        total: number;
        page: number;
        size: number;
    };
}

export type WorkspaceSortField = 'name' | 'created_at' | 'updated_at';