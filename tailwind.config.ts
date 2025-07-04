import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/**/*.{ts,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "card-dark": "#0A0A0A",
                "card-darker": "#000000",
                'ds-blue': {
                    400: 'var(--ds-blue-400)',
                    500: 'var(--ds-blue-500)',
                    600: 'var(--ds-blue-600)',
                },
                border: 'var(--border)',
                ring: 'var(--ring)',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
            },
        },
    },
};

export default config;