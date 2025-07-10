import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/**/*.{ts,tsx}',
    ],
    darkMode: ['class', 'class'],
    theme: {
    	extend: {
    		colors: {
    			'card-dark': '#0A0A0A',
    			'card-darker': '#000000',
    			'ds-blue': {
    				'400': 'var(--ds-blue-400)',
    				'500': 'var(--ds-blue-500)',
    				'600': 'var(--ds-blue-600)'
    			},
    			border: 'var(--border)',
    			ring: 'var(--ring)',
    			background: 'var(--background)',
    			foreground: 'var(--foreground)',
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
};

export default config;