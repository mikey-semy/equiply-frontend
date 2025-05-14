import { loadEnv, ConfigEnv, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

const config = ({ mode }: ConfigEnv): UserConfig => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
        define: {
            'process.env.VITE_API_USERNAME': JSON.stringify(env.VITE_API_USERNAME),
            'process.env.VITE_API_PASSWORD': JSON.stringify(env.VITE_API_PASSWORD),
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler'
                },
            },
        }
    }
}

export default config
