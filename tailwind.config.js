
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./routes/**/*.{js,ts,jsx,tsx}",
    "./ui/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F6E6C',   /* Medical Teal */
        secondary: '#6FB8B6', /* Light Teal */
        accent: {
            ai: '#06b6d4',     /* Cyan-500 for AI Elements */
            alert: '#f43f5e'   /* Rose-500 for Alerts */
        },
        slate: {
            900: '#0f172a',
            800: '#1e293b',
            50: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
