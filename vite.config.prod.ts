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
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            '/media': {
                target: 'https://api.equiply.ru',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/media/, ''),
            },
        }
    }
}));