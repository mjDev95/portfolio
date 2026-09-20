import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                // Admin panel (Inertia + React + Tailwind v3/postcss)
                'resources/css/app.css',
                'resources/js/app.jsx',
                // Public site (Blade + Barba.js + GSAP + Lenis)
                'resources/css/fluid-system.css',
                'resources/css/public.css',
                'resources/js/public/main.js',
            ],
            refresh: true,
        }),
        react(),
    ],
});
