/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6', // New primary
                    600: '#2563eb', // Light mode primary
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                accent: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6', // New secondary
                    600: '#7c3aed', // Light mode secondary
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
                surface: {
                    DEFAULT: '#f8f9fb', // Light bg
                    card: '#ffffff', // Light card
                    border: '#e8eaf0',
                    dark: '#0f172a', // Dark bg
                    darkCard: '#1e293b', // Dark card
                    darkBorder: '#334155' // Dark border
                },
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            boxShadow: {
                soft: '0 2px 24px 0 rgba(99,102,241,0.08)',
                card: '0 4px 32px 0 rgba(30,30,60,0.08)',
                glow: '0 0 32px 0 rgba(99,102,241,0.25)',
                'glow-sm': '0 0 16px 0 rgba(99,102,241,0.18)',
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 50%, #f8f9fb 100%)',
                'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
                'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,244,255,0.6) 100%)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 2s infinite',
                'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-16px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
        },
    },
    plugins: [],
}
