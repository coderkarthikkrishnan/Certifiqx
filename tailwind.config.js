/** @type {import('tailwindcss').Config} */
export default {
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
                    50: '#f0f4ff',
                    100: '#e0eaff',
                    200: '#c7d7fe',
                    300: '#a5b8fd',
                    400: '#818ef9',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                accent: {
                    50: '#fdf4ff',
                    100: '#fae8ff',
                    200: '#f5d0fe',
                    300: '#f0abfc',
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                    700: '#a21caf',
                    800: '#86198f',
                    900: '#701a75',
                },
                surface: {
                    DEFAULT: '#f8f9fb',
                    card: '#ffffff',
                    border: '#e8eaf0',
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
