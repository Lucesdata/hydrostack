/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a", // Slate 900
                surface: "#1e293b",    // Slate 800
                foreground: "#f8fafc", // Slate 50
                muted: "#94a3b8",      // Slate 400
                primary: {
                    DEFAULT: "#0ea5e9",  // Sky 500
                    hover: "#0284c7",    // Sky 600
                    foreground: "white",
                },
                accent: {
                    DEFAULT: "#06b6d4",  // Cyan 500
                    hover: "#0891b2",    // Cyan 600
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [],
};
