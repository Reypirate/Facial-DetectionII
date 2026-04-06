import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                forest: {
                    900: '#091612',
                    800: '#11231B',
                    700: '#1A3328',
                },
                mana: {
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                },
                elven: {
                    300: '#F3F4F6',
                    400: '#E2E8F0',
                    500: '#94A3B8',
                }
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
