import { defineConfig } from 'vite';
import baseConfig from './vite.config.base';

export default defineConfig((env) => ({
    ...baseConfig(env),
    server: {
        proxy: {
            '/api': {
                target: 'https://api.equiply.ru',
                changeOrigin: true,
                secure: false,
            },
            '/media': {
                target: 'https://api.equiply.ru',
                changeOrigin: true,
                secure: false,
            },
            '/auth': {
                target: 'https://api.equiply.ru',
                changeOrigin: true,
                secure: false
            },
            '/redoc': {
                target: 'https://api.equiply.ru',
                changeOrigin: true,
                secure: false
            },
            '/docs': {
                target: 'https://api.equiply.ru',
                changeOrigin: true,
                secure: false
            },
            '/openapi.json': {
                target: 'https://api.equiply.ru',
                changeOrigin: true,
                secure: false
            }
        }
    }
}));