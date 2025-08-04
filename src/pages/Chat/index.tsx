import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    MessageOutlined,
    PlusOutlined,
    MenuOutlined,
    SendOutlined,
    DeleteOutlined,
    BarChartOutlined,
    InfoCircleOutlined,
    EditOutlined,
    SearchOutlined,
    LoadingOutlined,
    ClearOutlined,
    DownloadOutlined,
    FileMarkdownOutlined,
    FileTextOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { Modal, Input, message, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { formatDate } from '@/shared/lib/date.utils';
import styles from './Chat.module.scss';
import { AIChatSchema, UIMessage, MessageRole } from './Chat.types';
import {
    getUserChats,
    createChat,
    getAICompletion,
    deleteChat,
    getChatsStats,
    updateChat,
    searchChats,
    getChatHistory,
    clearChatHistory,
    exportChatHistoryMarkdown,
    exportChatHistoryText
} from './Chat.api';


/**
 * Компонент страницы чата с ИИ
 */
const ChatPage: React.FC = () => {
    const [chats, setChats] = useState<AIChatSchema[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [editingChat, setEditingChat] = useState<{ id: string; title: string; description?: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [creatingChat, setCreatingChat] = useState(false);
    const [selectedChats, setSelectedChats] = useState<string[]>([]);
    const [bulkMode, setBulkMode] = useState(false);


    /**
     * Загружает список чатов при монтировании компонента
     */
    useEffect(() => {
        loadChats();
    }, []);

    /**
     * Переключает режим множественного выделения
     */
    const toggleBulkMode = () => {
        setBulkMode(!bulkMode);
        setSelectedChats([]);
    };

    /**
     * Переключает выделение чата
     */
    const toggleChatSelection = (chatId: string) => {
        setSelectedChats(prev =>
            prev.includes(chatId)
                ? prev.filter(id => id !== chatId)
                : [...prev, chatId]
        );
    };

    /**
     * Обработчик клика по чату
     */
    const handleChatClick = (chatId: string) => {
        if (bulkMode) {
            toggleChatSelection(chatId);
        } else {
            handleChatSelect(chatId);
        }
    };

    /**
     * Дебаунс для поиска
     */
    const debounceSearch = useCallback(
        useMemo(() => {
            let timeout: NodeJS.Timeout;
            return (query: string) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (query.trim()) {
                        handleSearch(query);
                    } else {
                        loadChats();
                    }
                }, 300);
            };
        }, []),
        []
    );

    /**
     * Очищает историю чата
     */
    const handleClearChatHistory = async (chatId: string, chatTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();

        Modal.confirm({
            title: 'Очистить историю чата?',
            content: `Вы уверены, что хотите очистить всю историю чата "${chatTitle}"? Это действие нельзя отменить.`,
            okText: 'Очистить',
            cancelText: 'Отмена',
            okType: 'danger',
            onOk: async () => {
                try {
                    const result = await clearChatHistory(chatId);

                    if (result.success) {
                        // Если это активный чат, очищаем сообщения на UI
                        if (activeChat === chatId) {
                            setMessages([]);
                        }
                        message.success('История чата очищена');
                    } else {
                        message.error(result.message || 'Ошибка очистки истории');
                    }
                } catch (error) {
                    console.error('Ошибка очистки истории чата:', error);
                    message.error('Произошла ошибка при очистке истории');
                }
            }
        });
    };

    /**
     * Экспортирует историю чата в Markdown
     */
    const handleExportMarkdown = async (chatId: string, chatTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            await exportChatHistoryMarkdown(chatId);
            message.success(`История чата "${chatTitle}" экспортирована в Markdown`);
        } catch (error) {
            console.error('Ошибка экспорта в Markdown:', error);
            message.error('Ошибка экспорта в Markdown');
        }
    };

    /**
     * Экспортирует историю чата в текстовый формат
     */
    const handleExportText = async (chatId: string, chatTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            await exportChatHistoryText(chatId);
            message.success(`История чата "${chatTitle}" экспортирована в текстовый файл`);
        } catch (error) {
            console.error('Ошибка экспорта в текст:', error);
            message.error('Ошибка экспорта в текст');
        }
    };

    /**
     * Поиск чатов
     */
    const handleSearch = async (query: string) => {
        try {
            setSearching(true);
            const response = await searchChats(query);
            setChats(response.data);
        } catch (error) {
            console.error('Ошибка поиска чатов:', error);
            message.error('Ошибка поиска чатов');
        } finally {
            setSearching(false);
        }
    };

    /**
     * Обработчик изменения поиска
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        debounceSearch(query);
    };

    /**
     * Загружает список чатов пользователя
     */
    const loadChats = async () => {
        try {
            setLoading(true);
            const response = await getUserChats();
            setChats(response.data);

            // Если есть чаты и нет активного - выбираем первый и загружаем его историю
            if (!activeChat && response.data.length > 0) {
                const firstChatId = response.data[0].chat_id;
                setActiveChat(firstChatId);
                // Загружаем историю для первого чата
                await loadChatHistory(firstChatId);
            }
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Загружает историю сообщений для чата
     */
    const loadChatHistory = async (chatId: string) => {
        try {
            setLoading(true);
            const response = await getChatHistory(chatId);
            const history = response.data;

            // Преобразуем сообщения из API в UI формат
            const uiMessages: UIMessage[] = history.messages.map((msg, index) => ({
                id: `${history.chat_id}_${index}`,
                role: msg.role,
                text: msg.text,
                timestamp: new Date(), // Если в API нет timestamp, используем текущее время
                isTyping: false
            }));

            setMessages(uiMessages);

            console.log(`Загружена история для чата ${chatId}: ${history.total_messages} сообщений`);
        } catch (error) {
            console.error('Ошибка загрузки истории чата:', error);
            // Не показываем ошибку пользователю, просто оставляем пустую историю
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Создает новый чат
     */
    const handleCreateChat = async (isAutoCreate = false) => {
        // Защита от множественного создания
        if (creatingChat) return;

        try {
            setCreatingChat(true);
            const title = isAutoCreate ? 'Новый чат' : `Чат ${new Date().toLocaleString('ru-RU')}`;
            const response = await createChat({ title });
            const newChat = response.data;
            setChats(prev => [newChat, ...prev]);
            setActiveChat(newChat.chat_id);
            setMessages([]); // Новый чат = пустая история
            setSidebarOpen(false);

            // Очищаем поиск при создании нового чата
            if (!isAutoCreate) {
                setSearchQuery('');
            }
        } catch (error) {
            console.error('Ошибка создания чата:', error);
            message.error('Ошибка создания чата');
        } finally {
            setCreatingChat(false);
        }
    };

    /**
     * Переключает активный чат
     */
    const handleChatSelect = async (chatId: string) => {
        setActiveChat(chatId);
        setSidebarOpen(false);

        // Загружаем историю сообщений для выбранного чата
        await loadChatHistory(chatId);
    };

    /**
     * Открывает редактор чата
     */
    const handleEditChat = (chat: AIChatSchema, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingChat({
            id: chat.chat_id,
            title: chat.title,
            description: chat.description || ''
        });
    };

    /**
     * Сохраняет изменения чата
     */
    const handleSaveChat = async () => {
        if (!editingChat) return;

        try {
            const response = await updateChat(editingChat.id, {
                title: editingChat.title,
                description: editingChat.description || undefined
            });

            // Обновляем список чатов
            setChats(prev => prev.map(chat =>
                chat.chat_id === editingChat.id
                    ? { ...chat, ...response.data }
                    : chat
            ));

            setEditingChat(null);
            message.success('Чат успешно обновлен');
        } catch (error) {
            console.error('Ошибка обновления чата:', error);
            message.error('Ошибка обновления чата');
        }
    };

    /**
     * Удаляет выделенные чаты
     */
    const handleBulkDelete = async () => {
        if (selectedChats.length === 0) return;

        try {
            // Удаляем все выделенные чаты параллельно
            await Promise.all(
                selectedChats.map(chatId => deleteChat(chatId))
            );

            // Убираем удаленные чаты из списка
            setChats(prev => prev.filter(chat => !selectedChats.includes(chat.chat_id)));

            // Если активный чат был удален, сбрасываем выбор
            if (activeChat && selectedChats.includes(activeChat)) {
                const remainingChats = chats.filter(chat => !selectedChats.includes(chat.chat_id));
                if (remainingChats.length > 0) {
                    setActiveChat(remainingChats[0].chat_id);
                } else {
                    setActiveChat(null);
                    setMessages([]);
                }
            }

            message.success(`Удалено чатов: ${selectedChats.length}`);
            setSelectedChats([]);
            setBulkMode(false);
        } catch (error) {
            console.error('Ошибка массового удаления:', error);
            message.error('Ошибка удаления чатов');
        }
    };

    /**
     * Удаляет чат (мягкое удаление)
     */
    const handleDeleteChat = async (chatId: string, chatTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            const result = await deleteChat(chatId);

            if (result.success) {
                // Убираем чат из списка
                setChats(prev => prev.filter(chat => chat.chat_id !== chatId));

                // Если удаляем активный чат, сбрасываем выбор
                if (activeChat === chatId) {
                    const remainingChats = chats.filter(chat => chat.chat_id !== chatId);
                    if (remainingChats.length > 0) {
                        setActiveChat(remainingChats[0].chat_id);
                    } else {
                        setActiveChat(null);
                        setMessages([]);
                    }
                }

                // Показываем уведомление с возможностью отмены через notification
                const key = `delete_${chatId}`;
                message.success({
                    content: `Чат "${chatTitle}" удален`,
                    duration: 5,
                    key,
                });

                // Показываем отдельную кнопку восстановления
                setTimeout(() => {
                    message.info({
                        content: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Хотите восстановить чат?</span>
                                <button
                                    onClick={() => {
                                        handleRestoreChat(chatId);
                                        message.destroy(key);
                                    }}
                                    style={{
                                        background: 'var(--primary-color)',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Восстановить
                                </button>
                            </div>
                        ),
                        duration: 8,
                        key: `restore_${chatId}`,
                    });
                }, 1000);
            } else {
                message.error(result.message || 'Ошибка удаления чата');
            }
        } catch (error) {
            console.error('Ошибка удаления чата:', error);
            message.error('Произошла ошибка при удалении чата');
        }
    };

    /**
     * Восстанавливает удаленный чат
     */
    const handleRestoreChat = async (chatId: string) => {
        try {
            // Восстанавливаем чат (устанавливаем is_active: true)
            await updateChat(chatId, { is_active: true });

            // Перезагружаем список чатов
            await loadChats();

            message.success('Чат восстановлен');
        } catch (error) {
            console.error('Ошибка восстановления чата:', error);
            message.error('Ошибка восстановления чата');
        }
    };

    /**
     * Показывает общую статистику всех чатов
     */
    const handleShowGlobalStats = async () => {
        try {
            const response = await getChatsStats();
            const stats = response.data;

            Modal.info({
                title: 'Общая статистика чатов',
                content: (
                    <div>
                        <p><strong>Всего чатов:</strong> {stats?.total_chats || 0}</p>
                        <p><strong>Активных чатов:</strong> {stats?.active_chats || 0}</p>
                        <p><strong>Неактивных чатов:</strong> {stats?.inactive_chats || 0}</p>
                        <p><strong>Всего сообщений:</strong> {stats?.total_messages || 0}</p>
                        <p><strong>Использовано токенов:</strong> {stats?.total_tokens || 0}</p>
                        <p><strong>Общая стоимость:</strong> {stats?.total_cost || 0} ₽</p>
                        {stats?.last_active_chat && (
                            <p><strong>Последний активный чат:</strong> {stats.last_active_chat.title}</p>
                        )}
                    </div>
                ),
                width: 500,
            });
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            message.error('Ошибка получения статистики');
        }
    };

    /**
     * Показывает информацию о чате
     */
    const handleShowChatInfo = (chat: AIChatSchema, e: React.MouseEvent) => {
        e.stopPropagation();

        Modal.info({
            title: 'Информация о чате',
            content: (
                <div>
                    <p><strong>Название:</strong> {chat.title}</p>
                    <p><strong>Описание:</strong> {chat.description || 'Не указано'}</p>
                    <p><strong>ID чата:</strong> {chat.chat_id}</p>
                    <p><strong>Создан:</strong> {formatDate(chat.created_at)}</p>
                    <p><strong>Обновлен:</strong> {formatDate(chat.updated_at)}</p>
                    <p><strong>Последнее сообщение:</strong> {formatDate(chat.last_message_at)}</p>
                    <p><strong>Статус:</strong> {chat.is_active ? 'Активен' : 'Неактивен'}</p>
                </div>
            ),
            width: 500,
        });
    };

    /**
     * Получает заголовок активного чата
     */
    const getActiveChatTitle = () => {
        if (!activeChat) return 'Новый чат';
        const chat = chats.find(c => c.chat_id === activeChat);
        return chat?.title || 'Чат с ИИ';
    };

    /**
     * Отправляет сообщение в чат
     */
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || sendingMessage) return;

        // Если нет активного чата, создаем новый автоматически
        if (!activeChat) {
            try {
                setSendingMessage(true);
                const response = await createChat({
                    title: `Чат ${new Date().toLocaleString('ru-RU')}`
                });
                const newChat = response.data;
                setChats(prev => [newChat, ...prev]);
                setActiveChat(newChat.chat_id);

                // После создания чата отправляем сообщение
                await sendMessageToChat(newChat.chat_id, inputMessage.trim());
            } catch (error) {
                console.error('Ошибка создания чата:', error);
                message.error('Ошибка создания чата');
                setSendingMessage(false);
                return;
            }
        } else {
            // Если чат уже есть, просто отправляем сообщение
            await sendMessageToChat(activeChat, inputMessage.trim());
        }
    };

    /**
     * Отправляет сообщение в указанный чат
     */
    const sendMessageToChat = async (chatId: string, messageText: string) => {
        const userMessage: UIMessage = {
            id: Date.now().toString(),
            role: MessageRole.USER,
            text: messageText,
            timestamp: new Date()
        };

        // Добавляем сообщение пользователя
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setSendingMessage(true);

        // Добавляем индикатор печати ИИ
        const typingMessage: UIMessage = {
            id: 'typing',
            role: MessageRole.ASSISTANT,
            text: 'Печатает...',
            timestamp: new Date(),
            isTyping: true
        };
        setMessages(prev => [...prev, typingMessage]);

        try {
            const response = await getAICompletion(chatId, messageText);

            // Убираем индикатор печати и добавляем ответ ИИ
            const aiMessage: UIMessage = {
                id: Date.now().toString() + '_ai',
                role: MessageRole.ASSISTANT,
                text: response.result.alternatives[0]?.message.text || 'Извините, не удалось получить ответ',
                timestamp: new Date()
            };

            setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(aiMessage));

        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);

            // Убираем индикатор печати и показываем ошибку
            const errorMessage: UIMessage = {
                id: 'error_' + Date.now(),
                role: MessageRole.ASSISTANT,
                text: 'Извините, произошла ошибка при отправке сообщения. Попробуйте еще раз.',
                timestamp: new Date()
            };

            setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(errorMessage));
        } finally {
            setSendingMessage(false);
        }
    };

    /**
     * Форматирует время сообщения
     */
    const formatMessageTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Обработчик нажатия Enter в поле ввода
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    /**
     * Создает меню дополнительных действий для чата
     */
    const getChatActionsMenu = (chat: AIChatSchema): MenuProps => ({
        items: [
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Редактировать',
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleEditChat(chat, e.domEvent as React.MouseEvent);
                }
            },
            {
                key: 'info',
                icon: <InfoCircleOutlined />,
                label: 'Информация',
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleShowChatInfo(chat, e.domEvent as React.MouseEvent);
                }
            },
            {
                type: 'divider'
            },
            {
                key: 'export-md',
                icon: <FileMarkdownOutlined />,
                label: 'Экспорт в Markdown',
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleExportMarkdown(chat.chat_id, chat.title, e.domEvent as React.MouseEvent);
                }
            },
            {
                key: 'export-txt',
                icon: <FileTextOutlined />,
                label: 'Экспорт в текст',
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleExportText(chat.chat_id, chat.title, e.domEvent as React.MouseEvent);
                }
            },
            {
                type: 'divider'
            },
            {
                key: 'clear',
                icon: <ClearOutlined />,
                label: 'Очистить историю',
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleClearChatHistory(chat.chat_id, chat.title, e.domEvent as React.MouseEvent);
                }
            },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Удалить чат',
                danger: true,
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleDeleteChat(chat.chat_id, chat.title, e.domEvent as React.MouseEvent);
                }
            }
        ]
    });

    return (
        <div className={styles.chatPage}>
            {sidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.headerButtons}>
                        <button
                            className={styles.newChatButton}
                            onClick={() => handleCreateChat(false)}
                            disabled={creatingChat}
                        >
                            <PlusOutlined /> {creatingChat ? 'Создание...' : 'Новый чат'}
                        </button>

                        <button
                            className={`${styles.bulkButton} ${bulkMode ? styles.active : ''}`}
                            onClick={toggleBulkMode}
                            title="Режим множественного выделения"
                        >
                            {bulkMode ? 'Отмена' : 'Выбрать'}
                        </button>
                    </div>

                    {/* Панель для bulk операций */}
                    {bulkMode && selectedChats.length > 0 && (
                        <div className={styles.bulkPanel}>
                            <span className={styles.bulkCounter}>
                                Выбрано: {selectedChats.length}
                            </span>
                            <button
                                className={styles.bulkDeleteButton}
                                onClick={handleBulkDelete}
                                disabled={selectedChats.length === 0}
                            >
                                <DeleteOutlined /> Удалить ({selectedChats.length})
                            </button>
                        </div>
                    )}

                    {/* Поиск чатов */}
                    <div className={styles.searchContainer}>
                        <Input
                            placeholder="Поиск чатов..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            prefix={searching ? <LoadingOutlined /> : <SearchOutlined />}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.chatsList}>
                    {loading || searching ? (
                        <div className={styles.loadingText}>
                            {searching ? 'Поиск...' : 'Загрузка...'}
                        </div>
                    ) : chats.length === 0 ? (
                        <div className={styles.emptyChatsText}>
                            {searchQuery ? 'Чаты не найдены' : 'Нет чатов'}
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.id}
                                className={`${styles.chatItem} ${activeChat === chat.chat_id ? styles.active : ''} ${selectedChats.includes(chat.chat_id) ? styles.selected : ''
                                    }`}
                                onClick={() => handleChatClick(chat.chat_id)}
                            >
                                {bulkMode && (
                                    <div className={styles.chatCheckbox}>
                                        <input
                                            type="checkbox"
                                            checked={selectedChats.includes(chat.chat_id)}
                                            onChange={() => toggleChatSelection(chat.chat_id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )}

                                <div className={styles.chatItemContent}>
                                    <div className={styles.chatTitle}>
                                        {chat.title}
                                    </div>
                                    <div className={styles.chatMeta}>
                                        <div className={styles.chatDate}>
                                            {formatDate(chat.updated_at)}
                                        </div>
                                    </div>
                                </div>

                                {!bulkMode && (
                                    <div className={styles.chatActions}>
                                        <Dropdown
                                            menu={getChatActionsMenu(chat)}
                                            trigger={['click']}
                                            placement="bottomRight"
                                        >
                                            <button
                                                className={styles.chatActionButton}
                                                onClick={(e) => e.stopPropagation()}
                                                title="Дополнительные действия"
                                            >
                                                <MoreOutlined />
                                            </button>
                                        </Dropdown>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Общая статистика внизу */}
                <div className={styles.sidebarFooter}>
                    <button
                        className={styles.statsButton}
                        onClick={handleShowGlobalStats}
                        title="Общая статистика чатов"
                    >
                        <BarChartOutlined /> Статистика
                    </button>
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.chatHeader}>
                    <button
                        className={styles.mobileMenuButton}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <MenuOutlined />
                    </button>
                    <h1 className={styles.chatHeaderTitle}>
                        {getActiveChatTitle()}
                    </h1>
                    {/* Кнопки управления историей активного чата */}
                    {activeChat && (
                        <div className={styles.chatHeaderActions}>
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'export-md',
                                            icon: <FileMarkdownOutlined />,
                                            label: 'Экспорт в Markdown',
                                            onClick: () => handleExportMarkdown(activeChat, getActiveChatTitle(), {} as React.MouseEvent)
                                        },
                                        {
                                            key: 'export-txt',
                                            icon: <FileTextOutlined />,
                                            label: 'Экспорт в текст',
                                            onClick: () => handleExportText(activeChat, getActiveChatTitle(), {} as React.MouseEvent)
                                        },
                                        {
                                            type: 'divider'
                                        },
                                        {
                                            key: 'clear',
                                            icon: <ClearOutlined />,
                                            label: 'Очистить историю',
                                            onClick: () => handleClearChatHistory(activeChat, getActiveChatTitle(), {} as React.MouseEvent)
                                        }
                                    ]
                                }}
                                trigger={['click']}
                                placement="bottomRight"
                            >
                                <button className={styles.headerActionButton}>
                                    <MoreOutlined />
                                </button>
                            </Dropdown>
                        </div>
                    )}
                </div>

                <div className={styles.messagesContainer}>
                    {loading ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyStateIcon}>
                                <LoadingOutlined />
                            </div>
                            <h2 className={styles.emptyStateTitle}>
                                Загрузка истории...
                            </h2>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyStateIcon}>
                                <MessageOutlined />
                            </div>
                            <h2 className={styles.emptyStateTitle}>
                                {activeChat ? 'Начните общение с ИИ' : 'Готов к общению!'}
                            </h2>
                            <p className={styles.emptyStateText}>
                                {activeChat
                                    ? 'Задайте любой вопрос или попросите помочь с задачей. Я готов помочь вам в различных вопросах!'
                                    : 'Напишите сообщение ниже, и я автоматически создам новый чат для нашего общения.'
                                }
                            </p>
                        </div>
                    ) : (
                        messages.map(message => (
                            <div
                                key={message.id}
                                className={`${styles.messageWrapper} ${message.role === MessageRole.USER
                                    ? styles.userMessage
                                    : styles.assistantMessage
                                    }`}
                            >
                                <div className={`${styles.messageBubble} ${message.role === MessageRole.USER
                                    ? styles.userBubble
                                    : message.isTyping
                                        ? styles.typingBubble
                                        : styles.assistantBubble
                                    }`}>
                                    {message.text}
                                    <div className={styles.messageTime}>
                                        {formatMessageTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.inputContainer}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={activeChat ? "Введите ваше сообщение..." : "Напишите сообщение для создания нового чата..."}
                            disabled={sendingMessage}
                            className={styles.messageInput}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || sendingMessage}
                            className={styles.sendButton}
                            title={activeChat ? "Отправить сообщение" : "Создать чат и отправить сообщение"}
                        >
                            <SendOutlined />
                        </button>
                    </div>
                </div>
            </div>

            {/* Модальное окно редактирования чата */}
            <Modal
                title="Редактировать чат"
                open={!!editingChat}
                onOk={handleSaveChat}
                onCancel={() => setEditingChat(null)}
                okText="Сохранить"
                cancelText="Отмена"
            >
                {editingChat && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                Название чата:
                            </label>
                            <Input
                                value={editingChat.title}
                                onChange={(e) => setEditingChat(prev => prev ? { ...prev, title: e.target.value } : null)}
                                placeholder="Введите название чата"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                Описание (опционально):
                            </label>
                            <Input.TextArea
                                value={editingChat.description}
                                onChange={(e) => setEditingChat(prev => prev ? { ...prev, description: e.target.value } : null)}
                                placeholder="Введите описание чата"
                                rows={3}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ChatPage;