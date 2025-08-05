/**
 * Типы для страницы чата с ИИ на основе API схем
 */

/**
 * Роль сообщения
 */
export enum MessageRole {
    SYSTEM = "system",
    USER = "user",
    ASSISTANT = "assistant"
}

/**
 * Схема сообщения
 */
export type MessageSchema = {
    role: MessageRole;
    text: string;
};

/**
 * Схема чата с AI
 */
export type AIChatSchema = {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    chat_id: string;
    last_message_at: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

/**
 * Схема для создания нового чата
 */
export type AIChatCreateSchema = {
    title?: string;
    description?: string;
};

/**
 * Схема для обновления чата
 */
export type AIChatUpdateSchema = {
    title?: string;
    description?: string;
    is_active?: boolean;
};

/**
 * Схема настроек рассуждений модели
 */
export type ReasoningOptionsSchema = {
    mode: string;
};

/**
 * Схема настроек генерации ответа
 */
export type CompletionOptionsSchema = {
    stream: boolean;
    temperature: number;
    maxTokens: number;
    reasoningOptions: ReasoningOptionsSchema;
};

/**
 * Схема запроса к AI чату
 */
export type AIRequestSchema = {
    modelUri: string;
    completionOptions: CompletionOptionsSchema;
    messages: MessageSchema[];
};

/**
 * Статистика использования токенов
 */
export type UsageSchema = {
    inputTextTokens: string;
    completionTokens: string;
    totalTokens: string;
};

/**
 * Альтернативный ответ модели
 */
export type AlternativeSchema = {
    message: MessageSchema;
    status: string;
};

/**
 * Результат генерации
 */
export type ResultSchema = {
    alternatives: AlternativeSchema[];
    usage: UsageSchema;
    modelVersion: string;
};

/**
 * Схема ответа AI чата
 */
export type AIResponseSchema = {
    success: boolean;
    result: ResultSchema;
};

/**
 * Схема статистики чатов
 */
export type AIChatStatsSchema = {
    total_chats: number;
    active_chats: number;
    inactive_chats: number;
    total_messages: number;
    total_tokens: number;
    total_cost: number;
    models_usage?: Record<string, number>;
    last_active_chat?: AIChatSchema;
};

/**
 * Базовая схема ответа
 */
export type BaseResponseSchema<T = Record<string, unknown>> = {
    success: boolean;
    message: string;
    data: T;
};

/**
 * Схема ответа с данными чата
 */
export type AIChatResponseSchema = BaseResponseSchema<AIChatSchema>;

/**
 * Схема ответа со списком чатов
 */
export type AIChatsListResponseSchema = BaseResponseSchema<AIChatSchema[]>;

/**
 * Схема ответа при создании чата
 */
export type AIChatCreateResponseSchema = BaseResponseSchema<AIChatSchema>;

/**
 * Схема ответа при обновлении чата
 */
export type AIChatUpdateResponseSchema = BaseResponseSchema<AIChatSchema>;

/**
 * Схема ответа со статистикой чатов
 */
export type AIChatStatsResponseSchema = BaseResponseSchema<AIChatStatsSchema>;


/**
 * Схема истории чата
 */
export type AIChatHistorySchema = {
    messages: MessageSchema[];
    total_messages: number;
    chat_id: string;
    user_id: string;
};

/**
 * Схема ответа с историей чата
 */
export type AIChatHistoryResponseSchema = BaseResponseSchema<AIChatHistorySchema>;

/**
 * Схема ответа при очистке истории чата
 */
export type AIChatHistoryClearResponseSchema = BaseResponseSchema<null>;

/**
 * Схема ответа при удалении чата
 */
export type AIChatDeleteResponseSchema = {
    message: string;
    success: boolean;
};

/**
 * Локальный тип сообщения для UI
 */
export type UIMessage = {
    id: string;
    role: MessageRole;
    text: string;
    timestamp: Date;
    isTyping?: boolean;
};