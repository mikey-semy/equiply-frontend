import { AxiosError } from 'axios';

export type ApiResponse<T> = {
    data: T;
    status: number;
};

export type ApiError = {
    detail?: string;
    message?: string;
    status?: number;
    error_type?: string;
};

export const handleApiError = (error: unknown): never => {
    if (error instanceof AxiosError) {
        console.log('Full API Response:', error.response?.data);
        const apiError: ApiError = {
            message: error.response?.data.detail || error.response?.data.message || 'Неизвестная ошибка',
            status: error.response?.status || 500,
            error_type: error.response?.data.error_type
        };
        console.error('API Error:', apiError);
        throw apiError;
    }
    throw error;
};

export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    throw new Error(`Unexpected response status: ${response.status}`);
};