import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Slider, InputNumber, Input, message, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ModelType, AISettingsSchema, AISettingsUpdateSchema } from '@/pages/Chat/Chat.types';
import { combineSystemMessages } from '@/shared/lib/ai-prompts';
import { getAISettings, updateAISettings } from '@/pages/Chat/Chat.api';
import styles from '@/pages/Chat/Chat.module.scss';

const { TextArea } = Input;
const { Option } = Select;

interface AISettingsModalProps {
    open: boolean;
    onCancel: () => void;
    onSave?: (settings: AISettingsSchema) => void;
}

/**
 * Компонент модального окна настроек AI
 */
const AISettingsModal: React.FC<AISettingsModalProps> = ({ open, onCancel, onSave }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<AISettingsSchema | null>(null);

    /**
     * Загружает текущие настройки
     */
    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await getAISettings();
            setSettings(response.data);
            form.setFieldsValue(response.data);
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            message.error('Ошибка загрузки настроек');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Сохраняет настройки
     */
    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            // Объединяем пользовательские настройки со скрытыми системными инструкциями
            const combinedSystemMessage = combineSystemMessages(values.system_message);

            const updateData: AISettingsUpdateSchema = {
                preferred_model: values.preferred_model,
                temperature: values.temperature,
                max_tokens: values.max_tokens,
                system_message: combinedSystemMessage
            };

            const response = await updateAISettings(updateData);
            setSettings(response.data);
            message.success('Настройки успешно сохранены');

            if (onSave) {
                onSave(response.data);
            }

            onCancel();
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            message.error('Ошибка сохранения настроек');
        } finally {
            setSaving(false);
        }
    };

    /**
     * Загружаем настройки при открытии модального окна
     */
    useEffect(() => {
        if (open) {
            loadSettings();
        }
    }, [open]);

    /**
     * Получает описание модели
     */
    // const getModelDescription = (model: ModelType): string => {
    //     const descriptions: Record<ModelType, string> = {
    //         [ModelType.YANDEX_GPT_LITE]: 'Быстрая и экономичная модель для простых задач',
    //         [ModelType.YANDEX_GPT_PRO]: 'Стандартная модель с хорошим балансом качества и скорости',
    //         [ModelType.YANDEX_GPT_PRO_32K]: 'Продвинутая модель с большим контекстом (32K токенов)',
    //         [ModelType.LLAMA_8B]: 'Легкая модель LLaMA для быстрых ответов',
    //         [ModelType.LLAMA_70B]: 'Мощная модель LLaMA для сложных задач',
    //         [ModelType.CUSTOM]: 'Пользовательская модель'
    //     };
    //     return descriptions[model] || '';
    // };

    /**
     * Получает название модели
     */
    const getModelName = (model: ModelType): string => {
        const names: Record<ModelType, string> = {
            [ModelType.YANDEX_GPT_LITE]: 'YandexGPT Lite',
            [ModelType.YANDEX_GPT_PRO]: 'YandexGPT Pro',
            [ModelType.YANDEX_GPT_PRO_32K]: 'YandexGPT Pro 32K',
            [ModelType.LLAMA_8B]: 'LLaMA 8B',
            [ModelType.LLAMA_70B]: 'LLaMA 70B',
            [ModelType.CUSTOM]: 'Пользовательская'
        };
        return names[model] || model;
    };

    /**
     * Рендерит опцию модели (название + описание)
     */
    const renderModelOption = (model: ModelType) => (
        <div className={styles.modelOption}>
            <div className={styles.modelName}>{getModelName(model)}</div>
            {/* <div className={styles.modelDescription}>{getModelDescription(model)}</div> */}
        </div>
    );

    /**
     * Извлекает пользовательскую часть из системного сообщения
     */
    const getUserSystemMessage = (fullSystemMessage?: string): string => {
        if (!fullSystemMessage) return '';

        // Ищем разделитель "ПОЛЬЗОВАТЕЛЬСКИЕ НАСТРОЙКИ НИЖЕ:"
        const dividerIndex = fullSystemMessage.indexOf('ПОЛЬЗОВАТЕЛЬСКИЕ НАСТРОЙКИ НИЖЕ:');
        if (dividerIndex === -1) {
            // Если разделитель не найден, возвращаем всё сообщение
            return fullSystemMessage;
        }

        // Извлекаем только пользовательскую часть после разделителя
        const userPart = fullSystemMessage
            .substring(dividerIndex + 'ПОЛЬЗОВАТЕЛЬСКИЕ НАСТРОЙКИ НИЖЕ:'.length)
            .replace(/^---\s*/, '') // Убираем разделитель ---
            .trim();

        return userPart;
    };

    return (
        <Modal
            title="Настройки AI"
            open={open}
            onCancel={onCancel}
            onOk={handleSave}
            okText="Сохранить"
            cancelText="Отмена"
            confirmLoading={saving}
            width={650}
            destroyOnHidden
            className={styles.settingsModal}
        >
            <Form
                form={form}
                layout="vertical"
                disabled={loading}
                style={{ marginTop: 16 }}
            >
                <Form.Item
                    label={
                        <span>
                            Предпочитаемая модель{' '}
                            <Tooltip title="Выберите модель AI для генерации ответов">
                                <InfoCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                    name="preferred_model"
                    rules={[{ required: true, message: 'Выберите модель' }]}
                >
                    <Select
                        placeholder="Выберите модель"
                        className={styles.modelSelect}
                        optionLabelProp="children"
                        classNames={{
                            popup: {
                                root: styles.modelSelectPopup
                            }
                        }}
                    >
                        {Object.values(ModelType).map(model => (
                            <Option key={model} value={model} label={getModelName(model)}>
                                {renderModelOption(model)}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label={
                        <span>
                            Температура ({form.getFieldValue('temperature') || 0.7}){' '}
                            <Tooltip title="Контролирует креативность ответов. Меньше = более предсказуемо, больше = более креативно">
                                <InfoCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                    name="temperature"
                    rules={[
                        { required: true, message: 'Укажите температуру' },
                        { type: 'number', min: 0, max: 1, message: 'Температура должна быть от 0 до 1' }
                    ]}
                >
                    <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        marks={{
                            0: 'Точно',
                            0.3: 'Умеренно',
                            0.7: 'Сбалансированно',
                            1: 'Креативно'
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label={
                        <span>
                            Максимальное количество токенов{' '}
                            <Tooltip title="Ограничивает длину ответа AI">
                                <InfoCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                    name="max_tokens"
                    rules={[
                        { required: true, message: 'Укажите количество токенов' },
                        { type: 'number', min: 1, max: 32000, message: 'Количество токенов должно быть от 1 до 32000' }
                    ]}
                >
                    <InputNumber
                        min={1}
                        max={32000}
                        step={100}
                        className={styles.tokensInput}
                        style={{ width: '100%' }}
                        placeholder="Например: 2000"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                        parser={value => {
                            const cleaned = value?.replace(/\s/g, '') || '';
                            const parsed = parseInt(cleaned, 10);
                            if (isNaN(parsed)) return 1;
                            if (parsed < 1) return 1;
                            if (parsed > 32000) return 32000;
                            return parsed as 1 | 32000;
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label={
                        <span>
                            Дополнительные инструкции{' '}
                            <Tooltip title="Дополнительные инструкции для AI. Основные правила форматирования уже настроены автоматически.">
                                <InfoCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                    name="system_message"
                    // Преобразуем значение при получении
                    getValueFromEvent={(e) => e.target.value}
                    getValueProps={(value) => ({
                        value: getUserSystemMessage(value)
                    })}
                >
                    <TextArea
                        rows={4}
                        className={styles.systemMessageTextarea}
                        placeholder="Например: Ты специалист по программированию. Давай детальные объяснения..."
                        showCount
                        maxLength={1000}
                    />
                </Form.Item>

                {settings && (
                    <div className={styles.settingsInfo}>
                        <div><strong>Последнее обновление:</strong> {new Date(settings.updated_at!).toLocaleString('ru-RU')}</div>
                    </div>
                )}
            </Form>
        </Modal>
    );
};

export default AISettingsModal;