import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        // laravel plugin disabled to run as SPA
        react(),
        tailwindcss(),
    ],
    server: {
        port: 8002,
        host: '127.0.0.1',
        proxy: {
            '/api/auth': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            '/api/books': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            '/api/orders': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            '/api/admin': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
