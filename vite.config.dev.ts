import { defineConfig } from 'vite';
import baseConfig from './vite.config.base';

export default defineConfig((env) => ({
    ...baseConfig(env),
    server: {
        proxy: {
            '/auth': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            },
            '/redoc': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            },
            '/docs': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            },
            '/openapi.json': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            }
        }
    }
}));