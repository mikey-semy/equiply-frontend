import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import Prism from 'prismjs';
import styles from './MessageContent.module.scss';
import { MessageContentProps } from './MessageContent.types';

// Импортируем только одну тему Prism
import 'prismjs/themes/prism-tomorrow.css'; // Только темная тема

// Импортируем только базовые языки
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';

// Импортируем плагины
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';

/**
 * Компонент для отображения содержимого сообщения с поддержкой Markdown
 */
export const MessageContent: React.FC<MessageContentProps> = ({ content, className, isUser = false }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            // Применяем подсветку синтаксиса к текущему контейнеру
            try {
                const codeBlocks = contentRef.current.querySelectorAll('pre[class*="language-"]');
                codeBlocks.forEach((block) => {
                    Prism.highlightElement(block.querySelector('code') as HTMLElement);
                });
            } catch (error) {
                console.warn('Prism highlighting failed:', error);
            }
        }
    }, [content]);

    return (
        <div
            ref={contentRef}
            className={`${styles.messageContent} ${isUser ? styles.userContent : styles.assistantContent} ${className || ''}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                    // Кастомный компонент для блоков кода
                    code(props) {
                        const { children, className: codeClassName, ...rest } = props;
                        const match = /language-(\w+)/.exec(codeClassName || '');
                        const language = match ? match[1] : '';
                        const isBlock = Boolean(match);

                        if (isBlock && children) {
                            const codeString = String(children).replace(/\n$/, '');

                            // Список поддерживаемых языков
                            const supportedLanguages = [
                                'javascript', 'js',
                                'typescript', 'ts',
                                'jsx', 'tsx',
                                'css', 'scss', 'sass',
                                'json',
                                'bash', 'sh', 'shell',
                                'python', 'py',
                                'sql',
                                'html', 'xml',
                                'markdown', 'md'
                            ];

                            // Используем 'text' для неподдерживаемых языков
                            const finalLanguage = supportedLanguages.includes(language.toLowerCase())
                                ? language.toLowerCase()
                                : 'text';

                            return (
                                <div className={styles.codeBlock}>
                                    <div className={styles.codeHeader}>
                                        <span className={styles.codeLanguage}>
                                            {language || 'text'}
                                        </span>
                                        <button
                                            className={styles.copyButton}
                                            onClick={() => {
                                                navigator.clipboard.writeText(codeString).catch(err => {
                                                    console.warn('Failed to copy text:', err);
                                                });
                                            }}
                                        >
                                            Копировать
                                        </button>
                                    </div>
                                    <pre className={`${styles.codeContent} language-${finalLanguage} line-numbers`}>
                                        <code className={`language-${finalLanguage}`}>
                                            {children}
                                        </code>
                                    </pre>
                                </div>
                            );
                        }

                        return (
                            <code className={`${styles.inlineCode} ${codeClassName || ''}`} {...rest}>
                                {children}
                            </code>
                        );
                    },

                    // Кастомные стили для других элементов
                    blockquote({ children }) {
                        return (
                            <blockquote className={styles.blockquote}>
                                {children}
                            </blockquote>
                        );
                    },

                    table({ children }) {
                        return (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    {children}
                                </table>
                            </div>
                        );
                    },

                    h1({ children }) {
                        return <h1 className={styles.h1}>{children}</h1>;
                    },

                    h2({ children }) {
                        return <h2 className={styles.h2}>{children}</h2>;
                    },

                    h3({ children }) {
                        return <h3 className={styles.h3}>{children}</h3>;
                    },

                    p({ children }) {
                        return <p className={styles.paragraph}>{children}</p>;
                    },

                    ul({ children }) {
                        return <ul className={styles.list}>{children}</ul>;
                    },

                    ol({ children }) {
                        return <ol className={styles.orderedList}>{children}</ol>;
                    },

                    li({ children }) {
                        return <li className={styles.listItem}>{children}</li>;
                    },

                    a({ href, children }) {
                        return (
                            <a
                                href={href}
                                className={styles.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {children}
                            </a>
                        );
                    },

                    strong({ children }) {
                        return <strong className={styles.bold}>{children}</strong>;
                    },

                    em({ children }) {
                        return <em className={styles.italic}>{children}</em>;
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};