import React from 'react';
import { Modal, Form, Input, Switch, Button } from 'antd';
import type { CreateWorkspaceRequest } from '@/pages/Workspaces/Workspaces.types';
import styles from './CreateWorkspaceModal.module.scss';

interface CreateWorkspaceModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (data: CreateWorkspaceRequest) => Promise<boolean>;
    loading?: boolean;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
    open,
    onCancel,
    onSubmit,
    loading = false,
}) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const success = await onSubmit(values);
            if (success) {
                form.resetFields();
                onCancel();
            }
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Создание рабочего пространства"
            open={open}
            onCancel={handleCancel}
            width={600}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Отмена
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    Создать
                </Button>,
            ]}
            className={styles.modal}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    is_public: false,
                }}
                className={styles.form}
            >
                <Form.Item
                    name="name"
                    label="Название рабочего пространства"
                    rules={[
                        { required: true, message: 'Введите название рабочего пространства' },
                        { min: 2, message: 'Название должно содержать минимум 2 символа' },
                        { max: 100, message: 'Название не должно превышать 100 символов' },
                    ]}
                >
                    <Input
                        placeholder="Демо, ЛПЦ-1, Обслуживание оборудования"
                        maxLength={100}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Описание"
                    rules={[
                        { max: 500, message: 'Описание не должно превышать 500 символов' },
                    ]}
                >
                    <Input.TextArea
                        placeholder="Описание рабочего пространства"
                        rows={4}
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                <Form.Item
                    name="is_public"
                    label="Публичное рабочее пространство"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};