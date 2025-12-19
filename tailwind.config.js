/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Critical for forcing dark mode via Redesign
    theme: {
        extend: {
            fontFamily: {
                heading: ['Inter', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                nebula: {
                    purple: '#a855f7',
                    blue: '#6366f1',
                }
            }
        },
    },
    plugins: [],
}
