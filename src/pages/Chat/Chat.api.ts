import api from '@/shared/api/api';
import { handleApiResponse, handleApiError } from '@/shared/api/api.handlers';
import {
    AIResponseSchema,
    AIChatCreateSchema,
    AIChatCreateResponseSchema,
    AIChatUpdateSchema,
    AIChatResponseSchema,
    AIChatsListResponseSchema,
    AIChatDeleteResponseSchema,
    AIChatStatsResponseSchema,
    AIChatHistoryResponseSchema,
    AIChatHistoryClearResponseSchema,
    AISettingsResponseSchema,
    AISettingsUpdateSchema,
    AISettingsUpdateResponseSchema,
} from './Chat.types';

/**
 * Получает ответ от ИИ
 *
 * @param chatId - ID чата
 * @param message - Текст сообщения пользователя
 * @returns Promise<AIResponseSchema> - Ответ от модели
 *
 * @example
 * const response = await getAICompletion('chat_123', 'Привет, как дела?');
 * console.log(response.result.alternatives[0].message.text);
 */
export const getAICompletion = async (chatId: string, message: string): Promise<AIResponseSchema> => {
    try {
        const formData = new FormData();
        formData.append('message', message);

        const response = await api.post(`/api/v1/ai/completion?chat_id=${encodeURIComponent(chatId)}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Получает список чатов пользователя
 */
export const getUserChats = async (): Promise<AIChatsListResponseSchema> => {
    try {
        const response = await api.get('/api/v1/ai/chats');
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Создает новый чат
 */
export const createChat = async (data: AIChatCreateSchema = {}): Promise<AIChatCreateResponseSchema> => {
    try {
        const response = await api.post('/api/v1/ai/chats', data);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Получает конкретный чат
 */
export const getChat = async (chatId: string): Promise<AIChatResponseSchema> => {
    try {
        const response = await api.get(`/api/v1/ai/chats/${encodeURIComponent(chatId)}`);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Обновляет чат
 */
export const updateChat = async (chatId: string, data: AIChatUpdateSchema): Promise<AIChatResponseSchema> => {
    try {
        const response = await api.put(`/api/v1/ai/chats/${encodeURIComponent(chatId)}`, data);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Удаляет чат
 */
export const deleteChat = async (chatId: string): Promise<AIChatDeleteResponseSchema> => {
    try {
        const response = await api.delete(`/api/v1/ai/chats/${encodeURIComponent(chatId)}`);

        // Обрабатываем различные форматы ответа от бэкенда
        if (response.data === true || response.data === false) {
            // Бэкенд вернул boolean
            return {
                success: response.data,
                message: response.data ? 'Чат успешно удален' : 'Ошибка удаления чата'
            };
        } else if (response.data && typeof response.data === 'object') {
            // Бэкенд вернул объект - используем handleApiResponse
            return handleApiResponse(response);
        } else {
            // Неожиданный формат ответа
            return {
                success: true,
                message: 'Чат удален'
            };
        }
    } catch (error) {
        handleApiError(error);
        // В блоке catch не возвращаем значение, так как handleApiError бросает исключение
        throw error;
    }
};

/**
 * Дублирует чат
 */
export const duplicateChat = async (chatId: string): Promise<AIChatCreateResponseSchema> => {
    try {
        const response = await api.post(`/api/v1/ai/chats/${encodeURIComponent(chatId)}/duplicate`);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Поиск по чатам
 */
export const searchChats = async (query: string): Promise<AIChatsListResponseSchema> => {
    try {
        const response = await api.get(`/api/v1/ai/chats/search?q=${encodeURIComponent(query)}`);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Получает статистику чатов
 */
export const getChatsStats = async (): Promise<AIChatStatsResponseSchema> => {
    try {
        const response = await api.get('/api/v1/ai/chats/stats');
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Получает историю сообщений чата
 */
export const getChatHistory = async (chatId: string): Promise<AIChatHistoryResponseSchema> => {
    try {
        const response = await api.get(`/api/v1/ai/history/${encodeURIComponent(chatId)}`);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};


/**
 * Очищает историю чата
 */
export const clearChatHistory = async (chatId: string): Promise<AIChatHistoryClearResponseSchema> => {
    try {
        const response = await api.post(`/api/v1/ai/history/clear?chat_id=${encodeURIComponent(chatId)}`);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Экспортирует историю чата в формате Markdown
 */
export const exportChatHistoryMarkdown = async (chatId: string): Promise<void> => {
    try {
        const response = await api.get(`/api/v1/ai/history/export/markdown?chat_id=${encodeURIComponent(chatId)}`, {
            responseType: 'blob'
        });

        // Создаем ссылку для скачивания файла
        const blob = new Blob([response.data], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat_history_${chatId}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Экспортирует историю чата в текстовом формате
 */
export const exportChatHistoryText = async (chatId: string): Promise<void> => {
    try {
        const response = await api.get(`/api/v1/ai/history/export/text?chat_id=${encodeURIComponent(chatId)}`, {
            responseType: 'blob'
        });

        // Создаем ссылку для скачивания файла
        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat_history_${chatId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Получает настройки AI пользователя
 */
export const getAISettings = async (): Promise<AISettingsResponseSchema> => {
    try {
        const response = await api.get('/api/v1/ai/settings');
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Обновляет настройки AI пользователя
 */
export const updateAISettings = async (settings: AISettingsUpdateSchema): Promise<AISettingsUpdateResponseSchema> => {
    try {
        const response = await api.put('/api/v1/ai/settings', settings);
        return handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};