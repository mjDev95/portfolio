import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                brand: {
                    primary: 'rgb(var(--brand-primary-rgb, 39 135 245) / <alpha-value>)',
                    'primary-hover': 'var(--brand-primary-hover, #1f6cc4)',
                    'primary-subtle': 'var(--brand-primary-subtle, #ebf1f7)',
                    'primary-dark': 'var(--brand-primary-dark, #1657a2)',
                    secondary: 'rgb(var(--brand-secondary-rgb, 108 117 125) / <alpha-value>)',
                    'secondary-hover': 'var(--brand-secondary-hover, #5a6268)',
                    'secondary-subtle': 'var(--brand-secondary-subtle, #f5f6f8)',
                    tertiary: 'rgb(var(--brand-tertiary-rgb, 0 180 216) / <alpha-value>)',
                    'tertiary-hover': 'var(--brand-tertiary-hover, #0096b4)',
                    'tertiary-subtle': 'var(--brand-tertiary-subtle, #e6f8fb)',
                    accent: 'rgb(var(--brand-accent-rgb, 223 177 54) / <alpha-value>)',
                    'accent-hover': 'var(--brand-accent-hover, #c99e2e)',
                    'accent-subtle': 'var(--brand-accent-subtle, #fdf8eb)',
                    carbon: '#0B0D0E',
                    surface: '#F8FAFC',
                },
                msg: {
                    blue: 'rgb(var(--brand-primary-rgb, 39 135 245) / <alpha-value>)',
                    'blue-hover': 'var(--brand-primary-hover, #1f6cc4)',
                    'blue-subtle': 'var(--brand-primary-subtle, #ebf1f7)',
                    light: {
                        bg: '#f5f7fa',
                        surface: '#ffffff',
                        secondary: '#ebf1f7',
                        border: '#f5f8fb',
                        text: '#293951',
                        muted: '#95aac9',
                        active: '#ebf1f7',
                    },
                    dark: {
                        bg: '#121517',
                        surface: '#1e2126',
                        secondary: '#16191c',
                        hover: '#282d35',
                        border: '#1e2126',
                        text: '#ffffff',
                        muted: '#a7a6a8',
                        active: '#282d35',
                    },
                },
            },
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
                heading: ['"Bricolage Grotesque"', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
