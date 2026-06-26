/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        iron: {
          950: "#08090b",
          900: "#111318",
          800: "#191d24",
          700: "#242a34",
          500: "#596273"
        },
        volt: {
          500: "#b6ff4d",
          600: "#91dd28"
        },
        ember: {
          500: "#ff5b4a",
          600: "#e44536"
        }
      },
      boxShadow: {
        glow: "0 0 28px rgba(182, 255, 77, 0.18)"
      }
    }
  },
  plugins: []
};
